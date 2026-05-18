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
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-[#C6A052] bg-[#C6A052]/10'
              : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#C6A052]/50 hover:bg-[#C6A052]/5'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#C6A052]/15 border border-[#C6A052]/30 flex items-center justify-center">
              <Upload size={20} className="text-[#C6A052]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8F5F0]/80">
                {isDragActive ? 'Drop images here' : 'Drag & drop garment photos'}
              </p>
              <p className="text-xs text-[#F8F5F0]/40 mt-1">
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
            <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#2A2A2A] group">
              <img src={p.url} alt={`Garment ${i + 1}`} className="w-full h-full object-cover" />
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
