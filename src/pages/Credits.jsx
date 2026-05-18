import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { CreditCard, Zap, Crown, Building2, Check, Plus } from 'lucide-react'
import { toast } from 'sonner'

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    credits: 10,
    icon: Zap,
    features: ['10 credits included', 'Basic model generation', 'Standard quality', 'Community support'],
    badge: null,
  },
  {
    name: 'Premium',
    price: '£29',
    credits: 100,
    icon: Crown,
    features: ['100 credits', 'Priority generation', '8K quality output', 'Flyer Studio access', 'Listing generator', 'Email support'],
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: '£99',
    credits: 500,
    icon: Building2,
    features: ['500 credits', 'Bulk generation', 'API access', 'Custom model styles', 'White-label exports', 'Dedicated support'],
    badge: 'Best Value',
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F8F5F0]">Credits</h1>
        <p className="text-sm text-[#F8F5F0]/40 mt-1">Manage your generation credits</p>
      </div>

      {/* Current Balance */}
      <div className="rounded-2xl border border-[#C6A052]/30 bg-gradient-to-br from-[#C6A052]/10 to-[#3B2A1A]/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#C6A052]/20 flex items-center justify-center">
              <CreditCard size={22} className="text-[#C6A052]" />
            </div>
            <div>
              <p className="text-sm text-[#F8F5F0]/60">Current Balance</p>
              <p className="text-3xl font-bold text-[#C6A052]">{credits}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="gold">{profile?.role || 'user'} plan</Badge>
            <p className="text-xs text-[#F8F5F0]/40 mt-1">{profile?.total_generations || 0} total generations</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#F8F5F0]/50">
            <span>Credits used</span>
            <span>{credits} remaining</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#0D0D0D]/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C6A052] to-[#D4B872] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={addDemoCredits} className="border-[#C6A052]/30 text-[#C6A052] hover:bg-[#C6A052]/10">
            <Plus size={14} /> Add 10 Demo Credits
          </Button>
          <p className="text-[10px] text-[#F8F5F0]/30 mt-1.5">For testing purposes only</p>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-[#F8F5F0] mb-4">Upgrade Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => {
            const Icon = plan.icon
            return (
              <div
                key={plan.name}
                className={`rounded-2xl border p-5 relative ${
                  plan.name === 'Premium'
                    ? 'border-[#C6A052]/50 bg-gradient-to-b from-[#C6A052]/10 to-[#1A1A1A]'
                    : 'border-[#2A2A2A] bg-[#1A1A1A]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="gold">{plan.badge}</Badge>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.name === 'Premium' ? 'bg-[#C6A052]/20' : 'bg-[#2A2A2A]'}`}>
                    <Icon size={16} className={plan.name === 'Premium' ? 'text-[#C6A052]' : 'text-[#F8F5F0]/60'} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#F8F5F0]">{plan.name}</h3>
                    <p className="text-xs text-[#F8F5F0]/40">{plan.credits} credits</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-[#F8F5F0]">{plan.price}</span>
                  {plan.price !== 'Free' && <span className="text-sm text-[#F8F5F0]/40"> / month</span>}
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[#F8F5F0]/70">
                      <Check size={12} className="text-[#C6A052] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.name === 'Premium' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => toast.info('Payment integration coming soon!')}
                >
                  {plan.price === 'Free' ? 'Current Plan' : `Get ${plan.name}`}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
        <h3 className="text-sm font-semibold text-[#F8F5F0] mb-2">How Credits Work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: '1 credit', desc: '= 1 generated model image' },
            { label: 'Never expire', desc: 'Credits roll over each month' },
            { label: 'Instant top-up', desc: 'Credits added immediately' },
          ].map(item => (
            <div key={item.label} className="text-xs">
              <p className="font-semibold text-[#C6A052]">{item.label}</p>
              <p className="text-[#F8F5F0]/50 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
