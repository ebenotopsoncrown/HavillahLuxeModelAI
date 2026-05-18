import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { invokeLLM } from '../lib/gemini'
import FlyerConfigurator from '../components/FlyerConfigurator'
import FlyerCanvas from '../components/FlyerCanvas'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
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
    <div className="max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#F8F5F0]">Flyer Studio</h1>
        <p className="text-sm text-[#F8F5F0]/40 mt-1">Create professional fashion marketing materials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Config */}
        <div className="space-y-4">
          {/* Model image select */}
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
            <Label className="mb-3">Select Model Image</Label>
            {loadingImages ? (
              <div className="flex justify-center py-4"><RotateCw size={18} className="animate-spin text-[#C6A052]" /></div>
            ) : projectImages.length === 0 ? (
              <div className="text-center py-6">
                <Image size={24} className="text-[#2A2A2A] mx-auto mb-2" />
                <p className="text-xs text-[#F8F5F0]/40">Generate model images first</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto">
                {projectImages.map(img => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedModelImg(img)}
                    className={`aspect-[4/3] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedModelImg?.id === img.id
                        ? 'border-[#C6A052] shadow-[0_0_12px_rgba(198,160,82,0.3)]'
                        : 'border-[#2A2A2A] hover:border-[#C6A052]/40'
                    }`}
                  >
                    <img src={img.image_url} alt="Model" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configurator */}
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
            <FlyerConfigurator config={flyerConfig} onChange={setFlyerConfig} />
          </div>

          <Button onClick={generateFlyer} disabled={loading || !selectedModelImg} className="w-full h-11">
            {loading ? (
              <><RotateCw size={15} className="animate-spin" /> Generating Flyer...</>
            ) : (
              <><Sparkles size={15} /> Generate Flyer</>
            )}
          </Button>
        </div>

        {/* Right: Canvas */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
            {flyerData ? (
              <FlyerCanvas flyerData={flyerData} onSave={saveFlyer} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#C6A052]/10 flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-[#C6A052]/50" />
                </div>
                <h3 className="text-lg font-semibold text-[#F8F5F0]/60 mb-2">Flyer Preview</h3>
                <p className="text-sm text-[#F8F5F0]/30">
                  Select a model image, configure your campaign,<br />then click Generate Flyer
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
