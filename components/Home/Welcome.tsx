"use client"

import { useRouter } from "next/navigation"

const Welcome = () => {
	const router = useRouter()
	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 font-orange-kid">
			<button
				type="button"
				onClick={() => router.push("/game")}
				className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xl transition-colors"
			>
				🎹 keys3 🎵
			</button>
		</div>
	)
}

export default Welcome
