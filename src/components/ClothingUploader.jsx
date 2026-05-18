import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, ImageIcon } from 'lucide-react'
import { cn } from '../lib/utils'

export default function ClothingUploader({ value = [], onChange, maxFiles = 4 }) {
  const [previews, setPreviews] = useState(value.map(f => ({ file: f, url: f instanceof File ? URL.createObjectURL(f) : f })))

  const onDrop = useCallback((accepted) => {
    const newItems = accepted.slice(0, maxFiles - previews.length).map(file => ({
      file,
      url: URL.createObjectURL(file),
    }))
    const updated = [...previews, ...newItems]
    setPreviews(updated)
    onChange(updated.map(p => p.file))
  }, [previews, maxFiles, onChange])

  const remove = (idx) => {
    const updated = previews.filter((_, i) => i !== idx)
    setPreviews(updated)
    onChange(updated.map(p => p.file))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: maxFiles - previews.length,
    disabled: previews.length >= maxFiles,
  })

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {previews.length < maxFiles && (
        <div
          {...getRootProps()}
          style={{
            background: isDragActive ? '#F0EBE0' : '#F8F5F0',
            border: `1.5px dashed ${isDragActive ? '#B8960C' : '#D4C9B0'}`,
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            if (!isDragActive) {
              e.currentTarget.style.background = '#F0EBE0'
              e.currentTarget.style.borderColor = '#B8960C'
            }
          }}
          onMouseLeave={e => {
            if (!isDragActive) {
              e.currentTarget.style.background = '#F8F5F0'
              e.currentTarget.style.borderColor = '#D4C9B0'
            }
          }}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(184,150,12,0.08)', border: '1px solid rgba(184,150,12,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} style={{ color: '#B8960C' }} />
            </div>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500, color: '#3A3A3A' }}>
                {isDragActive ? 'Drop images here' : 'Drag & drop garment photos'}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#AAAAAA', marginTop: '4px' }}>
                JPG, PNG, WebP · Max {maxFiles} images · {maxFiles - previews.length} remaining
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {previews.map((p, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E8E4DC' }} className="group">
              <img src={p.url} alt={`Garment ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
              <button
                onClick={() => remove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={12} className="text-white" />
              </button>
              <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon size={12} className="text-white/70" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
