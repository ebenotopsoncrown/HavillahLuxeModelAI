// ── Age group map ─────────────────────────────────────────────────────────────
const AGE_GROUP_MAP = {
  child_4_8:  { desc: '6 year old child',       isChild: true,  isTeen: false, bodyDesc: 'small child frame, petite proportions, young child physique' },
  child_9_12: { desc: '11 year old child',      isChild: true,  isTeen: false, bodyDesc: 'preteen frame, growing child proportions, young physique' },
  teen_13_15: { desc: '14 year old teenager',   isChild: false, isTeen: true,  bodyDesc: null },
  teen_16_17: { desc: '17 year old teenager',   isChild: false, isTeen: true,  bodyDesc: null },
  '18-25':    { desc: 'age 22, youthful vibrant African person, radiant fresh skin, contemporary energy', isChild: false, isTeen: false, bodyDesc: null },
  '26-35':    { desc: 'age 28, youthful yet mature African person, smooth refined skin with natural radiance, contemporary elegance', isChild: false, isTeen: false, bodyDesc: null },
  '36-45':    { desc: 'age 40, established elegance, graceful maturity, poised executive presence, refined beauty with depth', isChild: false, isTeen: false, bodyDesc: null },
  '46-55':    { desc: 'age 50, dignified timeless beauty, distinguished luxury presence, regal commanding aura', isChild: false, isTeen: false, bodyDesc: null },
  // Legacy values — kept for backward compat
  '30-35':    { desc: 'age 32, youthful yet mature African person, smooth refined skin with natural radiance, contemporary elegance', isChild: false, isTeen: false, bodyDesc: null },
  '36-42':    { desc: 'age 38, established elegance, graceful maturity, poised executive presence, refined beauty with depth', isChild: false, isTeen: false, bodyDesc: null },
  '43-50':    { desc: 'age 47, dignified timeless beauty, distinguished luxury presence, regal commanding aura', isChild: false, isTeen: false, bodyDesc: null },
}

// ── Background descriptions ───────────────────────────────────────────────────
export const BACKGROUND_MAP = {
  luxury_palace:   'opulent luxury palace interior with polished white marble floors featuring gold veining, ornate gold baroque accents, grand royal throne room, crystal chandeliers with warm glow, high ceilings with crown molding, regal atmosphere',
  modern_mansion:  'contemporary luxury mansion interior with panoramic floor-to-ceiling glass windows, minimalist designer furniture in neutral tones, clean architectural lines, abundant natural light, sophisticated modern aesthetic',
  yacht_deck:      'luxury mega-yacht teak wood deck at golden hour sunset, sparkling turquoise ocean backdrop, nautical elegance, coastal luxury, warm sunset lighting',
  studio_minimal:  'clean professional high-end fashion photography studio with seamless neutral luxury backdrop in champagne tones, soft diffused professional lighting setup, minimal aesthetic, editorial quality environment',
  desert_royalty:  'golden Saharan desert at sunset with dramatic rolling sand dunes, warm amber atmospheric lighting, cinematic vastness, royal mystique, exotic luxury location, natural grandeur',
  city_rooftop:    'glamorous rooftop terrace overlooking a spectacular city skyline at dusk, warm city lights glowing, sleek modern rooftop furniture, urban luxury lifestyle setting',
  tropical_paradise: 'stunning luxury beach resort, crystal clear turquoise lagoon water, pristine white sand beach, elegant overwater bungalows, swaying palm trees, perfect golden hour sky, five star tropical paradise',
  fashion_week:    'Paris Fashion Week venue, dramatic runway lighting, high fashion industry atmosphere, elegant couture fashion show setting, designer brand campaign quality',
  african_village: 'beautiful traditional African village with vibrant colorful surroundings, lush baobab trees in golden afternoon light, rich authentic cultural setting, warm earthy tones, serene natural beauty',
  luxury_hotel:    'grand five-star luxury hotel lobby with towering marble columns, opulent crystal chandeliers, gold and ivory decor, lavish high-end interior design, palatial elegance',
  garden_paradise: 'stunning English country garden in full bloom, lush roses and greenery, romantic soft natural light filtering through leaves, fairytale garden setting, impressionist painting quality natural beauty',
}

