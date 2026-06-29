import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { classNames } from '../../utils/classNames'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'outline'
}

export function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-gold/50',
        variant === 'primary' && 'bg-gold text-black shadow-soft hover:bg-[#b58d2e]',
        variant === 'outline' && 'border border-slate-300 bg-white text-slate-900 hover:border-black',
        variant === 'ghost' && 'bg-transparent text-slate-900 hover:bg-slate-100',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
