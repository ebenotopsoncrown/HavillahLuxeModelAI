import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, Layers, Clock, CreditCard,
  Crown, Menu, LogOut,
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
    <div style={{ padding: '20px 20px 12px' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#444444', marginBottom: '10px' }}>
        Generation Credits
      </p>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '28px', fontWeight: 300, color: '#B8960C', lineHeight: 1, marginBottom: '12px' }}>
        {credits}
      </p>
      <div style={{ height: '2px', width: '100%', background: '#1A1A1A', borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #B8960C, #DEC05A)', transition: 'width 0.5s ease' }} />
      </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ height: '80px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #1A1A1A', flexShrink: 0 }}>
        <Link
          to="/dashboard"
          onClick={() => setMobileOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
        >
          <Crown size={26} style={{ color: '#B8960C', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 300, color: '#B8960C', letterSpacing: '0.2em', lineHeight: 1 }}>
              HAVILLAH
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 400, color: '#444', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '4px' }}>
              LUXEMODEL AI
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <NavItem
              key={to}
              to={to}
              icon={Icon}
              label={label}
              active={active}
              onClick={() => setMobileOpen(false)}
            />
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1A1A1A', flexShrink: 0 }}>
        <CreditDisplay profile={profile} />
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={handleSignOut}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#444', borderRadius: '4px', transition: 'color 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = '#999'}
            onMouseLeave={e => e.currentTarget.style.color = '#444'}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
        <div style={{ padding: '0 20px 16px' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: '#333', letterSpacing: '0.05em' }}>
            &copy; 2026 Havillah LuxeModel AI
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#FAFAF8', overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0"
        style={{ width: '240px', background: '#0D0D0D', borderRight: '1px solid #1E1E1E' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} className="lg:hidden">
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '240px', background: '#0D0D0D', borderRight: '1px solid #1E1E1E', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile Header */}
        <header
          className="flex lg:hidden items-center justify-between"
          style={{ height: '56px', padding: '0 16px', borderBottom: '1px solid #E8E4DC', background: '#FFFFFF', flexShrink: 0 }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B8960C', padding: '4px', display: 'flex' }}
          >
            <Menu size={20} />
          </button>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300, color: '#B8960C', letterSpacing: '0.2em' }}>
            HAVILLAH
          </span>
          <div style={{ width: '28px' }} />
        </header>

        <main
          key={location.pathname}
          className="page-fade-in"
          style={{
            flex: 1,
            overflow: 'auto',
            background: '#FAFAF8',
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(184,150,12,0.03) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(184,150,12,0.02) 0%, transparent 40%)
            `,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

function NavItem({ to, icon: Icon, active, label, onClick }) {
  const [hovered, setHovered] = useState(false)
  const isHighlighted = active || hovered

  return (
    <Link
      to={to}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '44px',
        padding: '0 16px',
        borderRadius: '6px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '12px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        color: active ? '#C9A82C' : hovered ? '#999' : '#888',
        background: active ? 'rgba(184,150,12,0.1)' : hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderLeft: active ? '2px solid #C9A82C' : '2px solid transparent',
      }}
    >
      <Icon
        size={16}
        style={{ color: active ? '#C9A82C' : hovered ? '#666' : '#555', flexShrink: 0 }}
      />
      {label}
    </Link>
  )
}
