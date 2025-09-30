'use client'

import { FarcasterActions } from '@/components/Home/FarcasterActions'
import { User } from '@/components/Home/User'
import { WalletActions } from '@/components/Home/WalletActions'
import { NotificationActions } from './NotificationActions'
import CustomOGImageAction from './CustomOGImageAction'
import { Haptics } from './Haptics'
import { useRouter } from 'next/navigation'

export function Demo() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Monad Farcaster MiniApp Template
      </h1>
      
      {/* Game Navigation */}
      <button
        onClick={() => router.push('/game')}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xl transition-colors"
      >
        Play Piano Tiles 🎹
      </button>

      <div className="w-full max-w-4xl space-y-6">
        <User />
        <FarcasterActions />
        <NotificationActions />
        <WalletActions />
        <CustomOGImageAction />
        <Haptics />
      </div>
    </div>
  )
}
