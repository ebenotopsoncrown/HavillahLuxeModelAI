// ── Age group map ─────────────────────────────────────────────────────────────
const AGE_GROUP_MAP = {
  child_4_8:  { desc: '6 year old child',      isChild: true,  isTeen: false, bodyDesc: 'small child frame, petite proportions, young child physique' },
  child_9_12: { desc: '11 year old child',     isChild: true,  isTeen: false, bodyDesc: 'preteen frame, growing child proportions, young physique' },
  teen_13_15: { desc: '14 year old teenager',  isChild: false, isTeen: true,  bodyDesc: null },
  teen_16_17: { desc: '17 year old teenager',  isChild: false, isTeen: true,  bodyDesc: null },
  '18-25':    { desc: '22 year old',           isChild: false, isTeen: false, bodyDesc: null },
  '26-35':    { desc: '30 year old',           isChild: false, isTeen: false, bodyDesc: null },
  '36-45':    { desc: '40 year old',           isChild: false, isTeen: false, bodyDesc: null },
  '46-55':    { desc: '50 year old',           isChild: false, isTeen: false, bodyDesc: null },
  // Legacy values
  '30-35':    { desc: '32 year old',           isChild: false, isTeen: false, bodyDesc: null },
  '36-42':    { desc: '39 year old',           isChild: false, isTeen: false, bodyDesc: null },
  '43-50':    { desc: '46 year old',           isChild: false, isTeen: false, bodyDesc: null },
}

// ── Background descriptions (rich, detailed) ──────────────────────────────────
export const BACKGROUND_MAP = {
  luxury_palace: 'inside a breathtaking grand royal palace, towering marble pillars with gold leaf detailing, ornate gilded ceiling with crystal chandeliers, rich Persian carpets in deep red and gold, palace archways with intricate carvings, warm golden palace lighting, royal throne room atmosphere, Versailles level opulence and grandeur',
  modern_mansion: 'inside an ultra modern luxury mansion, soaring floor-to-ceiling glass walls, panoramic city views through windows, minimalist white Italian marble floors, designer contemporary furniture, curated contemporary art on walls, soft diffused natural daylight, Beverly Hills mansion interior, architectural magazine worthy space',
  yacht_deck: 'on the sun deck of a magnificent superyacht, sparkling turquoise Mediterranean sea stretching to the horizon, gleaming white yacht surfaces, clear blue sky with soft white clouds, warm golden afternoon sun shimmering on the water, distant coastline visible on horizon, luxury yachting lifestyle, Monte Carlo marina setting',
  studio_minimal: 'professional high-end fashion photography studio, seamless pure white curved backdrop, flawless even studio lighting from all sides, clean crisp white background, Vogue magazine studio setup, perfect controlled lighting environment, fashion week backstage studio quality',
  desert_royalty: 'majestic African desert landscape at golden hour, dramatic towering sand dunes in warm gold tones, vast open desert stretching to horizon, spectacular orange and purple sunset sky, warm magical golden hour light, ancient timeless Sahara atmosphere, National Geographic quality desert scenery',
  city_rooftop: 'glamorous rooftop terrace in central London, spectacular panoramic city skyline at dusk, iconic London landmarks visible in background, warm city lights beginning to glow, sleek modern rooftop furniture, urban luxury lifestyle setting, Instagram worthy rooftop atmosphere',
  tropical_paradise: 'stunning luxury beach resort in the Maldives, crystal clear turquoise lagoon water, pristine white sand beach, elegant overwater bungalows visible in background, swaying palm trees with coconuts, perfect golden hour sunset sky, five star tropical paradise atmosphere',
  fashion_week: 'Paris Fashion Week venue backstage area, dramatic runway lighting setup, high fashion industry atmosphere, elegant couture fashion show setting, designer brand campaign quality, haute couture Parisian fashion environment',
  african_village: 'beautiful traditional African village with vibrant colorful surroundings, lush baobab trees in golden afternoon light, rich authentic cultural setting, warm earthy tones, serene natural beauty, handcrafted architecture with detailed patterns',
  luxury_hotel: 'grand five-star luxury hotel lobby with towering marble columns, opulent crystal chandeliers, gold and ivory decor, lavish high-end interior design, palatial elegance, immaculate white gloved service environment',
  garden_paradise: 'stunning English country garden in full bloom, lush roses and greenery in every direction, romantic soft natural light filtering through leaves, fairytale garden setting, petals on the breeze, impressionist painting quality natural beauty',
}

