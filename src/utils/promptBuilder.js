const AGE_BLOCKS = {
  '30-35': 'a 30-35 year old',
  '36-42': 'a 36-42 year old',
  '43-50': 'a 43-50 year old',
}

const SKIN_TONE_BLOCKS = {
  deep_melanin: 'deep melanin dark skin, rich ebony complexion',
  rich_cocoa: 'rich cocoa brown skin, warm mahogany undertones',
  golden_bronze: 'golden bronze skin, warm caramel undertones',
}

const BODY_TYPE_BLOCKS = {
  female: {
    slim: 'slim elegant figure, model physique',
    curvy: 'beautiful curvy figure, full hourglass silhouette',
    athletic: 'toned athletic build, strong and graceful',
    royal_plus: 'full-figured royal body, commanding plus-size presence',
  },
  male: {
    slim: 'slim lean build, model physique',
    curvy: 'broad shouldered, well-built frame',
    athletic: 'muscular athletic build, powerful physique',
    royal_plus: 'large commanding frame, powerful plus-size presence',
  },
}

const HAIRSTYLE_BLOCKS = {
  afro: 'voluminous natural afro, perfectly shaped',
  braided_crown: 'elegant braided crown updo, intricate braiding',
  sleek_bun: 'sleek polished bun, sophisticated',
  luxury_waves: 'flowing luxury waves, glossy and full',
  locs: 'beautiful styled locs, natural and elegant',
  cornrows: 'neat geometric cornrows, artistic pattern',
  low_cut: 'clean low cut, sharp fade',
  waves_360: '360 waves, perfectly groomed',
  caesar_cut: 'caesar cut, clean and sharp',
  dreadlocks_med: 'medium length dreadlocks, natural and styled',
  bald_fade: 'clean bald head, smooth and polished',
  tapered_fade: 'sharp tapered fade, professional',
}

const MAKEUP_BLOCKS = {
  natural: 'natural minimal makeup, glowing skin',
  executive: 'executive polished makeup, professional',
  editorial: 'bold editorial makeup, high fashion',
  bold_groom: 'bold groomed look',
}

const FACIAL_HAIR_BLOCKS = {
  clean_shaven: 'clean shaven, smooth face',
  short_beard: 'neatly trimmed short beard',
  full_beard: 'full well-groomed beard',
  goatee: 'stylish goatee',
  mustache: 'sharp mustache',
}

const POSE_BLOCKS = {
  standing_power: 'standing in a powerful confident pose, hands on hips',
  royal_sitting: 'seated in a regal composed pose, upright elegant',
  runway_walk: 'walking the runway, mid-stride confident',
  luxury_lounge: 'casually lounging in a luxurious relaxed pose',
  over_shoulder: 'looking over shoulder, three-quarter turn',
}

const BACKGROUND_BLOCKS = {
  luxury_palace: 'inside a grand luxury palace, ornate gold architecture',
  modern_mansion: 'modern luxury mansion interior, minimalist expensive',
  yacht_deck: 'on the deck of a luxury superyacht, ocean backdrop',
  studio_minimal: 'clean minimal studio background, professional',
  desert_royalty: 'African desert landscape, golden sand dunes, sunset',
}

const QUALITY_ENHANCEMENT =
  'ultra-photorealistic, 8K resolution, professional fashion photography, shot on Hasselblad medium format, perfect lighting, magazine editorial quality, razor sharp focus, professional color grading, Vogue magazine style'

export const NEGATIVE_PROMPT =
  'cartoon, anime, illustration, painting, drawing, CGI, 3D render, blurry, low quality, distorted face, extra limbs, wrong anatomy, watermark, text, logo, duplicate, ugly, deformed'

export function buildPrompt(config) {
  const {
    gender = 'female',
    age_range = '30-35',
    skin_tone = 'rich_cocoa',
    body_type = 'slim',
    hairstyle = 'afro',
    makeup_level = 'natural',
    facial_hair = 'clean_shaven',
    pose = 'standing_power',
    background = 'studio_minimal',
    garment_type = '',
    garment_length = '',
    garment_fit = '',
    outfit_pieces = '',
    custom_instructions = '',
  } = config

  const age = AGE_BLOCKS[age_range] || AGE_BLOCKS['30-35']
  const skinTone = SKIN_TONE_BLOCKS[skin_tone] || SKIN_TONE_BLOCKS.rich_cocoa
  const bodyType = (BODY_TYPE_BLOCKS[gender] || BODY_TYPE_BLOCKS.female)[body_type] || BODY_TYPE_BLOCKS.female.slim
  const hair = HAIRSTYLE_BLOCKS[hairstyle] || HAIRSTYLE_BLOCKS.afro
  const grooming = gender === 'female'
    ? (MAKEUP_BLOCKS[makeup_level] || MAKEUP_BLOCKS.natural)
    : (FACIAL_HAIR_BLOCKS[facial_hair] || FACIAL_HAIR_BLOCKS.clean_shaven)
  const poseDesc = POSE_BLOCKS[pose] || POSE_BLOCKS.standing_power
  const bgDesc = BACKGROUND_BLOCKS[background] || BACKGROUND_BLOCKS.studio_minimal

  const garmentDesc = [garment_type, garment_length, garment_fit, outfit_pieces]
    .filter(Boolean)
    .join(', ')

  let prompt = ''

  if (custom_instructions) {
    prompt += `HIGHEST PRIORITY OVERRIDE: ${custom_instructions}\n\n`
  }

  prompt += `IDENTITY GENERATION PIPELINE:
Step 1: Detect any human figure in reference image
Step 2: Extract and segment the garment/clothing ONLY
Step 3: Completely discard all human identity - face, hair, skin, body
Step 4: Generate an entirely new synthetic African model: ${age} ${skinTone} African ${gender} model, ${bodyType}, ${hair}, ${grooming}
Step 5: Dress the new model in the extracted garment from reference image

The model is ${poseDesc}. Background: ${bgDesc}.`

  if (garmentDesc) {
    prompt += ` The garment is: ${garmentDesc}.`
  }

  prompt += ` ${QUALITY_ENHANCEMENT}`

  return { prompt, negative_prompt: NEGATIVE_PROMPT }
}

export { AGE_BLOCKS, SKIN_TONE_BLOCKS, BODY_TYPE_BLOCKS, HAIRSTYLE_BLOCKS, MAKEUP_BLOCKS, FACIAL_HAIR_BLOCKS, POSE_BLOCKS, BACKGROUND_BLOCKS }
