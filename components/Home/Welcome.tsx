"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { audioManager } from "@/lib/audio/AudioManager"
import { noteSequence } from "@/lib/store/constants"

const Welcome = () => {
	const router = useRouter()

	// Function to play a random piano note
	const playRandomNote = () => {
		const randomNote =
			noteSequence[Math.floor(Math.random() * noteSequence.length)]
		audioManager.playNote(randomNote)
	}

	return (
		<>
			<div className="fixed inset-0 -z-20">
				<Image
					src="/bg-intense.webp"
					alt="Piano tiles background"
					fill
					className="object-cover object-center"
					priority
					quality={90}
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-black/30" />
			</div>

			<div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 space-y-8 font-orange-kid">
				<div className="flex rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm border border-gray-400/30">
					{"keys3".split("").map((letter, index) => (
						<button
							key={`${JSON.stringify(index)}`}
							type="button"
							onClick={() => router.push("/game")}
							onMouseDown={() => playRandomNote()}
							className={`
								flex items-center justify-center px-6 py-8 h-20 font-bold text-2xl 
								transition-all duration-150 ease-out
								hover:transform hover:translateY-1 hover:shadow-inner
								active:transform active:translateY-2 active:shadow-inner active:scale-95
								focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
								${
									index % 2 === 0
										? "bg-white text-black hover:bg-gray-200 active:bg-gray-300 border-r border-gray-300 last:border-r-0"
										: "bg-black text-white hover:bg-gray-700 active:bg-gray-600 border-r border-gray-600 last:border-r-0"
								}
							`}
						>
							{letter.toUpperCase()}
						</button>
					))}
				</div>
			</div>
		</>
	)
}

export default Welcome