// ── Skin tone descriptions ────────────────────────────────────────────────────
const SKIN_TONE_MAP = {
  deep_melanin:  'stunning deep melanin dark skin, rich ebony complexion with beautiful undertones, flawless smooth dark skin that glows, melanin rich beautiful dark complexion',
  rich_cocoa:    'gorgeous rich cocoa brown skin, warm mahogany undertones, beautiful melanated brown complexion, smooth luminous brown skin',
  golden_bronze: 'radiant golden bronze skin, warm honey caramel undertones, luminous sun-kissed bronze complexion',
}

// ── Body type descriptions ────────────────────────────────────────────────────
const BODY_TYPE_MAP = {
  female: {
    slim:       'tall slim elegant supermodel figure, graceful long legs, model proportions',
    curvy:      'gorgeous curvy hourglass figure, full hips and bust, beautiful feminine curves',
    athletic:   'toned athletic feminine figure, defined waist, strong graceful build',
    royal_plus: 'beautiful full-figured plus-size model, commanding curvaceous presence',
  },
  male: {
    slim:       'tall slim athletic male model, lean and elegant',
    curvy:      'broad shouldered muscular male model, V-shaped physique',
    athletic:   'athletic powerful male model, defined muscular build',
    royal_plus: 'large commanding powerful male figure, strong presence',
  },
}

// ── Hairstyle descriptions ────────────────────────────────────────────────────
const HAIRSTYLE_MAP = {
  afro:           'massive stunning natural afro, perfectly shaped, voluminous crown glory',
  braided_crown:  'intricate gorgeous braided crown updo, artistic braiding, regal headpiece',
  sleek_bun:      'elegant sleek polished chignon bun, sophisticated refined styling',
  luxury_waves:   'glossy flowing luxury waves, bouncy full and shiny, supermodel hair',
  locs:           'beautiful styled locs, natural and regal, artfully arranged',
  cornrows:       'neat precise cornrows, geometric artistic pattern, sleek styling',
  low_cut:        'clean sharp low cut fade, crisp edges, fresh professional look',
  waves_360:      'perfect 360 waves, immaculately groomed, deep wave pattern',
  caesar_cut:     'sharp neat caesar cut, clean defined edges, classic professional',
  dreadlocks_med: 'medium styled dreadlocks, natural beauty, artfully kept',
  bald_fade:      'smooth clean bald head, perfectly polished, strong and beautiful',
  tapered_fade:   'sharp tapered fade, professionally edged, clean modern look',
  ponytail:       'neat sleek ponytail, polished and elegant',
  twists:         'beautiful styled twists, natural texture, artfully arranged',
}

// ── Makeup / grooming descriptions ───────────────────────────────────────────
const MAKEUP_MAP = {
  natural:    'natural dewy glowing skin, minimal makeup with fresh-faced beauty, glossy nude lips, defined natural brows, luminous highlight on cheekbones, long fluttery natural lashes, fresh youthful glow',
  executive:  'polished flawless professional makeup, defined bold brows, smooth foundation, nude pink lips, subtle contour, professional power beauty look, elegant and put-together',
  editorial:  'stunning bold editorial makeup, dramatic eye makeup, bold lip color, fierce contour and highlight, high fashion avant-garde beauty, magazine cover makeup artistry',
  groomed:    'well groomed masculine natural look, clean fresh skin, defined features, natural and handsome appearance',
  bold_groom: 'bold groomed distinguished masculine look, sharp defined features, strong handsome appearance',
}

const FACIAL_HAIR_MAP = {
  clean_shaven: 'clean shaven smooth face',
  short_beard:  'neatly trimmed short beard',
  full_beard:   'full well-groomed beard',
  goatee:       'stylish goatee',
  mustache:     'sharp mustache',
}

// ── Pose descriptions ─────────────────────────────────────────────────────────
export const POSE_MAP = {
  standing_power: 'standing in a powerful confident pose, hands on hips, shoulders back and proud, chin slightly raised, commanding stance, full body visible from head to toe, Miss World contestant power pose',
  royal_sitting:  'seated elegantly on a luxury chair or surface, regal upright dignified posture, legs positioned gracefully, hands placed elegantly, queen-like composed regal presence',
  runway_walk:    'walking confidently like a runway supermodel, mid-stride with purpose and grace, hips swaying naturally, arms moving gently, looking directly at camera with fierce confidence, Paris Fashion Week runway energy',
  luxury_lounge:  'lounging elegantly in a relaxed sophisticated pose, leaning gracefully, effortless luxury lifestyle energy, casual elegance, relaxed confidence',
  over_shoulder:  'looking back playfully over shoulder, three-quarter turn showing the garment, coy confident expression, playful yet sophisticated pose, showing both front and side of outfit',
}

