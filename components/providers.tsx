"use client"

import { FrameProvider } from "@/components/FarcasterProvider"
import { WalletProvider } from "@/components/WalletProvider"

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<WalletProvider>
			<FrameProvider>{children}</FrameProvider>
		</WalletProvider>
	)
}
