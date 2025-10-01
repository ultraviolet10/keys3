"use client"

import { useEffect, useRef, useState } from "react"

interface TileRow {
	id: number
	y: number // Y position in pixels
	activeColumn: number // Which column (0-3) has the black tile
	status: "pending" | "tapped" | "missed" // Track tile interaction state
}

export function GameScreen() {
	// Game constants
	const GAME_SPEED = 200 // pixels per second
	const TILE_HEIGHT = 80

	// Game state - TODO: Replace with Zustand store later
	const [lives, setLives] = useState(3)
	const [score, setScore] = useState(0)
	const [gameStatus, setGameStatus] = useState<
		"idle" | "playing" | "paused" | "gameOver"
	>("playing")

	// TODO: Replace with Zustand store - this is temporary local state for testing
	const [tileRows, setTileRows] = useState<TileRow[]>([
		{ id: 1, y: 0, activeColumn: 0, status: "pending" }, // Row 1: black tile in column 0
		{ id: 2, y: 80, activeColumn: 1, status: "pending" }, // Row 2: black tile in column 1
		{ id: 3, y: 160, activeColumn: 3, status: "pending" }, // Row 3: black tile in column 3
		{ id: 4, y: 240, activeColumn: 2, status: "pending" }, // Row 4: black tile in column 2
		{ id: 5, y: 320, activeColumn: 1, status: "pending" }, // Row 5: black tile in column 1
		{ id: 6, y: 400, activeColumn: 0, status: "pending" }, // Row 6: black tile in column 0
		{ id: 7, y: 480, activeColumn: 0, status: "pending" }, // Row 6: black tile in column 0
	])

	// Animation loop refs
	const lastFrameTimeRef = useRef<number>(0)
	const animationIdRef = useRef<number>(0)
	const nextIdRef = useRef<number>(8) // Next tile ID to assign
	const gameAreaRef = useRef<HTMLElement>(null) // Reference to game area for coordinate mapping

	// Animation loop
	// biome-ignore lint/correctness/useExhaustiveDependencies: i'll study it all in a bit
	useEffect(() => {
		const gameLoop = (timestamp: number) => {
			// Calculate delta time in seconds
			const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000
			lastFrameTimeRef.current = timestamp

			// Update tile positions, spawn new tiles, and clean up off-screen tiles
			setTileRows((prevRows) => {
				let updatedRows = prevRows.map((row) => ({
					...row,
					y: row.y + GAME_SPEED * deltaTime,
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
						status: "pending", // All new tiles start as pending
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
	}, [GAME_SPEED])

	// Touch/Click event handling
	const extractCoordinates = (e: React.TouchEvent | React.MouseEvent) => {
		if ("touches" in e) {
			// Mobile touch
			return { x: e.touches[0].clientX, y: e.touches[0].clientY }
		} else {
			// Desktop click
			return { x: e.clientX, y: e.clientY }
		}
	}

	const getGameCoordinates = (screenX: number, screenY: number) => {
		if (!gameAreaRef.current) return null

		const gameArea = gameAreaRef.current.getBoundingClientRect()
		const relativeX = screenX - gameArea.left
		const relativeY = screenY - gameArea.top

		// Which column (0-3)
		const column = Math.floor(relativeX / (gameArea.width / 4))

		return { column, y: relativeY }
	}

	const findTileAtPosition = (column: number, tapY: number) => {
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
	}

	const handleSuccessfulTap = (tile: TileRow) => {
		// Update tile status to tapped
		setTileRows((prevRows) =>
			prevRows.map((row) =>
				row.id === tile.id ? { ...row, status: "tapped" } : row,
			),
		)

		// Update score
		setScore((prevScore) => prevScore + 10)
	}

	const handleMissedTap = () => {
		// Decrease lives
		setLives((prevLives) => {
			const newLives = prevLives - 1
			if (newLives <= 0) {
				setGameStatus("gameOver")
			}
			return newLives
		})
	}

	const handleInteraction = (e: React.TouchEvent | React.MouseEvent) => {
		e.preventDefault() // Prevent scrolling/zooming

		if (gameStatus !== "playing") return

		const coords = extractCoordinates(e)
		const gameCoords = getGameCoordinates(coords.x, coords.y)

		if (!gameCoords) return

		const hitTile = findTileAtPosition(gameCoords.column, gameCoords.y)

		if (hitTile) {
			// Successful tap on black tile
			handleSuccessfulTap(hitTile)
		} else if (gameCoords.column >= 0 && gameCoords.column <= 3) {
			// Tap on white space - miss
			handleMissedTap()
		}
		// Ignore taps outside game area
	}

	// [uv1000] do we want the SafeAreaContainer here? tbd
	return (
		<div className="flex min-h-screen flex-col bg-black text-white">
			{/* Header - 10% of viewport */}
			<header className="h-[10vh] flex items-center justify-between px-4 relative">
				<div className="text-lg font-bold">2x</div>
				{/* <div></div> */}
			</header>

			{/* Game Area - 80% of viewport */}
			<main
				ref={gameAreaRef}
				onTouchStart={handleInteraction}
				onMouseDown={handleInteraction}
				className="h-[80vh] bg-gray-200 relative overflow-hidden grid grid-cols-4"
			>
				{tileRows.flatMap((row) =>
					// For each row, render 4 tiles (one per column)
					[0, 1, 2, 3].map((columnIndex) => {
						const isActiveColumn = columnIndex === row.activeColumn
						let bgColor = "bg-white" // Default white space

						if (isActiveColumn) {
							// Color based on tile status
							switch (row.status) {
								case "pending":
									bgColor = "bg-black"
									break
								case "tapped":
									bgColor = "bg-blue-500"
									break
								case "missed":
									bgColor = "bg-red-500"
									break
							}
						}

						return (
							<div
								key={`${row.id}-${columnIndex}`}
								className={`absolute w-full h-20 border border-gray-400 ${bgColor}`}
								style={{
									gridColumn: columnIndex + 1, // CSS grid columns are 1-based [uv1000] theory???
									transform: `translateY(${row.y}px)`,
								}}
							/>
						)
					}),
				)}
			</main>

			{/* Footer - 10% of viewport */}
			<footer className="h-[10vh] flex items-center justify-between px-4 bg-gray-800">
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-2">
						<span>❤️</span>
						<span>{lives}</span>
					</div>
					<div className="flex items-center space-x-2">
						<span>Score:</span>
						<span>{score}</span>
					</div>
				</div>
				<div className="text-sm">Status: {gameStatus}</div>
			</footer>
		</div>
	)
}
