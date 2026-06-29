import type { Customer } from '../types/customer'
import type { GoldReceivedEntry, GoldReceivedFormValues } from '../types/goldReceived'

const STORAGE_KEY = 'shaibah_gold_received'

export function loadGoldReceivedEntries(): GoldReceivedEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as GoldReceivedEntry[]) : []
  } catch {
    return []
  }
}

export function saveGoldReceivedEntries(entries: GoldReceivedEntry[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function createGoldReceivedEntry(values: GoldReceivedFormValues): GoldReceivedEntry {
  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...values,
    weight: Number(values.weight),
  }
}

export function updateGoldReceivedEntry(entry: GoldReceivedEntry, values: GoldReceivedFormValues): GoldReceivedEntry {
  return {
    ...entry,
    ...values,
    weight: Number(values.weight),
    updatedAt: new Date().toISOString(),
  }
}

export function getCustomerName(customerId: string, customers: Customer[]) {
  return customers.find((customer) => customer.id === customerId)?.fullName ?? 'Unknown customer'
}

export function syncGoldReceivedToLedger(_entry: GoldReceivedEntry) {
  // This function is deprecated. Use ledgerService instead.
}

export function removeGoldReceivedFromLedger(_customerId: string, _entryId: string) {
  // This function is deprecated. Use ledgerService instead.
}
