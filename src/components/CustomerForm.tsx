import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, ZoomIn } from 'lucide-react'
import { customerSchema, type Customer, type CustomerFormValues } from '../types/customer'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { useLanguage } from '../context/LanguageContext'
import { Modal } from './ui/Modal'
import { compressImageFile, formatBytes } from '../utils/imageCompression'
import { ZoomableImage } from './ui/ZoomableImage'

interface CustomerFormProps {
  customer: Customer | null
  onSave: (values: CustomerFormValues) => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const { t } = useLanguage()
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
  const [viewerOpen, setViewerOpen] = useState(false)
  const [photoMeta, setPhotoMeta] = useState<{ originalSizeBytes: number; compressedSizeBytes: number } | null>(null)

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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await compressImageFile(file)
      setValue('photo', result.dataUrl, { shouldDirty: true, shouldValidate: true })
      setPhotoMeta({ originalSizeBytes: result.originalSizeBytes, compressedSizeBytes: result.compressedSizeBytes })
    } catch {
      setPhotoMeta(null)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label={t('customerForm.fullName')} {...register('fullName')} error={errors.fullName?.message} />
        <Input label={t('customerForm.phoneNumber')} {...register('phoneNumber')} error={errors.phoneNumber?.message} />
        <Input label={t('customerForm.whatsappNumber')} {...register('whatsappNumber')} error={errors.whatsappNumber?.message} />
        <Input label={t('customerForm.city')} {...register('city')} error={errors.city?.message} />
      </div>

      <Input label={t('customerForm.address')} {...register('address')} error={errors.address?.message} />
      <Textarea label={t('customerForm.notes')} {...register('notes')} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-950">{t('customerForm.customerPhoto')}</p>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-gold">{t('customerForm.uploadPhoto')}</button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        {photo ? (
          <div className="space-y-3">
            <div className="relative w-32 overflow-hidden rounded-3xl border border-slate-200">
              <img src={photo} alt="Customer preview" className="h-32 w-32 object-cover" />
              <button type="button" onClick={() => setViewerOpen(true)} className="absolute left-2 top-2 rounded-full bg-slate-900/70 p-1 text-white">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setValue('photo', '', { shouldDirty: true, shouldValidate: true })} className="absolute right-2 top-2 rounded-full bg-rose-600 p-1 text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            {photoMeta ? (
              <p className="text-xs text-slate-500">
                {t('customerForm.noPhotoSelected')} · {formatBytes(photoMeta.originalSizeBytes)} → {formatBytes(photoMeta.compressedSizeBytes)}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">{t('customerForm.noPhotoSelected')}</div>
        )}
      </div>

      <Modal open={viewerOpen} title={t('customerForm.customerPhoto')} description="Compressed preview" onClose={() => setViewerOpen(false)}>
        {photo ? <ZoomableImage src={photo} alt="Customer full preview" /> : null}
      </Modal>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" type="button" onClick={onCancel}>
          {t('customerForm.cancel')}
        </Button>
        <Button type="submit">{customer ? t('customerForm.updateCustomer') : t('customerForm.addCustomer')}</Button>
      </div>
    </form>
  )
}
