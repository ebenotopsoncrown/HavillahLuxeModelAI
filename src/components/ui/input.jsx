import { cn } from '../../lib/utils'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-[#F8F5F0] placeholder:text-[#F8F5F0]/30 focus:outline-none focus:border-[#C6A052]/50 focus:ring-1 focus:ring-[#C6A052]/30 transition-colors',
        className
      )}
      {...props}
    />
  )
}
