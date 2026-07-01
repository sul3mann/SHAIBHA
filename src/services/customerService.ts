import type { Customer, CustomerFormValues } from '../types/customer'
import { getCurrentSessionUser } from './authService'

export const STORAGE_KEY = 'shaibah_customers'

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
  const actor = getCurrentSessionUser()

  return {
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
    createdByName: actor?.fullName,
    createdByUsername: actor?.username,
    createdByRole: actor?.role,
    updatedByName: actor?.fullName,
    updatedByUsername: actor?.username,
    updatedByRole: actor?.role,
    ...data,
  }
}

export function updateCustomerFromForm(customer: Customer, data: CustomerFormValues): Customer {
  const actor = getCurrentSessionUser()
  return {
    ...customer,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedByName: actor?.fullName,
    updatedByUsername: actor?.username,
    updatedByRole: actor?.role,
  }
}
