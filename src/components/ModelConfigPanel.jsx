import { Label } from './ui/label'
import { Select, SelectOption } from './ui/select'
import { Textarea } from './ui/textarea'

const FIELD_GROUPS = {
  gender: {
    label: 'Gender',
    options: [{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }],
  },
  age_range: {
    label: 'Age Range',
    options: [
      { value: '30-35', label: '30–35 years' },
      { value: '36-42', label: '36–42 years' },
      { value: '43-50', label: '43–50 years' },
    ],
  },
  skin_tone: {
    label: 'Skin Tone',
    options: [
      { value: 'deep_melanin', label: 'Deep Melanin (Ebony)' },
      { value: 'rich_cocoa', label: 'Rich Cocoa (Mahogany)' },
      { value: 'golden_bronze', label: 'Golden Bronze (Caramel)' },
    ],
  },
  body_type: {
    label: 'Body Type',
    options: [
      { value: 'slim', label: 'Slim / Model Physique' },
      { value: 'curvy', label: 'Curvy / Hourglass' },
      { value: 'athletic', label: 'Athletic / Toned' },
      { value: 'royal_plus', label: 'Royal Plus Size' },
    ],
  },
}

const HAIRSTYLE_OPTIONS_FEMALE = [
  { value: 'afro', label: 'Natural Afro' },
  { value: 'braided_crown', label: 'Braided Crown' },
  { value: 'sleek_bun', label: 'Sleek Bun' },
  { value: 'luxury_waves', label: 'Luxury Waves' },
  { value: 'locs', label: 'Styled Locs' },
  { value: 'cornrows', label: 'Cornrows' },
]

const HAIRSTYLE_OPTIONS_MALE = [
  { value: 'low_cut', label: 'Low Cut / Fade' },
  { value: 'waves_360', label: '360 Waves' },
  { value: 'caesar_cut', label: 'Caesar Cut' },
  { value: 'dreadlocks_med', label: 'Medium Dreadlocks' },
  { value: 'bald_fade', label: 'Bald / Clean Shave' },
  { value: 'tapered_fade', label: 'Tapered Fade' },
]

const MAKEUP_OPTIONS = [
  { value: 'natural', label: 'Natural / Glowing' },
  { value: 'executive', label: 'Executive / Polished' },
  { value: 'editorial', label: 'Editorial / Bold' },
  { value: 'bold_groom', label: 'Bold Groomed' },
]

const FACIAL_HAIR_OPTIONS = [
  { value: 'clean_shaven', label: 'Clean Shaven' },
  { value: 'short_beard', label: 'Short Beard' },
  { value: 'full_beard', label: 'Full Beard' },
  { value: 'goatee', label: 'Goatee' },
  { value: 'mustache', label: 'Mustache' },
]

const GARMENT_TYPES = ['Dress', 'Top / Blouse', 'Trousers / Pants', 'Skirt', 'Suit / Blazer', 'Jumpsuit', 'Kaftan / Abaya', 'Traditional Wear', 'Jacket / Coat', 'Other']
const GARMENT_LENGTHS = ['Mini', 'Midi', 'Maxi', 'Knee-length', 'Floor-length', 'Cropped', 'Full-length']
const GARMENT_FITS = ['Slim Fit', 'Regular Fit', 'Oversized', 'Fitted / Bodycon', 'Flowy / Relaxed', 'Tailored']

export default function ModelConfigPanel({ config, onChange }) {
  const set = (key, val) => onChange({ ...config, [key]: val })
  const hairstyleOptions = config.gender === 'male' ? HAIRSTYLE_OPTIONS_MALE : HAIRSTYLE_OPTIONS_FEMALE

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#B8960C] uppercase tracking-wider">Model Configuration</h3>

      {/* Core fields */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(FIELD_GROUPS).map(([key, { label, options }]) => (
          <div key={key}>
            <Label>{label}</Label>
            <Select value={config[key] || ''} onChange={e => set(key, e.target.value)}>
              {options.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
            </Select>
          </div>
        ))}
      </div>

      {/* Hairstyle */}
      <div>
        <Label>Hairstyle</Label>
        <Select value={config.hairstyle || ''} onChange={e => set('hairstyle', e.target.value)}>
          {hairstyleOptions.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
        </Select>
      </div>

      {/* Grooming */}
      {config.gender === 'female' ? (
        <div>
          <Label>Makeup Level</Label>
          <Select value={config.makeup_level || 'natural'} onChange={e => set('makeup_level', e.target.value)}>
            {MAKEUP_OPTIONS.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
          </Select>
        </div>
      ) : (
        <div>
          <Label>Facial Hair</Label>
          <Select value={config.facial_hair || 'clean_shaven'} onChange={e => set('facial_hair', e.target.value)}>
            {FACIAL_HAIR_OPTIONS.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
          </Select>
        </div>
      )}

      <div className="border-t border-[#E8E4DC] pt-3">
        <h3 className="text-sm font-semibold text-[#B8960C] uppercase tracking-wider mb-3">Garment Details</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Type</Label>
            <Select value={config.garment_type || ''} onChange={e => set('garment_type', e.target.value)}>
              <SelectOption value="">Select...</SelectOption>
              {GARMENT_TYPES.map(t => <SelectOption key={t} value={t}>{t}</SelectOption>)}
            </Select>
          </div>
          <div>
            <Label>Length</Label>
            <Select value={config.garment_length || ''} onChange={e => set('garment_length', e.target.value)}>
              <SelectOption value="">Select...</SelectOption>
              {GARMENT_LENGTHS.map(t => <SelectOption key={t} value={t}>{t}</SelectOption>)}
            </Select>
          </div>
          <div>
            <Label>Fit</Label>
            <Select value={config.garment_fit || ''} onChange={e => set('garment_fit', e.target.value)}>
              <SelectOption value="">Select...</SelectOption>
              {GARMENT_FITS.map(t => <SelectOption key={t} value={t}>{t}</SelectOption>)}
            </Select>
          </div>
        </div>
        <div className="mt-3">
          <Label>Outfit Description (optional)</Label>
          <Textarea
            rows={2}
            placeholder="e.g. red floral midi dress with puff sleeves..."
            value={config.outfit_pieces || ''}
            onChange={e => set('outfit_pieces', e.target.value)}
          />
        </div>
      </div>

      <div className="border-t border-[#E8E4DC] pt-3">
        <Label>Custom Instructions (overrides defaults)</Label>
        <Textarea
          rows={3}
          placeholder="e.g. Show the back of the dress, use dramatic lighting..."
          value={config.custom_instructions || ''}
          onChange={e => set('custom_instructions', e.target.value)}
        />
      </div>
    </div>
  )
}
