'use client'

import { forwardRef, useRef, useState, useCallback, useEffect, useImperativeHandle } from 'react'
import { ImagePlus, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

const MIN = 1, MAX = 4, STEP = 0.15
const EXPORT_DPR = 2

export interface DraggableImageHandle {
  getCroppedImage(): Promise<string>
}

interface Props {
  src: string
  alt: string
  onReplace: () => void
  /** Called after drag/zoom ends with a canvas-rendered data URL of the visible area. */
  onCrop?: (dataUrl: string) => void
  size?: 'sm' | 'lg'
}

const DraggableImage = forwardRef<DraggableImageHandle, Props>(
  function DraggableImage({ src, alt, onReplace, onCrop, size = 'lg' }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [scale, setScale] = useState(1)
    const [pos, setPos] = useState({ x: 0, y: 0 })

    // All mutable interaction state; avoids stale closures in imperative listeners
    const s = useRef({ scale: 1, pos: { x: 0, y: 0 }, dragging: false, startMouse: { x: 0, y: 0 }, startPos: { x: 0, y: 0 }, lastDist: 0 })
    s.current.scale = scale
    s.current.pos = pos

    // Callback refs — always point to the latest value without re-running effects
    const srcRef = useRef(src)
    srcRef.current = src
    const onCropRef = useRef(onCrop)
    onCropRef.current = onCrop

    // Track the last URL we produced via canvas so we don't reset the transform
    // when that exact URL is fed back as the new `src` by the parent.
    const lastCroppedRef = useRef<string | null>(null)

    // Debounce timer for zoom-button and wheel crops
    const cropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── clamp helper (reads from stable ref) ──────────────────────────────────
    const clampFn = useRef((x: number, y: number, sc: number) => {
      const el = containerRef.current
      if (!el) return { x, y }
      const { width: w, height: h } = el.getBoundingClientRect()
      const mx = w * (sc - 1) / 2
      const my = h * (sc - 1) / 2
      return { x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) }
    })

    // ── canvas crop ───────────────────────────────────────────────────────────
    const cropToDataURL = (sc: number, p: { x: number; y: number }): Promise<string> => {
      const currentSrc = srcRef.current
      const el = containerRef.current

      // canvas.toDataURL() throws "operation is insecure" for cross-origin images.
      // FileReader uploads are always data: URLs (safe); external https: URLs would
      // taint the canvas, so we skip cropping and return the original URL as-is.
      if (!el || (sc === 1 && p.x === 0 && p.y === 0) || !currentSrc.startsWith('data:')) {
        return Promise.resolve(currentSrc)
      }

      const { width: cw, height: ch } = el.getBoundingClientRect()
      return new Promise<string>(resolve => {
        const img = new Image()
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = Math.round(cw * EXPORT_DPR)
            canvas.height = Math.round(ch * EXPORT_DPR)
            const ctx = canvas.getContext('2d')!
            // Replicate object-cover centering, then apply user transform
            const coverScale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
            const drawW = img.naturalWidth * coverScale
            const drawH = img.naturalHeight * coverScale
            ctx.scale(EXPORT_DPR, EXPORT_DPR)
            ctx.translate(cw / 2 + p.x, ch / 2 + p.y)
            ctx.scale(sc, sc)
            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
            resolve(canvas.toDataURL('image/jpeg', 0.9))
          } catch {
            resolve(currentSrc)
          }
        }
        img.onerror = () => resolve(currentSrc)
        img.src = currentSrc
      })
    }

    // Expose imperative API so modals can call getCroppedImage() at submit time
    useImperativeHandle(ref, () => ({
      getCroppedImage: () => cropToDataURL(s.current.scale, s.current.pos),
    }), []) // stable — reads everything through refs

    // ── schedule a debounced onCrop ───────────────────────────────────────────
    const scheduleOnCrop = (sc: number, p: { x: number; y: number }, delay = 0) => {
      if (!onCropRef.current) return
      if (cropTimerRef.current) clearTimeout(cropTimerRef.current)
      cropTimerRef.current = setTimeout(() => {
        cropToDataURL(sc, p).then(url => {
          lastCroppedRef.current = url
          onCropRef.current?.(url)
        })
      }, delay)
    }

    // ── reset src only when it's a genuinely new image, not our own crop ──────
    useEffect(() => {
      if (src === lastCroppedRef.current) return
      setScale(1)
      setPos({ x: 0, y: 0 })
      s.current.scale = 1
      s.current.pos = { x: 0, y: 0 }
    }, [src])

    // ── imperative pointer/wheel listeners ────────────────────────────────────
    useEffect(() => {
      const el = containerRef.current
      if (!el) return
      const clamp = clampFn.current

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        s.current.dragging = true
        s.current.startMouse = { x: e.clientX, y: e.clientY }
        s.current.startPos = { ...s.current.pos }
        setIsDragging(true)
      }
      const onMouseMove = (e: MouseEvent) => {
        if (!s.current.dragging) return
        const newPos = clamp(
          s.current.startPos.x + e.clientX - s.current.startMouse.x,
          s.current.startPos.y + e.clientY - s.current.startMouse.y,
          s.current.scale,
        )
        s.current.pos = newPos
        setPos({ ...newPos })
      }
      const onMouseUp = () => {
        if (!s.current.dragging) return
        s.current.dragging = false
        setIsDragging(false)
        scheduleOnCrop(s.current.scale, s.current.pos)
      }
      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        const newScale = Math.min(MAX, Math.max(MIN, s.current.scale + (e.deltaY < 0 ? STEP : -STEP)))
        const newPos = clamp(s.current.pos.x, s.current.pos.y, newScale)
        s.current.scale = newScale
        s.current.pos = newPos
        setScale(newScale)
        setPos({ ...newPos })
        scheduleOnCrop(newScale, newPos, 500) // debounced — fires after scrolling stops
      }
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          const t = e.touches[0]
          s.current.dragging = true
          s.current.startMouse = { x: t.clientX, y: t.clientY }
          s.current.startPos = { ...s.current.pos }
          s.current.lastDist = 0
        } else if (e.touches.length === 2) {
          s.current.dragging = false
          s.current.lastDist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY,
          )
        }
      }
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        if (e.touches.length === 1 && s.current.dragging) {
          const t = e.touches[0]
          const newPos = clamp(
            s.current.startPos.x + t.clientX - s.current.startMouse.x,
            s.current.startPos.y + t.clientY - s.current.startMouse.y,
            s.current.scale,
          )
          s.current.pos = newPos
          setPos({ ...newPos })
        } else if (e.touches.length === 2 && s.current.lastDist > 0) {
          const dist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY,
          )
          const newScale = Math.min(MAX, Math.max(MIN, s.current.scale * (dist / s.current.lastDist)))
          const newPos = clamp(s.current.pos.x, s.current.pos.y, newScale)
          s.current.scale = newScale
          s.current.pos = newPos
          s.current.lastDist = dist
          setScale(newScale)
          setPos({ ...newPos })
        }
      }
      const onTouchEnd = () => {
        s.current.dragging = false
        s.current.lastDist = 0
        setIsDragging(false)
        scheduleOnCrop(s.current.scale, s.current.pos)
      }

      el.addEventListener('mousedown', onMouseDown)
      el.addEventListener('wheel', onWheel, { passive: false })
      el.addEventListener('touchstart', onTouchStart, { passive: true })
      el.addEventListener('touchmove', onTouchMove, { passive: false })
      el.addEventListener('touchend', onTouchEnd)
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)

      return () => {
        el.removeEventListener('mousedown', onMouseDown)
        el.removeEventListener('wheel', onWheel)
        el.removeEventListener('touchstart', onTouchStart)
        el.removeEventListener('touchmove', onTouchMove)
        el.removeEventListener('touchend', onTouchEnd)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }
    }, []) // empty deps — all mutable access goes through refs

    const zoomBy = useCallback((delta: number) => {
      const newScale = Math.min(MAX, Math.max(MIN, s.current.scale + delta))
      const newPos = clampFn.current(s.current.pos.x, s.current.pos.y, newScale)
      s.current.scale = newScale
      s.current.pos = newPos
      setScale(newScale)
      setPos({ ...newPos })
      scheduleOnCrop(newScale, newPos, 300) // debounced — fires after button mashing stops
    }, [])

    const reset = useCallback(() => {
      s.current.scale = 1
      s.current.pos = { x: 0, y: 0 }
      setScale(1)
      setPos({ x: 0, y: 0 })
    }, [])

    const isDefault = scale === 1 && pos.x === 0 && pos.y === 0
    const iconSize = size === 'sm' ? 10 : 12
    const btn = 'w-6 h-6 rounded-full bg-black/55 flex items-center justify-center text-white hover:bg-black/75 transition-colors'

    return (
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden group/di"
        style={{ cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'move' }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
          }}
        />

        {/* Hover controls */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/di:opacity-100 transition-opacity duration-150">
          {/* Replace photo */}
          <button
            type="button"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onReplace() }}
            className={`pointer-events-auto absolute top-2 right-2 ${btn}`}
            title="Change photo"
          >
            <ImagePlus size={iconSize} />
          </button>

          {/* Zoom / reset */}
          <div className="pointer-events-auto absolute bottom-2 right-2 flex items-center gap-1">
            {!isDefault && (
              <button
                type="button"
                onMouseDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); reset() }}
                className={btn}
                title="Reset view"
              >
                <RotateCcw size={iconSize - 1} />
              </button>
            )}
            <button
              type="button"
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); zoomBy(STEP * 2) }}
              className={btn}
              title="Zoom in"
            >
              <ZoomIn size={iconSize} />
            </button>
            <button
              type="button"
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); zoomBy(-STEP * 2) }}
              className={btn}
              title="Zoom out"
            >
              <ZoomOut size={iconSize} />
            </button>
          </div>
        </div>
      </div>
    )
  }
)

export default DraggableImage
