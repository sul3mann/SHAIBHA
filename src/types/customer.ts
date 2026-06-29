import { z } from 'zod'

export const customerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().min(7, 'Phone number is required'),
  whatsappNumber: z.string().min(7, 'WhatsApp number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  notes: z.string().optional(),
  photo: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

export interface Customer extends CustomerFormValues {
  id: string
  createdAt: string
  updatedAt: string
}

export interface CustomerWithLedger extends Customer {
  goldReceivedTotal: number
  goldGivenTotal: number
  labourTotal: number
  vatTotal: number
  balance: number
  totalTransactions: number
}
