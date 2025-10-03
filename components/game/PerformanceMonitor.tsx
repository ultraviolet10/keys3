import { useEffect, useRef, useState } from "react"

interface PerformanceStats {
	fps: number
	renderCount: number
	avgFrameTime: number
}

export const PerformanceMonitor = () => {
	const [stats, setStats] = useState<PerformanceStats>({
		fps: 0,
		renderCount: 0,
		avgFrameTime: 0,
	})
	const frameCountRef = useRef(0)
	const lastTimeRef = useRef(performance.now())
	const frameTimes = useRef<number[]>([])

	useEffect(() => {
		const updateStats = () => {
			const now = performance.now()
			const deltaTime = now - lastTimeRef.current

			// Track frame times for averaging
			frameTimes.current.push(deltaTime)
			if (frameTimes.current.length > 60) {
				frameTimes.current.shift() // Keep last 60 frames
			}

			frameCountRef.current++

			// Update stats every 60 frames (~1 second at 60fps)
			if (frameCountRef.current % 60 === 0) {
				const avgFrameTime =
					frameTimes.current.reduce((sum, time) => sum + time, 0) /
					frameTimes.current.length
				const fps = Math.round(1000 / avgFrameTime)

				setStats({
					fps,
					renderCount: frameCountRef.current,
					avgFrameTime: Math.round(avgFrameTime * 100) / 100,
				})
			}

			lastTimeRef.current = now
			requestAnimationFrame(updateStats)
		}

		const animationId = requestAnimationFrame(updateStats)
		return () => cancelAnimationFrame(animationId)
	}, [])

	// Only show in development
	if (process.env.NODE_ENV !== "development") {
		return null
	}

	return (
		<div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
			<div>FPS: {stats.fps}</div>
			<div>Frames: {stats.renderCount}</div>
			<div>Avg Frame: {stats.avgFrameTime}ms</div>
		</div>
	)
}

export default PerformanceMonitor