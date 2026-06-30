import type { LedgerEntry, CustomerLedgerSummary } from '../types/ledger'
import type { Entry } from '../types/entry'

const LEDGER_STORAGE_KEY = 'shaibah_ledger'
export const LEDGER_CHANGED_EVENT = 'shaibah:ledger-changed'

function emitLedgerChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LEDGER_CHANGED_EVENT))
  }
}

export function loadLedger(): LedgerEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LEDGER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LedgerEntry[]) : []
  } catch {
    return []
  }
}

export function saveLedger(ledger: LedgerEntry[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger))
  emitLedgerChanged()
}

export function syncEntryToLedger(entry: Entry) {
  const ledger = loadLedger()
  const existingIndex = ledger.findIndex((l) => l.entryId === entry.id)

  const ledgerEntry: LedgerEntry = {
    id: crypto.randomUUID(),
    entryId: entry.id,
    customerId: entry.customerId,
    date: entry.date,
    direction: entry.direction,
    entryMode: entry.entryMode,
    formulaMethod: entry.formulaMethod,
    weight24k: Number(entry.weight24k ?? 0),
    weight21k: Number(entry.weight21k ?? 0),
    labourWeight21k: Number(entry.labourWeight21k ?? 0),
    labourRate: Number(entry.labourRate ?? 0),
    labourAmount: Number(entry.labourAmount ?? 0),
    vatEnabled: entry.vatEnabled,
    vatAmount: Number(entry.vatAmount ?? 0),
    invoiceEnabled: entry.invoiceEnabled,
    invoiceNumber: entry.invoiceNumber,
    notes: entry.notes ?? '',
    photos: entry.photos ?? [],
    createdAt: entry.createdAt,
    createdBy: 'System',
    grandTotal: entry.grandTotal,
  }

  if (existingIndex !== -1) {
    ledger[existingIndex] = ledgerEntry
  } else {
    ledger.push(ledgerEntry)
  }

  saveLedger(ledger)
}

export function removeEntryFromLedger(entryId: string) {
  const ledger = loadLedger()
  const filtered = ledger.filter((l) => l.entryId !== entryId)
  saveLedger(filtered)
}

export function getCustomerLedger(customerId: string): LedgerEntry[] {
  const ledger = loadLedger()
  return ledger.filter((l) => l.customerId === customerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function calculateCustomerLedgerSummary(customerId: string): CustomerLedgerSummary {
  const ledger = getCustomerLedger(customerId)

  let goldReceivedTotal = 0
  let goldGivenTotal = 0
  let labourTotal = 0
  let vatTotal = 0

  ledger.forEach((entry) => {
    if (entry.direction === 'receive') {
      goldReceivedTotal += entry.weight21k
    } else {
      goldGivenTotal += entry.weight21k
    }
    labourTotal += entry.labourAmount
    vatTotal += entry.vatAmount
  })

  const balance = goldReceivedTotal - goldGivenTotal

  return {
    customerId,
    goldReceivedTotal,
    goldGivenTotal,
    labourTotal,
    vatTotal,
    balance,
    totalTransactions: ledger.length,
  }
}

export function clearLedger() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(LEDGER_STORAGE_KEY)
}
