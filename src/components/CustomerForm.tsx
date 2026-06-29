import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
    },
  })

  useEffect(() => {
    reset(customer ?? {
      fullName: '',
      phoneNumber: '',
      whatsappNumber: '',
      address: '',
      city: '',
      notes: '',
    })
  }, [customer, reset])

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

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{customer ? 'Update Customer' : 'Add Customer'}</Button>
      </div>
    </form>
  )
}
