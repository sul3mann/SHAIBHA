import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { goldReceivedSchema, type GoldReceivedEntry, type GoldReceivedFormValues } from '../types/goldReceived'
import type { Customer } from '../types/customer'

interface GoldReceivedFormProps {
  entry: GoldReceivedEntry | null
  customers: Customer[]
  onSave: (values: GoldReceivedFormValues) => void
  onCancel: () => void
}

export function GoldReceivedForm({ entry, customers, onSave, onCancel }: GoldReceivedFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoldReceivedFormValues>({
    resolver: zodResolver(goldReceivedSchema) as Resolver<GoldReceivedFormValues>,
    defaultValues: {
      customerId: '',
      date: new Date().toISOString().slice(0, 10),
      goldType: '24K',
      weight: 0,
      purity: '24',
      description: '',
      notes: '',
    },
  })

  useEffect(() => {
    reset(
      entry ?? {
        customerId: '',
        date: new Date().toISOString().slice(0, 10),
        goldType: '24K',
        weight: 0,
        purity: '24',
        description: '',
        notes: '',
      },
    )
  }, [entry, reset])

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
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
        <label className="grid gap-2 text-sm text-slate-700">
          <span>Gold Type</span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            {...register('goldType')}
          >
            <option value="24K">24K</option>
            <option value="22K">22K</option>
            <option value="21K">21K</option>
            <option value="18K">18K</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <Input label="Weight (grams)" type="number" step="0.01" {...register('weight', { valueAsNumber: true })} error={errors.weight?.message} />
        <Input label="Purity" {...register('purity')} error={errors.purity?.message} />
      </div>

      <Input label="Description" {...register('description')} error={errors.description?.message} />
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
