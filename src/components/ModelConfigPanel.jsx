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
  { value: 'afro',          label: 'Natural Afro' },
  { value: 'braided_crown', label: 'Braided Crown' },
  { value: 'cornrows',      label: 'Cornrows' },
  { value: 'sleek_bun',     label: 'Sleek Bun' },
  { value: 'luxury_waves',  label: 'Luxury Waves' },
  { value: 'locs',          label: 'Styled Locs' },
  { value: 'ponytail',      label: 'Ponytail' },
  { value: 'twists',        label: 'Styled Twists' },
]

const HAIRSTYLE_OPTIONS_MALE = [
  { value: 'low_cut',        label: 'Low Cut / Fade' },
  { value: 'caesar_cut',     label: 'Caesar Cut' },
  { value: 'tapered_fade',   label: 'Tapered Fade' },
  { value: 'high_top',       label: 'High Top Fade' },
  { value: 'waves_360',      label: '360 Waves' },
  { value: 'dreadlocks_med', label: 'Styled Locs' },
  { value: 'cornrows_male',  label: 'Cornrows' },
  { value: 'bald_fade',      label: 'Bald / Clean Shave' },
]

const MAKEUP_OPTIONS = [
  { value: 'natural',    label: 'Natural / Glowing' },
  { value: 'executive',  label: 'Executive / Polished' },
  { value: 'editorial',  label: 'Editorial / Bold' },
]

const FACIAL_HAIR_OPTIONS = [
  { value: 'clean_shaven', label: 'Clean Shaven' },
  { value: 'short_beard',  label: 'Short Beard' },
  { value: 'full_beard',   label: 'Full Beard' },
  { value: 'goatee',       label: 'Goatee' },
  { value: 'mustache',     label: 'Mustache' },
]

const BODY_TYPE_OPTIONS_FEMALE = [
  { value: 'slim',       label: 'Slim / Statuesque' },
  { value: 'curvy',      label: 'Curvy / Hourglass' },
  { value: 'athletic',   label: 'Athletic / Toned' },
  { value: 'royal_plus', label: 'Royal Plus Size' },
]

const BODY_TYPE_OPTIONS_MALE = [
  { value: 'slim',            label: 'Slim / Lean' },
  { value: 'athletic_male',   label: 'Athletic' },
  { value: 'muscular_male',   label: 'Muscular' },
  { value: 'broad_executive', label: 'Broad Executive' },
]

const OUTFIT_TYPE_OPTIONS = [
  { value: 'full_single',     label: 'Full Single Piece' },
  { value: 'full_outfit',     label: 'Complete Outfit' },
  { value: 'top_only',        label: 'Top / Blouse Only' },
  { value: 'trouser_only',    label: 'Trouser Only' },
  { value: 'bottom_only',     label: 'Bottom / Skirt Only' },
  { value: 'top_and_trouser', label: 'Top + Trouser (2-Piece)' },
  { value: 'top_and_bottom',  label: 'Top + Bottom (2-Piece)' },
  { value: 'agbada_set',      label: 'Agbada Set (3-Piece)' },
]

const GARMENT_LENGTH_OPTIONS = [
  { value: '',             label: 'Not specified' },
  { value: 'crop_short',  label: 'Cropped / Midriff' },
  { value: 'above_knee',  label: 'Above Knee (Short)' },
  { value: 'knee_length', label: 'Knee Length' },
  { value: 'below_knee',  label: 'Below Knee' },
  { value: 'midi_calf',   label: 'Midi / Calf Length' },
  { value: 'maxi_floor',  label: 'Maxi / Floor Length' },
  { value: 'flowing_gown',label: 'Full Gown (Sweeping)' },
]

const GARMENT_FIT_OPTIONS = [
  { value: '',              label: 'Not specified' },
  { value: 'tight_fitted',  label: 'Tight / Bodycon' },
  { value: 'slim_fit',      label: 'Slim Fit / Tailored' },
  { value: 'medium_fit',    label: 'Regular / Medium Fit' },
  { value: 'relaxed_fit',   label: 'Relaxed Fit' },
  { value: 'loose_flowing', label: 'Loose / Flowing' },
  { value: 'oversized',     label: 'Oversized' },
]

