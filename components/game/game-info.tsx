import type { GameStatus } from "@/types"

interface GameInfoProps {
	lives: number
	score: number
	gameStatus: GameStatus
}

/**
 * Bottom bar in the game screen that shows basic game info as the user plays it.
 */
const GameInfo = ({ lives, score, gameStatus }: GameInfoProps) => {
	return (
		<div className="h-[10vh] flex items-center justify-between px-4 bg-gray-800">
			<div className="flex items-center space-x-4">
				<div className="flex items-center space-x-2">
					<span>❤️</span>
					<span>{lives}</span>
				</div>
				<div className="flex items-center space-x-2">
					<span>Score:</span>
					<span>{score}</span>
				</div>
			</div>
			<div className="text-sm">Status: {gameStatus}</div>
		</div>
	)
}

export default GameInfo
