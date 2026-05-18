import { cn } from '../../lib/utils'

export function Progress({ value = 0, className }) {
  return (
    <div className={cn('h-2 w-full rounded-full bg-[#2A2A2A] overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#C6A052] to-[#D4B872] transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
