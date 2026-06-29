import type { InputHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | undefined
}

export function Input({ label, className, error, ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      {label && <span>{label}</span>}
      <input
        className={classNames(
          'w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20',
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${props.id ?? props.name}-error` : undefined}
        {...props}
      />
      {error ? <p id={`${props.id ?? props.name}-error`} className="text-xs text-rose-600">{error}</p> : null}
    </label>
  )
}
