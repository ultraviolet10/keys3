"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { useRef } from "react"
import { usePiano } from "@/lib/hooks/usePiano"
import { TileInteractionStatus } from "@/types"
import GameInfo from "./GameInfo"

// CVA variants for tile styling
const tileVariants = cva(
	// Base classes for all tiles
	"absolute w-full h-20 border border-gray-400 transition-colors duration-75",
	{
		variants: {
			type: {
				active: "", // Will use status for active tiles
				inactive: "bg-white", // Default white space
			},
			status: {
				pending: "bg-black",
				tapped: "bg-blue-500 shadow-lg shadow-blue-500/25",
				missed: "bg-red-500 shadow-lg shadow-red-500/25",
			},
		},
		compoundVariants: [
			// When inactive tile is missed (clicked white space)
			{
				type: "inactive",
				status: "missed",
				class: "bg-red-500 shadow-lg shadow-red-500/25",
			},
		],
		defaultVariants: {
			type: "inactive",
			status: "pending",
		},
	},
)

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

export interface TileProps extends VariantProps<typeof tileVariants> {
	position: { x: number; y: number }
	id: string
}

export function GameScreen() {
	// Use the piano hook for all game logic
	const { lives, score, gameStatus, tileRows, handleInteraction } = usePiano()

	// Only need gameAreaRef for DOM reference
	const gameAreaRef = useRef<HTMLElement>(null)

	return (
		<div className={mainContainerVariants({ theme: "classic" })}>
			<main
				ref={gameAreaRef}
				onTouchStart={(e) => handleInteraction(e, gameAreaRef)}
				onMouseDown={(e) => handleInteraction(e, gameAreaRef)}
				className={gameContainerVariants({ height: "full" })}
			>
				{tileRows.flatMap((row) =>
					// For each row, render 4 tiles (one per column)
					[0, 1, 2, 3].map((columnIndex) => {
						const isActiveColumn = columnIndex === row.activeColumn
						const tileType = isActiveColumn ? "active" : "inactive"
						const tileStatus = row.status as "pending" | "tapped" | "missed"

						return (
							<div
								key={`${row.id}-${columnIndex}`}
								className={tileVariants({
									type: tileType,
									status: isActiveColumn
										? tileStatus
										: row.status === TileInteractionStatus.MISSED
											? "missed"
											: "pending",
								})}
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
