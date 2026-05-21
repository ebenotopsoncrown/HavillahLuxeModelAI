import { supabase } from './supabase'

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export async function generateProductListing({ projectConfig, selectedImages, customInstructions }) {
  const garmentInfo = `
Garment Type: ${projectConfig.garment_type || 'Not specified'}
Gender: ${projectConfig.gender || 'Unisex'}
Outfit Pieces: ${projectConfig.outfit_pieces || 'Full outfit'}
Garment Fit: ${projectConfig.garment_fit || 'Regular fit'}
Garment Length: ${projectConfig.garment_length || 'Standard'}
Custom Notes: ${customInstructions || projectConfig.custom_instructions || 'None'}
Number of Model Images: ${selectedImages.length}
`.trim()

  const prompt = `You are a professional fashion copywriter for Havillah Marketplace, a premium Afro-Asian fashion store based in the UK.

Create a compelling product listing for this garment:
${garmentInfo}

The product has ${selectedImages.length} professional AI model photos showing the garment being worn beautifully.

Return ONLY valid JSON with no markdown:
{
  "name": "Compelling product name max 70 chars",
  "short_description": "One powerful selling line max 120 chars",
  "description": "Professional fashion description 150-200 words. Include style notes, occasions to wear, cultural significance if relevant, fabric feel, care instructions. Write like a luxury fashion brand.",
  "suggested_price": 65.00,
  "compare_at_price": 85.00,
  "wholesale_price": 35.00,
  "brand": "Havillah",
  "sku": "HV-${Date.now()}",
  "tags": ["african fashion", "tag2", "tag3"],
  "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "category": "african-fashion",
  "vat_rate": 20,
  "seo_title": "SEO title max 60 chars",
  "seo_description": "SEO description max 155 chars"
}

Pricing guide (GBP):
- Simple top/blouse: £25-45
- Dress/midi: £45-75
- Maxi gown: £65-95
- Kaftan: £55-120
- Agbada set: £85-185
- Traditional suit: £75-130
- Accessories: £15-35`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const text = data.content?.[0]?.text ?? '{}'
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    throw new Error('Could not generate listing. Please try again.')
  }
}

export async function publishToMarketplace({ listingData, selectedImages, projectId, userId }) {
  // Log agent task (best-effort — table may not exist yet)
  let taskId = null
  try {
    const { data: task } = await supabase
      .from('agent_tasks')
      .insert([{
        task_type: 'publish_to_marketplace',
        status: 'running',
        source_app: 'havillah_luxemodel',
        target_app: 'havillah_marketplace',
        input_data: {
          project_id: projectId,
          image_count: selectedImages.length,
          product_name: listingData.name,
        },
        created_by: userId,
        started_at: new Date().toISOString(),
      }])
      .select()
      .single()
    taskId = task?.id ?? null
  } catch {
    // agent_tasks table optional
  }

  try {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', listingData.category || 'african-fashion')
      .single()

    const slug =
      listingData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80) +
      '-' +
      Date.now()

    const imageArray = selectedImages.map((img, i) => ({
      url: img.image_url,
      alt: listingData.name,
      is_primary: i === 0,
    }))

    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        name: listingData.name,
        slug,
        description: listingData.description,
        short_description: listingData.short_description,
        price: listingData.price || listingData.suggested_price,
        retail_price: listingData.price || listingData.suggested_price,
        wholesale_price: listingData.wholesale_price,
        compare_at_price: listingData.compare_at_price,
        currency: 'GBP',
        sku: listingData.sku || `HV-${Date.now()}`,
        brand: listingData.brand || 'Havillah',
        vat_rate: listingData.vat_rate || 20,
        stock_quantity: listingData.stock_quantity || 10,
        reserved_quantity: 0,
        reorder_level: 5,
        type: 'fashion',
        status: listingData.status || 'active',
        is_active: true,
        is_featured: listingData.is_featured || false,
        category_id: category?.id ?? null,
        primary_image_url: selectedImages[0]?.image_url,
        image_urls: imageArray,
        tags: listingData.tags || [],
        sizes: listingData.sizes || [],
        seller_id: userId,
        source: 'luxemodel_agent',
      }])
      .select()
      .single()

    if (error) throw error

    if (taskId) {
      await supabase
        .from('agent_tasks')
        .update({
          status: 'completed',
          output_data: { product_id: product.id, product_name: product.name, product_slug: product.slug },
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId)
    }

    return { success: true, product }
  } catch (error) {
    if (taskId) {
      await supabase
        .from('agent_tasks')
        .update({ status: 'failed', error_message: error.message, completed_at: new Date().toISOString() })
        .eq('id', taskId)
    }
    throw error
  }
}

export async function getLuxeModelProducts(userId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('source', 'luxemodel_agent')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data ?? []
}
