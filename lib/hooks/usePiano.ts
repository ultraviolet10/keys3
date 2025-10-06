import { useCallback, useEffect, useRef } from "react"
import { useFrame } from "@/components/FarcasterProvider"
import { audioManager } from "@/lib/audio/AudioManager"
import {
	GAME_SPEED,
	initialTileRows,
	noteSequence,
	TILE_HEIGHT,
} from "@/lib/store/constants"
import { usePianoStore } from "@/lib/store/game-store"
import { GameStatus, TileInteractionStatus, type TileRow } from "@/types"

export const usePiano = () => {
	const lives = usePianoStore((s) => s.lives)
	const score = usePianoStore((s) => s.score)
	const gameStatus = usePianoStore((s) => s.gameStatus)
	const noteIndex = usePianoStore((s) => s.noteIndex)
	const tileRows = usePianoStore((s) => s.tileRows)

	// Get haptics from Farcaster frame
	const { haptics } = useFrame()

	// Animation loop refs
	const gameStartTimeRef = useRef<number>(0)
	const currentSpeedRef = useRef<number>(GAME_SPEED)
	const lastFrameTimeRef = useRef<number>(0)
	const animationIdRef = useRef<number>(0)
	const nextIdRef = useRef<number>(8)
	const lastSpeedUpdateRef = useRef<number>(0)

	// Animation loop
	useEffect(() => {
		const gameLoop = (timestamp: number) => {
			if (gameStatus !== GameStatus.PLAYING) {
				return // Stop the animation loop when not in playing state
			}

			// Initialize game start time on first frame
			if (gameStartTimeRef.current === 0) {
				gameStartTimeRef.current = timestamp
			}

			// Calculate delta time in seconds
			const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000
			lastFrameTimeRef.current = timestamp

			// Update speed every 10 seconds
			const elapsedTime = (timestamp - gameStartTimeRef.current) / 1000
			const speedLevel = Math.floor(elapsedTime / 10)
			if (speedLevel !== lastSpeedUpdateRef.current) {
				lastSpeedUpdateRef.current = speedLevel
				const newSpeed = GAME_SPEED * (1 + speedLevel * 0.2) // Increase by 20% every 10 seconds
				currentSpeedRef.current = newSpeed
			}

			// Update tile positions, spawn new tiles, and clean up off-screen tiles
			usePianoStore.setState((state) => {
				let updatedRows = state.tileRows.map((row) => ({
					...row,
					y: row.y + currentSpeedRef.current * deltaTime,
				}))

				// Remove tiles that are off-screen (past bottom of viewport)
				updatedRows = updatedRows.filter((row) => row.y < 700) // 80vh ≈ 640px + buffer

				// Spawn new tile if needed (when topmost tile is far enough down)
				const topMostTile =
					updatedRows.length > 0
						? updatedRows.reduce((top, row) => (row.y < top.y ? row : top))
						: null

				if (!topMostTile || topMostTile.y >= 0) {
					// Spawn if no tiles exist or topmost tile is far enough down
					const newTile: TileRow = {
						id: nextIdRef.current++,
						y: topMostTile ? topMostTile.y - 80 : -80, // Position above topmost tile or start fresh
						activeColumn: Math.floor(Math.random() * 4), // Random column for now
						status: TileInteractionStatus.PENDING, // All new tiles start as pending
					}
					updatedRows.unshift(newTile) // Add to beginning of array
				}

				return { tileRows: updatedRows }
			})

			// Continue the loop
			animationIdRef.current = requestAnimationFrame(gameLoop)
		}

		// Start the animation loop
		animationIdRef.current = requestAnimationFrame(gameLoop)

		// Cleanup on unmount
		return () => {
			if (animationIdRef.current) {
				cancelAnimationFrame(animationIdRef.current)
			}
		}
	}, [gameStatus])

	const extractCoordinates = useCallback(
		(e: React.TouchEvent | React.MouseEvent) => {
			if ("touches" in e) {
				return { x: e.touches[0].clientX, y: e.touches[0].clientY }
			} else {
				// Desktop click
				return { x: e.clientX, y: e.clientY }
			}
		},
		[],
	)

	const getGameCoordinates = useCallback(
		(
			screenX: number,
			screenY: number,
			gameAreaRef: React.RefObject<HTMLElement>,
		) => {
			if (!gameAreaRef.current) return null

			const gameArea = gameAreaRef.current.getBoundingClientRect()
			const relativeX = screenX - gameArea.left
			const relativeY = screenY - gameArea.top

			// Which column (0-3)
			const column = Math.floor(relativeX / (gameArea.width / 4))

			return { column, y: relativeY }
		},
		[],
	)

	const findTileAtPosition = useCallback(
		(column: number, tapY: number) => {
			return tileRows.find((row) => {
				// Must be the active column (black tile)
				if (row.activeColumn !== column) return false

				// Must be untapped
				if (row.status !== "pending") return false

				// Check Y bounds
				const tileTop = row.y
				const tileBottom = row.y + TILE_HEIGHT

				return tapY >= tileTop && tapY <= tileBottom
			})
		},
		[tileRows],
	)

	const handleSuccessfulTap = useCallback(
		(tile: TileRow) => {
			// Play sequential note based on current state
			const { noteIndex: ni } = usePianoStore.getState()
			const currentNote = noteSequence[ni]
			audioManager.playNote(currentNote)

			// Trigger medium haptic feedback for successful tap
			if (haptics) {
				haptics.impactOccurred("medium")
			}

			// Update tileRows, noteIndex, score atomically
			usePianoStore.setState((state) => ({
				tileRows: state.tileRows.map((row) =>
					row.id === tile.id
						? { ...row, status: TileInteractionStatus.TAPPED }
						: row,
				),
				noteIndex: (state.noteIndex + 1) % noteSequence.length,
				score: state.score + 10,
			}))
		},
		[haptics],
	)

	const handleMissedTap = useCallback(
		(_column: number, tapY: number) => {
			// Find the tile row that corresponds to the clicked position
			const clickedRow = tileRows.find((row) => {
				const tileTop = row.y
				const tileBottom = row.y + TILE_HEIGHT
				return tapY >= tileTop && tapY <= tileBottom
			})

			// Trigger heavy haptic feedback for wrong tap
			if (haptics) {
				haptics.impactOccurred("heavy")
			}

			// Decrease lives and mark clicked row (if any), possibly set GAMEOVER
			usePianoStore.setState((state) => {
				const newRows = clickedRow
					? state.tileRows.map((row) =>
							row.id === clickedRow.id
								? { ...row, status: TileInteractionStatus.MISSED }
								: row,
						)
					: state.tileRows

				const newLives = state.lives - 1
				return {
					tileRows: newRows,
					lives: newLives,
					gameStatus: newLives <= 0 ? GameStatus.GAMEOVER : state.gameStatus,
				}
			})
		},
		[tileRows, haptics],
	)

	const handleInteraction = useCallback(
		(
			e: React.TouchEvent | React.MouseEvent,
			gameAreaRef: React.RefObject<HTMLElement>,
		) => {
			e.preventDefault() // Prevent scrolling/zooming

			if (gameStatus !== GameStatus.PLAYING) return

			const coords = extractCoordinates(e)
			const gameCoords = getGameCoordinates(coords.x, coords.y, gameAreaRef)

			if (!gameCoords) return

			const hitTile = findTileAtPosition(gameCoords.column, gameCoords.y)

			if (hitTile) {
				// Successful tap on black tile
				handleSuccessfulTap(hitTile)
			} else if (gameCoords.column >= 0 && gameCoords.column <= 3) {
				// Tap on white space - miss
				handleMissedTap(gameCoords.column, gameCoords.y)
			}
			// Ignore taps outside game area
		},
		[
			extractCoordinates,
			findTileAtPosition,
			gameStatus,
			getGameCoordinates,
			handleMissedTap,
			handleSuccessfulTap,
		],
	)

	// Game actions
	const resetGame = useCallback(() => {
		usePianoStore.setState({
			lives: 1,
			score: 0,
			gameStatus: GameStatus.PLAYING,
			noteIndex: 0,
			tileRows: initialTileRows,
		})

		gameStartTimeRef.current = 0
		currentSpeedRef.current = GAME_SPEED
		lastFrameTimeRef.current = 0
		lastSpeedUpdateRef.current = 0
		nextIdRef.current = 8
	}, [])

	return {
		// Game state
		lives,
		score,
		gameStatus,
		tileRows,
		noteIndex,

		// Game actions
		resetGame,
		handleInteraction,

		// Utility functions
		extractCoordinates,
		getGameCoordinates,
		findTileAtPosition,
		handleSuccessfulTap,
		handleMissedTap,
	}
}
