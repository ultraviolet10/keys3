
import { PianoTilesGame } from '@/components/game/PianoTilesGame'
import { APP_URL } from '@/lib/constants'
import type { Metadata } from 'next'

const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/images/feed.png`,
  button: {
    title: 'Play Piano Tiles',
    action: {
      type: 'launch_frame',
      name: 'Piano Tiles Game',
      url: `${APP_URL}/game`,
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: '#f7f7f7',
    },
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Piano Tiles - Keys3',
    openGraph: {
      title: 'Piano Tiles - Keys3',
      description: 'Test your rhythm and reflexes in this musical mini-game',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  }
}

export default function GamePage() {
  return <PianoTilesGame />
}