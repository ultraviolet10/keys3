import type { Metadata } from "next"
import { GameScreen } from "@/components/game/GameScreen"
import { APP_URL } from "@/lib/constants"

const frame = {
	version: "next",
	imageUrl: `${APP_URL}/images/feed.png`,
	button: {
		title: "Play Piano Tiles",
		action: {
			type: "launch_frame",
			name: "Piano Tiles Game",
			url: `${APP_URL}/game`,
			splashImageUrl: `${APP_URL}/images/splash.png`,
			splashBackgroundColor: "#f7f7f7",
		},
	},
}

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "keys3",
		openGraph: {
			title: "keys3",
			description: "tippytap to earn",
		},
		other: {
			"fc:frame": JSON.stringify(frame),
		},
	}
}

export default function GamePage() {
	return <GameScreen />
}
