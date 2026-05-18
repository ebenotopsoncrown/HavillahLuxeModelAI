import { cn } from '../../lib/utils'

export function Label({ className, ...props }) {
  return (
    <label
      className={cn('text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5 block', className)}
      {...props}
    />
  )
}
