import { cn } from '../../lib/utils'

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded border border-[#E8E4DC] bg-white px-3 py-2 text-sm text-[#0D0D0D] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#B8960C] transition-colors resize-none',
        className
      )}
      {...props}
    />
  )
}
