import { useRef } from 'react'
import { Button } from './ui/button'
import { Download } from 'lucide-react'

const PLATFORM_DIMS = {
  'Instagram Post': { w: 1080, h: 1080, label: '1:1' },
  'Instagram Story': { w: 1080, h: 1920, label: '9:16' },
  'Facebook Post': { w: 1200, h: 630, label: '16:9' },
  'eBay Listing': { w: 1600, h: 900, label: '16:9' },
  'WhatsApp Banner': { w: 1280, h: 720, label: '16:9' },
  'Print A4': { w: 794, h: 1123, label: 'A4' },
}

export default function FlyerCanvas({ flyerData, onSave }) {
  const canvasRef = useRef(null)
  if (!flyerData) return null

  const {
    brand_name, headline, subheadline, offer_text, cta_text, tagline,
    hashtags = [], color_palette = {}, gradient_css, model_image_url, platform,
  } = flyerData

  const dims = PLATFORM_DIMS[platform] || PLATFORM_DIMS['Instagram Post']
  const isPortrait = dims.h > dims.w
  const bgGradient = gradient_css || 'linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 50%, #3B2A1A 100%)'
  const accentColor = color_palette?.accent || '#C6A052'
  const textColor = color_palette?.text || '#F8F5F0'

  async function downloadPNG() {
    const { default: html2canvas } = await import('html2canvas')
    const el = canvasRef.current
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: false })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${brand_name || 'flyer'}-${platform?.replace(/\s+/g, '-') || 'flyer'}.png`
    a.click()
  }

  return (
    <div className="space-y-4">
      {/* Canvas preview */}
      <div
        ref={canvasRef}
        className="relative overflow-hidden rounded-2xl mx-auto"
        style={{
          width: '100%',
          maxWidth: isPortrait ? 300 : 500,
          aspectRatio: `${dims.w}/${dims.h}`,
          background: bgGradient,
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {/* Model image */}
        {model_image_url && (
          <img
            src={model_image_url}
            alt="Model"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            crossOrigin="anonymous"
          />
        )}

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.4) 60%, transparent 100%)`
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
          {brand_name && (
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: accentColor }}>
              {brand_name}
            </p>
          )}
          {headline && (
            <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-1" style={{ color: textColor, fontFamily: 'Playfair Display, serif' }}>
              {headline}
            </h2>
          )}
          {subheadline && (
            <p className="text-xs sm:text-sm opacity-80 mb-2" style={{ color: textColor }}>
              {subheadline}
            </p>
          )}
          {offer_text && (
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 self-start" style={{ background: accentColor, color: '#0D0D0D' }}>
              {offer_text}
            </div>
          )}
          {cta_text && (
            <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: accentColor }}>
              {cta_text}
            </p>
          )}
          {tagline && (
            <p className="text-[10px] opacity-50 italic" style={{ color: textColor }}>
              {tagline}
            </p>
          )}
          {hashtags.length > 0 && (
            <p className="text-[9px] mt-1 opacity-40" style={{ color: accentColor }}>
              {hashtags.slice(0, 5).map(h => `#${h.replace('#', '')}`).join(' ')}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={downloadPNG} className="flex-1">
          <Download size={14} /> Download PNG
        </Button>
        {onSave && (
          <Button variant="outline" onClick={onSave} className="flex-1">
            Save Flyer
          </Button>
        )}
      </div>

      <p className="text-[10px] text-[#F8F5F0]/30 text-center">{dims.label} · {dims.w}×{dims.h}px</p>
    </div>
  )
}
