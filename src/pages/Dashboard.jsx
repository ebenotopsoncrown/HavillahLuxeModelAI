import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getLuxeModelProducts } from '../lib/marketplaceAgent'
import { Folder, Image, Star, Crown, PlusCircle, CheckCircle2, X, ShoppingBag, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

function StatCard({ icon: Icon, label, value }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E4DC',
        borderTop: '2px solid #B8960C',
        borderRadius: '4px',
        padding: '28px 24px',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 4px 12px rgba(0,0,0,0.08)'
          : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
      }}
    >
      <Icon size={20} style={{ color: '#E8E4DC', marginBottom: '20px', display: 'block' }} />
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '36px', fontWeight: 300, color: '#0D0D0D', lineHeight: 1, marginBottom: '10px' }}>
        {value}
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6B6B6B' }}>
        {label}
      </div>
    </div>
  )
}

function ProjectCard({ project, onDelete }) {
  const thumbnail = project.clothing_image_urls?.[0]
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  const statusStyle = project.status === 'completed'
    ? { border: '1px solid #B8960C', color: '#B8960C' }
    : project.status === 'generating'
    ? { border: '1px solid #B8960C', color: '#B8960C', opacity: 0.5 }
    : { border: '1px solid #E8E4DC', color: '#6B6B6B' }

  return (
    <div
      style={{
        borderRadius: '4px',
        overflow: 'hidden',
        background: thumbnail ? '#0D0D0D' : '#FFFFFF',
        border: thumbnail ? 'none' : '1px solid #E8E4DC',
        position: 'relative',
        cursor: 'pointer',
        aspectRatio: '3 / 4',
        boxShadow: hovered
          ? '0 4px 12px rgba(0,0,0,0.08)'
          : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/project?id=${project.id}`)}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={project.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.4s ease' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F5F0' }}>
          <Image size={32} style={{ color: '#E8E4DC' }} />
        </div>
      )}

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovered
          ? 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)'
          : 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
        transition: 'background 0.3s ease',
      }} />

      {/* Bottom content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500, color: '#F5F0E8', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {project.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: '2px', ...statusStyle }}>
            {project.status || 'draft'}
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#AAAAAA' }}>
            {new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Delete */}
      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(project.id) }}
          style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', background: 'rgba(255,255,255,0.9)', border: '1px solid #E8E4DC', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B6B', transition: 'color 0.2s ease' }}
          onMouseEnter={e => e.currentTarget.style.color = '#CC4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B6B6B'}
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({ total: 0, completed: 0, images: 0, favorites: 0 })
  const [loading, setLoading] = useState(true)
  const [publishedProducts, setPublishedProducts] = useState([])

  useEffect(() => {
    if (user) loadDashboard()
  }, [user])

  async function loadDashboard() {
    setLoading(true)
    try {
      const [{ data: projectsData }, { count: imgCount }, { count: favCount }] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
        supabase.from('generated_images').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('generated_images').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_favorite', true),
      ])
      setProjects(projectsData || [])
      const completed = (projectsData || []).filter(p => p.status === 'completed').length
      setStats({ total: (projectsData || []).length, completed, images: imgCount || 0, favorites: favCount || 0 })

      // Load marketplace products (non-blocking)
      getLuxeModelProducts(user.id).then(setPublishedProducts).catch(() => {})
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project and all its images?')) return
    await supabase.from('generated_images').delete().eq('project_id', id)
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
    toast.success('Project deleted')
  }

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Hero Header */}
      <div style={{ padding: '48px 48px 40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }} className="flex-col sm:flex-row gap-4">
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#B8960C', marginBottom: '14px' }}>
            Havillah Studio
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, color: '#0D0D0D', lineHeight: 1.05, marginBottom: '10px' }}>
            Your Creative Studio
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#6B6B6B', lineHeight: 1.6 }}>
            Generate world-class fashion model imagery
          </p>
        </div>
        <Link to="/new-project" style={{ flexShrink: 0 }}>
          <GoldButton>
            <PlusCircle size={14} />
            New Project
          </GoldButton>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ padding: '0 48px', gap: '16px' }}>
        <StatCard icon={Folder} label="Total Projects" value={stats.total} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} />
        <StatCard icon={Image} label="Images Generated" value={stats.images} />
        <StatCard icon={Star} label="Favourites" value={stats.favorites} />
      </div>

      {/* Recent Work */}
      <div style={{ padding: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#B8960C' }}>
            Recent Work
          </div>
          <ViewAllLink to="/history" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: '20px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ aspectRatio: '3/4', background: '#F0EDE6', borderRadius: '4px' }} className="animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 48px', border: '1.5px dashed #D4C9B0', borderRadius: '4px', background: '#FFFFFF' }}>
            <Crown size={64} style={{ color: '#E8E4DC', margin: '0 auto 28px', display: 'block' }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: '#0D0D0D', marginBottom: '12px' }}>
              Begin Your Collection
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#6B6B6B', marginBottom: '32px', lineHeight: 1.7 }}>
              Upload a garment and generate your first AI model image
            </p>
            <Link to="/new-project">
              <GoldButton>
                <PlusCircle size={14} />
                Create First Project
              </GoldButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: '20px' }}>
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} onDelete={deleteProject} />
            ))}
          </div>
        )}
      </div>
      {/* Published to Marketplace */}
      {publishedProducts.length > 0 && (
        <div style={{ padding: '0 48px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={14} style={{ color: '#B8960C' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#B8960C' }}>
                Published to Marketplace
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#6B6B6B', background: '#F0EDE6', padding: '1px 8px', borderRadius: '12px' }}>
                {publishedProducts.length}
              </span>
            </div>
            <a
              href={import.meta.env.VITE_MARKETPLACE_URL || 'https://havillah-marketplace.vercel.app'}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#AAAAAA', textDecoration: 'none' }}
            >
              View All on Marketplace <ExternalLink size={11} />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
            {publishedProducts.slice(0, 4).map(product => (
              <div
                key={product.id}
                style={{ borderRadius: '4px', border: '1px solid #E8E4DC', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <div style={{ aspectRatio: '3/4', background: '#F8F5F0', overflow: 'hidden' }}>
                  {product.primary_image_url
                    ? <img src={product.primary_image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image size={24} style={{ color: '#E8E4DC' }} /></div>
                  }
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500, color: '#0D0D0D', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#B8960C' }}>
                      £{parseFloat(product.price || 0).toFixed(2)}
                    </span>
                    <span style={{
                      fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                      padding: '2px 7px', borderRadius: '2px',
                      border: product.status === 'active' ? '1px solid #B8960C' : '1px solid #E8E4DC',
                      color: product.status === 'active' ? '#B8960C' : '#6B6B6B',
                    }}>
                      {product.status || 'draft'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GoldButton({ children, onClick, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: disabled ? 'rgba(184,150,12,0.3)' : hovered ? 'linear-gradient(135deg, #C9A82C, #F0D98A)' : 'linear-gradient(135deg, #B8960C, #DEC05A)',
        border: 'none',
        borderRadius: '2px',
        height: '44px',
        padding: '0 24px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#0D0D0D',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s ease',
        boxShadow: hovered && !disabled ? '0 0 20px rgba(184,150,12,0.25)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

function ViewAllLink({ to }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: hovered ? '#B8960C' : '#AAAAAA', transition: 'color 0.2s ease', textDecoration: 'none' }}
    >
      View All →
    </Link>
  )
}
