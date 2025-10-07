export interface AudioEngineInterface {
	playNote(note: string): void | Promise<void>
	setEnabled(enabled: boolean): void
	isAudioEnabled(): boolean
	setLevel?(level: number): void
	getCurrentLevel?(): number
}