// ── Shared quality suffix ─────────────────────────────────────────────────────
const PHOTOGRAPHY =
  'ultra-photorealistic professional fashion photography, ' +
  'shot on Hasselblad H6D-100c medium format camera, 85mm portrait lens, f/2.8 bokeh, ' +
  'three-point professional lighting setup, perfect rim light separating subject from background, ' +
  '8K resolution ultra-sharp crisp detail, flawless skin texture, perfect color accuracy, ' +
  'Vogue Italia editorial quality, award-winning fashion photography, ' +
  '100% photorealistic human being'

// ── Negative prompt (shared) ──────────────────────────────────────────────────
export const NEGATIVE_PROMPT =
  'buttons, button front, button down, zipper, zip, zip front, pocket, pockets, ' +
  'collar, shirt collar, lapel, belt, waistband belt, bow, ribbon, ruffles, frills, ' +
  'lace trim, lace overlay, extra embroidery, beading, sequins, added pattern, extra print, ' +
  'extra decoration, modified garment, different garment, wrong clothes, ' +
  'cartoon, anime, illustration, painting, 3D render, ' +
  'blurry, low quality, distorted, watermark, text, logo, ' +
  'extra limbs, wrong anatomy, deformed face, nudity, ' +
  'background from garment photo, original photo background, same background as reference image, ' +
  'dark background, cluttered background, messy room'

const CHILD_NEGATIVE =
  'adult content, revealing clothing, inappropriate, sexual, explicit, ' +
  NEGATIVE_PROMPT

// ── Internal helpers ──────────────────────────────────────────────────────────
function resolveAgeGroup(age_range) {
  return AGE_GROUP_MAP[age_range] || AGE_GROUP_MAP['26-35']
}

function resolveGenderWord(gender, ageGroup) {
  if (ageGroup.isChild) return gender === 'male' ? 'boy' : 'girl'
  if (ageGroup.isTeen)  return gender === 'male' ? 'teenage boy' : 'teenage girl'
  return gender === 'male' ? 'man' : 'woman'
}

// ── buildBaseModelPrompt ──────────────────────────────────────────────────────
// Step 1 of the VTO pipeline: generates a beautiful African model person image
// in the user-selected background wearing a plain white neutral outfit.
// Deliberately avoids real garment description — FASHN overlays the uploaded garment.
export function buildBaseModelPrompt(config) {
  const {
    gender       = 'female',
    age_range    = '26-35',
    skin_tone    = 'rich_cocoa',
    body_type    = 'slim',
    hairstyle    = 'afro',
    makeup_level = 'natural',
    facial_hair  = 'clean_shaven',
    pose         = 'standing_power',
    background   = 'studio_minimal',
  } = config

  const ageGroup   = resolveAgeGroup(age_range)
  const genderWord = resolveGenderWord(gender, ageGroup)
  const skin       = SKIN_TONE_MAP[skin_tone] || SKIN_TONE_MAP.rich_cocoa
  const body       = ageGroup.bodyDesc || (BODY_TYPE_MAP[gender] || BODY_TYPE_MAP.female)[body_type] || 'elegant model figure'
  const hair       = HAIRSTYLE_MAP[hairstyle] || 'beautiful natural hair'
  const poseDesc   = POSE_MAP[pose] || 'standing confidently'
  const bgDesc     = BACKGROUND_MAP[background] || BACKGROUND_MAP.studio_minimal

  const grooming = (ageGroup.isChild || ageGroup.isTeen)
    ? 'natural clean appearance, no makeup'
    : gender === 'female'
      ? (MAKEUP_MAP[makeup_level] || MAKEUP_MAP.natural)
      : (FACIAL_HAIR_MAP[facial_hair] || FACIAL_HAIR_MAP.clean_shaven)

  const expression = [
    'warm bright genuine smile showing perfect teeth',
    'sparkling happy confident eyes',
    'radiant joyful cheerful expression',
    'approachable friendly beautiful look',
    'confident charismatic magnetic presence',
    'high fashion supermodel energy',
  ].join(', ')

  const prompt = [
    PHOTOGRAPHY + '.',
    `SUBJECT: A breathtakingly beautiful ${ageGroup.desc} African ${genderWord} fashion model.`,
    `SKIN: ${skin}.`,
    `FACE & EXPRESSION: ${expression}.`,
    `FIGURE: ${body}.`,
    `HAIR: ${hair}.`,
    `GROOMING: ${grooming}.`,
    `POSE: ${poseDesc}.`,
    'OUTFIT: The model is wearing a perfectly fitted plain white seamless bodysuit or white dress, simple and clean with absolutely no details — this is a placeholder outfit only.',
    `BACKGROUND & SETTING: ${bgDesc}.`,
    'CRITICAL: Create an entirely new scene. Do NOT copy any background from reference photos.',
    'MOOD: Joyful, radiant, luxurious, confident.',
  ].join(' ')

  return { prompt, negative_prompt: ageGroup.isChild ? CHILD_NEGATIVE : NEGATIVE_PROMPT }
}

