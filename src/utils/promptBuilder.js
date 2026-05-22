const SKIN_TONE_MAP = {
  deep_melanin: 'deep melanin dark skin, rich ebony complexion, beautiful dark skin',
  rich_cocoa:   'rich cocoa brown skin, warm mahogany undertones, gorgeous brown skin',
  golden_bronze:'golden bronze skin, warm caramel undertones, radiant bronze complexion',
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
}

const MAKEUP_MAP = {
  natural:   'natural glowing minimal makeup',
  executive: 'polished executive professional makeup',
  editorial: 'bold high fashion editorial makeup',
  groomed:   'well groomed natural look',
  bold_groom:'bold groomed distinguished look',
}

const FACIAL_HAIR_MAP = {
  clean_shaven:  'clean shaven smooth face',
  short_beard:   'neatly trimmed short beard',
  full_beard:    'full well-groomed beard',
  goatee:        'stylish goatee',
  mustache:      'sharp mustache',
}

const POSE_MAP = {
  standing_power: 'standing confidently, hands on hips, power pose',
  royal_sitting:  'seated in a regal composed elegant pose',
  runway_walk:    'walking the runway mid-stride, confident',
  luxury_lounge:  'luxuriously lounging in a relaxed elegant pose',
  over_shoulder:  'looking over shoulder, three-quarter turn',
}

const BACKGROUND_MAP = {
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
  'different clothes, changed garment, modified clothing, ' +
  'wrong fabric, wrong pattern, wrong color scheme, ' +
  'different design, altered dress, new outfit, ' +
  'cartoon, anime, illustration, painting, 3D render, ' +
  'blurry, low quality, distorted, watermark, text, logo, ' +
  'extra limbs, wrong anatomy, deformed face, nudity'

export function buildPrompt(config, customInstructions) {
  const {
    gender           = 'female',
    age_range        = '30-35',
    skin_tone        = 'rich_cocoa',
    body_type        = 'slim',
    hairstyle        = 'afro',
    makeup_level     = 'natural',
    facial_hair      = 'clean_shaven',
    pose             = 'standing_power',
    background       = 'studio_minimal',
    garment_type     = '',
    garment_length   = '',
    garment_fit      = '',
    outfit_pieces    = '',
    custom_instructions = '',
  } = config

  const instructions = customInstructions || custom_instructions || ''

  const genderWord = gender === 'male' ? 'man' : 'woman'
  const skinTone   = SKIN_TONE_MAP[skin_tone]   || SKIN_TONE_MAP.rich_cocoa
  const bodyType   = (BODY_TYPE_MAP[gender] || BODY_TYPE_MAP.female)[body_type] || 'elegant figure'
  const hair       = HAIRSTYLE_MAP[hairstyle]   || 'natural hair'
  const grooming   = gender === 'female'
    ? (MAKEUP_MAP[makeup_level]    || MAKEUP_MAP.natural)
    : (FACIAL_HAIR_MAP[facial_hair]|| FACIAL_HAIR_MAP.clean_shaven)
  const poseDesc   = POSE_MAP[pose]             || POSE_MAP.standing_power
  const bgDesc     = BACKGROUND_MAP[background] || BACKGROUND_MAP.studio_minimal

  const garmentDetails = [garment_type, garment_length, garment_fit, outfit_pieces]
    .filter(Boolean)
    .join(', ')

  // ── Garment preservation block (top priority for img2img) ──
  const garmentBlock = `CRITICAL GARMENT REQUIREMENTS — MUST FOLLOW EXACTLY:
- Preserve THE EXACT SAME garment from the reference image
- Preserve every detail: exact colors, patterns, prints, fabric texture
- Preserve exact garment style, cut, silhouette and design
- Preserve ALL decorative elements: embroidery, buttons, zips, lace, prints
- DO NOT change, modify or replace ANY part of the garment
- The clothing must be IDENTICAL to the reference image
- Only the model, pose, background and lighting should change`

  // ── Custom instructions block ──
  const customBlock = instructions
    ? `\nADDITIONAL INSTRUCTIONS (HIGH PRIORITY): ${instructions}\n`
    : ''

  // ── Garment description (supplements reference image) ──
  const garmentDescBlock = garmentDetails
    ? `GARMENT DESCRIPTION: ${garmentDetails}.`
    : ''

  // ── Model identity ──
  const modelBlock =
    `NEW MODEL: A ${age_range} year old African ${genderWord}, ` +
    `${skinTone}, ${bodyType}, ${hair}, ${grooming}.`

  // ── Scene ──
  const sceneBlock =
    `POSE: The model is ${poseDesc}. ` +
    `BACKGROUND: ${bgDesc}.`

  const prompt = [
    garmentBlock,
    customBlock,
    garmentDescBlock,
    modelBlock,
    sceneBlock,
    `PHOTOGRAPHY: ${QUALITY}`,
    'REMEMBER: The garment must be IDENTICAL to the reference. Same colors, same patterns, same design. Only the model and setting change.',
  ].filter(Boolean).join('\n')

  return { prompt, negative_prompt: NEGATIVE_PROMPT }
}

// Named exports kept for any component that imports the maps directly
export {
  SKIN_TONE_MAP   as SKIN_TONE_BLOCKS,
  BODY_TYPE_MAP   as BODY_TYPE_BLOCKS,
  HAIRSTYLE_MAP   as HAIRSTYLE_BLOCKS,
  MAKEUP_MAP      as MAKEUP_BLOCKS,
  FACIAL_HAIR_MAP as FACIAL_HAIR_BLOCKS,
  POSE_MAP        as POSE_BLOCKS,
  BACKGROUND_MAP  as BACKGROUND_BLOCKS,
}
