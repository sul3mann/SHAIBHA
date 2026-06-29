// This file is deprecated. Use ledgerService instead.

export function getLedgerStorage(): Record<string, any[]> {
  return {}
}

export function saveLedgerStorage(_data: Record<string, any[]>) {
  // Deprecated
}

export function getCustomerLedger(_customerId: string): any[] {
  return []
}

export function upsertCustomerLedger(_customerId: string, _transactions: any[]) {
  // Deprecated
}

export function createCustomerProfile(overrides: Partial<any> = {}): any {
  return {
    id: overrides.id ?? `cust-${Math.random().toString(36).slice(2, 10)}`,
    fullName: overrides.fullName ?? 'New Customer',
    phoneNumber: overrides.phoneNumber ?? '',
    whatsappNumber: overrides.whatsappNumber ?? '',
    address: overrides.address ?? '',
    city: overrides.city ?? '',
    notes: overrides.notes ?? '',
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  }
}
