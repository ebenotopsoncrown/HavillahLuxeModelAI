import { cn } from '../../lib/utils'

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-[#F8F5F0] focus:outline-none focus:border-[#C6A052]/50 focus:ring-1 focus:ring-[#C6A052]/30 transition-colors cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function SelectOption({ value, children }) {
  return <option value={value} className="bg-[#1A1A1A] text-[#F8F5F0]">{children}</option>
}
