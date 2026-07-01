import { useRef, useState, type TouchEvent } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'

interface ZoomableImageProps {
  src: string
  alt: string
}

export function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const [scale, setScale] = useState(1)
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null)

  const getDistance = (touchA: React.Touch, touchB: React.Touch) => {
    const dx = touchA.clientX - touchB.clientX
    const dy = touchA.clientY - touchB.clientY
    return Math.hypot(dx, dy)
  }

  const handleTouchStart = (event: TouchEvent<HTMLImageElement>) => {
    if (event.touches.length === 2) {
      pinchRef.current = {
        distance: getDistance(event.touches[0], event.touches[1]),
        scale,
      }
    }
  }

  const handleTouchMove = (event: TouchEvent<HTMLImageElement>) => {
    if (event.touches.length === 2 && pinchRef.current) {
      const nextDistance = getDistance(event.touches[0], event.touches[1])
      const nextScale = Math.min(4, Math.max(1, pinchRef.current.scale * (nextDistance / pinchRef.current.distance)))
      setScale(nextScale)
    }
  }

  const handleTouchEnd = () => {
    pinchRef.current = null
  }

  return (
    <div className="relative flex max-h-[70vh] items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
      <img
        src={src}
        alt={alt}
        className="max-h-[70vh] w-full object-contain transition-transform"
        style={{ transform: `scale(${scale})` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={(event) => {
          event.preventDefault()
          setScale((current) => Math.min(4, Math.max(1, current + (event.deltaY < 0 ? 0.2 : -0.2))))
        }}
      />
      <div className="absolute bottom-3 right-3 flex gap-2 rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm">
        <button type="button" onClick={() => setScale((current) => Math.max(1, current - 0.2))} className="rounded-full p-2 text-slate-700 hover:bg-slate-100">
          <Minus className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setScale(1)} className="rounded-full p-2 text-slate-700 hover:bg-slate-100">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setScale((current) => Math.min(4, current + 0.2))} className="rounded-full p-2 text-slate-700 hover:bg-slate-100">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
