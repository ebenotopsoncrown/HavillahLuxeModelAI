import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Trash2, Search, Image, RotateCw, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    if (user) loadProjects()
  }, [user])

  async function loadProjects() {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project and all its images?')) return
    await supabase.from('generated_images').delete().eq('project_id', id)
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
    toast.success('Project deleted')
  }

  const filtered = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Page Header */}
      <div style={{ padding: '48px 48px 0' }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#B8960C', marginBottom: '10px' }}>
          Archive
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#F5F0E8', marginBottom: '20px' }}>
          Project History
        </h1>
        <div style={{ width: '40px', height: '1px', background: '#B8960C' }} />
      </div>

      <div style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '0' }}>

        {/* Search Bar + Meta Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', marginBottom: '0', paddingBottom: '20px', borderBottom: '1px solid #1A1A1A' }} className="flex-col sm:flex-row">
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={13} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: searchFocused ? '#B8960C' : '#444', transition: 'color 0.2s ease' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search projects..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${searchFocused ? '#B8960C' : '#2A2A2A'}`,
                borderRadius: 0,
                outline: 'none',
                padding: '10px 0 10px 22px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#F5F0E8',
                transition: 'border-color 0.2s ease',
                caretColor: '#B8960C',
              }}
            />
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#444', flexShrink: 0 }}>
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table Header */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 140px 100px 80px 100px', gap: '16px', padding: '12px 16px', alignItems: 'center' }}>
            {['', 'Project', 'Date', 'Status', 'Images', ''].map((col, i) => (
              <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#333' }}>
                {col}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <RotateCw size={20} style={{ color: '#B8960C' }} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 48px', border: '1px dashed #1A1A1A', borderRadius: '4px', marginTop: '0' }}>
            <Image size={32} style={{ color: '#1E1E1E', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#444' }}>
              {search ? 'No projects match your search' : 'No projects yet'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((project, index) => (
              <ProjectRow
                key={project.id}
                project={project}
                onOpen={() => navigate(`/project?id=${project.id}`)}
                onDelete={() => deleteProject(project.id)}
                isLast={index === filtered.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectRow({ project, onOpen, onDelete, isLast }) {
  const [hovered, setHovered] = useState(false)

  const statusStyle = project.status === 'completed'
    ? { border: '1px solid #B8960C', color: '#B8960C' }
    : project.status === 'generating'
    ? { border: '1px solid #B8960C', color: '#B8960C', opacity: 0.5 }
    : project.status === 'failed'
    ? { border: '1px solid #CC4444', color: '#CC4444' }
    : { border: '1px solid #2A2A2A', color: '#555' }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr 140px 100px 80px 100px',
        gap: '16px',
        padding: '0 16px',
        height: '64px',
        alignItems: 'center',
        background: hovered ? '#141414' : 'transparent',
        borderBottom: isLast ? 'none' : '1px solid #141414',
        transition: 'background 0.15s ease',
        cursor: 'default',
      }}
    >
      {/* Thumbnail */}
      <div
        onClick={onOpen}
        style={{ width: '40px', height: '40px', borderRadius: '2px', overflow: 'hidden', background: '#0F0F0F', flexShrink: 0, cursor: 'pointer' }}
      >
        {project.clothing_image_urls?.[0] ? (
          <img
            src={project.clothing_image_urls[0]}
            alt={project.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image size={14} style={{ color: '#1E1E1E' }} />
          </div>
        )}
      </div>

      {/* Project Name */}
      <div
        onClick={onOpen}
        style={{ cursor: 'pointer', minWidth: 0 }}
      >
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500, color: hovered ? '#F5F0E8' : '#CCC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.15s ease' }}>
          {project.name}
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#444', marginTop: '2px' }}>
          {project.gender || 'female'} model
        </div>
      </div>

      {/* Date */}
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#444' }}>
        {new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>

      {/* Status */}
      <div>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '9px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '3px 8px',
            borderRadius: '2px',
            ...statusStyle,
          }}
          className={project.status === 'generating' ? 'badge-generating' : ''}
        >
          {project.status || 'draft'}
        </span>
      </div>

      {/* Image Count */}
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: '#555' }}>
        {project.generation_count || 0}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s ease' }}>
        <ActionBtn onClick={onOpen} title="Open">
          <ArrowUpRight size={13} />
        </ActionBtn>
        <ActionBtn onClick={onDelete} title="Delete" danger>
          <Trash2 size={13} />
        </ActionBtn>
      </div>
    </div>
  )
}

function ActionBtn({ children, onClick, danger, title }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '30px',
        height: '30px',
        background: 'transparent',
        border: `1px solid ${hovered ? (danger ? '#CC4444' : '#2A2A2A') : '#1E1E1E'}`,
        borderRadius: '2px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: hovered ? (danger ? '#CC4444' : '#F5F0E8') : '#444',
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}
