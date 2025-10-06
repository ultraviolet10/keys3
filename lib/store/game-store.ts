import { create } from "zustand"
import { GameStatus, type TileRow } from "@/types"
import { initialTileRows } from "./constants"

interface GameState {
	// variables
	lives: number
	score: number
	gameStatus: GameStatus
	noteIndex: number
	melodyIndex: number
	melodyCompleted: boolean
	tileRows: TileRow[]

	// setters
	setLives: (lives: number) => void
	setScore: (score: number) => void
	setGameStatus: (gameStatus: GameStatus) => void
	setNoteIndex: (noteIndex: number) => void
	setMelodyIndex: (melodyIndex: number) => void
	setMelodyCompleted: (completed: boolean) => void
	setTileRows: (tileRows: TileRow[]) => void
}

export const usePianoStore = create<GameState>()((set) => ({
	lives: 1,
	score: 0,
	gameStatus: GameStatus.PLAYING,
	noteIndex: 0,
	melodyIndex: 0,
	melodyCompleted: false,
	tileRows: initialTileRows,

	setLives: (lives: number) => set({ lives }),
	setScore: (score: number) => set({ score }),
	setGameStatus: (gameStatus: GameStatus) => set({ gameStatus }),
	setNoteIndex: (noteIndex: number) => set({ noteIndex }),
	setMelodyIndex: (melodyIndex: number) => set({ melodyIndex }),
	setMelodyCompleted: (completed: boolean) =>
		set({ melodyCompleted: completed }),
	setTileRows: (tileRows: TileRow[]) => set({ tileRows }),
}))
