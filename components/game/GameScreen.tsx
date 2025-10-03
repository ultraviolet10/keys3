"use client"

import { useRef } from "react"
import { usePiano } from "@/lib/hooks/usePiano"
import { TileInteractionStatus } from "@/types"
import GameInfo from "./GameInfo"

export function GameScreen() {
	// Use the piano hook for all game logic
	const { lives, score, gameStatus, tileRows, handleInteraction } = usePiano()

	// Only need gameAreaRef for DOM reference
	const gameAreaRef = useRef<HTMLElement>(null)

	return (
		<div className="flex min-h-screen flex-col bg-black text-white">
			<main
				ref={gameAreaRef}
				onTouchStart={(e) => handleInteraction(e, gameAreaRef)}
				onMouseDown={(e) => handleInteraction(e, gameAreaRef)}
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
