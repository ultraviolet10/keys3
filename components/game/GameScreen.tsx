"use client"

import { cva } from "class-variance-authority"
import { useRef } from "react"
import { usePiano } from "@/lib/hooks/usePiano"
import GameInfo from "./GameInfo"
import PerformanceMonitor from "./PerformanceMonitor"
import Tile from "./Tile"

// CVA variants for game container
const gameContainerVariants = cva(
	"relative overflow-hidden grid grid-cols-4 bg-gradient-to-b from-gray-100 to-gray-300",
	{
		variants: {
			height: {
				full: "h-[90vh]",
				compact: "h-[80vh]",
			},
		},
		defaultVariants: {
			height: "full",
		},
	},
)

// CVA variants for main container
const mainContainerVariants = cva(
	"flex min-h-screen flex-col text-white bg-gradient-to-br",
	{
		variants: {
			theme: {
				dark: "from-gray-900 via-black to-gray-800",
				classic: "from-black to-gray-900",
			},
		},
		defaultVariants: {
			theme: "classic",
		},
	},
)

export function GameScreen() {
	// Use the piano hook for all game logic
	const { lives, score, gameStatus, tileRows, handleInteraction } = usePiano()

	// Only need gameAreaRef for DOM reference
	const gameAreaRef = useRef<HTMLElement>(null)

	return (
		<div className={mainContainerVariants({ theme: "classic" })}>
			{/* Performance monitoring for development */}
			<PerformanceMonitor />

			<main
				ref={gameAreaRef}
				onTouchStart={(e) => handleInteraction(e, gameAreaRef)}
				onMouseDown={(e) => handleInteraction(e, gameAreaRef)}
				className={gameContainerVariants({ height: "full" })}
			>
				{tileRows.flatMap((row) =>
					// For each row, render 4 memoized tiles (one per column)
					[0, 1, 2, 3].map((columnIndex) => {
						const isActiveColumn = columnIndex === row.activeColumn

						return (
							<Tile
								key={`${row.id}-${columnIndex}`}
								rowId={row.id}
								columnIndex={columnIndex}
								yPosition={row.y}
								isActive={isActiveColumn}
								status={row.status}
							/>
						)
					}),
				)}
			</main>

			<GameInfo lives={lives} score={score} gameStatus={gameStatus} />
		</div>
	)
}
