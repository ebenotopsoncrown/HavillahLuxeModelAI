import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { invokeLLM } from '../lib/gemini'
import FlyerConfigurator from '../components/FlyerConfigurator'
import FlyerCanvas from '../components/FlyerCanvas'
import { Sparkles, Image, RotateCw } from 'lucide-react'
import { toast } from 'sonner'

export default function FlyerStudio() {
  const { user } = useAuth()
  const [projectImages, setProjectImages] = useState([])
  const [selectedModelImg, setSelectedModelImg] = useState(null)
  const [flyerConfig, setFlyerConfig] = useState({ brand_name: '', platform: 'Instagram Post', campaign_type: '', brand_tone: '' })
  const [flyerData, setFlyerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingImages, setLoadingImages] = useState(true)

  useEffect(() => {
    if (user) loadImages()
  }, [user])

  async function loadImages() {
    setLoadingImages(true)
    const { data } = await supabase
      .from('generated_images')
      .select('*, projects(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setProjectImages(data || [])
    setLoadingImages(false)
  }

  async function generateFlyer() {
    if (!selectedModelImg) { toast.error('Select a model image first'); return }
    if (!flyerConfig.brand_name) { toast.error('Enter a brand name'); return }

    setLoading(true)
    try {
      const prompt = `You are a luxury fashion marketing expert. Create a high-impact social media flyer for:
Brand: ${flyerConfig.brand_name}
Platform: ${flyerConfig.platform}
Campaign: ${flyerConfig.campaign_type || 'Brand Showcase'}
Tone: ${flyerConfig.brand_tone || 'Luxury & Elegant'}
${flyerConfig.offer_text ? `Offer: ${flyerConfig.offer_text}` : ''}
${flyerConfig.notes ? `Notes: ${flyerConfig.notes}` : ''}

Return JSON with:
{
  "headline": "powerful 3-7 word headline",
  "subheadline": "one sentence supporting text",
  "cta_text": "call to action phrase",
  "tagline": "brand tagline 5-8 words",
  "hashtags": ["tag1","tag2","tag3","tag4","tag5"],
  "color_palette": {
    "accent": "#hex color that fits the brand tone",
    "text": "#F8F5F0",
    "background": "#0D0D0D"
  },
  "gradient_css": "CSS linear-gradient string for background"
}`

      const result = await invokeLLM(prompt, 'json_object')

      const fullData = {
        ...result,
        brand_name: flyerConfig.brand_name,
        campaign_type: flyerConfig.campaign_type,
        brand_tone: flyerConfig.brand_tone,
        platform: flyerConfig.platform,
        offer_text: flyerConfig.offer_text || '',
        model_image_url: selectedModelImg.image_url,
      }
      setFlyerData(fullData)
    } catch (err) {
      toast.error('Failed to generate flyer: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveFlyer() {
    if (!flyerData) return
    const { error } = await supabase.from('saved_flyers').insert({
      user_id: user.id,
      ...flyerConfig,
      headline: flyerData.headline,
      subheadline: flyerData.subheadline,
      cta_text: flyerData.cta_text,
      tagline: flyerData.tagline,
      hashtags: flyerData.hashtags,
      color_palette: flyerData.color_palette,
      gradient_css: flyerData.gradient_css,
      model_image_url: selectedModelImg?.image_url,
      config_json: flyerData,
    })
    if (error) toast.error('Failed to save flyer')
    else toast.success('Flyer saved!')
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div style={{ padding: '48px 48px 0', flexShrink: 0 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#B8960C', marginBottom: '10px' }}>
          Creative Tools
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#F5F0E8', marginBottom: '20px' }}>
          Flyer Studio
        </h1>
        <div style={{ width: '40px', height: '1px', background: '#B8960C' }} />
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ flex: 1, padding: '40px 48px', gap: '0' }}>

        {/* LEFT — Configuration */}
        <div style={{ background: '#141414', borderRadius: '4px 0 0 4px', border: '1px solid #1E1E1E', padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', overflowY: 'auto' }} className="lg:rounded-r-none rounded-b-none lg:rounded-b-none">

          {/* Model Image Selector */}
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B8960C', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Select Model Image
              <div style={{ flex: 1, height: '1px', background: '#1A1A1A' }} />
            </div>

            {loadingImages ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
                <RotateCw size={18} style={{ color: '#B8960C' }} className="animate-spin" />
              </div>
            ) : projectImages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', border: '1px dashed #1E1E1E', borderRadius: '4px' }}>
                <Image size={24} style={{ color: '#222', margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#444' }}>
                  Generate model images first
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {projectImages.map(img => (
                  <ModelImageThumb
                    key={img.id}
                    img={img}
                    selected={selectedModelImg?.id === img.id}
                    onClick={() => setSelectedModelImg(img)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Flyer Configurator */}
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B8960C', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Campaign Details
              <div style={{ flex: 1, height: '1px', background: '#1A1A1A' }} />
            </div>
            <FlyerConfigurator config={flyerConfig} onChange={setFlyerConfig} />
          </div>

          {/* Generate Button */}
          <GenerateFlyerButton onClick={generateFlyer} loading={loading} disabled={loading || !selectedModelImg} />
        </div>

        {/* RIGHT — Preview */}
        <div style={{ background: '#0F0F0F', borderRadius: '0 4px 4px 0', border: '1px solid #1E1E1E', borderLeft: 'none', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className="lg:rounded-l-none rounded-t-none lg:rounded-t-none">
          {flyerData ? (
            <div style={{ width: '100%' }}>
              <FlyerCanvas flyerData={flyerData} onSave={saveFlyer} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 32px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '4px', border: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Sparkles size={28} style={{ color: '#2A2A2A' }} />
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 300, color: '#333', marginBottom: '10px' }}>
                Flyer Preview
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#333', lineHeight: 1.7 }}>
                Select a model image, configure your<br />campaign, then generate your flyer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ModelImageThumb({ img, selected, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: '1',
        borderRadius: '2px',
        overflow: 'hidden',
        border: selected ? '2px solid #B8960C' : `2px solid ${hovered ? '#2A2A2A' : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: selected ? '0 0 12px rgba(184,150,12,0.25)' : 'none',
      }}
    >
      <img src={img.image_url} alt="Model" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

function GenerateFlyerButton({ onClick, loading, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: '48px',
        background: disabled ? 'rgba(184,150,12,0.2)' : hovered ? 'linear-gradient(135deg, #C9A82C, #F0D98A)' : 'linear-gradient(135deg, #B8960C, #DEC05A)',
        border: 'none',
        borderRadius: '2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: disabled ? 'rgba(8,8,8,0.4)' : '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        boxShadow: hovered && !disabled ? '0 0 20px rgba(184,150,12,0.25)' : 'none',
        flexShrink: 0,
      }}
    >
      {loading ? (
        <><RotateCw size={14} className="animate-spin" /> Generating Flyer...</>
      ) : (
        <><Sparkles size={14} /> Generate Flyer</>
      )}
    </button>
  )
}