// ── Skin tone descriptions ────────────────────────────────────────────────────
const SKIN_TONE_MAP = {
  deep_melanin:  'deep rich melanin skin with luminous dark complexion, beautiful ebony undertones, radiant glow, flawless texture',
  rich_cocoa:    'rich cocoa skin tone with warm golden undertones, radiant sun-kissed glow, silky smooth appearance',
  golden_bronze: 'golden bronze skin with honey undertones, sun-kissed warmth, regal luminous glow, sophisticated depth',
}

// ── Body type descriptions ────────────────────────────────────────────────────
const BODY_TYPE_MAP = {
  female: {
    slim:         'slim elegant figure with graceful proportions, refined silhouette, statuesque presence',
    curvy:        'beautifully curvy hourglass figure with voluptuous elegance, natural feminine proportions, confident curves',
    athletic:     'athletic toned figure with powerful grace, defined muscles, strong elegant physique',
    royal_plus:   'full-figured royal presence with majestic proportions, regal curves, commanding beauty, queen-like stature',
  },
  male: {
    slim:          'slim lean masculine figure with elegant proportions, refined silhouette, graceful yet powerful build',
    slim_male:     'slim lean masculine figure with elegant proportions, refined silhouette, graceful yet powerful build',
    curvy:         'powerfully built muscular masculine figure with commanding presence, broad shoulders, imposing stature',
    athletic:      'athletic toned masculine figure with defined broad shoulders, powerful chest, strong masculine physique',
    athletic_male: 'athletic toned masculine figure with defined broad shoulders, powerful chest, strong masculine physique',
    muscular_male: 'powerfully built muscular masculine figure with commanding presence, broad shoulders, imposing stature',
    royal_plus:    'broad full-figured masculine executive presence with commanding stature, powerful authoritative build',
    broad_executive: 'broad full-figured masculine executive presence with commanding stature, powerful authoritative build',
  },
}

// ── Hairstyle descriptions (female) ──────────────────────────────────────────
const HAIRSTYLE_FEMALE_MAP = {
  afro:           'natural voluminous afro with beautifully textured coils, crown of glory, defined curl pattern, healthy shine',
  braided_crown:  'intricate braided crown hairstyle with royal styling, elegant cornrow patterns, cultural artistry, regal finish',
  sleek_bun:      'sleek sophisticated high bun with refined elegant styling, polished finish, executive presence',
  luxury_waves:   'luxurious flowing waves with glamorous body, voluminous cascading hair, editorial-worthy styling, silky movement',
  locs:           'elegant styled locs with natural beauty, well-maintained length, sophisticated texture, cultural pride',
  cornrows:       'intricate geometric cornrow patterns with cultural elegance, precise braiding, artistic sophistication',
  ponytail:       'sleek polished ponytail, elegant and refined',
  twists:         'beautiful styled twists, natural texture, artfully arranged',
}

// ── Hairstyle descriptions (male) ─────────────────────────────────────────────
const HAIRSTYLE_MALE_MAP = {
  low_cut:        'sharp low fade haircut with clean precise edges, well-groomed professional masculine styling',
  low_fade:       'sharp low fade haircut with clean precise edges, well-groomed professional masculine styling',
  caesar_cut:     'clean classic caesar cut with defined shape, professional masculine grooming',
  clean_cut:      'clean classic low cut hairstyle with defined shape, professional masculine grooming',
  tapered_fade:   'sharp tapered fade, professionally edged, clean modern look',
  waves_360:      'perfect 360 waves, immaculately groomed, deep wave pattern',
  high_top:       'styled high top fade with defined natural texture, bold contemporary African masculine look',
  dreadlocks_med: 'well-maintained styled locs with natural masculine beauty, cultured sophisticated length',
  locs_male:      'well-maintained styled locs with natural masculine beauty, cultured sophisticated length',
  bald_fade:      'clean shaved bald head with polished masculine confidence, distinguished powerful look',
  bald_shave:     'clean shaved bald head with polished masculine confidence, distinguished powerful look',
  cornrows_male:  'neat geometric cornrow patterns with cultural precision, traditional masculine artistry',
}

