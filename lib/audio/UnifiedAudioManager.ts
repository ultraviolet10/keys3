import type { AudioEngineInterface } from "./AudioEngineInterface"
import { AudioManager } from "./AudioManager"
import { ToneAudioEngine } from "./ToneAudioEngine"

export class UnifiedAudioManager {
	private staticEngine: AudioManager
	private toneEngine: ToneAudioEngine
	private currentEngine: AudioEngineInterface

	constructor() {
		this.staticEngine = new AudioManager()
		this.toneEngine = new ToneAudioEngine()
		this.currentEngine = this.toneEngine // Start with Tone.js for Level 1 piano
	}

	public switchEngine(engineType: "static" | "tone"): void {
		if (engineType === "static") {
			this.currentEngine = this.staticEngine
		} else {
			this.currentEngine = this.toneEngine
		}
	}

	public async playNote(note: string): Promise<void> {
		const result = this.currentEngine.playNote(note)
		// Handle both sync and async playNote methods
		if (result instanceof Promise) {
			await result
		}
	}

	public setEnabled(enabled: boolean): void {
		this.staticEngine.setEnabled(enabled)
		this.toneEngine.setEnabled(enabled)
	}

	public isAudioEnabled(): boolean {
		return this.currentEngine.isAudioEnabled()
	}

	public getCurrentEngine(): AudioEngineInterface {
		return this.currentEngine
	}

	public getCurrentEngineType(): "static" | "tone" {
		return this.currentEngine === this.staticEngine ? "static" : "tone"
	}

	public async dispose(): Promise<void> {
		if (this.toneEngine.dispose) {
			await this.toneEngine.dispose()
		}
	}
}

// Create a singleton instance
export const unifiedAudioManager = new UnifiedAudioManager()
