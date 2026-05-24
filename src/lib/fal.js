import { supabase } from './supabase'

const FAL_KEY = import.meta.env.VITE_FAL_API_KEY

if (!FAL_KEY) {
  console.error('VITE_FAL_API_KEY is not set')
}

// Callers read this after generateImage() to know which engine ran
export let lastProvider = 'unknown'

// ── VTO category detection ─────────────────────────────────────────────────────
function getVTOCategory(garmentType) {
  const t = (garmentType || '').toLowerCase()
  if (t.includes('trouser') || t.includes('pant') || t.includes('skirt')) return 'bottoms'
  if (
    t.includes('dress') || t.includes('jumpsuit') ||
    t.includes('kaftan') || t.includes('abaya') || t.includes('traditional')
  ) return 'one-pieces'
  return 'tops'
}

function isLongTop(garmentType) {
  const t = (garmentType || '').toLowerCase()
  return t.includes('kaftan') || t.includes('abaya')
}

// ── Poll async Fal.ai queue job ────────────────────────────────────────────────
// Uses correct queue.fal.run endpoints (not fal.run which is for sync calls)
async function pollFalResult(modelPath, requestId, maxAttempts = 40) {
  console.log(`⏳ Polling ${modelPath} job ${requestId}...`)

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000))

    try {
      const statusRes = await fetch(
        `https://queue.fal.run/${modelPath}/requests/${requestId}/status`,
        { headers: { Authorization: `Key ${FAL_KEY}` } }
      )
      const status = await statusRes.json()
      console.log(`Poll ${i + 1}: ${status.status}`)

      if (status.status === 'COMPLETED') {
        const resultRes = await fetch(
          `https://queue.fal.run/${modelPath}/requests/${requestId}`,
          { headers: { Authorization: `Key ${FAL_KEY}` } }
        )
        const result = await resultRes.json()
        return (
          result.images?.[0]?.url ||
          result.output?.images?.[0]?.url ||
          result.image?.url
        )
      }

      if (status.status === 'FAILED') {
        throw new Error(`Job failed: ${JSON.stringify(status.error || status)}`)
      }
    } catch (e) {
      if (i === maxAttempts - 1) throw e
    }
  }

  throw new Error('Generation timed out after 2 minutes')
}

// ── Step 1: Generate base model in selected background ────────────────────────
// Produces a clean person with plain white outfit in the chosen background.
// FASHN will then dress this person in the real uploaded garment.
async function generateBaseModel(prompt, negativePrompt) {
  console.log('🎨 Step 1: Generating African model...')

  const res = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      num_inference_steps: 40,
      guidance_scale: 8.0,
      num_images: 1,
      image_size: 'portrait_4_3',
      enable_safety_checker: false,
      seed: Math.floor(Math.random() * 1000000),
    }),
  })

  if (!res.ok) { const err = await res.text(); throw new Error(`Model generation failed: ${err}`) }
  const data = await res.json()

  if (data.images?.[0]?.url) {
    console.log('✅ Base model generated')
    return data.images[0].url
  }
  if (data.request_id) return await pollFalResult('fal-ai/flux/dev', data.request_id)
  throw new Error('No image in model generation response')
}

// ── Step 2: FASHN Virtual Try-On — grafts EXACT garment pixels onto model ─────
// restore_background: true preserves the background generated in step 1
async function applyGarmentVTO(modelImageUrl, garmentImageUrl, category, garmentType) {
  console.log('👗 Step 2: Applying garment via FASHN VTO...')

  const res = await fetch('https://fal.run/fal-ai/fashn/tryon', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model_image:        modelImageUrl,
      garment_image:      garmentImageUrl,
      category,
      flat_lay:           false,
      adjust_hands:       true,
      restore_background: true,   // keep the generated background from step 1
      restore_clothes:    true,
      long_top:           isLongTop(garmentType),
      mode:               'balanced',
      garment_photo_type: 'auto',
      num_samples:        1,
    }),
  })

  if (!res.ok) { const err = await res.text(); throw new Error(`FASHN VTO error: ${err}`) }
  const data = await res.json()

  if (data.images?.[0]?.url) {
    console.log('✅ Garment applied successfully')
    return data.images[0].url
  }
  if (data.image?.url) return data.image.url
  if (data.request_id) return await pollFalResult('fal-ai/fashn/tryon', data.request_id)
  throw new Error('No VTO image URL in FASHN response')
}

// ── img2img fallback (VTO non-billing failure) ────────────────────────────────
async function falImg2Img(prompt, negativePrompt, referenceUrl, strength) {
  const res = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      image_url: referenceUrl,
      strength,
      num_inference_steps: 50,
      guidance_scale: 12.0,
      num_images: 1,
      image_size: 'portrait_4_3',
      enable_safety_checker: false,
    }),
  })
  if (!res.ok) { const err = await res.text(); throw new Error(`Fal.ai img2img error: ${err}`) }
  const data = await res.json()
  if (data.images?.[0]?.url) return data.images[0].url
  if (data.image?.url) return data.image.url
  if (data.request_id) return await pollFalResult('fal-ai/flux/dev/image-to-image', data.request_id)
  throw new Error('No image URL in Fal.ai img2img response')
}

