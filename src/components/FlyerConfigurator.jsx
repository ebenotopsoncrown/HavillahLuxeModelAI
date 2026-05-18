import { Label } from './ui/label'
import { Input } from './ui/input'
import { Select, SelectOption } from './ui/select'
import { Textarea } from './ui/textarea'

const PLATFORMS = ['Instagram Post', 'Instagram Story', 'Facebook Post', 'eBay Listing', 'WhatsApp Banner', 'Print A4']
const CAMPAIGNS = ['New Collection Launch', 'Flash Sale', 'Brand Showcase', 'Product Feature', 'Holiday Special', 'Clearance']
const TONES = ['Luxury & Elegant', 'Bold & Energetic', 'Minimal & Clean', 'Warm & Inviting', 'Royal & Regal', 'Modern & Trendy']

export default function FlyerConfigurator({ config, onChange }) {
  const set = (key, val) => onChange({ ...config, [key]: val })

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#C6A052] uppercase tracking-wider">Campaign Details</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Brand Name</Label>
          <Input value={config.brand_name || ''} onChange={e => set('brand_name', e.target.value)} placeholder="Your brand..." />
        </div>
        <div>
          <Label>Platform</Label>
          <Select value={config.platform || ''} onChange={e => set('platform', e.target.value)}>
            <SelectOption value="">Select...</SelectOption>
            {PLATFORMS.map(p => <SelectOption key={p} value={p}>{p}</SelectOption>)}
          </Select>
        </div>
        <div>
          <Label>Campaign Type</Label>
          <Select value={config.campaign_type || ''} onChange={e => set('campaign_type', e.target.value)}>
            <SelectOption value="">Select...</SelectOption>
            {CAMPAIGNS.map(c => <SelectOption key={c} value={c}>{c}</SelectOption>)}
          </Select>
        </div>
        <div>
          <Label>Brand Tone</Label>
          <Select value={config.brand_tone || ''} onChange={e => set('brand_tone', e.target.value)}>
            <SelectOption value="">Select...</SelectOption>
            {TONES.map(t => <SelectOption key={t} value={t}>{t}</SelectOption>)}
          </Select>
        </div>
      </div>

      <div>
        <Label>Offer / Promotion Text (optional)</Label>
        <Input value={config.offer_text || ''} onChange={e => set('offer_text', e.target.value)} placeholder="e.g. 30% OFF All Dresses This Weekend" />
      </div>

      <div>
        <Label>Additional Notes (optional)</Label>
        <Textarea
          rows={2}
          value={config.notes || ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any specific details to include..."
        />
      </div>
    </div>
  )
}
