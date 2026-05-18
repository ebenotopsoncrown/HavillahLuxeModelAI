const FAL_API_KEY = import.meta.env.VITE_FAL_API_KEY

export async function generateImage(prompt, negativePrompt, referenceImageUrls = []) {
  const body = {
    prompt,
    image_size: 'portrait_4_3',
    num_inference_steps: 28,
    guidance_scale: 3.5,
    num_images: 1,
    enable_safety_checker: true,
  }
  if (referenceImageUrls.length > 0) {
    body.image_url = referenceImageUrls[0]
  }

  const response = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Fal.ai error: ${err}`)
  }

  const data = await response.json()
  return data.images?.[0]?.url ?? null
}
