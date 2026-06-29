import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-8 shadow-soft">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
              {cancelLabel}
            </Button>
            <Button variant="primary" onClick={onConfirm} className="w-full sm:w-auto">
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
