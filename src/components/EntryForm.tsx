import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { X } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { entrySchema, formulaMethods, type Entry, type EntryFormValues } from '../types/entry'
import type { Customer } from '../types/customer'
import type { WorkshopSettings } from '../types/settings'
import { useEntryForm } from '../hooks/useEntryForm'

interface EntryFormProps {
  entry: Entry | null
  customers: Customer[]
  settings: WorkshopSettings | null
  onSave: (values: EntryFormValues) => void
  onCancel: () => void
}

export function EntryForm({ entry, customers, settings, onSave, onCancel }: EntryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema) as Resolver<EntryFormValues>,
    defaultValues: {
      customerId: '',
      date: new Date().toISOString().slice(0, 10),
      direction: 'receive',
      entryMode: 'gold',
      formulaMethod: 'method1',
      weight24k: 0,
      weight21k: 0,
      labourWeight21k: 0,
      labourRate: 0,
      labourAmount: 0,
      vatEnabled: false,
      vatAmount: 0,
      invoiceEnabled: false,
      invoiceNumber: '',
      notes: '',
      photos: [],
    },
  })

  const { formData, updateField, calculateGrandTotal } = useEntryForm(entry, settings)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const entryMode = watch('entryMode')
  const invoiceEnabled = watch('invoiceEnabled')
  const vatEnabled = watch('vatEnabled')
  const weight24k = watch('weight24k')
  const weight21k = watch('weight21k')
  const labourWeight = watch('labourWeight21k')
  const labourRate = watch('labourRate')

  useEffect(() => {
    reset(formData)
  }, [entry, settings, reset, formData])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        updateField('photos', [...(formData.photos || []), base64])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    const updated = formData.photos?.filter((_, i) => i !== index) || []
    updateField('photos', updated)
  }

  const grandTotal = calculateGrandTotal()

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-8">
      <div className="space-y-6 border-b border-slate-200 pb-6">
        <h3 className="text-lg font-semibold text-slate-950">Customer & Date</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-700">
            <span>Customer</span>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              {...register('customerId')}
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </select>
            {errors.customerId ? <p className="text-xs text-rose-600">{errors.customerId.message}</p> : null}
          </label>
          <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
        </div>
      </div>

      <div className="space-y-6 border-b border-slate-200 pb-6">
        <h3 className="text-lg font-semibold text-slate-950">Transaction Type</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-700">
            <span>Direction</span>
            <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20" {...register('direction')}>
              <option value="receive">Receive</option>
              <option value="give">Give</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            <span>Entry Mode</span>
            <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20" {...register('entryMode')}>
              <option value="gold">Gold Only</option>
              <option value="labour">Labour Only</option>
              <option value="both">Both</option>
            </select>
          </label>
        </div>
      </div>

      <div className="space-y-6 border-b border-slate-200 pb-6">
        <h3 className="text-lg font-semibold text-slate-950">Gold Formula</h3>
        <label className="grid gap-2 text-sm text-slate-700">
          <span>Conversion Formula</span>
          <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20" {...register('formulaMethod')}>
            {Object.entries(formulaMethods).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(entryMode === 'gold' || entryMode === 'both') && (
        <div className="space-y-6 border-b border-slate-200 pb-6">
          <h3 className="text-lg font-semibold text-slate-950">Gold Weight</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="24K Weight (g)" type="number" step="0.01" value={weight24k} onChange={(e) => updateField('weight24k', parseFloat(e.target.value) || 0)} />
            <Input label="21K Weight (g)" type="number" step="0.01" value={weight21k} onChange={(e) => updateField('weight21k', parseFloat(e.target.value) || 0)} />
          </div>
        </div>
      )}

      {(entryMode === 'labour' || entryMode === 'both') && (
        <div className="space-y-6 border-b border-slate-200 pb-6">
          <h3 className="text-lg font-semibold text-slate-950">Labour</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="21K Labour Weight (g)" type="number" step="0.01" value={labourWeight} onChange={(e) => updateField('labourWeight21k', parseFloat(e.target.value) || 0)} />
            <Input label="Labour Rate (SAR/g)" type="number" step="0.01" value={labourRate} onChange={(e) => updateField('labourRate', parseFloat(e.target.value) || 0)} />
            <div className="grid gap-2 text-sm text-slate-700">
              <span>Labour Amount</span>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                {(formData.labourAmount ?? 0).toFixed(2)} SAR
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 border-b border-slate-200 pb-6">
        <h3 className="text-lg font-semibold text-slate-950">VAT & Invoice</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3">
            <input type="checkbox" {...register('vatEnabled')} className="h-4 w-4 rounded" />
            <span className="text-sm text-slate-700">Enable VAT ({settings?.vatPercentage ?? 15}%)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" {...register('invoiceEnabled')} className="h-4 w-4 rounded" />
            <span className="text-sm text-slate-700">Enable Invoice</span>
          </label>
        </div>
        {invoiceEnabled && <Input label="Invoice Number" {...register('invoiceNumber')} error={errors.invoiceNumber?.message} />}
      </div>

      <div className="space-y-6 border-b border-slate-200 pb-6">
        <h3 className="text-lg font-semibold text-slate-950">Summary</h3>
        <div className="grid gap-3 rounded-3xl border border-gold/20 bg-gold/5 p-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-700">Labour Amount:</span>
            <span className="font-medium text-slate-900">{(formData.labourAmount ?? 0).toFixed(2)} SAR</span>
          </div>
          {vatEnabled && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">VAT ({settings?.vatPercentage ?? 15}%):</span>
              <span className="font-medium text-slate-900">{(formData.vatAmount ?? 0).toFixed(2)} SAR</span>
            </div>
          )}
          <div className="border-t border-gold/20 pt-3 text-lg font-semibold">
            <div className="flex justify-between">
              <span>Grand Total:</span>
              <span className="text-gold">{grandTotal.toFixed(2)} SAR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 border-b border-slate-200 pb-6">
        <h3 className="text-lg font-semibold text-slate-950">Photos</h3>
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600 transition hover:border-gold hover:bg-gold/5"
          >
            Click to upload or drag and drop photos
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />

          {formData.photos && formData.photos.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img src={photo} alt={`preview-${index}`} className="h-32 w-full rounded-2xl object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute right-2 top-2 rounded-full bg-rose-600 p-1 text-white hover:bg-rose-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Textarea label="Notes" {...register('notes')} />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{entry ? 'Update Entry' : 'Add Entry'}</Button>
      </div>
    </form>
  )
}
