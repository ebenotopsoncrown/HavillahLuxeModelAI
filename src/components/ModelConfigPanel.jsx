import { Label } from './ui/label'
import { Select, SelectOption } from './ui/select'
import { Textarea } from './ui/textarea'

const AGE_OPTIONS = [
  { value: 'child_4_8',  label: 'Child 4–8 years',     group: 'Children' },
  { value: 'child_9_12', label: 'Child 9–12 years',    group: 'Children' },
  { value: 'teen_13_15', label: 'Teen 13–15 years',    group: 'Teenagers' },
  { value: 'teen_16_17', label: 'Teen 16–17 years',    group: 'Teenagers' },
  { value: '18-25',      label: 'Adult 18–25 years',   group: 'Adults' },
  { value: '26-35',      label: 'Adult 26–35 years',   group: 'Adults' },
  { value: '36-45',      label: 'Adult 36–45 years',   group: 'Adults' },
  { value: '46-55',      label: 'Adult 46–55 years',   group: 'Adults' },
]

const HAIRSTYLE_OPTIONS_FEMALE = [
  { value: 'afro',         label: 'Natural Afro' },
  { value: 'braided_crown',label: 'Braided Crown' },
  { value: 'ponytail',     label: 'Ponytail' },
  { value: 'cornrows',     label: 'Cornrows' },
  { value: 'twists',       label: 'Styled Twists' },
  { value: 'sleek_bun',    label: 'Sleek Bun' },
  { value: 'luxury_waves', label: 'Luxury Waves' },
  { value: 'locs',         label: 'Styled Locs' },
]

const HAIRSTYLE_OPTIONS_MALE = [
  { value: 'low_cut',        label: 'Low Cut / Fade' },
  { value: 'caesar_cut',     label: 'Caesar Cut' },
  { value: 'tapered_fade',   label: 'Tapered Fade' },
  { value: 'waves_360',      label: '360 Waves' },
  { value: 'dreadlocks_med', label: 'Medium Dreadlocks' },
  { value: 'bald_fade',      label: 'Bald / Clean Shave' },
]

const MAKEUP_OPTIONS = [
  { value: 'natural',   label: 'Natural / Glowing' },
  { value: 'executive', label: 'Executive / Polished' },
  { value: 'editorial', label: 'Editorial / Bold' },
  { value: 'bold_groom',label: 'Bold Groomed' },
]

const FACIAL_HAIR_OPTIONS = [
  { value: 'clean_shaven', label: 'Clean Shaven' },
  { value: 'short_beard',  label: 'Short Beard' },
  { value: 'full_beard',   label: 'Full Beard' },
  { value: 'goatee',       label: 'Goatee' },
  { value: 'mustache',     label: 'Mustache' },
]

const BODY_TYPE_OPTIONS = [
  { value: 'slim',       label: 'Slim / Model Physique' },
  { value: 'curvy',      label: 'Curvy / Hourglass' },
  { value: 'athletic',   label: 'Athletic / Toned' },
  { value: 'royal_plus', label: 'Royal Plus Size' },
]

const GARMENT_TYPES   = ['Dress', 'Top / Blouse', 'Trousers / Pants', 'Skirt', 'Suit / Blazer', 'Jumpsuit', 'Kaftan / Abaya', 'Traditional Wear', 'Jacket / Coat', 'Other']
const GARMENT_LENGTHS = ['Mini', 'Midi', 'Maxi', 'Knee-length', 'Floor-length', 'Cropped', 'Full-length']
const GARMENT_FITS    = ['Slim Fit', 'Regular Fit', 'Oversized', 'Fitted / Bodycon', 'Flowy / Relaxed', 'Tailored']

export default function ModelConfigPanel({ config, onChange }) {
  const set = (key, val) => onChange({ ...config, [key]: val })

  const isChild = config.age_range?.startsWith('child_')
  const isTeen  = config.age_range?.startsWith('teen_')
  const isYoung = isChild || isTeen

  const hairstyleOptions = config.gender === 'male' ? HAIRSTYLE_OPTIONS_MALE : HAIRSTYLE_OPTIONS_FEMALE

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#B8960C] uppercase tracking-wider">Model Configuration</h3>

      {/* Gender + Age */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Gender</Label>
          <Select value={config.gender || 'female'} onChange={e => set('gender', e.target.value)}>
            <SelectOption value="female">Female</SelectOption>
            <SelectOption value="male">Male</SelectOption>
          </Select>
        </div>
        <div>
          <Label>Age Group</Label>
          <Select value={config.age_range || '26-35'} onChange={e => set('age_range', e.target.value)}>
            {AGE_OPTIONS.map(o => (
              <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>
            ))}
          </Select>
        </div>
      </div>

      {/* Skin tone */}
      <div>
        <Label>Skin Tone</Label>
        <Select value={config.skin_tone || 'rich_cocoa'} onChange={e => set('skin_tone', e.target.value)}>
          <SelectOption value="deep_melanin">Deep Melanin (Ebony)</SelectOption>
          <SelectOption value="rich_cocoa">Rich Cocoa (Mahogany)</SelectOption>
          <SelectOption value="golden_bronze">Golden Bronze (Caramel)</SelectOption>
        </Select>
      </div>

      {/* Body type — hidden for young children */}
      {!isChild && (
        <div>
          <Label>Body Type</Label>
          <Select value={config.body_type || 'slim'} onChange={e => set('body_type', e.target.value)}>
            {BODY_TYPE_OPTIONS.map(o => (
              <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>
            ))}
          </Select>
        </div>
      )}

      {/* Hairstyle */}
      <div>
        <Label>Hairstyle</Label>
        <Select value={config.hairstyle || ''} onChange={e => set('hairstyle', e.target.value)}>
          {hairstyleOptions.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
        </Select>
      </div>

      {/* Makeup / facial hair — hidden for children & teens (auto natural) */}
      {!isYoung && (
        config.gender === 'female' ? (
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
        )
      )}

      {isYoung && (
        <p style={{ fontSize: '11px', color: '#B8960C', fontStyle: 'italic', margin: 0 }}>
          {isChild ? 'Child' : 'Teen'} models use natural age-appropriate appearance automatically.
        </p>
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
        <Label>Custom Instructions (optional)</Label>
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
