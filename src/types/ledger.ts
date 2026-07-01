export interface LedgerEntry {
  id: string
  entryId: string
  customerId: string
  date: string
  direction: 'receive' | 'give'
  entryMode: 'gold' | 'labour' | 'both'
  formulaMethod: string
  weight24k: number
  weight21k: number
  labourWeight21k: number
  labourRate: number
  labourAmount: number
  vatEnabled: boolean
  vatAmount: number
  invoiceEnabled: boolean
  invoiceNumber?: string
  notes: string
  photos: string[]
  createdBy?: string
  createdAt: string
  grandTotal: number
  enteredByName?: string
  enteredByUsername?: string
  enteredByRole?: string
  updatedByName?: string
  updatedByUsername?: string
  updatedByRole?: string
}

export interface CustomerLedgerSummary {
  customerId: string
  goldReceivedTotal: number
  goldGivenTotal: number
  labourTotal: number
  vatTotal: number
  balance: number
  totalTransactions: number
}

