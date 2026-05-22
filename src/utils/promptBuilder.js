// ── Age group map ─────────────────────────────────────────────────────────────
const AGE_GROUP_MAP = {
  // Children
  child_4_8:  { desc: '6 year old child',      isChild: true,  isTeen: false, bodyDesc: 'small child frame, petite proportions, young child physique' },
  child_9_12: { desc: '11 year old child',     isChild: true,  isTeen: false, bodyDesc: 'preteen frame, growing child proportions, young physique' },
  // Teenagers
  teen_13_15: { desc: '14 year old teenager',  isChild: false, isTeen: true,  bodyDesc: null },
  teen_16_17: { desc: '17 year old teenager',  isChild: false, isTeen: true,  bodyDesc: null },
  // Adults (new ranges)
  '18-25':    { desc: '22 year old',           isChild: false, isTeen: false, bodyDesc: null },
  '26-35':    { desc: '30 year old',           isChild: false, isTeen: false, bodyDesc: null },
  '36-45':    { desc: '40 year old',           isChild: false, isTeen: false, bodyDesc: null },
  '46-55':    { desc: '50 year old',           isChild: false, isTeen: false, bodyDesc: null },
  // Backward-compatible legacy values
  '30-35':    { desc: '32 year old',           isChild: false, isTeen: false, bodyDesc: null },
  '36-42':    { desc: '39 year old',           isChild: false, isTeen: false, bodyDesc: null },
  '43-50':    { desc: '46 year old',           isChild: false, isTeen: false, bodyDesc: null },
}

// ── Attribute maps ────────────────────────────────────────────────────────────
const SKIN_TONE_MAP = {
  deep_melanin:  'deep melanin dark skin, rich ebony complexion, beautiful dark skin',
  rich_cocoa:    'rich cocoa brown skin, warm mahogany undertones, gorgeous brown skin',
  golden_bronze: 'golden bronze skin, warm caramel undertones, radiant bronze complexion',
}

const BODY_TYPE_MAP = {
  female: {
    slim:       'slim elegant model figure',
    curvy:      'beautiful curvy hourglass figure',
    athletic:   'toned athletic build',
    royal_plus: 'full-figured commanding plus-size model',
  },
  male: {
    slim:       'slim lean athletic build',
    curvy:      'broad shouldered well-built frame',
    athletic:   'muscular athletic physique',
    royal_plus: 'large commanding powerful frame',
  },
}

const HAIRSTYLE_MAP = {
  afro:           'voluminous natural afro',
  braided_crown:  'elegant braided crown updo',
  sleek_bun:      'sleek polished bun',
  luxury_waves:   'flowing luxury waves',
  locs:           'beautiful styled locs',
  cornrows:       'neat geometric cornrows',
  low_cut:        'clean low cut fade',
  waves_360:      '360 waves perfectly groomed',
  caesar_cut:     'sharp caesar cut',
  dreadlocks_med: 'medium length dreadlocks',
  bald_fade:      'clean bald head smooth',
  tapered_fade:   'sharp tapered fade',
  ponytail:       'neat ponytail',
  twists:         'styled twists',
}

const MAKEUP_MAP = {
  natural:   'natural glowing minimal makeup',
  executive: 'polished executive professional makeup',
  editorial: 'bold high fashion editorial makeup',
  groomed:   'well groomed natural look',
  bold_groom:'bold groomed distinguished look',
}

const FACIAL_HAIR_MAP = {
  clean_shaven: 'clean shaven smooth face',
  short_beard:  'neatly trimmed short beard',
  full_beard:   'full well-groomed beard',
  goatee:       'stylish goatee',
  mustache:     'sharp mustache',
}

export const POSE_MAP = {
  standing_power: 'standing confidently, hands on hips, power pose',
  royal_sitting:  'seated in a regal composed elegant pose',
  runway_walk:    'walking the runway mid-stride, confident',
  luxury_lounge:  'luxuriously lounging in a relaxed elegant pose',
  over_shoulder:  'looking over shoulder, three-quarter turn',
}

