const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

export async function invokeLLM(prompt, responseFormat = 'text') {
  const systemInstruction = responseFormat === 'json_object'
    ? 'You are a helpful AI assistant. Always respond with valid JSON only, no markdown or extra text.'
    : 'You are a helpful AI assistant.'

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini error: ${err}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  if (responseFormat === 'json_object') {
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleaned)
    } catch {
      throw new Error('Gemini did not return valid JSON')
    }
  }

  return text
}
