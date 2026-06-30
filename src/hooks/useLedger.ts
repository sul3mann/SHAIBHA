import { useEffect, useMemo, useState } from 'react'
import type { LedgerEntry } from '../types/ledger'
import { getCustomerLedger, LEDGER_CHANGED_EVENT } from '../services/ledgerService'

export function useLedger(customerId: string) {
  const [transactions, setTransactions] = useState<LedgerEntry[]>([])

  useEffect(() => {
    const syncTransactions = () => {
      setTransactions(getCustomerLedger(customerId))
    }

    syncTransactions()

    window.addEventListener(LEDGER_CHANGED_EVENT, syncTransactions)

    return () => {
      window.removeEventListener(LEDGER_CHANGED_EVENT, syncTransactions)
    }
  }, [customerId])

  return useMemo(() => ({ transactions }), [transactions])
}
