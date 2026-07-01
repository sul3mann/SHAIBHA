import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { X } from 'lucide-react'
import { loadEntries } from '../services/entryService'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { entrySchema, formulaMethods, type Entry, type EntryFormValues } from '../types/entry'
import type { Customer } from '../types/customer'
import type { WorkshopSettings } from '../types/settings'
import { useEntryForm } from '../hooks/useEntryForm'
import { useLanguage } from '../context/LanguageContext'

interface EntryFormProps {
  entry: Entry | null
  customers: Customer[]
  settings: WorkshopSettings | null
  onSave: (values: EntryFormValues) => void
  onCancel: () => void
}

export function EntryForm({ entry, customers, settings, onSave, onCancel }: EntryFormProps) {
  const { t } = useLanguage()
  const {
    handleSubmit,
    reset,
    setValue,
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
  const navigate = useNavigate()
  const [customerQuery, setCustomerQuery] = useState('')
  const customerOptions = useMemo(() => {
    const query = customerQuery.trim().toLowerCase()
    return customers.filter((customer) => {
      if (!query) return true
      return [customer.fullName, customer.phoneNumber, customer.city, customer.address].join(' ').toLowerCase().includes(query)
    })
  }, [customerQuery, customers])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const entryMode = watch('entryMode')
  const invoiceEnabled = watch('invoiceEnabled')
  const weight24k = watch('weight24k')
  const weight21k = watch('weight21k')
  const labourWeight = watch('labourWeight21k')
  const labourRate = watch('labourRate')

  useEffect(() => {
    reset({
      customerId: entry?.customerId ?? '',
      date: entry?.date ?? new Date().toISOString().slice(0, 10),
      direction: entry?.direction ?? 'receive',
      entryMode: entry?.entryMode ?? 'gold',
      formulaMethod: entry?.formulaMethod ?? settings?.defaultFormula ?? 'method1',
      weight24k: entry?.weight24k ?? 0,
      weight21k: entry?.weight21k ?? 0,
      labourWeight21k: entry?.labourWeight21k ?? 0,
      labourRate: entry?.labourRate ?? 0,
      labourAmount: entry?.labourAmount ?? 0,
      vatEnabled: entry?.vatEnabled ?? false,
      vatAmount: entry?.vatAmount ?? 0,
      invoiceEnabled: entry?.invoiceEnabled ?? false,
      invoiceNumber: entry?.invoiceNumber ?? '',
      notes: entry?.notes ?? '',
      photos: entry?.photos ?? [],
    })
  }, [entry, settings, reset])

  const handleFieldChange = (field: keyof EntryFormValues, value: string | number | boolean | string[]) => {
    const normalizedValue = value
    const formula = formulaMethods[(formData.formulaMethod as keyof typeof formulaMethods) ?? 'method1']

    let nextWeight24k = formData.weight24k
    let nextWeight21k = formData.weight21k
    let nextLabourAmount = formData.labourAmount

    if (field === 'weight24k') {
      const parsedValue = Number(value)
      nextWeight21k = parsedValue > 0 ? String(parsedValue * formula.factor) : ''
      nextWeight24k = typeof normalizedValue === 'string' || typeof normalizedValue === 'number' ? normalizedValue : ''
    } else if (field === 'weight21k') {
      const parsedValue = Number(value)
      nextWeight24k = parsedValue > 0 ? String(parsedValue * formula.reverseFactor) : ''
      nextWeight21k = typeof normalizedValue === 'string' || typeof normalizedValue === 'number' ? normalizedValue : ''
    } else if (field === 'formulaMethod') {
      const current24k = Number(formData.weight24k)
      const current21k = Number(formData.weight21k)
      if (current24k > 0) {
        nextWeight21k = String(current24k * formula.factor)
      } else if (current21k > 0) {
        nextWeight24k = String(current21k * formula.reverseFactor)
      }
    } else if (field === 'labourWeight21k' || field === 'labourRate') {
      const labourWeight = Number(field === 'labourWeight21k' ? value : formData.labourWeight21k)
      const labourRate = Number(field === 'labourRate' ? value : formData.labourRate)
      nextLabourAmount = labourWeight > 0 && labourRate > 0 ? String(labourWeight * labourRate) : ''
    }

    updateField(field as keyof EntryFormValues, normalizedValue as never)
    setValue(field as keyof EntryFormValues, normalizedValue as never)

    if (field === 'weight24k' || field === 'weight21k' || field === 'formulaMethod') {
      setValue('weight24k', nextWeight24k as never)
      setValue('weight21k', nextWeight21k as never)
    }

    if (field === 'labourWeight21k' || field === 'labourRate') {
      setValue('labourAmount', nextLabourAmount as never)
    }
  }

  const generateInvoiceNumber = () => {
    const entries = loadEntries()
    const usedNumbers = entries
      .map((item) => item.invoiceNumber)
      .filter((value): value is string => typeof value === 'string' && /^INV-\d+$/.test(value))
      .map((value) => Number(value.replace('INV-', '')))

    const next = usedNumbers.length ? Math.max(...usedNumbers) + 1 : 1
    return `INV-${String(next).padStart(4, '0')}`
  }

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

  const formatDisplayValue = (value: number | string | null | undefined) => {
    const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '0'))
    if (!Number.isFinite(parsed)) return '0'
    return parsed.toString()
  }

  useEffect(() => {
    if (formData.invoiceEnabled && !formData.invoiceNumber) {
      handleFieldChange('invoiceNumber', generateInvoiceNumber())
    }
  }, [formData.invoiceEnabled, formData.invoiceNumber])

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-700">
            <span>{t('entryForm.customer')}</span>
            {customers.length === 0 ? (
              <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">{t('entryForm.createCustomerBefore')}</p>
                <Button type="button" variant="outline" onClick={() => navigate('/customers')}>
                  {t('entryForm.createCustomer')}
                </Button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={customerQuery}
                  onChange={(event) => setCustomerQuery(event.target.value)}
                  placeholder={t('entryForm.searchCustomer')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  value={formData.customerId}
                  onChange={(event) => handleFieldChange('customerId', event.target.value)}
                >
                  <option value="">{t('entryForm.selectCustomer')}</option>
                  {customerOptions.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName}
                    </option>
                  ))}
                </select>
              </>
            )}
            {errors.customerId ? <p className="text-xs text-rose-600">{errors.customerId.message}</p> : null}
          </label>
          <Input label={t('entryForm.date')} type="date" value={formData.date} onChange={(event) => handleFieldChange('date', event.target.value)} error={errors.date?.message} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2 text-sm text-slate-700">
            <span>{t('entryForm.direction')}</span>
            <div className="flex gap-2">
              {(['receive', 'give'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleFieldChange('direction', value)}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition ${formData.direction === value ? 'border-gold bg-gold text-black' : 'border-slate-200 bg-white text-slate-700 hover:border-gold'}`}
                >
                  {value === 'receive' ? t('entryForm.goldReceived') : t('entryForm.goldGiven')}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2 text-sm text-slate-700">
            <span>{t('entryForm.entryMode')}</span>
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'gold', label: t('entryForm.goldOnly') },
                { value: 'labour', label: t('entryForm.labourOnly') },
                { value: 'both', label: t('entryForm.goldPlusLabour') },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFieldChange('entryMode', option.value)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${formData.entryMode === option.value ? 'border-gold bg-gold text-black' : 'border-slate-200 bg-white text-slate-700 hover:border-gold'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="grid gap-2 text-sm text-slate-700">
          <span>{t('entryForm.conversionFormula')}</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(formulaMethods).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleFieldChange('formulaMethod', key)}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${formData.formulaMethod === key ? 'border-gold bg-gold text-black' : 'border-slate-200 bg-white text-slate-700 hover:border-gold'}`}
              >
                {value.label.replace('Method 1: ', '').replace('Method 2: ', '').replace('Method 3: ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(entryMode === 'gold' || entryMode === 'both') && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input label={t('entryForm.twentyFourKWeight')} type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*" value={weight24k ?? ''} onChange={(e) => handleFieldChange('weight24k', e.target.value)} />
            <Input label={t('entryForm.twentyOneKWeight')} type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*" value={weight21k ?? ''} onChange={(e) => handleFieldChange('weight21k', e.target.value)} />
          </div>
        </div>
      )}

      {(entryMode === 'labour' || entryMode === 'both') && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input label={t('entryForm.twentyOneKLabourWeight')} type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*" value={labourWeight ?? ''} onChange={(e) => handleFieldChange('labourWeight21k', e.target.value)} />
            <Input label={t('entryForm.labourRate')} type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*" value={labourRate ?? ''} onChange={(e) => handleFieldChange('labourRate', e.target.value)} />
            <div className="grid gap-2 text-sm text-slate-700">
              <span>{t('entryForm.labourAmount')}</span>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900">
                {formatDisplayValue(formData.labourAmount)} SAR
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={Boolean(formData.vatEnabled)} onChange={(event) => handleFieldChange('vatEnabled', event.target.checked)} className="h-4 w-4 rounded" />
            <span className="text-sm text-slate-700">{t('entryForm.enableVat')} ({settings?.vatPercentage ?? 15}%)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={Boolean(formData.invoiceEnabled)} onChange={(event) => handleFieldChange('invoiceEnabled', event.target.checked)} className="h-4 w-4 rounded" />
            <span className="text-sm text-slate-700">{t('entryForm.enableInvoice')}</span>
          </label>
        </div>
        {invoiceEnabled && (
          <Input
            label={t('entryForm.invoiceNumber')}
            value={formData.invoiceNumber ?? ''}
            onChange={(event) => handleFieldChange('invoiceNumber', event.target.value)}
            error={errors.invoiceNumber?.message}
          />
        )}
      </div>

      <div className="rounded-2xl border border-gold/20 bg-gold/5 p-3">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-700">{t('entryForm.gold')}:</span>
            <span className="font-medium text-slate-900">24K {formatDisplayValue(formData.weight24k)}g / 21K {formatDisplayValue(formData.weight21k)}g</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-700">{t('entryForm.labour')}:</span>
            <span className="font-medium text-slate-900">{formatDisplayValue(formData.labourAmount)} SAR</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-700">{t('entryForm.vat')}:</span>
            <span className="font-medium text-slate-900">{formatDisplayValue(formData.vatAmount)} SAR</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-700">{t('entryForm.invoice')}:</span>
            <span className="font-medium text-slate-900">{formData.invoiceNumber || '—'}</span>
          </div>
          <div className="border-t border-gold/20 pt-2 text-base font-semibold">
            <div className="flex items-center justify-between">
              <span>{t('entryForm.grandTotal')}:</span>
              <span className="text-gold">{formatDisplayValue(grandTotal)} SAR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600 transition hover:border-gold hover:bg-gold/5"
          >
            {t('entryForm.uploadPhotoHint')}
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

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <Textarea label={t('entryForm.notes')} value={formData.notes ?? ''} onChange={(event) => handleFieldChange('notes', event.target.value)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" type="button" onClick={onCancel}>
          {t('entryForm.cancel')}
        </Button>
        <Button type="submit">{entry ? t('entryForm.updateEntry') : t('entryForm.addEntry')}</Button>
      </div>
    </form>
  )
}