// Unified hairstyle map (for backward compat)
const HAIRSTYLE_MAP = { ...HAIRSTYLE_FEMALE_MAP, ...HAIRSTYLE_MALE_MAP }

// ── Makeup / grooming descriptions ───────────────────────────────────────────
const MAKEUP_MAP = {
  natural:    'soft natural makeup with luminous dewy skin glow, subtle enhancement, fresh-faced beauty, minimal bronzer, nude lips, defined brows',
  executive:  'polished executive makeup with refined lips in berry tones, understated glamour, professional finish, soft contour',
  editorial:  'bold editorial makeup with dramatic smokey eyes, striking beauty, magazine-ready artistry, sculpted cheekbones, statement lips, high-impact glamour',
  groomed:    'clean well-groomed male skin, moisturized smooth complexion, natural healthy appearance',
  bold_groom: 'boldly groomed male look, high-definition skin, contoured jawline, polished editorial finish',
}

const FACIAL_HAIR_MAP = {
  clean_shaven: 'clean-shaven face, smooth jawline, well-groomed',
  short_beard:  'neatly trimmed short beard, well-defined edges, groomed',
  full_beard:   'full well-maintained beard, precisely shaped with sharp edges, distinguished',
  goatee:       'neat goatee beard, precisely groomed chin and mustache area',
  mustache:     'well-trimmed mustache, groomed upper lip hair',
}

// ── Pose descriptions ─────────────────────────────────────────────────────────
export const POSE_MAP = {
  standing_power: 'weight on back leg, commanding powerful presence, regal posture, full body visible head to toe, centered composition, one hand on hip, confident stance',
  royal_sitting:  'seated elegantly on luxury velvet throne chair, poised regal posture, legs crossed gracefully, hands relaxed on armrests, regal demeanor, straight spine, chin slightly elevated',
  runway_walk:    'mid-walk runway pose with natural confident stride, fluid garment motion revealing draping, dynamic movement captured, professional catwalk energy, one foot forward',
  luxury_lounge:  'leaning casually against polished marble pillar, relaxed yet powerful stance, one leg crossed over the other, casual luxury elegance, effortless sophistication',
  over_shoulder:  'looking back over shoulder with subtle confident expression, dramatic elegant three-quarter profile, mysterious allure, captivating gaze, poised neck extension',
}

// ── Garment length descriptions ───────────────────────────────────────────────
export const GARMENT_LENGTH_MAP = {
  crop_short:    'cropped short garment ending at midriff or waist level, showing torso',
  above_knee:    'garment hem ending above the knee, short length',
  knee_length:   'garment ending at knee level, classic knee-length',
  below_knee:    'garment extending below the knee to mid-calf area',
  midi_calf:     'midi length garment ending at mid-calf, elegant tea-length',
  maxi_floor:    'floor-length maxi garment reaching ankles or floor',
  flowing_gown:  'flowing full-length gown with dramatic sweeping hem, floor-sweeping elegance',
}

// Legacy text value fallback
const GARMENT_LENGTH_LEGACY = {
  'Mini':         GARMENT_LENGTH_MAP.above_knee,
  'Midi':         GARMENT_LENGTH_MAP.midi_calf,
  'Maxi':         GARMENT_LENGTH_MAP.maxi_floor,
  'Knee-length':  GARMENT_LENGTH_MAP.knee_length,
  'Floor-length': GARMENT_LENGTH_MAP.maxi_floor,
  'Cropped':      GARMENT_LENGTH_MAP.crop_short,
  'Full-length':  GARMENT_LENGTH_MAP.maxi_floor,
}

