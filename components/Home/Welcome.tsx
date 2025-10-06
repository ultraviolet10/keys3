"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

const Welcome = () => {
	const router = useRouter()
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

			{/* Content */}
			<div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 space-y-8 font-orange-kid">
				<button
					type="button"
					onClick={() => router.push("/game")}
					className="group flex rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm border border-gray-400/30 transition-transform hover:scale-105"
				>
					{"keys3".split("").map((letter, index) => (
						<div
							key={`${JSON.stringify(index)}`}
							className={`
								flex items-center justify-center px-6 py-8 h-20 font-bold text-2xl 
								transition-all duration-150 ease-out cursor-pointer
								hover:transform hover:translateY-1 hover:shadow-inner
								active:transform active:translateY-2 active:shadow-inner
								${
									index % 2 === 0
										? "bg-white text-black hover:bg-gray-200 active:bg-gray-300"
										: "bg-black text-white hover:bg-gray-700 active:bg-gray-600"
								}
							`}
						>
							{letter.toUpperCase()}
						</div>
					))}
				</button>
			</div>
		</>
	)
}

export default Welcome
