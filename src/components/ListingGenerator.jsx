import { useState } from 'react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { invokeLLM } from '../lib/gemini'
import { supabase } from '../lib/supabase'
import { Sparkles, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function ListingGenerator({ project, onSaved }) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(project?.listing_title || '')
  const [description, setDescription] = useState(project?.listing_description || '')
  const [copied, setCopied] = useState(null)

  async function generate() {
    setLoading(true)
    try {
      const prompt = `You are an expert e-commerce copywriter specializing in African fashion.
Generate a compelling eBay/Instagram product listing for this garment:
- Type: ${project?.garment_type || 'garment'}
- Fit: ${project?.garment_fit || ''}
- Length: ${project?.garment_length || ''}
- Description: ${project?.outfit_pieces || ''}

Return JSON with exactly these fields:
{
  "title": "SEO-optimized title under 80 chars",
  "description": "3-4 sentence compelling description highlighting style, occasion, and value"
}`
      const result = await invokeLLM(prompt, 'json_object')
      setTitle(result.title || '')
      setDescription(result.description || '')
    } catch (err) {
      toast.error('Failed to generate listing: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    if (!project?.id) return
    const { error } = await supabase
      .from('projects')
      .update({ listing_title: title, listing_description: description })
      .eq('id', project.id)
    if (error) toast.error('Failed to save listing')
    else {
      toast.success('Listing saved!')
      onSaved?.({ listing_title: title, listing_description: description })
    }
  }

  function copyText(text, key) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#C6A052] uppercase tracking-wider">Listing Generator</h3>
        <Button size="sm" onClick={generate} disabled={loading}>
          <Sparkles size={13} />
          {loading ? 'Generating...' : 'AI Generate'}
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>Title</Label>
            {title && (
              <button onClick={() => copyText(title, 'title')} className="text-[10px] text-[#F8F5F0]/40 hover:text-[#C6A052] flex items-center gap-1 transition-colors">
                {copied === 'title' ? <Check size={11} /> : <Copy size={11} />}
                {copied === 'title' ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Elegant African Print Ankara Midi Dress..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>Description</Label>
            {description && (
              <button onClick={() => copyText(description, 'desc')} className="text-[10px] text-[#F8F5F0]/40 hover:text-[#C6A052] flex items-center gap-1 transition-colors">
                {copied === 'desc' ? <Check size={11} /> : <Copy size={11} />}
                {copied === 'desc' ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <Textarea
            rows={5}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Compelling product description..."
          />
        </div>
      </div>

      {(title || description) && (
        <Button variant="outline" size="sm" onClick={save} className="w-full">
          Save Listing
        </Button>
      )}
    </div>
  )
}
