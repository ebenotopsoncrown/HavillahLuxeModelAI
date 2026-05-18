import { cn } from '../../lib/utils'

export function Label({ className, ...props }) {
  return (
    <label
      className={cn('text-xs font-medium text-[#F8F5F0]/60 uppercase tracking-wider mb-1.5 block', className)}
      {...props}
    />
  )
}
