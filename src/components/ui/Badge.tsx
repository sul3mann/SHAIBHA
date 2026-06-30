import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'gold' | 'slate' | 'success' | 'warning'
}

export function Badge({ children, tone = 'slate' }: BadgeProps) {
  const colors = {
    gold: 'bg-gold/10 text-gold',
    slate: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
  }

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[tone]}`}>{children}</span>
}
