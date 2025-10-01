export class AudioManager {
	private audioCache: Map<string, HTMLAudioElement> = new Map()
	private isEnabled: boolean = true

	constructor() {
		// Pre-load all audio files
		this.preloadAudio()
	}

	private async preloadAudio(): Promise<void> {
		const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]

		for (const note of notes) {
			try {
				const audio = new Audio(`/audio/${note}.mp3`)
				audio.preload = "auto"
				this.audioCache.set(note, audio)
			} catch (error) {
				console.warn(`Failed to preload audio for note ${note}:`, error)
			}
		}
	}

	public playNote(note: string): void {
		if (!this.isEnabled) return

		const audio = this.audioCache.get(note)
		if (!audio) {
			console.warn(`Audio not found for note: ${note}`)
			return
		}

		try {
			// Reset audio to beginning in case it's still playing
			audio.currentTime = 0
			audio.play()
		} catch (error) {
			console.warn(`Failed to play note ${note}:`, error)
		}
	}

	public setEnabled(enabled: boolean): void {
		this.isEnabled = enabled
	}

	public isAudioEnabled(): boolean {
		return this.isEnabled
	}
}

// Create a singleton instance
export const audioManager = new AudioManager()
