"use client"

import { useFrame } from "@/components/FarcasterProvider"
import { SafeAreaContainer } from "@/components/SafeAreaContainer"
import Welcome from "../Home/Welcome"

export default function Home() {
	const { context, isLoading, isSDKLoaded } = useFrame()

	if (isLoading) {
		return (
			<SafeAreaContainer insets={context?.client.safeAreaInsets}>
				<div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8">
					<h1 className="text-3xl font-bold text-center">Loading...</h1>
				</div>
			</SafeAreaContainer>
		)
	}

	if (!isSDKLoaded) {
		return (
			<SafeAreaContainer insets={context?.client.safeAreaInsets}>
				<div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8">
					<h1 className="text-3xl font-bold text-center">
						No farcaster SDK found, please use this miniapp in the farcaster app
					</h1>
				</div>
			</SafeAreaContainer>
		)
	}

	return (
		<SafeAreaContainer insets={context?.client.safeAreaInsets}>
			<Welcome />
		</SafeAreaContainer>
	)
}
