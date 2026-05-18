import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Download, RotateCcw } from 'lucide-react'

const DEFAULTS = { brightness: 100, contrast: 100, saturation: 100, warmth: 0, vignette: 0 }

function Slider({ label, min, max, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#F8F5F0]/60">{label}</span>
        <span className="text-xs text-[#C6A052] font-mono">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-[#2A2A2A] cursor-pointer accent-[#C6A052]"
      />
    </div>
  )
}

export default function ImageEditor({ imageUrl, onDownload }) {
  const [adj, setAdj] = useState({ ...DEFAULTS })
  const canvasRef = useRef(null)
  const imgRef = useRef(null)

  const set = (key, val) => setAdj(prev => ({ ...prev, [key]: val }))

  const filterStyle = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%) sepia(${adj.warmth}%)`

  async function handleDownload() {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.filter = filterStyle
    ctx.drawImage(img, 0, 0)

    if (adj.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.75
      )
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(1, `rgba(0,0,0,${adj.vignette / 100})`)
      ctx.filter = 'none'
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'luxemodel-edited.jpg'
      a.click()
      URL.revokeObjectURL(url)
      if (onDownload) onDownload(url)
    }, 'image/jpeg', 0.92)
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-[#0D0D0D]">
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Edit preview"
          className="w-full h-full object-contain"
          style={{ filter: filterStyle }}
          crossOrigin="anonymous"
        />
        {adj.vignette > 0 && (
          <div
            className="absolute inset-0 pointer-events-none rounded-xl"
            style={{
              background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${adj.vignette / 100}) 100%)`
            }}
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-3">
        <Slider label="Brightness" min={50} max={150} value={adj.brightness} onChange={v => set('brightness', v)} />
        <Slider label="Contrast" min={50} max={150} value={adj.contrast} onChange={v => set('contrast', v)} />
        <Slider label="Saturation" min={0} max={200} value={adj.saturation} onChange={v => set('saturation', v)} />
        <Slider label="Warmth" min={0} max={50} value={adj.warmth} onChange={v => set('warmth', v)} />
        <Slider label="Vignette" min={0} max={80} value={adj.vignette} onChange={v => set('vignette', v)} />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setAdj({ ...DEFAULTS })} className="flex-1">
          <RotateCcw size={14} /> Reset
        </Button>
        <Button size="sm" onClick={handleDownload} className="flex-1">
          <Download size={14} /> Download Edited
        </Button>
      </div>
    </div>
  )
}