// ── Garment fit descriptions ──────────────────────────────────────────────────
export const GARMENT_FIT_MAP = {
  tight_fitted:  'body-hugging tight fitted silhouette that follows every curve, form-fitting tailored precision',
  slim_fit:      'tailored slim fit close to the body with defined shape, elegant streamlined cut',
  medium_fit:    'classic medium fit with comfortable ease, balanced proportions, flattering drape',
  relaxed_fit:   'relaxed comfortable fit with generous ease, natural flow and movement',
  loose_flowing: 'loose flowing silhouette with abundant fabric, free-moving draping, airy volume',
  oversized:     'oversized voluminous fit with dramatic proportions, statement-making width, bold architectural shape',
}

const GARMENT_FIT_LEGACY = {
  'Slim Fit':           GARMENT_FIT_MAP.slim_fit,
  'Regular Fit':        GARMENT_FIT_MAP.medium_fit,
  'Oversized':          GARMENT_FIT_MAP.oversized,
  'Fitted / Bodycon':   GARMENT_FIT_MAP.tight_fitted,
  'Flowy / Relaxed':    GARMENT_FIT_MAP.loose_flowing,
  'Tailored':           GARMENT_FIT_MAP.slim_fit,
}

// ── Outfit type / pieces descriptions ────────────────────────────────────────
export const OUTFIT_PIECES_MAP = {
  full_outfit:     'wearing the complete outfit exactly as shown in the reference image',
  full_single:     'wearing the complete single-piece outfit fully, entire garment visible from neckline to hem',
  top_only:        'CRITICAL: The model wears ONLY the TOP/BLOUSE piece. Show only the top garment. Pair with simple neutral plain trousers as understated complement. Focus entirely on the top piece.',
  trouser_only:    'CRITICAL: The model wears ONLY the TROUSER/BOTTOM piece from the reference. Show the trouser clearly on the lower body. Pair with a simple plain neutral top as complement.',
  bottom_only:     'CRITICAL: The model wears ONLY the BOTTOM piece (trousers/skirt). Show from waist down clearly. Model wears a simple neutral top that is NOT the focus.',
  top_and_trouser: 'CRITICAL: This is a TWO-PIECE OUTFIT. Show BOTH the TOP piece AND the TROUSER/BOTTOM piece as entirely separate distinct garments. DO NOT merge them into a single dress. Both separate pieces must be clearly and fully visible.',
  top_and_bottom:  'CRITICAL: This is a TWO-PIECE OUTFIT - a SEPARATE TOP and SEPARATE BOTTOM. Show BOTH pieces as completely separate garments. Both the top and bottom must be clearly visible and distinct.',
  agbada_set:      'CRITICAL: This is a COMPLETE AGBADA THREE-PIECE SET. Show all three pieces: the wide flowing outer robe, the inner tunic/kaftan, and the trousers. All three pieces must be clearly visible and correctly layered.',
}

// ── Lighting descriptions ─────────────────────────────────────────────────────
export const LIGHTING_MAP = {
  soft_studio:        'soft diffused studio lighting with beauty dish setup, wrap-around illumination, minimal shadows, professional fashion photography lighting',
  golden_hour:        'warm golden hour natural light, soft directional sunlight, glowing skin tones, cinematic warmth',
  dramatic_editorial: 'dramatic high-contrast editorial lighting, defined shadows, sculptural illumination, Vogue-style setup',
  natural_window:     'natural window light with soft diffusion, authentic skin tones, gentle shadows, elegant simplicity',
}

