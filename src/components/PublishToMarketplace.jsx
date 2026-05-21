import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { generateProductListing, publishToMarketplace, getCategories } from '../lib/marketplaceAgent'
import { X, CheckSquare, Square, Sparkles, ShoppingBag, ExternalLink, RotateCw } from 'lucide-react'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size']

const gold = '#B8960C'
const bg = '#141414'
const surface = '#1A1A1A'
const border = '#2A2A2A'
const text = '#F5F0E8'
const muted = 'rgba(245,240,232,0.45)'

export default function PublishToMarketplace({ project, images, onClose, onSuccess }) {
  const { user } = useAuth()

  const [selectedIds, setSelectedIds] = useState(new Set())
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [listing, setListing] = useState(null)
  const [categories, setCategories] = useState([])
  const [published, setPublished] = useState(null)
  const [customNotes, setCustomNotes] = useState('')

  // form fields driven by AI then editable
  const [form, setForm] = useState({
    name: '',
    short_description: '',
    description: '',
    brand: 'Havillah',
    price: '',
    compare_at_price: '',
    wholesale_price: '',
    vat_rate: 20,
    sku: '',
    stock_quantity: 10,
    category: 'african-fashion',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    tags: '',
    status: 'active',
    is_featured: false,
  })

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const selectedImages = images.filter(img => selectedIds.has(img.id))

  function toggleImage(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(images.map(img => img.id)))
  }

  function clearAll() {
    setSelectedIds(new Set())
  }

  function toggleSize(size) {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size],
    }))
  }

  function field(key) {
    return (e) => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleGenerate() {
    if (selectedImages.length === 0) return
    setGenerating(true)
    try {
      const result = await generateProductListing({
        projectConfig: project,
        selectedImages,
        customInstructions: customNotes,
      })
      setListing(result)
      setForm(f => ({
        ...f,
        name: result.name || '',
        short_description: result.short_description || '',
        description: result.description || '',
        brand: result.brand || 'Havillah',
        price: result.suggested_price || '',
        compare_at_price: result.compare_at_price || '',
        wholesale_price: result.wholesale_price || '',
        vat_rate: result.vat_rate || 20,
        sku: result.sku || `HV-${Date.now()}`,
        sizes: result.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        tags: (result.tags || []).join(', '),
        category: result.category || 'african-fashion',
      }))
    } catch (err) {
      alert('AI generation failed: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handlePublish(asDraft = false) {
    if (!form.name || !form.price) {
      alert('Product name and price are required.')
      return
    }
    setPublishing(true)
    try {
      const listingData = {
        ...form,
        price: parseFloat(form.price),
        compare_at_price: parseFloat(form.compare_at_price) || null,
        wholesale_price: parseFloat(form.wholesale_price) || null,
        vat_rate: parseFloat(form.vat_rate) || 20,
        stock_quantity: parseInt(form.stock_quantity) || 10,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: asDraft ? 'draft' : 'active',
        category: form.category,
      }
      const { product } = await publishToMarketplace({
        listingData,
        selectedImages,
        projectId: project.id,
        userId: user.id,
      })
      setPublished(product)
      onSuccess?.(product)
    } catch (err) {
      alert('Publish failed: ' + err.message)
    } finally {
      setPublishing(false)
    }
  }

  const marketplaceUrl = import.meta.env.VITE_MARKETPLACE_URL || 'https://havillah-marketplace.vercel.app'

  // ── Success screen ─────────────────────────────────────────────────────────
  if (published) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '48px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(184,150,12,0.15)', border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <ShoppingBag size={28} color={gold} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: text, marginBottom: 12 }}>
            Product Published!
          </h2>
          <p style={{ color: muted, fontSize: 14, marginBottom: 8 }}>
            <span style={{ color: gold, fontWeight: 600 }}>"{published.name}"</span>
          </p>
          <p style={{ color: muted, fontSize: 13, marginBottom: 36 }}>
            is now live on Havillah Marketplace
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <a
              href={`${marketplaceUrl}/products/${published.slug}`}
              target="_blank"
              rel="noreferrer"
              style={btnStyle('gold')}
            >
              <ExternalLink size={14} /> View on Marketplace
            </a>
            <button onClick={() => { setPublished(null); setListing(null); setSelectedIds(new Set()); setForm(f => ({ ...f, name: '', price: '', description: '' })) }} style={btnStyle('outline')}>
              Publish Another
            </button>
          </div>
        </div>
      </Overlay>
    )
  }

  // ── Main modal ─────────────────────────────────────────────────────────────
  return (
    <Overlay onClose={onClose}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: text, margin: 0 }}>
            Publish to Havillah Marketplace
          </h2>
          <p style={{ color: muted, fontSize: 12, margin: '2px 0 0' }}>
            Create a product listing from your model images
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer', padding: 4 }}>
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT PANEL — Image selection */}
        <div style={{ width: 280, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: gold }}>
                Select Images
              </span>
              <span style={{ fontSize: 11, color: muted }}>{selectedIds.size} selected</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={selectAll} style={smallBtn}>Select All</button>
              <button onClick={clearAll} style={smallBtn}>Clear</button>
            </div>
            <p style={{ fontSize: 11, color: muted, marginTop: 8 }}>
              First selected image will be the primary photo
            </p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {images.map((img, i) => {
                const isSelected = selectedIds.has(img.id)
                const isPrimary = isSelected && [...selectedIds][0] === img.id
                return (
                  <div
                    key={img.id}
                    onClick={() => toggleImage(img.id)}
                    style={{
                      position: 'relative',
                      aspectRatio: '3/4',
                      borderRadius: 6,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: isSelected ? `2px solid ${gold}` : `2px solid ${border}`,
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <img src={img.image_url} alt={`img-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: isSelected ? 'rgba(184,150,12,0.1)' : 'transparent', transition: 'background 0.15s' }} />
                    <div style={{ position: 'absolute', top: 6, right: 6 }}>
                      {isSelected
                        ? <CheckSquare size={16} color={gold} fill={gold} />
                        : <Square size={16} color="rgba(255,255,255,0.5)" />
                      }
                    </div>
                    {isPrimary && (
                      <div style={{ position: 'absolute', bottom: 4, left: 4, background: gold, color: '#0D0D0D', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, letterSpacing: '0.05em' }}>
                        PRIMARY
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Custom notes + Generate button */}
          <div style={{ padding: 14, borderTop: `1px solid ${border}` }}>
            <textarea
              placeholder="Optional styling notes for the AI..."
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              rows={2}
              style={inputStyle({ resize: 'none', fontSize: 12 })}
            />
            <button
              onClick={handleGenerate}
              disabled={selectedIds.size === 0 || generating}
              style={{
                ...btnStyle('gold'),
                width: '100%',
                marginTop: 8,
                opacity: selectedIds.size === 0 || generating ? 0.45 : 1,
                cursor: selectedIds.size === 0 || generating ? 'not-allowed' : 'pointer',
                justifyContent: 'center',
              }}
            >
              {generating
                ? <><RotateCw size={14} className="animate-spin" /> Generating...</>
                : <><Sparkles size={14} /> Generate Listing with AI</>
              }
            </button>
          </div>
        </div>

        {/* RIGHT PANEL — Product form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {!listing && !generating ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: muted, textAlign: 'center' }}>
              <Sparkles size={36} style={{ color: border, marginBottom: 16 }} />
              <p style={{ fontSize: 14 }}>Select images then click<br />"Generate Listing with AI"</p>
            </div>
          ) : generating ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: muted }}>
              <RotateCw size={28} style={{ color: gold, marginBottom: 12, animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 14 }}>Crafting your listing...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Product Information */}
              <FormSection title="Product Information">
                <FormField label="Product Name *">
                  <input value={form.name} onChange={field('name')} style={inputStyle()} maxLength={70} />
                </FormField>
                <FormField label="Short Description *">
                  <input value={form.short_description} onChange={field('short_description')} style={inputStyle()} maxLength={120} />
                </FormField>
                <FormField label="Full Description *">
                  <textarea value={form.description} onChange={field('description')} rows={6} style={inputStyle({ resize: 'vertical' })} />
                </FormField>
                <FormField label="Brand">
                  <input value={form.brand} onChange={field('brand')} style={inputStyle()} />
                </FormField>
              </FormSection>

              {/* Pricing */}
              <FormSection title="Pricing (GBP)">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormField label="Retail Price *">
                    <PriceInput value={form.price} onChange={field('price')} />
                  </FormField>
                  <FormField label="Compare At Price">
                    <PriceInput value={form.compare_at_price} onChange={field('compare_at_price')} />
                  </FormField>
                  <FormField label="Wholesale Price">
                    <PriceInput value={form.wholesale_price} onChange={field('wholesale_price')} />
                  </FormField>
                  <FormField label="VAT Rate">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="number" value={form.vat_rate} onChange={field('vat_rate')} style={{ ...inputStyle(), width: 80 }} />
                      <span style={{ color: muted, fontSize: 13 }}>%</span>
                    </div>
                  </FormField>
                </div>
              </FormSection>

              {/* Inventory */}
              <FormSection title="Inventory">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormField label="SKU">
                    <input value={form.sku} onChange={field('sku')} style={inputStyle()} />
                  </FormField>
                  <FormField label="Stock Quantity">
                    <input type="number" value={form.stock_quantity} onChange={field('stock_quantity')} style={inputStyle()} />
                  </FormField>
                </div>
              </FormSection>

              {/* Category & Details */}
              <FormSection title="Category & Details">
                <FormField label="Category">
                  <select value={form.category} onChange={field('category')} style={inputStyle()}>
                    {categories.length > 0
                      ? categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)
                      : <option value="african-fashion">African Fashion</option>
                    }
                  </select>
                </FormField>
                <FormField label="Available Sizes">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {SIZES.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          border: form.sizes.includes(size) ? `1px solid ${gold}` : `1px solid ${border}`,
                          background: form.sizes.includes(size) ? 'rgba(184,150,12,0.15)' : 'transparent',
                          color: form.sizes.includes(size) ? gold : muted,
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Tags (comma separated)">
                  <input value={form.tags} onChange={field('tags')} style={inputStyle()} placeholder="african fashion, kaftan, luxury" />
                </FormField>
              </FormSection>

              {/* Listing Status */}
              <FormSection title="Listing Status">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <RadioOpt
                    label="Publish immediately (active)"
                    checked={form.status === 'active'}
                    onChange={() => setForm(f => ({ ...f, status: 'active' }))}
                  />
                  <RadioOpt
                    label="Save as draft"
                    checked={form.status === 'draft'}
                    onChange={() => setForm(f => ({ ...f, status: 'draft' }))}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                      style={{ accentColor: gold, width: 14, height: 14 }}
                    />
                    <span style={{ fontSize: 13, color: muted }}>Feature this product on homepage</span>
                  </label>
                </div>
              </FormSection>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 8, paddingBottom: 16 }}>
                <button
                  onClick={() => handlePublish(false)}
                  disabled={publishing}
                  style={{ ...btnStyle('gold'), flex: 1, justifyContent: 'center', opacity: publishing ? 0.5 : 1 }}
                >
                  {publishing ? <RotateCw size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
                  {publishing ? 'Publishing...' : 'Publish to Marketplace'}
                </button>
                <button
                  onClick={() => handlePublish(true)}
                  disabled={publishing}
                  style={{ ...btnStyle('outline'), opacity: publishing ? 0.5 : 1 }}
                >
                  Save as Draft
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Overlay({ children, onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, width: '100%', maxWidth: 960, height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        {children}
      </div>
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${border}`, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${border}`, background: '#1A1A1A' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: gold }}>{title}</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      {children}
    </div>
  )
}

function PriceInput({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: muted, fontSize: 13 }}>£</span>
      <input type="number" step="0.01" value={value} onChange={onChange} style={inputStyle()} />
    </div>
  )
}

function RadioOpt({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input type="radio" checked={checked} onChange={onChange} style={{ accentColor: gold, width: 14, height: 14 }} />
      <span style={{ fontSize: 13, color: checked ? text : muted }}>{label}</span>
    </label>
  )
}

function inputStyle(extra = {}) {
  return {
    background: '#0D0D0D',
    border: `1px solid ${border}`,
    borderRadius: 6,
    padding: '8px 12px',
    color: text,
    fontSize: 13,
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    ...extra,
  }
}

function btnStyle(variant) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 18px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.06em',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
    textDecoration: 'none',
  }
  if (variant === 'gold') {
    return { ...base, background: 'linear-gradient(135deg, #B8960C, #DEC05A)', color: '#0D0D0D', border: 'none' }
  }
  return { ...base, background: 'transparent', border: `1px solid ${border}`, color: muted }
}

const smallBtn = {
  background: 'transparent',
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: '4px 10px',
  fontSize: 11,
  color: muted,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