const LIGHTING_OPTIONS = [
  { value: 'soft_studio',        label: 'Soft Studio' },
  { value: 'golden_hour',        label: 'Golden Hour' },
  { value: 'dramatic_editorial', label: 'Dramatic Editorial' },
  { value: 'natural_window',     label: 'Natural Window Light' },
]

const CAMERA_OPTIONS = [
  { value: '85mm_portrait',      label: '85mm Portrait' },
  { value: '50mm_editorial',     label: '50mm Editorial' },
  { value: '35mm_environmental', label: '35mm Environmental' },
]

export default function ModelConfigPanel({ config, onChange }) {
  const set = (key, val) => onChange({ ...config, [key]: val })

  const isChild = config.age_range?.startsWith('child_')
  const isTeen  = config.age_range?.startsWith('teen_')
  const isYoung = isChild || isTeen
  const isMale  = config.gender === 'male'

  const hairstyleOptions  = isMale ? HAIRSTYLE_OPTIONS_MALE : HAIRSTYLE_OPTIONS_FEMALE
  const bodyTypeOptions   = isMale ? BODY_TYPE_OPTIONS_MALE : BODY_TYPE_OPTIONS_FEMALE

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
          <Select value={config.age_range || '36-45'} onChange={e => set('age_range', e.target.value)}>
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
            {bodyTypeOptions.map(o => (
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

      {/* Makeup / facial hair — hidden for children & teens */}
      {!isYoung && (
        isMale ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Grooming</Label>
              <Select value={config.makeup_level || 'groomed'} onChange={e => set('makeup_level', e.target.value)}>
                <SelectOption value="groomed">Natural / Groomed</SelectOption>
                <SelectOption value="bold_groom">Bold Groomed</SelectOption>
                <SelectOption value="executive">Executive</SelectOption>
                <SelectOption value="editorial">Editorial</SelectOption>
              </Select>
            </div>
            <div>
              <Label>Facial Hair</Label>
              <Select value={config.facial_hair || 'clean_shaven'} onChange={e => set('facial_hair', e.target.value)}>
                {FACIAL_HAIR_OPTIONS.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
              </Select>
            </div>
          </div>
        ) : (
          <div>
            <Label>Makeup Level</Label>
            <Select value={config.makeup_level || 'natural'} onChange={e => set('makeup_level', e.target.value)}>
              {MAKEUP_OPTIONS.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
            </Select>
          </div>
        )
      )}

      {isYoung && (
        <p style={{ fontSize: '11px', color: '#B8960C', fontStyle: 'italic', margin: 0 }}>
          {isChild ? 'Child' : 'Teen'} models use natural age-appropriate appearance automatically.
        </p>
      )}

      {/* Lighting + Camera */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Lighting</Label>
          <Select value={config.lighting || 'soft_studio'} onChange={e => set('lighting', e.target.value)}>
            {LIGHTING_OPTIONS.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
          </Select>
        </div>
        <div>
          <Label>Camera Lens</Label>
          <Select value={config.camera || '85mm_portrait'} onChange={e => set('camera', e.target.value)}>
            {CAMERA_OPTIONS.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
          </Select>
        </div>
      </div>

      {/* Garment Details */}
      <div className="border-t border-[#E8E4DC] pt-3">
        <h3 className="text-sm font-semibold text-[#B8960C] uppercase tracking-wider mb-3">Garment Details</h3>

        <div className="mb-3">
          <Label>Outfit Type</Label>
          <Select value={config.outfit_type || 'full_single'} onChange={e => set('outfit_type', e.target.value)}>
            {OUTFIT_TYPE_OPTIONS.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Garment Length</Label>
            <Select value={config.garment_length || ''} onChange={e => set('garment_length', e.target.value)}>
              {GARMENT_LENGTH_OPTIONS.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
            </Select>
          </div>
          <div>
            <Label>Garment Fit</Label>
            <Select value={config.garment_fit || ''} onChange={e => set('garment_fit', e.target.value)}>
              {GARMENT_FIT_OPTIONS.map(o => <SelectOption key={o.value} value={o.value}>{o.label}</SelectOption>)}
            </Select>
          </div>
        </div>

        <div className="mt-3">
          <Label>Garment Description (optional)</Label>
          <Textarea
            rows={2}
            placeholder="e.g. red floral ankara midi dress with puff sleeves..."
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