export const BACKGROUND_MAP = {
  luxury_palace:  'inside a grand luxury palace with ornate gold architecture',
  modern_mansion: 'modern luxury mansion interior, minimalist expensive decor',
  yacht_deck:     'on the deck of a luxury superyacht with ocean backdrop',
  studio_minimal: 'clean professional photography studio, seamless backdrop',
  desert_royalty: 'African desert landscape, golden sand dunes at sunset',
}

const QUALITY =
  'ultra-photorealistic professional fashion photography, ' +
  'shot on Hasselblad medium format camera, 8K resolution, ' +
  'razor sharp focus, perfect studio lighting, ' +
  'magazine editorial quality, Vogue fashion magazine style, ' +
  'award-winning fashion photography'

export const NEGATIVE_PROMPT =
  'different clothes, changed garment, modified clothing, added details, extra embellishments, ' +
  'wrong fabric, wrong pattern, wrong color scheme, different design, altered dress, new outfit, ' +
  'added buttons, added lines, added dots, added decorations, added embroidery, ' +
  'cartoon, anime, illustration, painting, 3D render, ' +
  'blurry, low quality, distorted, watermark, text, logo, ' +
  'extra limbs, wrong anatomy, deformed face, nudity'

const CHILD_NEGATIVE =
  'adult content, revealing clothing, inappropriate, sexual, explicit, ' +
  NEGATIVE_PROMPT

// ── Internal helpers ──────────────────────────────────────────────────────────
function resolveAgeGroup(age_range) {
  return AGE_GROUP_MAP[age_range] || AGE_GROUP_MAP['26-35']
}

function resolveGenderWord(gender, ageGroup) {
  if (ageGroup.isChild) return gender === 'male' ? 'boy' : 'girl'
  if (ageGroup.isTeen) return gender === 'male' ? 'teenage boy' : 'teenage girl'
  return gender === 'male' ? 'man' : 'woman'
}

function resolveGrooming(gender, ageGroup, makeup_level, facial_hair) {
  if (ageGroup.isChild || ageGroup.isTeen) return 'natural clean appearance, no makeup'
  return gender === 'female'
    ? (MAKEUP_MAP[makeup_level] || MAKEUP_MAP.natural)
    : (FACIAL_HAIR_MAP[facial_hair] || FACIAL_HAIR_MAP.clean_shaven)
}

// ── buildBaseModelPrompt ───────────────────────────────────────────────────────
// Used as Step 1 in the VTO pipeline: generates just the person + background.
// Deliberately avoids garment description so FASHN can overlay the real garment.
export function buildBaseModelPrompt(config) {
  const {
    gender           = 'female',
    age_range        = '26-35',
    skin_tone        = 'rich_cocoa',
    body_type        = 'slim',
    hairstyle        = 'afro',
    makeup_level     = 'natural',
    facial_hair      = 'clean_shaven',
    pose             = 'standing_power',
    background       = 'studio_minimal',
  } = config

  const ageGroup   = resolveAgeGroup(age_range)
  const genderWord = resolveGenderWord(gender, ageGroup)
  const skinTone   = SKIN_TONE_MAP[skin_tone]   || SKIN_TONE_MAP.rich_cocoa
  const bodyType   = ageGroup.bodyDesc || (BODY_TYPE_MAP[gender] || BODY_TYPE_MAP.female)[body_type] || 'elegant figure'
  const hair       = HAIRSTYLE_MAP[hairstyle]   || 'natural hair'
  const grooming   = resolveGrooming(gender, ageGroup, makeup_level, facial_hair)
  const poseDesc   = POSE_MAP[pose]             || POSE_MAP.standing_power
  const bgDesc     = BACKGROUND_MAP[background] || BACKGROUND_MAP.studio_minimal
  const negPrompt  = ageGroup.isChild ? CHILD_NEGATIVE : NEGATIVE_PROMPT

  const prompt = [
    `A ${ageGroup.desc} African ${genderWord},`,
    `${skinTone},`,
    `${bodyType},`,
    `${hair},`,
    `${grooming}.`,
    `Wearing a simple plain neutral fitted white outfit.`,
    `The model is ${poseDesc}.`,
    `BACKGROUND: ${bgDesc}.`,
    `PHOTOGRAPHY: ${QUALITY}`,
    `Professional fashion model pose, full body visible.`,
  ].join(' ')

  return { prompt, negative_prompt: negPrompt }
}

