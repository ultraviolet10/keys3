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
	currentLevel: number
	completedMelodies: number
	audioEngine: "static" | "tone"

	// setters
	setLives: (lives: number) => void
	setScore: (score: number) => void
	setGameStatus: (gameStatus: GameStatus) => void
	setNoteIndex: (noteIndex: number) => void
	setMelodyIndex: (melodyIndex: number) => void
	setMelodyCompleted: (completed: boolean) => void
	setTileRows: (tileRows: TileRow[]) => void
	setCurrentLevel: (level: number) => void
	setCompletedMelodies: (count: number) => void
	setAudioEngine: (engine: "static" | "tone") => void
}

export const usePianoStore = create<GameState>()((set) => ({
	lives: 1,
	score: 0,
	gameStatus: GameStatus.PLAYING,
	noteIndex: 0,
	melodyIndex: 0,
	melodyCompleted: false,
	tileRows: initialTileRows,
	currentLevel: 1,
	completedMelodies: 0,
	audioEngine: "tone",

	setLives: (lives: number) => set({ lives }),
	setScore: (score: number) => set({ score }),
	setGameStatus: (gameStatus: GameStatus) => set({ gameStatus }),
	setNoteIndex: (noteIndex: number) => set({ noteIndex }),
	setMelodyIndex: (melodyIndex: number) => set({ melodyIndex }),
	setMelodyCompleted: (completed: boolean) =>
		set({ melodyCompleted: completed }),
	setTileRows: (tileRows: TileRow[]) => set({ tileRows }),
	setCurrentLevel: (level: number) => set({ currentLevel: level }),
	setCompletedMelodies: (count: number) => set({ completedMelodies: count }),
	setAudioEngine: (engine: "static" | "tone") => set({ audioEngine: engine }),
}))
