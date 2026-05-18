import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Trash2, Search, Image, RotateCw } from 'lucide-react'
import { toast } from 'sonner'

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

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
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8F5F0]">History</h1>
          <p className="text-sm text-[#F8F5F0]/40 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F8F5F0]/30" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-8"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RotateCw size={24} className="animate-spin text-[#C6A052]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-[#2A2A2A]">
          <Image size={32} className="text-[#2A2A2A] mx-auto mb-3" />
          <p className="text-sm text-[#F8F5F0]/40">
            {search ? 'No projects match your search' : 'No projects yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(project => (
            <div
              key={project.id}
              className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 hover:border-[#C6A052]/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-xl overflow-hidden bg-[#0D0D0D] shrink-0">
                  {project.clothing_image_urls?.[0] ? (
                    <img
                      src={project.clothing_image_urls[0]}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={16} className="text-[#2A2A2A]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#F8F5F0] truncate">{project.name}</h3>
                    <Badge variant={project.status === 'completed' ? 'success' : project.status === 'generating' ? 'warning' : 'default'}>
                      {project.status || 'draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#F8F5F0]/40">{project.generation_count || 0} images generated</span>
                    <span className="text-xs text-[#F8F5F0]/30">·</span>
                    <span className="text-xs text-[#F8F5F0]/40">{project.gender || 'female'} model</span>
                    <span className="text-xs text-[#F8F5F0]/30">·</span>
                    <span className="text-xs text-[#F8F5F0]/40">{new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/project?id=${project.id}`)}
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProject(project.id)}
                    className="w-8 px-0"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
