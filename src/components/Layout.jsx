import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, Layers, Clock, CreditCard,
  Crown, Menu, X, LogOut, Sparkles,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/new-project', icon: PlusCircle, label: 'New Project' },
  { to: '/flyer-studio', icon: Layers, label: 'Flyer Studio' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/credits', icon: CreditCard, label: 'Credits' },
]

function CreditDisplay({ profile }) {
  const credits = profile?.credits ?? 0
  const pct = Math.min(100, (credits / 100) * 100)
  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#0D0D0D] p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#F8F5F0]/50 font-medium uppercase tracking-wider">Credits</span>
        <span className="text-sm font-bold text-[#C6A052]">{credits}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#2A2A2A] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#C6A052] to-[#D4B872] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-[#F8F5F0]/30 mt-1.5">remaining</p>
    </div>
  )
}

export default function Layout({ children }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
    toast.success('Signed out successfully')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-6 pb-8">
        <Link to="/dashboard" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C6A052] to-[#3B2A1A] flex items-center justify-center shadow-lg group-hover:shadow-[#C6A052]/30 transition-shadow">
            <Crown size={18} className="text-[#0D0D0D]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#C6A052] leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>
              Havillah
            </h1>
            <p className="text-[9px] text-[#F8F5F0]/40 uppercase tracking-[0.2em] mt-0.5">LuxeModel AI</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group ${
                active
                  ? 'bg-[#C6A052]/15 border border-[#C6A052]/30 text-[#C6A052]'
                  : 'text-[#F8F5F0]/50 hover:text-[#F8F5F0] hover:bg-[#2A2A2A]/60'
              }`}
            >
              <Icon size={16} className={active ? 'text-[#C6A052]' : 'text-[#F8F5F0]/40 group-hover:text-[#F8F5F0]/70'} />
              {label}
              {label === 'New Project' && (
                <Sparkles size={12} className="ml-auto text-[#C6A052]/60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-3 border-t border-[#2A2A2A] mt-4">
        <CreditDisplay profile={profile} />
        {profile && (
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C6A052] to-[#3B2A1A] flex items-center justify-center text-xs font-bold text-[#0D0D0D]">
              {(profile.full_name || profile.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#F8F5F0] truncate">{profile.full_name || 'User'}</p>
              <p className="text-[10px] text-[#F8F5F0]/40 truncate">{profile.role || 'user'}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#F8F5F0]/50 hover:text-red-400 hover:bg-red-900/20 transition-all"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#0D0D0D] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#111111] border-r border-[#2A2A2A] shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#111111] border-r border-[#2A2A2A] z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] bg-[#111111]">
          <button onClick={() => setMobileOpen(true)} className="text-[#F8F5F0]/60 hover:text-[#F8F5F0]">
            <Menu size={20} />
          </button>
          <span className="text-[#C6A052] font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>Havillah</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
