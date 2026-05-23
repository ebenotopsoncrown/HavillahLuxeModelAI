// ── Age group map ─────────────────────────────────────────────────────────────
const AGE_GROUP_MAP = {
  // Children
  child_4_8:  { desc: '6 year old child',      isChild: true,  isTeen: false, bodyDesc: 'small child frame, petite proportions, young child physique' },
  child_9_12: { desc: '11 year old child',     isChild: true,  isTeen: false, bodyDesc: 'preteen frame, growing child proportions, young physique' },
  // Teenagers
  teen_13_15: { desc: '14 year old teenager',  isChild: false, isTeen: true,  bodyDesc: null },
  teen_16_17: { desc: '17 year old teenager',  isChild: false, isTeen: true,  bodyDesc: null },
  // Adults
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
  natural:    'natural glowing minimal makeup',
  executive:  'polished executive professional makeup',
  editorial:  'bold high fashion editorial makeup',
  groomed:    'well groomed natural look',
  bold_groom: 'bold groomed distinguished look',
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

// ── buildBaseModelPrompt ──────────────────────────────────────────────────────
// Step 1 of the VTO pipeline: generates a base person image.
// Deliberately avoids garment description so FASHN can overlay the real garment.
export function buildBaseModelPrompt(config) {
  const {
    gender       = 'female',
    age_range    = '26-35',
    skin_tone    = 'rich_cocoa',
    body_type    = 'slim',
    hairstyle    = 'afro',
    makeup_level = 'natural',
    facial_hair  = 'clean_shaven',
  } = config

  const ageGroup   = resolveAgeGroup(age_range)
  const genderWord = resolveGenderWord(gender, ageGroup)
  const skin       = SKIN_TONE_MAP[skin_tone] || SKIN_TONE_MAP.rich_cocoa
  const body       = ageGroup.bodyDesc || (BODY_TYPE_MAP[gender] || BODY_TYPE_MAP.female)[body_type] || 'model figure'

  const prompt =
    `Professional fashion model, ${ageGroup.desc} African ${genderWord}, ` +
    `${skin}, ${body}, wearing plain white fitted clothing, ` +
    `neutral pose, white studio background, professional lighting, photorealistic`

  return { prompt, negative_prompt: ageGroup.isChild ? CHILD_NEGATIVE : NEGATIVE_PROMPT }
}

// ── buildPrompt ───────────────────────────────────────────────────────────────
// Comprehensive garment-preservation prompt for img2img fallback.
// Pass garment attribute description as customInstructions to prevent AI hallucination.
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

  // Inline maps tuned for prompt clarity
  const skinTones = {
    deep_melanin:  'deep melanin dark skin, rich ebony complexion',
    rich_cocoa:    'rich cocoa brown skin, warm mahogany undertones',
    golden_bronze: 'golden bronze skin, warm caramel undertones',
  }
  const bodyTypes = {
    female: {
      slim:       'slim elegant model physique',
      curvy:      'beautiful curvy hourglass figure',
      athletic:   'toned athletic build',
      royal_plus: 'full-figured commanding plus-size model',
    },
    male: {
      slim:       'slim lean model build',
      curvy:      'broad shouldered muscular frame',
      athletic:   'athletic powerful physique',
      royal_plus: 'large commanding powerful frame',
    },
  }
  const hairstyles = {
    afro:           'voluminous natural afro',
    braided_crown:  'elegant braided crown updo',
    sleek_bun:      'sleek polished bun',
    luxury_waves:   'flowing luxury waves',
    locs:           'beautiful styled locs',
    cornrows:       'neat cornrows',
    low_cut:        'clean low cut fade',
    waves_360:      '360 waves groomed',
    caesar_cut:     'sharp caesar cut',
    dreadlocks_med: 'medium dreadlocks',
    bald_fade:      'clean bald head',
    tapered_fade:   'sharp tapered fade',
  }
  const makeupStyles = {
    natural:    'natural glowing minimal makeup',
    executive:  'polished professional makeup',
    editorial:  'bold editorial makeup',
    groomed:    'well groomed natural look',
    bold_groom: 'bold distinguished groomed look',
  }
  const poses = {
    standing_power: 'standing in a powerful confident pose',
    royal_sitting:  'seated in a regal composed pose',
    runway_walk:    'walking confidently on runway',
    luxury_lounge:  'elegantly lounging in relaxed pose',
    over_shoulder:  'looking over shoulder three-quarter turn',
  }
  const backgrounds = {
    luxury_palace:  'inside a grand luxury palace with gold architecture',
    modern_mansion: 'modern luxury mansion interior',
    yacht_deck:     'on a luxury superyacht deck with ocean view',
    studio_minimal: 'clean minimal professional photography studio',
    desert_royalty: 'African desert landscape at golden sunset',
  }

  const skin     = skinTones[skin_tone]                                   || 'beautiful brown skin'
  const body     = ageGroup.bodyDesc || bodyTypes[gender]?.[body_type]    || 'elegant figure'
  const hair     = hairstyles[hairstyle]                                  || 'natural hair'
  const grooming = (ageGroup.isChild || ageGroup.isTeen)
    ? 'natural clean appearance, no makeup'
    : gender === 'female'
      ? (makeupStyles[makeup_level] || makeupStyles.natural)
      : (FACIAL_HAIR_MAP[facial_hair] || FACIAL_HAIR_MAP.clean_shaven)
  const poseDesc = poses[pose]                                            || 'standing confidently'
  const bgDesc   = backgrounds[background]                                || 'studio background'

  // ── ABSOLUTE GARMENT RULES ────────────────────────────────────────────────
  const absoluteRules = `[ABSOLUTE MANDATORY RULES - NEVER VIOLATE]:

RULE 1 - ZERO ADDITIONS:
Do NOT add ANY feature, detail, or element to the garment that is not clearly visible in the reference image. This includes:
- NO buttons unless buttons are on the original
- NO zips unless zip is on the original
- NO pockets unless pockets are on the original
- NO belts unless belt is on the original
- NO embroidery unless embroidery is on the original
- NO lace unless lace is on the original
- NO ruffles unless ruffles are on the original
- NO collar unless collar is on the original
- NO sleeves modification
- NO neckline modification
- NO length modification
- NO pattern addition
- NO print addition
- NO color addition or change
- NO texture change
- NO fabric change

RULE 2 - ZERO REMOVALS:
Do NOT remove ANY feature visible on the original garment. Every visible element must appear in the output.

RULE 3 - EXACT REPLICATION:
The garment in the output must be a photographic reproduction of the garment in the reference image. Ask yourself: "If I covered the model and only showed the garment, would it be identical to the reference?" If NO — regenerate until YES.

RULE 4 - SELF VERIFICATION:
Before finalizing the image, mentally compare:
- Original garment color vs Output garment color: MATCH?
- Original front design vs Output front design: MATCH?
- Original neckline vs Output neckline: MATCH?
- Original sleeve style vs Output sleeve style: MATCH?
- Original length vs Output length: MATCH?
- Original patterns/prints vs Output patterns: MATCH?
- Original embellishments vs Output embellishments: MATCH?
- Any extra elements in output not in original? NONE?
If ANY mismatch — reject.`

  // ── GARMENT ANALYSIS STEP ────────────────────────────────────────────────
  const garmentAnalysis = `STEP 1 - ANALYZE THE REFERENCE GARMENT:
Carefully examine every detail of the garment in the reference image:
- What TYPE of garment is it exactly?
- What COLOR(S) does it have exactly?
- What PATTERN or PRINT does it have? (plain/striped/print)
- What NECKLINE style? (round/v-neck/square/etc)
- What SLEEVE style? (sleeveless/short/long/etc)
- What LENGTH? (crop/knee/midi/maxi/floor)
- What FRONT DESIGN? (plain/button/zip/wrapped/etc)
- What EMBELLISHMENTS? (none/embroidery/beading/etc)
- What FABRIC texture? (smooth/textured/shiny/matte)

STEP 2 - LOCK THESE ATTRIBUTES:
Every attribute identified above is LOCKED. None can be changed, added to, or removed from.`

  // ── CUSTOM / GARMENT ATTRIBUTES ──────────────────────────────────────────
  const customBlock = instructions
    ? `\n[ADDITIONAL INSTRUCTIONS - HIGH PRIORITY]:\n${instructions}\n`
    : ''

  // ── PHOTOGRAPHY QUALITY ──────────────────────────────────────────────────
  const quality = [
    'ultra-photorealistic professional fashion photography',
    'shot on Phase One IQ4 150MP medium format camera',
    '8K resolution crisp sharp focus throughout',
    'perfect professional fashion lighting setup',
    'Vogue Italia magazine editorial quality',
    'award winning fashion photography',
    'flawless skin texture and detail',
    'perfect color accuracy and reproduction',
  ].join(', ')

  // ── COMPREHENSIVE NEGATIVE PROMPT ────────────────────────────────────────
  const negative_prompt = [
    'buttons added', 'buttons not in original', 'zip added', 'pockets added',
    'belt added', 'collar added', 'different neckline', 'modified neckline',
    'different sleeves', 'modified sleeves', 'extra embroidery', 'added embellishments',
    'extra decoration', 'modified pattern', 'different pattern', 'extra print',
    'different color', 'color change', 'additional design elements', 'modified garment',
    'different garment', 'wrong clothes', 'altered clothing', 'garment modifications',
    'extra details on clothing', 'hallucinated garment features',
    'cartoon', 'anime', 'illustration', 'painting',
    'blurry', 'low quality', 'distorted', 'watermark', 'text overlay', 'logo',
    'extra limbs', 'wrong anatomy', 'deformed face', 'bad hands',
    'missing limbs', 'floating objects', 'duplicate', 'artifact', 'noise', 'grain',
    ...(ageGroup.isChild ? ['adult content', 'revealing clothing', 'inappropriate', 'sexual', 'explicit'] : []),
  ].join(', ')

  // ── FINAL PROMPT ─────────────────────────────────────────────────────────
  const prompt = `${absoluteRules}

${garmentAnalysis}
${customBlock}
STEP 3 - GENERATE NEW MODEL IMAGE:
Create a professional fashion photograph showing:

MODEL: A ${ageGroup.desc} African ${genderWord} with ${skin}, ${body}, ${hair}, ${grooming}.

POSE: ${poseDesc}.
BACKGROUND: ${bgDesc}.

GARMENT: THE EXACT SAME garment from the reference image — every color, every pattern, every design element preserved with 100% accuracy. No additions, no removals, no modifications whatsoever.

PHOTOGRAPHY: ${quality}

FINAL CHECK: Before completing, verify the garment in this output is IDENTICAL to the reference image. Any discrepancy = reject and regenerate.`

  return { prompt, negative_prompt }
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
