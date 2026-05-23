import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, uploadFile } from '../lib/supabase'
import { generateImage, lastProvider } from '../lib/fal'
import { buildPrompt, buildBaseModelPrompt } from '../utils/promptBuilder'
import { canGenerate, deductCredits } from '../lib/credits'
import ClothingUploader from '../components/ClothingUploader'
import ModelConfigPanel from '../components/ModelConfigPanel'
import { Sparkles, Camera, Mountain, RotateCw } from 'lucide-react'
import { toast } from 'sonner'

const POSES = [
  { key: 'standing_power', label: 'Power Stand', icon: '💪' },
  { key: 'royal_sitting', label: 'Royal Sit', icon: '👑' },
  { key: 'runway_walk', label: 'Runway Walk', icon: '✨' },
  { key: 'luxury_lounge', label: 'Lounge', icon: '🛋️' },
  { key: 'over_shoulder', label: 'Over Shoulder', icon: '🔄' },
]

const BACKGROUNDS = [
  { key: 'luxury_palace',    label: 'Palace',       icon: '🏛️' },
  { key: 'modern_mansion',   label: 'Mansion',      icon: '🏠' },
  { key: 'yacht_deck',       label: 'Yacht',        icon: '⛵' },
  { key: 'studio_minimal',   label: 'Studio',       icon: '📸' },
  { key: 'desert_royalty',   label: 'Desert',       icon: '🏜️' },
  { key: 'city_rooftop',     label: 'City Rooftop', icon: '🌆' },
  { key: 'tropical_paradise',label: 'Tropical',     icon: '🌴' },
  { key: 'fashion_week',     label: 'Fashion Week', icon: '👗' },
  { key: 'african_village',  label: 'Village',      icon: '🌍' },
  { key: 'luxury_hotel',     label: 'Hotel Lobby',  icon: '🏨' },
  { key: 'garden_paradise',  label: 'Garden',       icon: '🌸' },
]

