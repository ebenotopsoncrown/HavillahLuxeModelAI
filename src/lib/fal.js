import { supabase } from './supabase'

const TIMEOUT_MS = 90_000 // Pollinations can take up to 60s on first request

export async function generateImage(prompt, negativePrompt, referenceImageUrls = []) {
  const seed = Math.floor(Math.random() * 999999)

  // Weave clothing context into the prompt so the model knows what to render
  const fullPrompt = referenceImageUrls.length > 0
    ? `${prompt}, wearing the exact garment style from the reference, high-end fashion photography`
    : prompt

  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}` +
    `?width=768&height=1024&model=flux&seed=${seed}&nologo=true&enhance=true`

  // Fetch with timeout
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response
  try {
    response = await fetch(url, { signal: controller.signal })
  } catch (err) {
    throw new Error(err.name === 'AbortError'
      ? 'Image generation timed out — please try again'
      : `Generation failed: ${err.message}`)
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) throw new Error(`Generation failed: ${response.status}`)

  const blob = await response.blob()
  if (blob.size < 5000) throw new Error('Generated image too small — please try again')

  // Upload to Supabase for a permanent URL
  const fileName = `gen-${Date.now()}-${seed}.jpg`
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(fileName, blob, { contentType: 'image/jpeg' })

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  const { data } = supabase.storage.from('generated-images').getPublicUrl(fileName)
  return data.publicUrl
}
