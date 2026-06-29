import type { ReactNode } from 'react'
import { classNames } from '../../utils/classNames'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={classNames('rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-soft', className)}>
      {children}
    </div>
  )
}
