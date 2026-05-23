import { supabase } from './supabase'

const FAL_KEY = import.meta.env.VITE_FAL_API_KEY
const TIMEOUT_MS = 120_000

// Callers can read this after generateImage() to know which engine ran
export let lastProvider = 'unknown'

// ── VTO garment category detection ────────────────────────────────────────────
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

// ── Poll an async Fal.ai job ──────────────────────────────────────────────────
async function pollFalJob(requestId, modelPath = 'fal-ai/flux/dev', maxAttempts = 45) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const res = await fetch(
      `https://fal.run/${modelPath}/requests/${requestId}`,
      { headers: { Authorization: `Key ${FAL_KEY}` } }
    )
    const data = await res.json()
    if (data.status === 'COMPLETED') {
      return (
        data.output?.images?.[0]?.url ||
        data.output?.image?.url ||
        data.images?.[0]?.url ||
        data.image?.url
      )
    }
    if (data.status === 'FAILED') throw new Error('Fal.ai job failed: ' + (data.error || 'unknown'))
  }
  throw new Error('Fal.ai job timed out')
}

// ── Step 1: Generate a base model person (no specific garment) ────────────────
// Produces a clean person image that FASHN will dress in the real garment.
async function generateBaseModel(prompt, negativePrompt) {
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
  if (!res.ok) { const err = await res.text(); throw new Error(`Base model gen error: ${err}`) }
  const data = await res.json()
  if (data.images?.[0]?.url) return data.images[0].url
  if (data.request_id) return await pollFalJob(data.request_id, 'fal-ai/flux/dev')
  throw new Error('No base model URL in response')
}

// ── Step 2: Apply garment via FASHN Virtual Try-On ────────────────────────────
// FASHN grafts the EXACT garment pixels onto the base model image.
// restore_background: true keeps the background generated in step 1.
async function applyGarmentVTO(modelImageUrl, garmentImageUrl, category, garmentType) {
  const res = await fetch('https://fal.run/fal-ai/fashn/tryon', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model_image:        modelImageUrl,
      garment_image:      garmentImageUrl,
      category,
      flat_lay:           false,
      adjust_hands:       true,
      restore_background: false,
      restore_clothes:    true,
      long_top:           isLongTop(garmentType),
      mode:               'balanced',
      garment_photo_type: 'auto',
      num_samples:        1,
    }),
  })
  if (!res.ok) { const err = await res.text(); throw new Error(`FASHN VTO error: ${err}`) }
  const data = await res.json()
  if (data.images?.[0]?.url) return data.images[0].url
  if (data.image?.url) return data.image.url
  if (data.request_id) return await pollFalJob(data.request_id, 'fal-ai/fashn/tryon')
  throw new Error('No VTO image URL in FASHN response')
}

// ── Fal.ai img2img (fallback if VTO unavailable) ─────────────────────────────
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
  if (data.request_id) return await pollFalJob(data.request_id, 'fal-ai/flux/dev/image-to-image')
  throw new Error('No image URL in Fal.ai img2img response')
}

// ── Fal.ai text-to-image (no reference) ──────────────────────────────────────
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
  if (data.request_id) return await pollFalJob(data.request_id, 'fal-ai/flux/dev')
  throw new Error('No image URL in Fal.ai text2img response')
}

// ── Pollinations fallback (text-to-image only) ────────────────────────────────
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
// Primary:  FASHN Virtual Try-On (two-step: generate base model → graft garment)
// Fallback: Fal.ai img2img (if VTO unavailable or errors)
// Last:     Pollinations text-to-image (only on billing errors)
//
// Parameters:
//   prompt            — full garment+model prompt (used by img2img fallback)
//   negativePrompt    — shared negative prompt
//   referenceImageUrls — user's uploaded garment photo URLs
//   strength          — img2img strength (0.5–0.85); lower = more garment preserved
//   baseModelPrompt   — person-only prompt for VTO step 1 (no garment description)
//   garmentType       — e.g. 'Dress', 'Top / Blouse', used to pick VTO category
export async function generateImage(
  prompt,
  negativePrompt,
  referenceImageUrls = [],
  strength = 0.65,
  baseModelPrompt = null,
  garmentType = ''
) {
  const seed = Math.floor(Math.random() * 999999)
  const referenceUrl = referenceImageUrls[0] || null

  if (!FAL_KEY) {
    lastProvider = 'pollinations-fallback'
    const blob = await pollinationsText2Img(prompt, seed)
    return await uploadToStorage(blob, seed)
  }

  // ── Path 1: VTO — true pixel-perfect garment preservation ──────────────────
  if (referenceUrl && baseModelPrompt) {
    try {
      const baseModelUrl = await generateBaseModel(baseModelPrompt, negativePrompt)
      const category = getVTOCategory(garmentType)
      const vtoUrl = await applyGarmentVTO(baseModelUrl, referenceUrl, category, garmentType)
      lastProvider = 'fal-vto'
      return await uploadToStorage(vtoUrl, seed)
    } catch (err) {
      if (isBillingError(err.message || '')) {
        lastProvider = 'pollinations-fallback'
        toast_noop('Fal.ai balance exhausted')
        const blob = await pollinationsText2Img(prompt, seed)
        return await uploadToStorage(blob, seed)
      }
      // Non-billing VTO failure — fall through to img2img
      console.warn('VTO unavailable, falling back to img2img:', err.message)
    }
  }

  // ── Path 2: img2img — garment-lock via reference (VTO fallback) ─────────────
  if (referenceUrl) {
    try {
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

  // ── Path 3: text-to-image (no reference provided) ──────────────────────────
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

// Placeholder so the billing-error branch inside generateImage compiles without
// a toast import (callers handle the toast via lastProvider check).
function toast_noop() {}
