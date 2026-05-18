import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Folder, Image, Star, Crown, PlusCircle, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'

function StatCard({ icon: Icon, label, value }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#141414',
        border: '1px solid #1E1E1E',
        borderTop: '1px solid #B8960C',
        borderRadius: '4px',
        padding: '28px 24px',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <Icon size={20} style={{ color: '#2A2A2A', marginBottom: '20px', display: 'block' }} />
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '36px', fontWeight: 300, color: '#F5F0E8', lineHeight: 1, marginBottom: '10px' }}>
        {value}
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#444' }}>
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
    : { border: '1px solid #2A2A2A', color: '#555' }

  return (
    <div
      style={{ borderRadius: '4px', overflow: 'hidden', background: '#141414', position: 'relative', cursor: 'pointer', aspectRatio: '3 / 4' }}
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
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0F0F' }}>
          <Image size={32} style={{ color: '#1E1E1E' }} />
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
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#555' }}>
            {new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Delete */}
      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(project.id) }}
          style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', background: 'rgba(8,8,8,0.8)', border: '1px solid #2A2A2A', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', transition: 'color 0.2s ease' }}
          onMouseEnter={e => e.currentTarget.style.color = '#CC4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}
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
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, color: '#F5F0E8', lineHeight: 1.05, marginBottom: '10px' }}>
            Your Creative Studio
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
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
              <div key={i} style={{ aspectRatio: '3/4', background: '#141414', borderRadius: '4px' }} className="animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 48px', border: '1px dashed #1E1E1E', borderRadius: '4px' }}>
            <Crown size={64} style={{ color: '#1E1E1E', margin: '0 auto 28px', display: 'block' }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: '#F5F0E8', marginBottom: '12px' }}>
              Begin Your Collection
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#555', marginBottom: '32px', lineHeight: 1.7 }}>
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
        color: '#080808',
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
      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: hovered ? '#B8960C' : '#444', transition: 'color 0.2s ease', textDecoration: 'none' }}
    >
      View All →
    </Link>
  )
}
