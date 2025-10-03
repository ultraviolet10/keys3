import { cva } from "class-variance-authority"
import { memo } from "react"
import { TileInteractionStatus } from "@/types"

// CVA variants for tile styling (moved from GameScreen)
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

export interface TileProps {
	// Essential tile data
	rowId: number
	columnIndex: number
	yPosition: number
	isActive: boolean
	status: TileInteractionStatus
}

// Custom comparison function for memo to optimize re-renders
const arePropsEqual = (prevProps: TileProps, nextProps: TileProps): boolean => {
	// Only re-render if these specific props change
	return (
		prevProps.rowId === nextProps.rowId &&
		prevProps.columnIndex === nextProps.columnIndex &&
		prevProps.yPosition === nextProps.yPosition &&
		prevProps.isActive === nextProps.isActive &&
		prevProps.status === nextProps.status
	)
}

// Memoized tile component that only re-renders when props change
const Tile = memo(
	({ rowId, columnIndex, yPosition, isActive, status }: TileProps) => {
		// Development: Log renders to console to verify memoization
		if (process.env.NODE_ENV === "development") {
			console.log(
				`🎯 Tile render: Row ${rowId}, Col ${columnIndex}, Y: ${yPosition}, Active: ${isActive}, Status: ${status}`,
			)
		}

		// Determine tile type and status for CVA
		const tileType = isActive ? "active" : "inactive"
		const tileStatus = status as "pending" | "tapped" | "missed"

		// Calculate final status for CVA (handles inactive missed tiles)
		const finalStatus = isActive
			? tileStatus
			: status === TileInteractionStatus.MISSED
				? "missed"
				: "pending"

		return (
			<div
				className={tileVariants({
					type: tileType,
					status: finalStatus,
				})}
				style={{
					gridColumn: columnIndex + 1,
					transform: `translateY(${yPosition}px)`,
				}}
			/>
		)
	},
	arePropsEqual,
)

// Display name for debugging
Tile.displayName = "Tile"

export default Tile