const DEFAULT_CONFIG = {
  gender: 'female',
  age_range: '26-35',
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
  const [nameFocused, setNameFocused] = useState(false)
  const [preservationStrength, setPreservationStrength] = useState(0.55)
  const [frontDesign, setFrontDesign] = useState('plain')
  const [neckline, setNeckline] = useState('round')
  const [sleeves, setSleeves] = useState('sleeveless')
  const [pattern, setPattern] = useState('plain')
  const [extraDetails, setExtraDetails] = useState('')

  async function handleGenerate() {
    if (!projectName.trim()) { toast.error('Please enter a project name'); return }
    if (files.length === 0) { toast.error('Please upload at least one garment photo'); return }
    const allowed = await canGenerate(imageCount)
    if (!allowed) {
      toast.error(`Not enough credits. You need ${imageCount} to generate.`)
      return
    }

    setGenerating(true)
    setProgress(5)
    setProgressMsg('Uploading garment images...')

    try {
      const uploadedUrls = await Promise.all(files.map(f => uploadFile(f)))
      setProgress(20)
      setProgressMsg('Creating project...')

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

      const fullConfig = { ...config, pose, background }
      const garmentDescription = [
        'EXACT GARMENT ATTRIBUTES (DO NOT DEVIATE):',
        `- Front design: ${frontDesign}`,
        `- Neckline: ${neckline}`,
        `- Sleeves: ${sleeves}`,
        `- Pattern/Print: ${pattern}`,
        `- Extra details: ${extraDetails || 'none'}`,
      ].join('\n')
      const { prompt, negative_prompt } = buildPrompt(fullConfig, garmentDescription)
      const { prompt: baseModelPrompt } = buildBaseModelPrompt(fullConfig)
      setProgressMsg(`Building ${imageCount} AI model images...`)

      const generatedUrls = []
      for (let i = 0; i < imageCount; i++) {
        setProgressMsg(`Generating image ${i + 1} of ${imageCount}...`)
        setProgress(35 + ((i / imageCount) * 50))
        const url = await generateImage(
          prompt, negative_prompt, uploadedUrls, preservationStrength,
          baseModelPrompt, config.garment_type
        )
        if (url) generatedUrls.push({ url, prompt })
      }

      // Warn if Fal.ai balance ran out and we fell back to text-to-image
      if (lastProvider === 'pollinations-fallback') {
        toast.warning(
          'Fal.ai balance exhausted — images generated without garment lock. Top up at fal.ai/dashboard/billing for exact garment matching.',
          { duration: 8000 }
        )
      }

      setProgress(88)
      setProgressMsg('Saving images...')

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

      await supabase.from('projects').update({
        status: 'completed',
        generation_count: generatedUrls.length,
      }).eq('id', project.id)

      await deductCredits(imageCount) // no-op for admin
      await supabase.from('users').update({
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
    <div style={{ minHeight: '100%' }}>
      {/* Page Header */}
      <div style={{ padding: '48px 48px 0' }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#B8960C', marginBottom: '10px' }}>
          New Project
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#0D0D0D', marginBottom: '20px' }}>
          Create Your Collection
        </h1>
        <div style={{ width: '40px', height: '1px', background: '#B8960C' }} />
      </div>

      {/* Generating Banner */}
      {generating && (
        <div style={{ margin: '32px 48px 0', background: '#FFFFFF', border: '1px solid rgba(184,150,12,0.3)', borderRadius: '4px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Sparkles size={13} style={{ color: '#B8960C' }} className="animate-pulse" />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500, color: '#B8960C', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {progressMsg}
            </span>
          </div>
          <div style={{ height: '2px', background: '#E8E4DC', borderRadius: '1px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #B8960C, #DEC05A)', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#6B6B6B', marginTop: '8px' }}>
            {Math.round(progress)}% complete
          </div>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%]" style={{ padding: '40px 48px', gap: '48px' }}>

        {/* LEFT COLUMN */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: '4px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {/* Project Name */}
          <div>
            <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#B8960C', marginBottom: '8px' }}>
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              disabled={generating}
              placeholder="e.g. Summer Ankara Collection..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${nameFocused ? '#B8960C' : '#E8E4DC'}`,
                borderRadius: 0,
                outline: 'none',
                padding: '14px 0',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '20px',
                fontWeight: 300,
                color: '#0D0D0D',
                transition: 'border-color 0.2s ease',
                caretColor: '#B8960C',
              }}
            />
          </div>

          {/* Upload Zone */}
          <div>
            <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#B8960C', marginBottom: '12px' }}>
              Garment Photos
            </label>
            <ClothingUploader value={files} onChange={setFiles} maxFiles={4} />
          </div>

          {/* Garment Attributes */}
          <div style={{ background: '#FAFAF8', border: '1px solid rgba(184,150,12,0.3)', borderLeft: '3px solid #B8960C', borderRadius: '4px', padding: '24px' }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B8960C', marginBottom: '6px' }}>
              Garment Details
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#6B6B6B', marginBottom: '20px', lineHeight: 1.5 }}>
              Describe your garment so the AI preserves it exactly. This prevents AI from adding elements that don't exist on your garment.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3A3A3A', marginBottom: '6px' }}>Front Design</label>
                <select value={frontDesign} onChange={e => setFrontDesign(e.target.value)} disabled={generating}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: '4px', padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#0D0D0D', outline: 'none', cursor: generating ? 'not-allowed' : 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#B8960C'}
                  onBlur={e => e.target.style.borderColor = '#E8E4DC'}>
                  <option value="plain">Plain (no buttons, no zip)</option>
                  <option value="buttons">Has buttons</option>
                  <option value="zip">Has zip/zipper</option>
                  <option value="wrapped">Wrap style</option>
                  <option value="tied">Tied / bow front</option>
                  <option value="embroidered">Has embroidery</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3A3A3A', marginBottom: '6px' }}>Neckline</label>
                <select value={neckline} onChange={e => setNeckline(e.target.value)} disabled={generating}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: '4px', padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#0D0D0D', outline: 'none', cursor: generating ? 'not-allowed' : 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#B8960C'}
                  onBlur={e => e.target.style.borderColor = '#E8E4DC'}>
                  <option value="round">Round neck</option>
                  <option value="v_neck">V-neck</option>
                  <option value="square">Square neck</option>
                  <option value="high">High neck / Turtle neck</option>
                  <option value="off_shoulder">Off shoulder</option>
                  <option value="boat">Boat neck</option>
                  <option value="halter">Halter neck</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3A3A3A', marginBottom: '6px' }}>Sleeves</label>
                <select value={sleeves} onChange={e => setSleeves(e.target.value)} disabled={generating}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: '4px', padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#0D0D0D', outline: 'none', cursor: generating ? 'not-allowed' : 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#B8960C'}
                  onBlur={e => e.target.style.borderColor = '#E8E4DC'}>
                  <option value="sleeveless">Sleeveless</option>
                  <option value="short">Short sleeves</option>
                  <option value="three_quarter">3/4 sleeves</option>
                  <option value="long">Long sleeves</option>
                  <option value="puff">Puff sleeves</option>
                  <option value="bell">Bell sleeves</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3A3A3A', marginBottom: '6px' }}>Pattern / Print</label>
                <select value={pattern} onChange={e => setPattern(e.target.value)} disabled={generating}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: '4px', padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#0D0D0D', outline: 'none', cursor: generating ? 'not-allowed' : 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#B8960C'}
                  onBlur={e => e.target.style.borderColor = '#E8E4DC'}>
                  <option value="plain">Plain / Solid color</option>
                  <option value="ankara">Ankara / African print</option>
                  <option value="striped">Striped</option>
                  <option value="floral">Floral print</option>
                  <option value="geometric">Geometric pattern</option>
                  <option value="lace">Lace fabric</option>
                  <option value="sequined">Sequined / Beaded</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3A3A3A', marginBottom: '6px' }}>Extra Details</label>
              <textarea
                value={extraDetails}
                onChange={e => setExtraDetails(e.target.value)}
                disabled={generating}
                placeholder="Describe any other important garment details (e.g. 'gold trim at hem', 'red belt included', 'open back design')"
                rows={2}
                style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: '4px', padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#0D0D0D', resize: 'none', outline: 'none', lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = '#B8960C'}
                onBlur={e => e.target.style.borderColor = '#E8E4DC'}
              />
            </div>
          </div>

          {/* Model Config */}
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B8960C', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Model Identity &amp; Appearance
              <div style={{ flex: 1, height: '1px', background: '#E8E4DC' }} />
            </div>
            <ModelConfigPanel config={config} onChange={setConfig} />
          </div>
        </div>

        {/* RIGHT COLUMN (sticky) */}
        <div className="lg:sticky lg:top-8 self-start" style={{ background: '#FFFFFF', border: '1px solid #E8E4DC', borderLeft: '1px solid #E8E4DC', borderRadius: '4px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

          {/* Scene — Pose */}
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B8960C', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Camera size={11} />
              Pose
              <div style={{ flex: 1, height: '1px', background: '#E8E4DC' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {POSES.map(p => (
                <SceneOption
                  key={p.key}
                  icon={p.icon}
                  label={p.label}
                  selected={pose === p.key}
                  onClick={() => !generating && setPose(p.key)}
                  disabled={generating}
                />
              ))}
            </div>
          </div>

          {/* Scene — Background */}
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B8960C', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Mountain size={11} />
              Background
              <div style={{ flex: 1, height: '1px', background: '#E8E4DC' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {BACKGROUNDS.map(b => (
                <SceneOption
                  key={b.key}
                  icon={b.icon}
                  label={b.label}
                  selected={background === b.key}
                  onClick={() => !generating && setBackground(b.key)}
                  disabled={generating}
                />
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div>
            <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#B8960C', marginBottom: '12px' }}>
              Custom Instructions
            </label>
            <textarea
              value={config.custom_instructions}
              onChange={e => setConfig(prev => ({ ...prev, custom_instructions: e.target.value }))}
              disabled={generating}
              placeholder="Any additional styling or scene details..."
              rows={3}
              style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: '4px', padding: '12px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#0D0D0D', resize: 'none', outline: 'none', transition: 'border-color 0.2s ease', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = '#B8960C'}
              onBlur={e => e.target.style.borderColor = '#E8E4DC'}
            />
          </div>

          {/* Garment Preservation Strength */}
          <div style={{ background: '#FAFAF8', border: '1px solid #E8E4DC', borderRadius: '4px', padding: '20px' }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B8960C', marginBottom: '14px' }}>
              Garment Preservation Strength
            </div>
            <input
              type="range"
              min="0.5"
              max="0.85"
              step="0.05"
              value={preservationStrength}
              onChange={e => setPreservationStrength(parseFloat(e.target.value))}
              disabled={generating}
              style={{ width: '100%', accentColor: '#B8960C', cursor: generating ? 'not-allowed' : 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: '#AAAAAA' }}>Max Preservation</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: preservationStrength > 0.70 ? '#E05C2A' : '#B8960C', fontWeight: 600 }}>
                {preservationStrength <= 0.55 ? 'Maximum Preservation (Recommended)' : preservationStrength <= 0.70 ? 'Balanced' : 'Creative (May alter garment)'}
                {' '}· {preservationStrength}
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: '#AAAAAA' }}>Creative</span>
            </div>
            {preservationStrength > 0.70 && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#E05C2A', marginTop: '8px', lineHeight: 1.5, fontWeight: 500 }}>
                ⚠️ High values may alter garment details. Lower for better preservation.
              </p>
            )}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#AAAAAA', marginTop: preservationStrength > 0.70 ? '4px' : '8px', lineHeight: 1.5 }}>
              Lower = garment preserved more strictly. Default 0.55 recommended.
            </p>
          </div>

          {/* Generation Panel */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DC', borderTop: '2px solid #B8960C', borderRadius: '4px', padding: '24px' }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B8960C', marginBottom: '16px' }}>
              Images to Generate
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4].map(n => (
                <CountButton
                  key={n}
                  value={n}
                  selected={imageCount === n}
                  onClick={() => !generating && setImageCount(n)}
                  disabled={generating}
                />
              ))}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#6B6B6B', marginBottom: '20px' }}>
              {profile?.unlimited
                ? '∞ Unlimited credits · Admin'
                : `Costs ${imageCount} credit${imageCount !== 1 ? 's' : ''} · ${profile?.credits || 0} available`
              }
            </div>
            <GenerateButton onClick={handleGenerate} generating={generating} imageCount={imageCount} disabled={generating || files.length === 0 || !projectName.trim()} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SceneOption({ icon, label, selected, onClick, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? 'rgba(184,150,12,0.06)' : hovered ? '#F8F5F0' : '#FAFAF8',
        border: selected ? '1px solid #B8960C' : `1px solid ${hovered ? '#D4C9B0' : '#E8E4DC'}`,
        borderRadius: '4px',
        padding: '10px 4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'center',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{ fontSize: '18px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: selected ? '#B8960C' : '#6B6B6B', lineHeight: 1.2 }}>
        {label}
      </div>
    </button>
  )
}

function CountButton({ value, selected, onClick, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        height: '40px',
        background: selected ? 'rgba(184,150,12,0.08)' : 'transparent',
        border: selected ? '1px solid #B8960C' : `1px solid ${hovered ? '#D4C9B0' : '#E8E4DC'}`,
        borderRadius: '2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'DM Mono', monospace",
        fontSize: '14px',
        fontWeight: 400,
        color: selected ? '#B8960C' : hovered ? '#3A3A3A' : '#6B6B6B',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {value}
    </button>
  )
}

function GenerateButton({ onClick, generating, imageCount, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: '52px',
        background: disabled ? 'rgba(184,150,12,0.25)' : hovered ? 'linear-gradient(135deg, #C9A82C, #F0D98A)' : 'linear-gradient(135deg, #B8960C, #DEC05A)',
        border: 'none',
        borderRadius: '2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: disabled ? 'rgba(13,13,13,0.4)' : '#0D0D0D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.2s ease',
        boxShadow: hovered && !disabled ? '0 0 24px rgba(184,150,12,0.3)' : 'none',
        opacity: disabled && !generating ? 0.35 : 1,
      }}
    >
      {generating ? (
        <>
          <RotateCw size={14} className="animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles size={14} />
          Generate {imageCount} Image{imageCount !== 1 ? 's' : ''}
        </>
      )}
    </button>
  )
}
