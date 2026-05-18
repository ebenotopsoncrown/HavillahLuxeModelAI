import { cn } from '../../lib/utils'

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded border border-[#E8E4DC] bg-white px-3 py-2 text-sm text-[#0D0D0D] focus:outline-none focus:border-[#B8960C] transition-colors cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function SelectOption({ value, children }) {
  return <option value={value} className="bg-white text-[#0D0D0D]">{children}</option>
}
