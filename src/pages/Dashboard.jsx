import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Folder, Image, Star, Sparkles, PlusCircle, Trash2,
  TrendingUp, Clock, CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

function StatCard({ icon: Icon, label, value, color = 'gold' }) {
  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color === 'gold' ? 'bg-[#C6A052]/15' : 'bg-[#2A2A2A]'}`}>
        <Icon size={18} className={color === 'gold' ? 'text-[#C6A052]' : 'text-[#F8F5F0]/60'} />
      </div>
      <p className="text-2xl font-bold text-[#F8F5F0]">{value}</p>
      <p className="text-xs text-[#F8F5F0]/40 mt-0.5">{label}</p>
    </div>
  )
}

function ProjectCard({ project, onDelete }) {
  const thumbnail = project.clothing_image_urls?.[0]
  const navigate = useNavigate()

  return (
    <div className="group rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] overflow-hidden hover:border-[#C6A052]/30 transition-all duration-200 hover:shadow-lg hover:shadow-[#C6A052]/10">
      {/* Thumbnail */}
      <div
        className="aspect-[4/3] bg-[#0D0D0D] overflow-hidden cursor-pointer"
        onClick={() => navigate(`/project?id=${project.id}`)}
      >
        {thumbnail ? (
          <img src={thumbnail} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image size={28} className="text-[#2A2A2A]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#F8F5F0] truncate">{project.name}</h3>
            <p className="text-xs text-[#F8F5F0]/40 mt-0.5">
              {project.generation_count || 0} images · {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={project.status === 'completed' ? 'success' : project.status === 'generating' ? 'warning' : 'default'}>
              {project.status || 'draft'}
            </Badge>
          </div>
        </div>

        <div className="flex gap-1.5 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => navigate(`/project?id=${project.id}`)}
          >
            Open
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="w-8 px-0"
            onClick={() => onDelete(project.id)}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
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
      setStats({
        total: (projectsData || []).length,
        completed,
        images: imgCount || 0,
        favorites: favCount || 0,
      })
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8F5F0]">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-[#F8F5F0]/40 mt-1">Your AI fashion model studio</p>
        </div>
        <Link to="/new-project">
          <Button>
            <PlusCircle size={16} /> New Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Folder} label="Total Projects" value={stats.total} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} />
        <StatCard icon={Image} label="Images Generated" value={stats.images} />
        <StatCard icon={Star} label="Favorites" value={stats.favorites} color="star" />
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F8F5F0]">Recent Projects</h2>
          <Link to="/history" className="text-sm text-[#C6A052] hover:text-[#D4B872] transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2A2A2A] p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#C6A052]/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} className="text-[#C6A052]" />
            </div>
            <h3 className="text-lg font-semibold text-[#F8F5F0] mb-2">No projects yet</h3>
            <p className="text-sm text-[#F8F5F0]/40 mb-5">Upload a garment and generate your first AI model photo</p>
            <Link to="/new-project">
              <Button>
                <PlusCircle size={15} /> Create First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} onDelete={deleteProject} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
