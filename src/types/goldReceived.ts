import { z } from 'zod'

export const goldReceivedSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  date: z.string().min(1, 'Date is required'),
  goldType: z.enum(['24K', '22K', '21K', '18K', 'Other']),
  weight: z.coerce.number().min(0.01, 'Weight must be greater than zero'),
  purity: z.string().min(1, 'Purity is required'),
  description: z.string().min(2, 'Description is required'),
  notes: z.string().optional(),
})

export type GoldReceivedFormValues = z.infer<typeof goldReceivedSchema>

export interface GoldReceivedEntry extends GoldReceivedFormValues {
  id: string
  createdAt: string
  updatedAt: string
}