// ── Camera lens descriptions ──────────────────────────────────────────────────
export const CAMERA_MAP = {
  '85mm_portrait':     '85mm prime lens, professional fashion portrait, shallow depth of field with creamy bokeh, subject sharply focused',
  '50mm_editorial':    '50mm lens, editorial full-body perspective, balanced proportions, natural field of view',
  '35mm_environmental':'35mm lens, environmental fashion photography, context included, dynamic composition',
}

// ── Quality prefix (exact Base44 Fk) ─────────────────────────────────────────
const QUALITY_PREFIX =
  'ultra-detailed skin texture with visible natural pores, realistic subsurface scattering, volumetric atmospheric lighting, ' +
  'photorealistic shadows with soft edges, accurate color grading, professional color science, natural depth of field, ' +
  'optical lens characteristics, film grain subtlety, cinematic color palette'

// ── Negative prompt (exact Base44 Rk) ────────────────────────────────────────
export const NEGATIVE_PROMPT =
  'same face as uploaded image, same pose as uploaded image, same background as uploaded image, ' +
  'face similarity to source, image cloning, face replication, identity preservation, face-swap, ' +
  'copied identity, background carry-over, real person replicated, blurry output, cartoonish style, ' +
  'CGI plastic skin, deformed hands, distorted clothing, logo mutation, text distortion, ' +
  'blurry, low resolution, out of focus, distorted anatomy, extra fingers, extra limbs, ' +
  'poorly fitted clothing, warped fabric, stretched textile, unrealistic lighting, plastic artificial skin, ' +
  'bad proportions, deformed face, asymmetrical eyes, ugly, disfigured, low quality, amateur photography, ' +
  'cartoon, illustration, painting, drawing, sketch, 3D render, CGI, doll-like, mannequin, ' +
  'oversaturated, underexposed, overexposed, noise, artifacts, watermark'

const CHILD_NEGATIVE_EXTRA = 'adult content, revealing clothing, inappropriate, sexual, explicit, '

// ── Internal helpers ──────────────────────────────────────────────────────────
function resolveAgeGroup(age_range) {
  return AGE_GROUP_MAP[age_range] || AGE_GROUP_MAP['36-45'] || AGE_GROUP_MAP['36-42']
}

function resolveGenderWord(gender, ageGroup) {
  if (ageGroup.isChild) return gender === 'male' ? 'boy' : 'girl'
  if (ageGroup.isTeen)  return gender === 'male' ? 'teenage boy' : 'teenage girl'
  return gender === 'male' ? 'man' : 'woman'
}

function resolveGarmentLength(val) {
  if (!val) return ''
  return GARMENT_LENGTH_MAP[val] || GARMENT_LENGTH_LEGACY[val] || val
}

function resolveGarmentFit(val) {
  if (!val) return ''
  return GARMENT_FIT_MAP[val] || GARMENT_FIT_LEGACY[val] || val
}

