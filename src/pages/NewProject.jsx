import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, uploadFile } from '../lib/supabase'
import { generateImage } from '../lib/fal'
import { buildPrompt } from '../utils/promptBuilder'
import ClothingUploader from '../components/ClothingUploader'
import ModelConfigPanel from '../components/ModelConfigPanel'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Progress } from '../components/ui/progress'
import {
  Sparkles, Camera, Mountain, LayoutTemplate,
  RotateCw, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../lib/utils'

const POSES = [
  { key: 'standing_power', label: 'Power Stand', icon: '💪' },
  { key: 'royal_sitting', label: 'Royal Sit', icon: '👑' },
  { key: 'runway_walk', label: 'Runway Walk', icon: '✨' },
  { key: 'luxury_lounge', label: 'Lounge', icon: '🛋️' },
  { key: 'over_shoulder', label: 'Over Shoulder', icon: '🔄' },
]

const BACKGROUNDS = [
  { key: 'luxury_palace', label: 'Palace', icon: '🏛️' },
  { key: 'modern_mansion', label: 'Mansion', icon: '🏠' },
  { key: 'yacht_deck', label: 'Yacht', icon: '⛵' },
  { key: 'studio_minimal', label: 'Studio', icon: '📸' },
  { key: 'desert_royalty', label: 'Desert', icon: '🏜️' },
]

const DEFAULT_CONFIG = {
  gender: 'female',
  age_range: '30-35',
  skin_tone: 'rich_cocoa',
  body_type: 'slim',
  hairstyle: 'afro',
  makeup_level: 'natural',
  facial_hair: 'clean_shaven',
  garment_type: '',
  garment_length: '',
  garment_fit: '',
  outfit_pieces: '',
  custom_instructions: '',
}

export default function NewProject() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [files, setFiles] = useState([])
  const [config, setConfig] = useState({ ...DEFAULT_CONFIG })
  const [pose, setPose] = useState('standing_power')
  const [background, setBackground] = useState('studio_minimal')
  const [imageCount, setImageCount] = useState(2)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('')

  async function handleGenerate() {
    if (!projectName.trim()) { toast.error('Please enter a project name'); return }
    if (files.length === 0) { toast.error('Please upload at least one garment photo'); return }
    if ((profile?.credits || 0) < imageCount) {
      toast.error(`Not enough credits. You need ${imageCount} but have ${profile?.credits || 0}`)
      return
    }

    setGenerating(true)
    setProgress(5)
    setProgressMsg('Uploading garment images...')

    try {
      // Upload files
      const uploadedUrls = await Promise.all(files.map(f => uploadFile(f)))
      setProgress(20)
      setProgressMsg('Creating project...')

      // Create project
      const { data: project, error: projErr } = await supabase.from('projects').insert({
        user_id: user.id,
        name: projectName.trim(),
        clothing_image_urls: uploadedUrls,
        status: 'generating',
        generation_count: 0,
        ...config,
        pose,
        background,
      }).select().single()

      if (projErr) throw projErr
      setProgress(35)

      // Build prompt
      const { prompt, negative_prompt } = buildPrompt({ ...config, pose, background })
      setProgressMsg(`Building ${imageCount} AI model images...`)

      // Generate images
      const generatedUrls = []
      for (let i = 0; i < imageCount; i++) {
        setProgressMsg(`Generating image ${i + 1} of ${imageCount}...`)
        setProgress(35 + ((i / imageCount) * 50))
        const url = await generateImage(prompt, negative_prompt, uploadedUrls)
        if (url) generatedUrls.push({ url, prompt })
      }

      setProgress(88)
      setProgressMsg('Saving images...')

      // Save generated images
      if (generatedUrls.length > 0) {
        await supabase.from('generated_images').insert(
          generatedUrls.map(({ url, prompt: p }) => ({
            project_id: project.id,
            user_id: user.id,
            image_url: url,
            prompt_used: p,
            pose,
            background,
            age_range: config.age_range,
            skin_tone: config.skin_tone,
            is_favorite: false,
          }))
        )
      }

      // Update project status
      await supabase.from('projects').update({
        status: 'completed',
        generation_count: generatedUrls.length,
      }).eq('id', project.id)

      // Deduct credits & update totals
      await supabase.from('users').update({
        credits: Math.max(0, (profile?.credits || 0) - imageCount),
        total_generations: (profile?.total_generations || 0) + generatedUrls.length,
      }).eq('id', user.id)
      await refreshProfile()

      setProgress(100)
      setProgressMsg('Done!')
      toast.success(`Generated ${generatedUrls.length} images!`)
      navigate(`/project?id=${project.id}`)
    } catch (err) {
      toast.error('Generation failed: ' + err.message)
      setGenerating(false)
      setProgress(0)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#F8F5F0]">New Project</h1>
        <p className="text-sm text-[#F8F5F0]/40 mt-1">Upload a garment and configure your AI model</p>
      </div>

      {generating && (
        <div className="rounded-2xl border border-[#C6A052]/30 bg-[#C6A052]/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#C6A052] animate-pulse" />
            <span className="text-sm font-medium text-[#C6A052]">{progressMsg}</span>
          </div>
          <Progress value={progress} />
          <p className="text-xs text-[#F8F5F0]/40">{Math.round(progress)}% complete</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1 */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5 space-y-4">
          <div>
            <Label>Project Name</Label>
            <Input
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="e.g. Summer Ankara Collection..."
              disabled={generating}
            />
          </div>
          <div>
            <Label>Garment Photos</Label>
            <ClothingUploader value={files} onChange={setFiles} maxFiles={4} />
          </div>
        </div>

        {/* Column 2 */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5 overflow-y-auto max-h-[70vh]">
          <ModelConfigPanel config={config} onChange={setConfig} />
        </div>

        {/* Column 3 */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5 space-y-5">
          {/* Pose selector */}
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Camera size={12} /> Pose</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {POSES.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPose(p.key)}
                  disabled={generating}
                  className={cn(
                    'rounded-xl p-2 text-center border transition-all duration-150 text-xs',
                    pose === p.key
                      ? 'bg-[#C6A052]/15 border-[#C6A052]/50 text-[#C6A052]'
                      : 'border-[#2A2A2A] bg-[#0D0D0D] text-[#F8F5F0]/50 hover:border-[#C6A052]/30'
                  )}
                >
                  <div className="text-lg mb-0.5">{p.icon}</div>
                  <div className="text-[9px] leading-tight">{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Background selector */}
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Mountain size={12} /> Background</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {BACKGROUNDS.map(b => (
                <button
                  key={b.key}
                  onClick={() => setBackground(b.key)}
                  disabled={generating}
                  className={cn(
                    'rounded-xl p-2 text-center border transition-all duration-150 text-xs',
                    background === b.key
                      ? 'bg-[#C6A052]/15 border-[#C6A052]/50 text-[#C6A052]'
                      : 'border-[#2A2A2A] bg-[#0D0D0D] text-[#F8F5F0]/50 hover:border-[#C6A052]/30'
                  )}
                >
                  <div className="text-lg mb-0.5">{b.icon}</div>
                  <div className="text-[9px] leading-tight">{b.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Image count */}
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><LayoutTemplate size={12} /> Images to Generate</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setImageCount(n)}
                  disabled={generating}
                  className={cn(
                    'flex-1 rounded-xl py-2 text-sm font-semibold border transition-all',
                    imageCount === n
                      ? 'bg-[#C6A052]/15 border-[#C6A052]/50 text-[#C6A052]'
                      : 'border-[#2A2A2A] bg-[#0D0D0D] text-[#F8F5F0]/50 hover:border-[#C6A052]/30'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#F8F5F0]/30 mt-1.5">{imageCount} credit{imageCount !== 1 ? 's' : ''} · {profile?.credits || 0} available</p>
          </div>

          {/* Generate */}
          <div className="pt-2">
            <Button
              onClick={handleGenerate}
              disabled={generating || files.length === 0 || !projectName.trim()}
              className="w-full h-12 text-base"
            >
              {generating ? (
                <><RotateCw size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate {imageCount} Image{imageCount !== 1 ? 's' : ''}</>
              )}
            </Button>
            {!generating && (
              <p className="text-[10px] text-[#F8F5F0]/20 text-center mt-2">
                Costs {imageCount} credit{imageCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