// ── text-to-image (no reference provided) ────────────────────────────────────
async function falText2Img(prompt, negativePrompt) {
  const res = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      num_inference_steps: 35,
      guidance_scale: 7.5,
      num_images: 1,
      image_size: 'portrait_4_3',
      enable_safety_checker: false,
    }),
  })
  if (!res.ok) { const err = await res.text(); throw new Error(`Fal.ai text2img error: ${err}`) }
  const data = await res.json()
  if (data.images?.[0]?.url) return data.images[0].url
  if (data.request_id) return await pollFalResult('fal-ai/flux/dev', data.request_id)
  throw new Error('No image URL in Fal.ai text2img response')
}

// ── Pollinations fallback (billing errors only) ───────────────────────────────
const TIMEOUT_MS = 120_000
async function pollinationsText2Img(prompt, seed) {
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=768&height=1024&model=flux&seed=${seed}&nologo=true&enhance=true`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetch(url, { signal: controller.signal })
  } catch (err) {
    throw new Error(err.name === 'AbortError'
      ? 'Image generation timed out — please try again'
      : `Generation failed: ${err.message}`)
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) throw new Error(`Pollinations error: ${res.status}`)
  const blob = await res.blob()
  if (blob.size < 5000) throw new Error('Generated image too small — please try again')
  return blob
}

function isBillingError(msg) {
  return (
    msg.includes('Exhausted balance') ||
    msg.includes('User is locked') ||
    msg.includes('locked') ||
    msg.includes('402')
  )
}

// ── Upload to permanent Supabase storage ──────────────────────────────────────
async function uploadToStorage(source, seed) {
  const fileName = `gen-${Date.now()}-${seed}.jpg`
  let blob = source
  if (typeof source === 'string') {
    const res = await fetch(source)
    if (!res.ok) throw new Error('Failed to download generated image')
    blob = await res.blob()
  }
  const { error } = await supabase.storage
    .from('generated-images')
    .upload(fileName, blob, { contentType: 'image/jpeg' })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  const { data } = supabase.storage.from('generated-images').getPublicUrl(fileName)
  return data.publicUrl
}

// ── Main export ───────────────────────────────────────────────────────────────
// Primary:  Two-step VTO (generate model in background → FASHN grafts garment)
// Fallback: Fal.ai img2img (on VTO non-billing failure)
// Last:     Pollinations text-to-image (billing errors only)
//
// Parameters:
//   prompt            — full garment+model prompt (img2img fallback)
//   negativePrompt    — shared negative prompt
//   referenceImageUrls — user's uploaded garment photo URLs
//   strength          — img2img strength (0.5–0.85)
//   baseModelPrompt   — person-only prompt for VTO step 1
//   garmentType       — e.g. 'Dress', 'Kaftan / Abaya'
//   onProgress        — optional callback(message) for step reporting
export async function generateImage(
  prompt,
  negativePrompt,
  referenceImageUrls = [],
  strength = 0.55,
  baseModelPrompt = null,
  garmentType = '',
  onProgress = null,
  baseNegativePrompt = null,
) {
  const seed = Math.floor(Math.random() * 999999)
  const referenceUrl = referenceImageUrls[0] || null
  const progress = onProgress || (() => {})

  if (!FAL_KEY) {
    lastProvider = 'pollinations-fallback'
    const blob = await pollinationsText2Img(prompt, seed)
    return await uploadToStorage(blob, seed)
  }

  // ── Path 1: Two-step VTO ──────────────────────────────────────────────────
  if (referenceUrl && baseModelPrompt) {
    try {
      progress('Step 1 of 2 — Generating your African model...')
      // Use the model-specific negative prompt (with gender enforcement) if provided
      const step1NegativePrompt = baseNegativePrompt || negativePrompt
      console.log('[generateImage] Step 1 negative prompt:', step1NegativePrompt)
      const baseModelUrl = await generateBaseModel(baseModelPrompt, step1NegativePrompt)

      progress('Step 2 of 2 — Applying your exact garment...')
      const category = getVTOCategory(garmentType)
      const vtoUrl = await applyGarmentVTO(baseModelUrl, referenceUrl, category, garmentType)

      progress('Saving image...')
      lastProvider = 'fal-vto'
      return await uploadToStorage(vtoUrl, seed)
    } catch (err) {
      if (isBillingError(err.message || '')) {
        lastProvider = 'pollinations-fallback'
        const blob = await pollinationsText2Img(prompt, seed)
        return await uploadToStorage(blob, seed)
      }
      console.warn('VTO unavailable, falling back to img2img:', err.message)
      progress('VTO unavailable — trying alternative method...')
    }
  }

  // ── Path 2: img2img fallback ──────────────────────────────────────────────
  if (referenceUrl) {
    try {
      progress('Generating via garment reference...')
      const falUrl = await falImg2Img(prompt, negativePrompt, referenceUrl, strength)
      lastProvider = 'fal-img2img'
      return await uploadToStorage(falUrl, seed)
    } catch (err) {
      if (!isBillingError(err.message || '')) throw err
      lastProvider = 'pollinations-fallback'
      const blob = await pollinationsText2Img(prompt, seed)
      return await uploadToStorage(blob, seed)
    }
  }

  // ── Path 3: text-to-image (no reference) ─────────────────────────────────
  try {
    const falUrl = await falText2Img(prompt, negativePrompt)
    lastProvider = 'fal-text2img'
    return await uploadToStorage(falUrl, seed)
  } catch (err) {
    if (!isBillingError(err.message || '')) throw err
    lastProvider = 'pollinations-fallback'
    const blob = await pollinationsText2Img(prompt, seed)
    return await uploadToStorage(blob, seed)
  }
}
