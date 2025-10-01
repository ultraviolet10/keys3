"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { GAME_SPEED, TILE_HEIGHT } from "@/lib/store/constants"
import { GameStatus, TileInteractionStatus, type TileRow } from "@/types"
import GameInfo from "./GameInfo"

export function GameScreen() {
	// Game state - TODO: Replace with Zustand store later
	const [lives, setLives] = useState(3)
	const [score, setScore] = useState(0)
	const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.PLAYING)
	const gameStartTimeRef = useRef<number>(0)
	const currentSpeedRef = useRef<number>(GAME_SPEED)

	// TODO: Replace with Zustand store - this is temporary local state for testing
	const [tileRows, setTileRows] = useState<TileRow[]>([
		{ id: 1, y: 0, activeColumn: 0, status: TileInteractionStatus.PENDING }, // Row 1: black tile in column 0
		{ id: 2, y: 80, activeColumn: 1, status: TileInteractionStatus.PENDING }, // Row 2: black tile in column 1
		{ id: 3, y: 160, activeColumn: 3, status: TileInteractionStatus.PENDING }, // Row 3: black tile in column 3
		{ id: 4, y: 240, activeColumn: 2, status: TileInteractionStatus.PENDING }, // Row 4: black tile in column 2
		{ id: 5, y: 320, activeColumn: 1, status: TileInteractionStatus.PENDING }, // Row 5: black tile in column 1
		{ id: 6, y: 400, activeColumn: 0, status: TileInteractionStatus.PENDING }, // Row 6: black tile in column 0
		{ id: 7, y: 480, activeColumn: 0, status: TileInteractionStatus.PENDING }, // Row 6: black tile in column 0
	])

	// Animation loop refs
	const lastFrameTimeRef = useRef<number>(0)
	const animationIdRef = useRef<number>(0)
	const nextIdRef = useRef<number>(8) // Next tile ID to assign
	const gameAreaRef = useRef<HTMLElement>(null) // Reference to game area for coordinate mapping
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

			// Update speed every 3 seconds
			const elapsedTime = (timestamp - gameStartTimeRef.current) / 1000
			const speedLevel = Math.floor(elapsedTime / 3)
			if (speedLevel !== lastSpeedUpdateRef.current) {
				lastSpeedUpdateRef.current = speedLevel
				const newSpeed = GAME_SPEED * (1 + speedLevel * 0.5) // Increase by 50% every 3 seconds
				currentSpeedRef.current = newSpeed
			}

			// Update tile positions, spawn new tiles, and clean up off-screen tiles
			setTileRows((prevRows) => {
				let updatedRows = prevRows.map((row) => ({
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

				return updatedRows
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

	/**
	 * [uv1000] should we be using so many useCallbacks here?
	 * my mental model with useCallback is writing it as a function that triggers only when one of the deps changes
	 */
	const extractCoordinates = useCallback(
		(e: React.TouchEvent | React.MouseEvent) => {
			// something something typeof?
			if ("touches" in e) {
				return { x: e.touches[0].clientX, y: e.touches[0].clientY }
			} else {
				// Desktop click
				return { x: e.clientX, y: e.clientY }
			}
		},
		[],
	)

	const getGameCoordinates = useCallback((screenX: number, screenY: number) => {
		if (!gameAreaRef.current) return null

		const gameArea = gameAreaRef.current.getBoundingClientRect()
		const relativeX = screenX - gameArea.left
		const relativeY = screenY - gameArea.top

		// Which column (0-3)
		const column = Math.floor(relativeX / (gameArea.width / 4))

		return { column, y: relativeY }
	}, [])

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

	const handleSuccessfulTap = useCallback((tile: TileRow) => {
		// Update tile status to tapped
		setTileRows((prevRows) =>
			prevRows.map((row) =>
				row.id === tile.id
					? { ...row, status: TileInteractionStatus.TAPPED }
					: row,
			),
		)

		// Update score
		setScore((prevScore) => prevScore + 10)
	}, [])

	const handleMissedTap = useCallback(
		(_column: number, tapY: number) => {
			// Find the tile row that corresponds to the clicked position
			const clickedRow = tileRows.find((row) => {
				const tileTop = row.y
				const tileBottom = row.y + TILE_HEIGHT
				return tapY >= tileTop && tapY <= tileBottom
			})

			// Mark the clicked white tile as missed for visual feedback
			if (clickedRow) {
				setTileRows((prevRows) =>
					prevRows.map((row) =>
						row.id === clickedRow.id
							? { ...row, status: TileInteractionStatus.MISSED }
							: row,
					),
				)
			}

			// Decrease lives
			setLives((prevLives) => {
				const newLives = prevLives - 1
				if (newLives <= 0) {
					setGameStatus(GameStatus.GAMEOVER)
				}
				return newLives
			})
		},
		[tileRows],
	)

	const handleInteraction = useCallback(
		(e: React.TouchEvent | React.MouseEvent) => {
			e.preventDefault() // Prevent scrolling/zooming

			if (gameStatus !== GameStatus.PLAYING) return

			const coords = extractCoordinates(e)
			const gameCoords = getGameCoordinates(coords.x, coords.y)

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

	return (
		<div className="flex min-h-screen flex-col bg-black text-white">
			<main
				ref={gameAreaRef}
				onTouchStart={handleInteraction}
				onMouseDown={handleInteraction}
				// event end handlers?
				className="h-[90vh] bg-gray-200 relative overflow-hidden grid grid-cols-4" // 90% of the viewport
			>
				{tileRows.flatMap((row) =>
					// For each row, render 4 tiles (one per column)
					[0, 1, 2, 3].map((columnIndex) => {
						const isActiveColumn = columnIndex === row.activeColumn
						let bgColor = "bg-white" // Default white space

						if (isActiveColumn) {
							// Color based on tile status for black tiles
							switch (row.status) {
								case TileInteractionStatus.PENDING:
									bgColor = "bg-black"
									break
								case TileInteractionStatus.TAPPED:
									bgColor = "bg-blue-500"
									break
								case TileInteractionStatus.MISSED:
									bgColor = "bg-red-500"
									break
							}
						} else if (row.status === TileInteractionStatus.MISSED) {
							// Show red background for white tiles that were clicked incorrectly
							bgColor = "bg-red-500"
						}

						return (
							<div
								key={`${row.id}-${columnIndex}`}
								className={`absolute w-full h-20 border border-gray-400 ${bgColor}`}
								style={{
									gridColumn: columnIndex + 1,
									transform: `translateY(${row.y}px)`,
								}}
							/>
						)
					}),
				)}
			</main>

			<GameInfo lives={lives} score={score} gameStatus={gameStatus} />
		</div>
	)
}
