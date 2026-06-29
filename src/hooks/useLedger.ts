import { useEffect, useMemo, useState } from 'react'
import type { LedgerEntry } from '../types/ledger'
import { getCustomerLedger } from '../services/ledgerService'

export function useLedger(customerId: string) {
  const [transactions, setTransactions] = useState<LedgerEntry[]>([])

  useEffect(() => {
    setTransactions(getCustomerLedger(customerId))
  }, [customerId])

  return useMemo(() => ({ transactions }), [transactions])
}