// ── buildBaseModelPrompt ──────────────────────────────────────────────────────
// VTO Step 1: generate a beautiful African model in chosen background wearing a
// plain white neutral outfit. FASHN overlays the real garment in Step 2.
export function buildBaseModelPrompt(config) {
  console.log('[buildBaseModelPrompt] CONFIG RECEIVED:', JSON.stringify(config, null, 2))

  const {
    gender       = 'female',
    age_range    = '36-42',
    skin_tone    = 'rich_cocoa',
    body_type    = 'slim',
    hairstyle    = 'afro',
    makeup_level = 'natural',
    facial_hair  = 'clean_shaven',
    pose         = 'standing_power',
    background   = 'studio_minimal',
    lighting     = 'soft_studio',
    camera       = '85mm_portrait',
  } = config

  const isMale    = gender === 'male'
  const ageGroup  = resolveAgeGroup(age_range)
  const genderWord = resolveGenderWord(gender, ageGroup)

  const skin     = SKIN_TONE_MAP[skin_tone] || SKIN_TONE_MAP.rich_cocoa
  const bodyMap  = isMale ? BODY_TYPE_MAP.male : BODY_TYPE_MAP.female
  const body     = ageGroup.bodyDesc || bodyMap[body_type] || bodyMap.slim || 'elegant model figure'
  const hairMap  = isMale ? HAIRSTYLE_MALE_MAP : HAIRSTYLE_FEMALE_MAP
  const hair     = hairMap[hairstyle] || HAIRSTYLE_MAP[hairstyle] || 'beautiful natural hair'
  const bgDesc   = BACKGROUND_MAP[background] || BACKGROUND_MAP.studio_minimal
  const poseDesc = POSE_MAP[pose] || POSE_MAP.standing_power
  const lightDesc = LIGHTING_MAP[lighting] || LIGHTING_MAP.soft_studio
  const camDesc  = CAMERA_MAP[camera] || CAMERA_MAP['85mm_portrait']

  const grooming = (ageGroup.isChild || ageGroup.isTeen)
    ? 'natural clean appearance, no makeup'
    : isMale
      ? (MAKEUP_MAP[makeup_level === 'natural' ? 'groomed' : makeup_level] || MAKEUP_MAP.groomed) +
        (FACIAL_HAIR_MAP[facial_hair] ? `, ${FACIAL_HAIR_MAP[facial_hair]}` : '')
      : (MAKEUP_MAP[makeup_level] || MAKEUP_MAP.natural)

  const genderIdentity = isMale
    ? 'Ultra-realistic African man of regal royal presence, refined masculine elegance and affluent aura'
    : 'Ultra-realistic African woman of regal royal presence, refined elegance and affluent aura'

  const faceFeatures = isMale
    ? 'symmetrical facial structure, strong masculine jawline, prominent cheekbones, well-defined features, confident demeanor'
    : 'symmetrical facial structure, prominent high cheekbones, almond-shaped eyes, full natural lips, confident demeanor'

  const genderNegative = isMale
    ? 'woman, female, feminine, female body, female face, female features, feminine features'
    : 'man, male, masculine, male body, male face, beard, mustache, male features, masculine features'

  const prompt = [
    `${genderIdentity}, ${skin}, ${ageGroup.desc}, luxury high-fashion editorial model,`,
    `unique AI-generated face with ${faceFeatures}, ${body}, ${hair}, ${grooming}.`,
    `The model is ${poseDesc}.`,
    `OUTFIT: The model is wearing a perfectly fitted plain white seamless bodysuit — simple and clean with no details. This is a placeholder outfit only.`,
    `BACKGROUND — GENERATE FROM SCRATCH: ${bgDesc}. Do NOT copy any background from reference photos.`,
    `CAMERA & LIGHTING: ${camDesc}, ${lightDesc}, shot on 85mm lens, f1.8–f4 aperture, golden ratio composition.`,
    `QUALITY: ${QUALITY_PREFIX}, ultra realistic skin texture, high dynamic range, professional fashion photography, magazine cover quality, 8K ultra high resolution, Vogue Italia editorial standard, award-winning fashion photography.`,
    ageGroup.isChild ? 'Child model — age-appropriate natural appearance.' : '',
  ].filter(Boolean).join(' ')

  const negative_prompt = [
    genderNegative,
    'blurry, low quality, distorted, cartoon, anime, painting, 3D render, illustration, CGI',
    'watermark, text, logo, extra limbs, wrong anatomy, deformed face, bad hands, extra fingers',
    'background from garment photo, copied background, original photo setting',
    ageGroup.isChild ? CHILD_NEGATIVE_EXTRA : '',
  ].filter(Boolean).join(', ')

  console.log('[buildBaseModelPrompt] PROMPT:', prompt)
  return { prompt, negative_prompt }
}

