import type { Customer, CustomerFormValues } from '../types/customer'

const STORAGE_KEY = 'shaibah_customers'

export function loadCustomers(): Customer[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Customer[]) : []
  } catch {
    return []
  }
}

export function saveCustomers(customers: Customer[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
}

export function createCustomerFromForm(data: CustomerFormValues): Customer {
  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...data,
  }
}

export function updateCustomerFromForm(customer: Customer, data: CustomerFormValues): Customer {
  return {
    ...customer,
    ...data,
    updatedAt: new Date().toISOString(),
  }
}
