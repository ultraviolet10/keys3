import { cva } from "class-variance-authority"
import { GameStatus } from "@/types"

interface GameInfoProps {
	lives: number
	score: number
	gameStatus: GameStatus
	currentLevel: number
	audioEngine: "static" | "tone"
}

const infoBarVariants = cva(
	"h-[10vh] flex items-center justify-between px-4 border-t transition-colors duration-200",
	{
		variants: {
			status: {
				playing: "bg-gray-800 border-gray-700",
				paused: "bg-yellow-800 border-yellow-700",
				gameover: "bg-red-800 border-red-700",
				idle: "bg-gray-800 border-gray-700",
			},
		},
		defaultVariants: {
			status: "playing",
		},
	},
)

// CVA variants for stat items
const statItemVariants = cva(
	"flex items-center space-x-2 text-sm font-medium",
	{
		variants: {
			type: {
				lives: "text-red-300",
				score: "text-blue-300",
				status: "text-gray-300",
				level: "text-purple-300",
				engine: "text-green-300",
			},
			highlight: {
				true: "text-white font-bold font-orange-kid",
				false: "",
			},
		},
		defaultVariants: {
			type: "lives",
			highlight: false,
		},
	},
)

// CVA variants for stat icons/labels
const statLabelVariants = cva(
	"text-xs font-medium uppercase tracking-wider font-orange-kid",
	{
		variants: {
			type: {
				lives: "text-red-400",
				score: "text-blue-400",
				status: "text-gray-400",
				level: "text-purple-400",
				engine: "text-green-400",
			},
		},
		defaultVariants: {
			type: "lives",
		},
	},
)

/**
 * Bottom bar in the game screen that shows basic game info as the user plays it.
 */
const GameInfo = ({
	lives,
	score,
	gameStatus,
	currentLevel,
	audioEngine,
}: GameInfoProps) => {
	const getStatusKey = (
		status: GameStatus,
	): "playing" | "paused" | "gameover" | "idle" => {
		switch (status) {
			case GameStatus.PLAYING:
				return "playing"
			case GameStatus.PAUSED:
				return "paused"
			case GameStatus.GAMEOVER:
				return "gameover"
			default:
				return "idle"
		}
	}

	return (
		<div className={infoBarVariants({ status: getStatusKey(gameStatus) })}>
			<div className="flex items-center space-x-6">
				{/* Lives */}
				<div
					className={statItemVariants({ type: "lives", highlight: lives <= 1 })}
				>
					<span className="text-lg">❤️</span>
					<div className="flex flex-col">
						<span className={statLabelVariants({ type: "lives" })}>Lives</span>
						<span className="text-lg font-bold font-orange-kid">{lives}</span>
					</div>
				</div>

				{/* Score */}
				<div className={statItemVariants({ type: "score" })}>
					<span className="text-lg">🎯</span>
					<div className="flex flex-col">
						<span className={statLabelVariants({ type: "score" })}>Score</span>
						<span className="text-lg font-bold font-orange-kid">
							{score.toLocaleString()}
						</span>
					</div>
				</div>

				{/* Level */}
				<div className={statItemVariants({ type: "level" })}>
					<span className="text-lg">🎼</span>
					<div className="flex flex-col">
						<span className={statLabelVariants({ type: "level" })}>Level</span>
						<span className="text-lg font-bold font-orange-kid">
							{currentLevel}
						</span>
					</div>
				</div>
			</div>

			<div className="flex items-center space-x-4">
				{/* Audio Engine */}
				<div className={statItemVariants({ type: "engine" })}>
					<span className="text-lg">
						{audioEngine === "tone" ? "🎹" : "🎵"}
					</span>
					<div className="flex flex-col text-right">
						<span className={statLabelVariants({ type: "engine" })}>Audio</span>
						<span className="text-sm font-semibold font-orange-kid capitalize">
							{audioEngine === "tone" ? "Synth" : "Classic"}
						</span>
					</div>
				</div>

				{/* Game Status */}
				<div className={statItemVariants({ type: "status" })}>
					<div className="text-right">
						<div className={statLabelVariants({ type: "status" })}>Status</div>
						<div className="text-sm font-semibold font-orange-kid capitalize">
							{gameStatus.toLowerCase()}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default GameInfo
