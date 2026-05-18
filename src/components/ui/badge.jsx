import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-[#2A2A2A] text-[#F8F5F0]/70',
  gold: 'bg-[#C6A052]/15 text-[#C6A052] border border-[#C6A052]/30',
  success: 'bg-green-900/30 text-green-400 border border-green-700/30',
  warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30',
  destructive: 'bg-red-900/30 text-red-400 border border-red-700/30',
  premium: 'bg-gradient-to-r from-[#C6A052]/20 to-[#D4B872]/20 text-[#C6A052] border border-[#C6A052]/30',
}

export function Badge({ variant = 'default', className, children }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
