import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { generateImage, lastProvider } from '../lib/fal'
import { buildPrompt } from '../utils/promptBuilder'
import { canGenerate, deductCredits } from '../lib/credits'
import ListingGenerator from '../components/ListingGenerator'
import ImageEditor from '../components/ImageEditor'
import PublishToMarketplace from '../components/PublishToMarketplace'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import {
  Download, Star, Trash2, Sparkles, Edit2, RotateCw,
  Image, ArrowLeft, DownloadCloud, ShoppingBag,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../lib/utils'

export default function ProjectDetail() {
  const [params] = useSearchParams()
  const projectId = params.get('id')
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [editImg, setEditImg] = useState(null)
  const [selectedImg, setSelectedImg] = useState(null)
  const [showPublish, setShowPublish] = useState(false)

  useEffect(() => {
    if (projectId && user) loadProject()
  }, [projectId, user])

  async function loadProject() {
    setLoading(true)
    const [{ data: proj }, { data: imgs }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('generated_images').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
    ])
    setProject(proj)
    setImages(imgs || [])
    setLoading(false)
  }

  async function toggleFavorite(img) {
    const { error } = await supabase.from('generated_images').update({ is_favorite: !img.is_favorite }).eq('id', img.id)
    if (!error) setImages(prev => prev.map(i => i.id === img.id ? { ...i, is_favorite: !i.is_favorite } : i))
  }

  async function deleteImage(id) {
    await supabase.from('generated_images').delete().eq('id', id)
    setImages(prev => prev.filter(i => i.id !== id))
    toast.success('Image deleted')
  }

  async function downloadImage(url, name = 'luxemodel') {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${name}.jpg`
      a.click()
    } catch {
      window.open(url, '_blank')
    }
  }

  async function downloadAll() {
    for (let i = 0; i < images.length; i++) {
      await downloadImage(images[i].image_url, `luxemodel-${project?.name || 'photo'}-${i + 1}`)
      await new Promise(r => setTimeout(r, 300))
    }
    toast.success('All images downloaded')
  }

  async function generateMore() {
    if (!project) return
    const allowed = await canGenerate(1)
    if (!allowed) { toast.error('Not enough credits'); return }
    setGenerating(true)
    setGenProgress(10)
    try {
      const { prompt, negative_prompt } = buildPrompt({
        gender: project.gender,
        age_range: project.age_range,
        skin_tone: project.skin_tone,
        body_type: project.body_type,
        hairstyle: project.hairstyle,
        makeup_level: project.makeup_level,
        facial_hair: project.facial_hair,
        garment_type: project.garment_type,
        garment_length: project.garment_length,
        garment_fit: project.garment_fit,
        outfit_pieces: project.outfit_pieces,
        custom_instructions: project.custom_instructions,
        pose: project.pose,
        background: project.background,
      })

      setGenProgress(30)
      const url = await generateImage(prompt, negative_prompt, project.clothing_image_urls || [], 0.65)
      if (lastProvider === 'pollinations-fallback') {
        toast.warning('Fal.ai balance exhausted — top up at fal.ai/dashboard/billing for garment preservation.', { duration: 8000 })
      }
      setGenProgress(80)

      if (url) {
        const { data: newImg } = await supabase.from('generated_images').insert({
          project_id: project.id,
          user_id: user.id,
          image_url: url,
          prompt_used: prompt,
          pose: project.pose,
          background: project.background,
          age_range: project.age_range,
          skin_tone: project.skin_tone,
          is_favorite: false,
        }).select().single()

        if (newImg) setImages(prev => [newImg, ...prev])
        await supabase.from('projects').update({ generation_count: images.length + 1 }).eq('id', project.id)
        await deductCredits(1) // no-op for admin
        await supabase.from('users').update({
          total_generations: (profile?.total_generations || 0) + 1,
        }).eq('id', user.id)
        await refreshProfile()
        toast.success('New image generated!')
      }
    } catch (err) {
      toast.error('Generation failed: ' + err.message)
    } finally {
      setGenerating(false)
      setGenProgress(0)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RotateCw size={24} className="animate-spin text-[#C6A052]" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-[#F8F5F0]/50">Project not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-[#F8F5F0]/40 hover:text-[#F8F5F0] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#F8F5F0]">{project.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={project.status === 'completed' ? 'success' : 'warning'}>{project.status}</Badge>
              <span className="text-xs text-[#F8F5F0]/40">{images.length} images</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {images.length > 0 && (
            <Button variant="outline" size="sm" onClick={downloadAll}>
              <DownloadCloud size={14} /> Download All
            </Button>
          )}
          {images.length > 0 && (
            <button
              onClick={() => setShowPublish(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, #B8960C, #DEC05A)',
                border: 'none', borderRadius: 6, padding: '6px 14px',
                fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
                color: '#0D0D0D', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <ShoppingBag size={13} /> Publish to Marketplace
            </button>
          )}
          <Button size="sm" onClick={generateMore} disabled={generating}>
            {generating ? <RotateCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? 'Generating...' : 'Generate More'}
          </Button>
        </div>
      </div>

      {generating && (
        <div className="rounded-2xl border border-[#C6A052]/30 bg-[#C6A052]/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#C6A052] animate-pulse" />
            <span className="text-sm text-[#C6A052]">Generating new image...</span>
          </div>
          <Progress value={genProgress} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Col 1: Reference + Listing */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
            <h3 className="text-sm font-semibold text-[#C6A052] uppercase tracking-wider mb-3">Reference Images</h3>
            <div className="grid grid-cols-2 gap-2">
              {(project.clothing_image_urls || []).map((url, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-[#2A2A2A]">
                  <img src={url} alt={`ref-${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
            <ListingGenerator
              project={project}
              onSaved={updates => setProject(prev => ({ ...prev, ...updates }))}
            />
          </div>
        </div>

        {/* Cols 2-4: Images */}
        <div className="lg:col-span-3">
          {images.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2A2A2A] h-64 flex items-center justify-center">
              <div className="text-center">
                <Image size={32} className="text-[#2A2A2A] mx-auto mb-3" />
                <p className="text-sm text-[#F8F5F0]/40">No images yet</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map(img => (
                <div
                  key={img.id}
                  className={cn(
                    'group relative rounded-2xl overflow-hidden border transition-all duration-200',
                    img.is_favorite ? 'border-[#C6A052]/40' : 'border-[#2A2A2A] hover:border-[#C6A052]/20'
                  )}
                >
                  <div
                    className="aspect-[4/3] bg-[#0D0D0D] cursor-pointer"
                    onClick={() => setSelectedImg(img)}
                  >
                    <img src={img.image_url} alt="Generated" className="w-full h-full object-cover" />
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all pointer-events-none" />

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavorite(img)}
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                        img.is_favorite ? 'bg-[#C6A052] text-[#0D0D0D]' : 'bg-black/60 text-[#F8F5F0] hover:bg-[#C6A052] hover:text-[#0D0D0D]'
                      )}
                    >
                      <Star size={12} fill={img.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => downloadImage(img.image_url, `luxemodel-${project.name}`)}
                      className="w-7 h-7 rounded-lg bg-black/60 text-[#F8F5F0] hover:bg-[#C6A052] hover:text-[#0D0D0D] flex items-center justify-center transition-colors"
                    >
                      <Download size={12} />
                    </button>
                    <button
                      onClick={() => setEditImg(img)}
                      className="w-7 h-7 rounded-lg bg-black/60 text-[#F8F5F0] hover:bg-[#C6A052] hover:text-[#0D0D0D] flex items-center justify-center transition-colors"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="w-7 h-7 rounded-lg bg-black/60 text-red-400 hover:bg-red-600/80 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {img.is_favorite && (
                    <div className="absolute top-2 left-2">
                      <Star size={12} className="text-[#C6A052]" fill="currentColor" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image preview dialog */}
      <Dialog open={!!selectedImg} onOpenChange={() => setSelectedImg(null)}>
        <DialogContent className="max-w-2xl">
          {selectedImg && (
            <img
              src={selectedImg.image_url}
              alt="Preview"
              className="w-full rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editImg} onOpenChange={() => setEditImg(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {editImg && (
            <ImageEditor imageUrl={editImg.image_url} />
          )}
        </DialogContent>
      </Dialog>

      {/* Publish to Marketplace modal */}
      {showPublish && (
        <PublishToMarketplace
          project={project}
          images={images}
          onClose={() => setShowPublish(false)}
          onSuccess={(product) => {
            toast.success(`"${product.name}" published to Marketplace!`)
            setShowPublish(false)
          }}
        />
      )}
    </div>
  )
}
