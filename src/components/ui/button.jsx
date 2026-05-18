import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold font-montserrat transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A052] cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-[#C6A052] to-[#D4B872] text-[#0D0D0D] hover:shadow-lg hover:shadow-[#C6A052]/25 hover:-translate-y-0.5',
        outline: 'border border-[#2A2A2A] bg-transparent text-[#F8F5F0] hover:border-[#C6A052]/50 hover:bg-[#C6A052]/10',
        ghost: 'bg-transparent text-[#F8F5F0] hover:bg-[#2A2A2A]',
        destructive: 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30',
        gold_outline: 'border border-[#C6A052]/50 text-[#C6A052] bg-[#C6A052]/10 hover:bg-[#C6A052]/20',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
