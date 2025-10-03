import { TileInteractionStatus } from "@/types"

/**
 * number of pixels we scroll by for complexity increments
 */
export const GAME_SPEED = 200

/**
 * height of each tile in pixels
 */
export const TILE_HEIGHT = 100

export const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]
export const noteSequence = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]
export const initialTileRows = [
	{ id: 1, y: 0, activeColumn: 0, status: TileInteractionStatus.PENDING },
	{ id: 2, y: 80, activeColumn: 1, status: TileInteractionStatus.PENDING },
	{ id: 3, y: 160, activeColumn: 3, status: TileInteractionStatus.PENDING },
	{ id: 4, y: 240, activeColumn: 2, status: TileInteractionStatus.PENDING },
	{ id: 5, y: 320, activeColumn: 1, status: TileInteractionStatus.PENDING },
	{ id: 6, y: 400, activeColumn: 0, status: TileInteractionStatus.PENDING },
	{ id: 7, y: 480, activeColumn: 0, status: TileInteractionStatus.PENDING },
]
