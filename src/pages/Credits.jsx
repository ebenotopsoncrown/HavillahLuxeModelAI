import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Zap, Crown, Building2, Check, Plus } from 'lucide-react'
import { toast } from 'sonner'

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    credits: 10,
    icon: Zap,
    features: ['10 credits included', 'Basic model generation', 'Standard quality', 'Community support'],
    badge: null,
    featured: false,
  },
  {
    name: 'Premium',
    price: '£29',
    credits: 100,
    icon: Crown,
    features: ['100 credits', 'Priority generation', '8K quality output', 'Flyer Studio access', 'Listing generator', 'Email support'],
    badge: 'Most Popular',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '£99',
    credits: 500,
    icon: Building2,
    features: ['500 credits', 'Bulk generation', 'API access', 'Custom model styles', 'White-label exports', 'Dedicated support'],
    badge: 'Best Value',
    featured: false,
  },
]

export default function Credits() {
  const { profile, refreshProfile, user } = useAuth()
  const credits = profile?.credits ?? 0
  const pct = Math.min(100, (credits / 100) * 100)

  async function addDemoCredits() {
    const { error } = await supabase
      .from('users')
      .update({ credits: credits + 10 })
      .eq('id', user.id)
    if (error) {
      toast.error('Failed to add credits')
    } else {
      await refreshProfile()
      toast.success('10 demo credits added!')
    }
  }

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Page Header */}
      <div style={{ padding: '48px 48px 0' }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#B8960C', marginBottom: '10px' }}>
          Account
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#0D0D0D', marginBottom: '20px' }}>
          Credits &amp; Plans
        </h1>
        <div style={{ width: '40px', height: '1px', background: '#B8960C' }} />
      </div>

      <div style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Current Balance Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DC', borderTop: '2px solid #B8960C', borderRadius: '4px', padding: '32px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            {/* Left */}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6B6B6B', marginBottom: '12px' }}>
                Current Balance
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '52px', fontWeight: 300, color: '#B8960C', lineHeight: 1, marginBottom: '20px' }}>
                {credits}
              </div>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#6B6B6B' }}>Credits remaining</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#AAAAAA' }}>{credits} / 100</span>
              </div>
              <div style={{ height: '2px', background: '#E8E4DC', borderRadius: '1px', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #B8960C, #DEC05A)', transition: 'width 0.5s ease' }} />
              </div>
            </div>
            {/* Right */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ display: 'inline-block', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: '2px', border: '1px solid #B8960C', color: '#B8960C', marginBottom: '12px' }}>
                {profile?.role || 'starter'} plan
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '24px', fontWeight: 300, color: '#0D0D0D', lineHeight: 1, marginBottom: '4px' }}>
                {profile?.total_generations || 0}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B6B6B' }}>
                Total Generations
              </div>
            </div>
          </div>
        </div>

        {/* Add Demo Credits */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <GhostButton onClick={addDemoCredits}>
            <Plus size={13} />
            Add 10 Demo Credits
          </GhostButton>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#AAAAAA', fontStyle: 'italic' }}>
            For testing purposes only
          </span>
        </div>

        {/* Pricing Section Header */}
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#B8960C', marginBottom: '8px' }}>
            Choose Your Plan
          </div>
          <div style={{ width: '32px', height: '1px', background: '#B8960C', marginBottom: '28px' }} />

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '16px' }}>
            {PLANS.map(plan => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>

        {/* How Credits Work */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: '4px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6B6B6B', marginBottom: '20px' }}>
            How Credits Work
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '24px' }}>
            {[
              { label: '1 Credit', desc: 'equals one generated model image' },
              { label: 'Never Expire', desc: 'Credits roll over each month' },
              { label: 'Instant Top-Up', desc: 'Credits added immediately on purchase' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: '#B8960C', marginBottom: '6px' }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#6B6B6B', lineHeight: 1.6 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlanCard({ plan }) {
  const [hovered, setHovered] = useState(false)
  const Icon = plan.icon

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: '#FFFFFF',
        border: plan.featured ? '1px solid #B8960C' : `1px solid ${hovered ? '#D4C9B0' : '#E8E4DC'}`,
        borderRadius: '4px',
        padding: '36px 28px',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 4px 12px rgba(0,0,0,0.08)'
          : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ background: '#B8960C', fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0D0D0D', padding: '4px 12px', borderRadius: '0 0 4px 4px' }}>
            {plan.badge}
          </div>
        </div>
      )}

      {/* Plan Name */}
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 300, color: '#0D0D0D', marginBottom: '16px', marginTop: plan.badge ? '16px' : '0' }}>
        {plan.name}
      </h2>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '40px', fontWeight: 300, color: '#B8960C', lineHeight: 1 }}>
          {plan.price}
        </span>
        {plan.price !== 'Free' && (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#6B6B6B' }}>/month</span>
        )}
      </div>

      {/* Credits */}
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', color: '#B8960C', marginBottom: '20px' }}>
        {plan.credits} credits
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#E8E4DC', marginBottom: '20px' }} />

      {/* Features */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Check size={13} style={{ color: '#B8960C', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#6B6B6B', lineHeight: 1.5 }}>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {plan.featured ? (
        <GoldButton onClick={() => toast.info('Payment integration coming soon!')}>
          Get {plan.name}
        </GoldButton>
      ) : (
        <OutlineButton onClick={() => plan.price === 'Free' ? null : toast.info('Payment integration coming soon!')}>
          {plan.price === 'Free' ? 'Current Plan' : `Get ${plan.name}`}
        </OutlineButton>
      )}
    </div>
  )
}

function GoldButton({ children, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: '44px',
        background: hovered ? 'linear-gradient(135deg, #C9A82C, #F0D98A)' : 'linear-gradient(135deg, #B8960C, #DEC05A)',
        border: 'none',
        borderRadius: '2px',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#0D0D0D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? '0 0 20px rgba(184,150,12,0.25)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

function OutlineButton({ children, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: '44px',
        background: hovered ? '#F8F5F0' : 'transparent',
        border: `1px solid ${hovered ? '#D4C9B0' : '#E8E4DC'}`,
        borderRadius: '2px',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: hovered ? '#0D0D0D' : '#6B6B6B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  )
}

function GhostButton({ children, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '11px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: hovered ? '#3A3A3A' : '#6B6B6B',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'color 0.2s ease',
        padding: '8px 0',
      }}
    >
      {children}
    </button>
  )
}
