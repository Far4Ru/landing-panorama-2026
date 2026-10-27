import { useEffect, useRef, type RefObject } from 'react'
import { createOrbitalRenderer } from './orbitalRenderer'

export function OrbitalScene({ angle, renderScene }: {
  angle: RefObject<number>
  renderScene: RefObject<(() => void) | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')
    if (!context) return
    const renderer = createOrbitalRenderer(context)
    let frame = 0
    let size = 0

    const draw = () => {
      if (!document.hidden) renderer.draw(size, angle.current)
    }
    renderScene.current = draw
    const restart = () => {
      cancelAnimationFrame(frame)
      renderer.invalidate()
      if (!document.hidden) frame = requestAnimationFrame(draw)
    }
    const resize = () => {
      const nextSize = canvas.clientWidth
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const resolution = Math.round(nextSize * ratio)
      if (nextSize === size && canvas.width === resolution) return
      size = nextSize
      canvas.width = resolution
      canvas.height = resolution
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      restart()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    document.addEventListener('visibilitychange', restart)
    return () => {
      cancelAnimationFrame(frame)
      renderScene.current = null
      observer.disconnect()
      document.removeEventListener('visibilitychange', restart)
    }
  }, [angle, renderScene])

  return (
    <div className="orbital-scene" aria-hidden="true">
      <div className="orbital-axis" />
      <canvas ref={canvasRef} />
    </div>
  )
}
