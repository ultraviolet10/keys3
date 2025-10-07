import { useCallback, useEffect, useRef } from "react"
import { useFrame } from "@/components/FarcasterProvider"
import { unifiedAudioManager } from "@/lib/audio/UnifiedAudioManager"
import {
	furElisePhrase1,
	furElisePhrase2,
	furElisePhrase3,
	furElisePhrase4,
	furElisePhrase5,
	furElisePhrase6,
	furElisePhrase7,
	furElisePhrase8,
	furEliseSequence,
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
	const melodyIndex = usePianoStore((s) => s.melodyIndex)
	const melodyCompleted = usePianoStore((s) => s.melodyCompleted)
	const currentLevel = usePianoStore((s) => s.currentLevel)
	const completedMelodies = usePianoStore((s) => s.completedMelodies)
	const audioEngine = usePianoStore((s) => s.audioEngine)
	const tileRows = usePianoStore((s) => s.tileRows)

	// Get haptics from Farcaster frame
	const { haptics } = useFrame()

	// Initialize audio engine based on current state
	useEffect(() => {
		unifiedAudioManager.switchEngine(audioEngine)

		// Set level on the audio engine if it supports it
		const engine = unifiedAudioManager.getCurrentEngine()
		if (
			engine &&
			"setLevel" in engine &&
			typeof engine.setLevel === "function"
		) {
			engine.setLevel(currentLevel)
		}
	}, [audioEngine, currentLevel])

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
			const currentState = usePianoStore.getState()

			// Get current phrase based on melody index (8 notes per phrase)
			const _getCurrentPhrase = () => {
				const phrases = [
					furElisePhrase1,
					furElisePhrase2,
					furElisePhrase3,
					furElisePhrase4,
					furElisePhrase5,
					furElisePhrase6,
					furElisePhrase7,
					furElisePhrase8,
				]
				const phraseIndex = Math.floor(currentState.melodyIndex / 8)
				return phrases[phraseIndex] || furElisePhrase1
			}

			// Determine which note to play based on melody progress
			let currentNote: string
			let newMelodyIndex = currentState.melodyIndex
			let newNoteIndex = currentState.noteIndex
			let newMelodyCompleted = currentState.melodyCompleted
			let newGameStatus = currentState.gameStatus
			let newCurrentLevel = currentState.currentLevel
			let newCompletedMelodies = currentState.completedMelodies
			const newAudioEngine = currentState.audioEngine

			if (
				!currentState.melodyCompleted &&
				currentState.melodyIndex < furEliseSequence.length
			) {
				// Playing Für Elise sequence
				currentNote = furEliseSequence[currentState.melodyIndex]
				newMelodyIndex = currentState.melodyIndex + 1

				// Check if we completed a phrase (every 8 notes)
				const completedPhrases = Math.floor(newMelodyIndex / 8)
				const previousCompletedPhrases = Math.floor(
					currentState.melodyIndex / 8,
				)

				if (completedPhrases > previousCompletedPhrases) {
					// New phrase completed - check for level progression
					switch (completedPhrases) {
						case 1:
							// After phrase 1: Switch to Level 2 (Electric Piano)
							if (newCurrentLevel === 1) {
								newCurrentLevel = 2
								// Immediately update the audio engine level
								const engine = unifiedAudioManager.getCurrentEngine()
								if (
									engine &&
									"setLevel" in engine &&
									typeof engine.setLevel === "function"
								) {
									engine.setLevel(2)
								}
							}
							break
						case 2:
							// After phrase 2: Switch to Level 3 (Reverb + Higher Pitch)
							if (newCurrentLevel === 2) {
								newCurrentLevel = 3
								// Immediately update the audio engine level
								const engine = unifiedAudioManager.getCurrentEngine()
								if (
									engine &&
									"setLevel" in engine &&
									typeof engine.setLevel === "function"
								) {
									engine.setLevel(3)
								}
							}
							break
						default:
							// Continue with current level
							break
					}
				}

				// Check if all 8 phrases are completed (64 notes)
				if (newMelodyIndex >= furEliseSequence.length) {
					newMelodyCompleted = true
					newCompletedMelodies = currentState.completedMelodies + 1
					// Game completed - all 8 phrases of Für Elise
					newGameStatus = GameStatus.WON
				}
			} else {
				// Fallback to sequential notes after melody completion
				currentNote = noteSequence[currentState.noteIndex]
				newNoteIndex = (currentState.noteIndex + 1) % noteSequence.length
			}

			// Play note with current audio engine
			unifiedAudioManager.playNote(currentNote)

			// Trigger medium haptic feedback for successful tap
			if (haptics) {
				haptics.impactOccurred("medium")
			}

			// Update game state atomically
			usePianoStore.setState((state) => ({
				tileRows: state.tileRows.map((row) =>
					row.id === tile.id
						? { ...row, status: TileInteractionStatus.TAPPED }
						: row,
				),
				melodyIndex: newMelodyIndex,
				noteIndex: newNoteIndex,
				melodyCompleted: newMelodyCompleted,
				gameStatus: newGameStatus,
				currentLevel: newCurrentLevel,
				completedMelodies: newCompletedMelodies,
				audioEngine: newAudioEngine,
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
				// Check if there's actually a tile row at this Y position
				const tileRowAtPosition = tileRows.find((row) => {
					const tileTop = row.y
					const tileBottom = row.y + TILE_HEIGHT
					return gameCoords.y >= tileTop && gameCoords.y <= tileBottom
				})

				// Only count as miss if there's actually a tile row here (white space tap)
				if (tileRowAtPosition) {
					handleMissedTap(gameCoords.column, gameCoords.y)
				}
				// Otherwise ignore taps in empty space
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
			tileRows.find,
		],
	)

	// Game actions
	const resetGame = useCallback(() => {
		usePianoStore.setState({
			lives: 1,
			score: 0,
			gameStatus: GameStatus.PLAYING,
			noteIndex: 0,
			melodyIndex: 0,
			melodyCompleted: false,
			currentLevel: 1,
			completedMelodies: 0,
			audioEngine: "tone",
			tileRows: initialTileRows,
		})

		// Reset audio engine to Tone.js
		unifiedAudioManager.switchEngine("tone")

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
		melodyIndex,
		melodyCompleted,
		currentLevel,
		completedMelodies,
		audioEngine,

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
