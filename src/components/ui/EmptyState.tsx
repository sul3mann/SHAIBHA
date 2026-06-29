import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">{icon}</div>
      <div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6">{description}</p>
      </div>
    </div>
  )
}