// ── buildPrompt ───────────────────────────────────────────────────────────────
// Base44 IDENTITY GENERATION MODE — img2img fallback path.
// Uses exact Base44 6-step pipeline prompt structure for maximum compatibility.
export function buildPrompt(config, customInstructions) {
  const {
    gender              = 'female',
    age_range           = '36-42',
    skin_tone           = 'rich_cocoa',
    body_type           = 'slim',
    hairstyle           = 'afro',
    makeup_level        = 'natural',
    facial_hair         = 'clean_shaven',
    pose                = 'standing_power',
    background          = 'studio_minimal',
    lighting            = 'soft_studio',
    camera              = '85mm_portrait',
    garment_length      = '',
    garment_fit         = '',
    outfit_type         = 'full_single',
    outfit_pieces       = '',
    custom_instructions = '',
  } = config

  const instructions = customInstructions || custom_instructions || ''
  const isMale = gender === 'male'
  const ageGroup = resolveAgeGroup(age_range)

  const skin     = SKIN_TONE_MAP[skin_tone] || SKIN_TONE_MAP.rich_cocoa
  const bodyMap  = isMale ? BODY_TYPE_MAP.male : BODY_TYPE_MAP.female
  const body     = ageGroup.bodyDesc || bodyMap[body_type] || bodyMap.slim || 'elegant model figure'
  const hairMap  = isMale ? HAIRSTYLE_MALE_MAP : HAIRSTYLE_FEMALE_MAP
  const hair     = hairMap[hairstyle] || HAIRSTYLE_MAP[hairstyle] || 'beautiful natural hair'
  const bgDesc   = BACKGROUND_MAP[background] || BACKGROUND_MAP.studio_minimal
  const poseDesc = POSE_MAP[pose] || POSE_MAP.standing_power
  const lightDesc = LIGHTING_MAP[lighting] || LIGHTING_MAP.soft_studio
  const camDesc  = CAMERA_MAP[camera] || CAMERA_MAP['85mm_portrait']

  const grooming = (ageGroup.isChild || ageGroup.isTeen)
    ? 'natural clean appearance, no makeup'
    : isMale
      ? (MAKEUP_MAP[makeup_level === 'natural' ? 'groomed' : makeup_level] || MAKEUP_MAP.groomed) +
        (FACIAL_HAIR_MAP[facial_hair] ? `, ${FACIAL_HAIR_MAP[facial_hair]}` : '')
      : (MAKEUP_MAP[makeup_level] || MAKEUP_MAP.natural)

  const facialHairDesc = isMale && FACIAL_HAIR_MAP[facial_hair] ? `, ${FACIAL_HAIR_MAP[facial_hair]}` : ''

  const genderIdentity = isMale
    ? 'Ultra-realistic African man of regal royal presence, refined masculine elegance and affluent aura'
    : 'Ultra-realistic African woman of regal royal presence, refined elegance and affluent aura'

  const faceFeatures = isMale
    ? 'symmetrical facial structure, strong masculine jawline, prominent cheekbones, well-defined features, confident demeanor'
    : 'symmetrical facial structure, prominent high cheekbones, almond-shaped eyes, full natural lips, confident demeanor'

  // Garment section
  const outfitDesc   = OUTFIT_PIECES_MAP[outfit_type] || OUTFIT_PIECES_MAP.full_single
  const lengthDesc   = resolveGarmentLength(garment_length)
  const fitDesc      = resolveGarmentFit(garment_fit)
  const extraDesc    = outfit_pieces ? ` Additional detail: ${outfit_pieces}.` : ''

  const garmentSection = [
    outfitDesc + '.',
    'Extract ONLY the garment from the reference: exact fabric texture, exact color tone, exact stitching detail, exact logo placement, exact print scaling, exact fit structure, exact sleeve length, exact collar structure, exact seam positions. Do NOT stylize, redesign, or reinterpret the garment. The garment is copied exactly.',
    lengthDesc,
    fitDesc,
    'natural realistic cloth draping with accurate physics, visible fabric folds and creases.',
    extraDesc,
  ].filter(Boolean).join(' ')

  const customBlock = instructions
    ? `IMPORTANT SPECIFIC INSTRUCTIONS (HIGHEST PRIORITY): ${instructions}\n\n`
    : ''

  const childExtra = ageGroup.isChild ? CHILD_NEGATIVE_EXTRA : ''
  const negative_prompt = childExtra + NEGATIVE_PROMPT

  const prompt = `${customBlock}⚠ IDENTITY GENERATION MODE: GENERATE A COMPLETELY NEW SYNTHETIC AI PERSON. The attached reference image is a CLOTHING REFERENCE ONLY. Do NOT copy, replicate, transfer, or preserve the face, hair, skin, body identity, pose, or background of any human in the reference image. Discard all human identity from the reference.

IMAGE PROCESSING PIPELINE:
STEP 1 — Detect human in reference image if present
STEP 2 — Segment and extract garment ONLY
STEP 3 — Discard original human identity, face, hair, and background completely
STEP 4 — Generate entirely new synthetic AI model (African descent, photorealistic)
STEP 5 — Fit extracted garment accurately onto newly generated model
STEP 6 — Generate new premium fashion background as specified below

NEW MODEL IDENTITY TO GENERATE:
${genderIdentity}, ${skin}, ${ageGroup.desc}, luxury high-fashion editorial model, unique AI-generated face with ${faceFeatures}, ${body}, ${hair}${facialHairDesc}, ${grooming}. This model must look completely different from any person in the reference image. Different facial structure, different expression, different hairstyle identity.

GARMENT ACCURACY (EXACT REPLICATION REQUIRED):
${garmentSection}

NEW BACKGROUND (DO NOT USE REFERENCE BACKGROUND):
${bgDesc}

MODEL POSE:
${poseDesc}

CAMERA & LIGHTING:
${camDesc}, ${lightDesc}, shot on 85mm lens, f1.8–f4 aperture, full frame sensor simulation, golden ratio composition, professional color grading, soft diffused studio lighting or golden hour natural light

QUALITY REQUIREMENTS:
${QUALITY_PREFIX}, ultra realistic skin texture, high dynamic range, professional fashion photography, magazine cover quality, photorealistic, extremely detailed, premium African fashion campaign, hyper detailed fabric texture, natural melanin skin rendering, global fashion brand quality, 8K ultra high resolution, RAW unprocessed photo quality, hyper-realistic, masterpiece quality, Vogue Italia editorial standard, award-winning fashion photography, Vogue-level quality, editorial quality, no two generations should look like the same person`

  return { prompt, negative_prompt }
}

