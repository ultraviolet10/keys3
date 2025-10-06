export interface SafeAreaInsets {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/**
 * Game interface types
 */
export enum TileInteractionStatus {
  PENDING = "pending",
  TAPPED = "tapped",
  MISSED = "missed",
}

export interface TileRow {
	id: number
	y: number // Y position in pixels
	activeColumn: number // Which column (0-3) has the black tile
	status: TileInteractionStatus // Track tile interaction state
	missedColumn?: number // Which column was clicked incorrectly (if any)
}

export enum GameStatus {
	IDLE = "idle",
	PLAYING = "playing",
	PAUSED = "paused",
	GAMEOVER = "gameOver",
	WON = "won",
}
