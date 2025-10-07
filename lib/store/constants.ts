import { TileInteractionStatus } from "@/types"

/**
 * number of pixels we scroll by for complexity increments
 */
export const GAME_SPEED = 200

/**
 * height of each tile in pixels
 */
export const TILE_HEIGHT = 100

// All available audio notes for preloading
export const notes = [
	// Natural notes across all octaves
	"C1",
	"C2",
	"C3",
	"C4",
	"C5",
	"C6",
	"C7",
	"C8",
	"D1",
	"D2",
	"D3",
	"D4",
	"D5",
	"D6",
	"D7",
	"E1",
	"E2",
	"E3",
	"E4",
	"E5",
	"E6",
	"E7",
	"F1",
	"F2",
	"F3",
	"F4",
	"F5",
	"F6",
	"F7",
	"G1",
	"G2",
	"G3",
	"G4",
	"G5",
	"G6",
	"G7",
	"A0",
	"A1",
	"A2",
	"A3",
	"A4",
	"A5",
	"A6",
	"A7",
	"B0",
	"B1",
	"B2",
	"B3",
	"B4",
	"B5",
	"B6",
	"B7",

	// Sharp/flat notes (using flat notation as in your files)
	"Db1",
	"Db2",
	"Db3",
	"Db4",
	"Db5",
	"Db6",
	"Db7",
	"Db8",
	"Eb1",
	"Eb2",
	"Eb3",
	"Eb4",
	"Eb5",
	"Eb6",
	"Eb7",
	"Gb1",
	"Gb2",
	"Gb3",
	"Gb4",
	"Gb5",
	"Gb6",
	"Gb7",
	"Ab1",
	"Ab2",
	"Ab3",
	"Ab4",
	"Ab5",
	"Ab6",
	"Ab7",
	"Bb0",
	"Bb1",
	"Bb2",
	"Bb3",
	"Bb4",
	"Bb5",
	"Bb6",
	"Bb7",
]

// Für Elise - Opening 8 phrases (actual composition)
// Each phrase completion triggers level progression
export const furElisePhrase1 = [
	"E5",
	"Eb5",
	"E5",
	"Eb5",
	"E5",
	"B4",
	"D5",
	"C5",
]
export const furElisePhrase2 = ["A4", "C4", "E4", "A4", "B4", "E4", "Ab4", "B4"]
export const furElisePhrase3 = [
	"C5",
	"E4",
	"E5",
	"Eb5",
	"E5",
	"Eb5",
	"E5",
	"B4",
]
export const furElisePhrase4 = ["D5", "C5", "A4", "C4", "E4", "A4", "B4", "E4"]
export const furElisePhrase5 = ["C5", "B4", "A4", "A4", "B4", "C5", "D5", "E5"]
export const furElisePhrase6 = ["G4", "F5", "E5", "D5", "F4", "E5", "D5", "C5"]
export const furElisePhrase7 = ["E4", "D5", "C5", "B4", "E4", "E5", "E5", "E6"]
export const furElisePhrase8 = [
	"E5",
	"Eb5",
	"E5",
	"Eb5",
	"E5",
	"B4",
	"D5",
	"C5",
]

// Combined full sequence for reference
export const furEliseSequence = [
	...furElisePhrase1,
	...furElisePhrase2,
	...furElisePhrase3,
	...furElisePhrase4,
	...furElisePhrase5,
	...furElisePhrase6,
	...furElisePhrase7,
	...furElisePhrase8,
]

// Legacy sequence renamed for clarity
export const melodySequence = furEliseSequence

// Level 2 melody sequence - Electric Piano Jazz progression
export const level2MelodySequence = [
	// Jazz-influenced melody with more complex harmonies
	"D4",
	"F4",
	"A4",
	"D5",
	"F5",
	"A5",
	"D6",
	"C4",
	"E4",
	"G4",
	"C5",
	"E5",
	"G5",
	"C6",
	"Bb3",
	"D4",
	"F4",
	"Bb4",
	"D5",
	"F5",
	"Bb5",
	"A3",
	"C4",
	"E4",
	"A4",
	"C5",
	"E5",
	"A5",

	// More sophisticated progression
	"F4",
	"A4",
	"C5",
	"F5",
	"A5",
	"C6",
	"F6",
	"G3",
	"B3",
	"D4",
	"G4",
	"B4",
	"D5",
	"G5",
	"E4",
	"G4",
	"B4",
	"E5",
	"G5",
	"B5",
	"E6",
	"C4",
	"E4",
	"G4",
	"C5",
	"E5",
	"G5",
	"C6",
]

// Level 3 melody sequence placeholder for future
export const level3MelodySequence = [
	// Synthwave-style sequence
	"C3",
	"G3",
	"C4",
	"E4",
	"G4",
	"C5",
	"E5",
	"G5",
	"F3",
	"C4",
	"F4",
	"A4",
	"C5",
	"F5",
	"A5",
	"C6",
	"G3",
	"D4",
	"G4",
	"B4",
	"D5",
	"G5",
	"B5",
	"D6",
	"Am3",
	"E4",
	"A4",
	"C5",
	"E5",
	"A5",
	"C6",
	"E6",
]

// Fallback sequence for continuous play after melody completes
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