// ── Config validation ─────────────────────────────────────────────────────────
export function validateConfig(config) {
  const issues = []
  if (config.background && !BACKGROUND_MAP[config.background]) {
    issues.push(`Background key '${config.background}' not found. Available: ${Object.keys(BACKGROUND_MAP).join(', ')}`)
  }
  if (config.pose && !POSE_MAP[config.pose]) {
    issues.push(`Pose key '${config.pose}' not found. Available: ${Object.keys(POSE_MAP).join(', ')}`)
  }
  if (issues.length > 0) {
    console.error('[validateConfig] CONFIG VALIDATION ERRORS:', issues)
  } else {
    console.log('[validateConfig] ✅ Config validation passed')
  }
  return issues
}

// ── Named re-exports for backward compatibility ────────────────────────────────
export {
  SKIN_TONE_MAP    as SKIN_TONE_BLOCKS,
  BODY_TYPE_MAP    as BODY_TYPE_BLOCKS,
  HAIRSTYLE_MAP    as HAIRSTYLE_BLOCKS,
  MAKEUP_MAP       as MAKEUP_BLOCKS,
  FACIAL_HAIR_MAP  as FACIAL_HAIR_BLOCKS,
  POSE_MAP         as POSE_BLOCKS,
  BACKGROUND_MAP   as BACKGROUND_BLOCKS,
  AGE_GROUP_MAP,
}