// ── buildPrompt ───────────────────────────────────────────────────────────────
// Full garment-preservation prompt used as img2img fallback.
export function buildPrompt(config, customInstructions) {
  const {
    gender              = 'female',
    age_range           = '26-35',
    skin_tone           = 'rich_cocoa',
    body_type           = 'slim',
    hairstyle           = 'afro',
    makeup_level        = 'natural',
    facial_hair         = 'clean_shaven',
    pose                = 'standing_power',
    background          = 'studio_minimal',
    garment_type        = '',
    garment_length      = '',
    garment_fit         = '',
    outfit_pieces       = '',
    custom_instructions = '',
  } = config

  const instructions = customInstructions || custom_instructions || ''

  const ageGroup   = resolveAgeGroup(age_range)
  const genderWord = resolveGenderWord(gender, ageGroup)
  const skinTone   = SKIN_TONE_MAP[skin_tone]   || SKIN_TONE_MAP.rich_cocoa
  const bodyType   = ageGroup.bodyDesc || (BODY_TYPE_MAP[gender] || BODY_TYPE_MAP.female)[body_type] || 'elegant figure'
  const hair       = HAIRSTYLE_MAP[hairstyle]   || 'natural hair'
  const grooming   = resolveGrooming(gender, ageGroup, makeup_level, facial_hair)
  const poseDesc   = POSE_MAP[pose]             || POSE_MAP.standing_power
  const bgDesc     = BACKGROUND_MAP[background] || BACKGROUND_MAP.studio_minimal
  const negPrompt  = ageGroup.isChild ? CHILD_NEGATIVE : NEGATIVE_PROMPT

  const garmentDetails = [garment_type, garment_length, garment_fit, outfit_pieces]
    .filter(Boolean).join(', ')

  const garmentBlock = `CRITICAL GARMENT REQUIREMENTS — MUST FOLLOW EXACTLY:
- Copy THE EXACT SAME garment from the reference image — pixel-perfect accuracy required
- Preserve every single detail: exact colors, patterns, prints, fabric texture, sheen
- Preserve exact garment style, cut, silhouette and design — do NOT simplify
- Preserve ALL decorative elements: embroidery, buttons, zips, lace, prints, beadwork
- DO NOT add any new element not present in the reference (no extra lines, dots, buttons, stitching)
- DO NOT remove any element present in the reference
- The clothing must be IDENTICAL to the reference image — no artistic interpretation
- ONLY the model's face/body, pose, and background should differ from the reference`

  const customBlock = instructions
    ? `\nADDITIONAL INSTRUCTIONS (HIGH PRIORITY): ${instructions}\n`
    : ''

  const garmentDescBlock = garmentDetails
    ? `GARMENT DESCRIPTION (reference only): ${garmentDetails}.`
    : ''

  const modelBlock =
    `NEW MODEL: A ${ageGroup.desc} African ${genderWord}, ` +
    `${skinTone}, ${bodyType}, ${hair}, ${grooming}.`

  const sceneBlock =
    `POSE: The model is ${poseDesc}. ` +
    `BACKGROUND: ${bgDesc} — COMPLETELY DIFFERENT from the reference image background.`

  const prompt = [
    garmentBlock,
    customBlock,
    garmentDescBlock,
    modelBlock,
    sceneBlock,
    `PHOTOGRAPHY: ${QUALITY}`,
    'FINAL CHECK: The garment is IDENTICAL to the reference — same colors, same pattern, same design. Zero modifications.',
  ].filter(Boolean).join('\n')

  return { prompt, negative_prompt: negPrompt }
}

// Named re-exports for any component that imports the maps directly
export {
  SKIN_TONE_MAP   as SKIN_TONE_BLOCKS,
  BODY_TYPE_MAP   as BODY_TYPE_BLOCKS,
  HAIRSTYLE_MAP   as HAIRSTYLE_BLOCKS,
  MAKEUP_MAP      as MAKEUP_BLOCKS,
  FACIAL_HAIR_MAP as FACIAL_HAIR_BLOCKS,
  POSE_MAP        as POSE_BLOCKS,
  BACKGROUND_MAP  as BACKGROUND_BLOCKS,
  AGE_GROUP_MAP,
}
