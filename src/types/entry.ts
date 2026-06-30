import { z } from 'zod'

export type FormulaMethod = 'method1' | 'method2' | 'method3'
export type Direction = 'receive' | 'give'
export type EntryMode = 'gold' | 'labour' | 'both'

export const formulaMethods = {
  method1: { label: 'Method 1: 21K = 24K × 1.14', factor: 1.14, reverseFactor: 1 / 1.14 },
  method2: { label: 'Method 2: 21K = 24K × 1.142', factor: 1.142, reverseFactor: 1 / 1.142 },
  method3: { label: 'Method 3: 21K = 24K × (24/21)', factor: 24 / 21, reverseFactor: 21 / 24 },
}

export const entrySchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  date: z.string().min(1, 'Date is required'),
  direction: z.enum(['receive', 'give'] as const),
  entryMode: z.enum(['gold', 'labour', 'both'] as const),
  formulaMethod: z.enum(['method1', 'method2', 'method3'] as const),
  weight24k: z.union([z.string(), z.coerce.number()]).optional(),
  weight21k: z.union([z.string(), z.coerce.number()]).optional(),
  labourWeight21k: z.union([z.string(), z.coerce.number()]).optional(),
  labourRate: z.union([z.string(), z.coerce.number()]).optional(),
  labourAmount: z.union([z.string(), z.coerce.number()]).optional(),
  vatEnabled: z.boolean().default(false),
  vatAmount: z.union([z.string(), z.coerce.number()]).optional(),
  invoiceEnabled: z.boolean().default(false),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).default([]),
})

export type EntryFormValues = z.infer<typeof entrySchema>

export interface Entry extends EntryFormValues {
  id: string
  grandTotal: number
  createdAt: string
  updatedAt: string
}
