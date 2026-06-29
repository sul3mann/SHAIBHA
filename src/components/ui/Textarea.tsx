import type { TextareaHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      {label && <span>{label}</span>}
      <textarea
        className={classNames(
          'min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20',
          className,
        )}
        {...props}
      />
    </label>
  )
}
