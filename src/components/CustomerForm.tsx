import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { customerSchema, type Customer, type CustomerFormValues } from '../types/customer'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'

interface CustomerFormProps {
  customer: Customer | null
  onSave: (values: CustomerFormValues) => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      whatsappNumber: '',
      address: '',
      city: '',
      notes: '',
      photo: '',
    },
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photo = watch('photo')

  useEffect(() => {
    reset(
      customer
        ? {
            fullName: customer.fullName,
            phoneNumber: customer.phoneNumber,
            whatsappNumber: customer.whatsappNumber,
            address: customer.address,
            city: customer.city,
            notes: customer.notes ?? '',
            photo: customer.photo ?? '',
          }
        : {
            fullName: '',
            phoneNumber: '',
            whatsappNumber: '',
            address: '',
            city: '',
            notes: '',
            photo: '',
          },
    )
  }, [customer, reset])

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setValue('photo', reader.result as string, { shouldDirty: true, shouldValidate: true })
    }
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Full Name" {...register('fullName')} error={errors.fullName?.message} />
        <Input label="Phone Number" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
        <Input label="WhatsApp Number" {...register('whatsappNumber')} error={errors.whatsappNumber?.message} />
        <Input label="City" {...register('city')} error={errors.city?.message} />
      </div>

      <Input label="Address" {...register('address')} error={errors.address?.message} />
      <Textarea label="Notes" {...register('notes')} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-950">Customer photo</p>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-gold">Upload photo</button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        {photo ? (
          <div className="relative w-32 overflow-hidden rounded-3xl border border-slate-200">
            <img src={photo} alt="Customer preview" className="h-32 w-32 object-cover" />
            <button type="button" onClick={() => setValue('photo', '', { shouldDirty: true, shouldValidate: true })} className="absolute right-2 top-2 rounded-full bg-rose-600 p-1 text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">No photo selected yet.</div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{customer ? 'Update Customer' : 'Add Customer'}</Button>
      </div>
    </form>
  )
}