// ── buildPrompt ───────────────────────────────────────────────────────────────
// Comprehensive garment-preservation prompt for img2img fallback path.
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
    custom_instructions = '',
  } = config

  const instructions = customInstructions || custom_instructions || ''

  const ageGroup   = resolveAgeGroup(age_range)
  const genderWord = resolveGenderWord(gender, ageGroup)
  const skin       = SKIN_TONE_MAP[skin_tone] || SKIN_TONE_MAP.rich_cocoa
  const body       = ageGroup.bodyDesc || (BODY_TYPE_MAP[gender] || BODY_TYPE_MAP.female)[body_type] || 'elegant figure'
  const hair       = HAIRSTYLE_MAP[hairstyle] || 'natural hair'
  const grooming   = (ageGroup.isChild || ageGroup.isTeen)
    ? 'natural clean appearance, no makeup'
    : gender === 'female'
      ? (MAKEUP_MAP[makeup_level] || MAKEUP_MAP.natural)
      : (FACIAL_HAIR_MAP[facial_hair] || FACIAL_HAIR_MAP.clean_shaven)
  const poseDesc   = POSE_MAP[pose] || 'standing confidently'
  const bgDesc     = BACKGROUND_MAP[background] || BACKGROUND_MAP.studio_minimal

  const absoluteRules = `[ABSOLUTE MANDATORY RULES]:
RULE 1: Do NOT add ANY detail to the garment not visible in the reference — no buttons, no zips, no pockets, no belts, no embroidery, no collar, no extra decoration of any kind unless present on the original.
RULE 2: Do NOT remove any feature visible on the original garment.
RULE 3: The garment must be a photographic reproduction of the reference — same color, same pattern, same neckline, same sleeves, same length, same front design.
RULE 4: The background must be the selected setting only — do NOT copy background from the reference garment photo.`

  const customBlock = instructions
    ? `\n[ADDITIONAL INSTRUCTIONS]:\n${instructions}\n`
    : ''

  const negative_prompt = [
    'buttons added', 'zip added', 'pockets added', 'belt added', 'collar added',
    'different neckline', 'different sleeves', 'extra embroidery', 'added embellishments',
    'modified pattern', 'different pattern', 'extra print', 'different color', 'color change',
    'modified garment', 'different garment', 'hallucinated garment features',
    'background from garment photo', 'background from original photo',
    'cartoon', 'anime', 'illustration', 'painting',
    'blurry', 'low quality', 'distorted', 'watermark', 'text', 'logo',
    'extra limbs', 'wrong anatomy', 'deformed face', 'bad hands',
    ...(ageGroup.isChild ? ['adult content', 'revealing clothing', 'inappropriate'] : []),
  ].join(', ')

  const prompt = `${absoluteRules}
${customBlock}
Create a professional fashion photograph showing:

MODEL: A beautiful ${ageGroup.desc} African ${genderWord} with ${skin}, ${body}, ${hair}, ${grooming}, bright warm genuine smile, sparkling confident eyes, radiant glowing skin, gorgeous attractive features, high fashion supermodel energy.

POSE: ${poseDesc}.
BACKGROUND: ${bgDesc}.

GARMENT: Reproduce THE EXACT SAME garment from the reference image — every color, every pattern, every design element preserved with 100% accuracy. Zero additions, zero removals, zero modifications.

PHOTOGRAPHY: ${PHOTOGRAPHY}.`

  return { prompt, negative_prompt }
}

// ── Named re-exports for backward compatibility ────────────────────────────────
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
