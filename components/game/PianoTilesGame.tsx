'use client'


export function PianoTilesGame() {
  // [uv1000] do we want the SafeAreaContainer here? tbd
  return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        {/* Header - 10% of viewport */}
        <header className="h-[10vh] flex items-center justify-between px-4 relative">
          <div className="text-lg font-bold">2x</div>
          {/* <div></div> */}
        </header>

        {/* Game Area - 80% of viewport */}
        <main className="h-[80vh] bg-gray-900 relative overflow-hidden">
          <div className="text-center text-white py-8">
            Game Area - Piano Tiles will go here
          </div>
        </main>

        {/* Footer - 10% of viewport */}
        {/* [uv1000] niche theory around vh? */}
        <footer className="h-[10vh] flex items-center justify-between px-4 bg-gray-800">
          {/* [uv1000] needs some zustand magic - this will become its own component tied to the state manager */}
          <div className="flex items-center space-x-2">
            <span>❤️</span>
            <span>3</span>
          </div>
          {/* [uv1000] zustaaaaaaaaaaaaaaaand */}
          <div className="text-sm">
            Progress: 0%
          </div>
        </footer>
      </div>
  )
}