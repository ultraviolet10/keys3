import { create } from "zustand"
import { GameStatus, type TileRow } from "@/types"
import { initialTileRows } from "./constants"

interface GameState {
	// variables
	lives: number
	score: number
	gameStatus: GameStatus
	noteIndex: number
	tileRows: TileRow[]

	// setters
	setLives: (lives: number) => void
	setScore: (score: number) => void
	setGameStatus: (gameStatus: GameStatus) => void
	setNoteIndex: (noteIndex: number) => void
	setTileRows: (tileRows: TileRow[]) => void
}

export const usePianoStore = create<GameState>()((set) => ({
	lives: 1,
	score: 0,
	gameStatus: GameStatus.PLAYING,
	noteIndex: 0,
	tileRows: initialTileRows,

	setLives: (lives: number) => set({ lives }),
	setScore: (score: number) => set({ score }),
	setGameStatus: (gameStatus: GameStatus) => set({ gameStatus }),
	setNoteIndex: (noteIndex: number) => set({ noteIndex }),
	setTileRows: (tileRows: TileRow[]) => set({ tileRows }),
}))
