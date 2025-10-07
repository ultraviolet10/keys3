import * as Tone from "tone"

export class ToneAudioEngine {
	private synth: Tone.Synth | null = null
	private reverb: Tone.Reverb | null = null
	private chorus: Tone.Chorus | null = null
	private isEnabled: boolean = true
	private isInitialized: boolean = false
	private currentLevel: number = 1

	private async initializeTone(): Promise<void> {
		if (this.isInitialized) return

		try {
			// Start the audio context (requires user interaction)
			if (Tone.context.state !== "running") {
				await Tone.start()
			}

			// Initialize synth based on current level
			this.updateSynthForLevel(this.currentLevel)

			this.isInitialized = true
		} catch (error) {
			console.warn("Failed to initialize Tone.js:", error)
		}
	}

	private updateSynthForLevel(level: number): void {
		// Dispose existing synth and effects
		if (this.synth) {
			this.synth.dispose()
		}
		if (this.reverb) {
			this.reverb.dispose()
		}
		if (this.chorus) {
			this.chorus.dispose()
		}

		try {
			switch (level) {
				case 1:
					// Level 1: Regular Piano Sound
					this.synth = new Tone.Synth({
						oscillator: {
							type: "sine",
						},
						envelope: {
							attack: 0.005,
							decay: 0.1,
							sustain: 0.3,
							release: 1,
						},
					}).toDestination()
					break

				case 2:
					// Level 2: Electric Piano Sound
					this.synth = new Tone.Synth({
						oscillator: {
							type: "fmsquare",
							modulationType: "sine",
							modulationIndex: 2,
							harmonicity: 0.5,
						},
						envelope: {
							attack: 0.02,
							decay: 0.3,
							sustain: 0.3,
							release: 1.2,
						},
					})

					this.chorus = new Tone.Chorus({
						frequency: 1.5,
						delayTime: 3.5,
						depth: 0.7,
						wet: 0.3,
					})
						.start()
						.toDestination()

					this.synth.connect(this.chorus)
					break
				default:
					// Level 3: Reverb + Higher Pitch
					this.synth = new Tone.Synth({
						oscillator: {
							type: "fmsquare",
							modulationType: "sine",
							modulationIndex: 3,
							harmonicity: 0.8,
						},
						envelope: {
							attack: 0.01,
							decay: 0.4,
							sustain: 0.5,
							release: 2,
						},
					})

					this.reverb = new Tone.Reverb({
						decay: 4,
						wet: 0.6,
					}).toDestination()

					this.chorus = new Tone.Chorus({
						frequency: 2,
						delayTime: 2.5,
						depth: 0.9,
						wet: 0.4,
					}).start()

					// Connect effects chain: synth -> chorus -> reverb -> destination
					this.synth.connect(this.chorus)
					this.chorus.connect(this.reverb)
					break
			}
		} catch (error) {
			console.warn(`Failed to create synth for level ${level}:`, error)
		}
	}

	public async playNote(note: string): Promise<void> {
		if (!this.isEnabled) return

		try {
			// Initialize on first play if needed
			if (!this.isInitialized) {
				await this.initializeTone()
			}

			if (!this.synth) {
				console.warn("Tone.js synth not initialized")
				return
			}

			// Convert note format and apply level-based pitch modifications
			const toneNote = this.convertNoteFormat(note)

			// Play the note with slight variation in duration for realism
			const duration = Math.random() * 0.1 + 0.3 // 0.3 to 0.4 seconds
			this.synth.triggerAttackRelease(toneNote, duration)
		} catch (error) {
			console.warn(`Failed to play note ${note} with Tone.js:`, error)
		}
	}

	private convertNoteFormat(note: string): string {
		// Convert from our format to Tone.js format if needed
		// Apply level-based pitch modifications
		if (this.currentLevel === 3) {
			// Level 3: Higher pitch - transpose up by one octave
			const noteWithoutOctave = note.slice(0, -1)
			const octave = parseInt(note.slice(-1), 10)
			return `${noteWithoutOctave}${octave + 1}`
		}

		// Levels 1 and 2: Use original pitch
		return note
	}

	public setLevel(level: number): void {
		if (this.currentLevel === level) return

		this.currentLevel = level

		// Update synth configuration if already initialized
		if (this.isInitialized) {
			this.updateSynthForLevel(level)
		}
	}

	public getCurrentLevel(): number {
		return this.currentLevel
	}

	public setEnabled(enabled: boolean): void {
		this.isEnabled = enabled
	}

	public isAudioEnabled(): boolean {
		return this.isEnabled
	}

	public async dispose(): Promise<void> {
		if (this.synth) {
			this.synth.dispose()
			this.synth = null
		}
		this.isInitialized = false
	}
}

// Create a singleton instance
export const toneAudioEngine = new ToneAudioEngine()
