import type { Entry, EntryFormValues } from '../types/entry'
import { formulaMethods } from '../types/entry'
import type { WorkshopSettings } from '../types/settings'
import { defaultSettings } from '../types/settings'
import { syncEntryToLedger, removeEntryFromLedger, clearLedger } from './ledgerService'
import { getCurrentSessionUser } from './authService'

export const ENTRIES_STORAGE_KEY = 'shaibah_entries'
export const SETTINGS_STORAGE_KEY = 'shaibah_settings'

export function loadEntries(): Entry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ENTRIES_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Entry[]) : []
  } catch {
    return []
  }
}

export function saveEntries(entries: Entry[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries))
}

export function loadSettings(): WorkshopSettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WorkshopSettings) : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: WorkshopSettings) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function createEntry(values: EntryFormValues, settings: WorkshopSettings): Entry {
  const timestamp = new Date().toISOString()
  const actor = getCurrentSessionUser()
  const formula = formulaMethods[values.formulaMethod]

  let weight24k = Number(values.weight24k ?? 0)
  let weight21k = Number(values.weight21k ?? 0)
  let labourAmount = Number(values.labourAmount ?? 0)

  if (values.entryMode === 'gold' || values.entryMode === 'both') {
    if (weight24k > 0 && weight21k === 0) {
      weight21k = weight24k * formula.factor
    } else if (weight21k > 0 && weight24k === 0) {
      weight24k = weight21k * formula.reverseFactor
    }
  }

  if (values.entryMode === 'labour' || values.entryMode === 'both') {
    labourAmount = Number(values.labourWeight21k ?? 0) * Number(values.labourRate ?? 0)
  }

  let vatAmount = 0
  if (values.vatEnabled) {
    vatAmount = labourAmount * (settings.vatPercentage / 100)
  }

  const grandTotal = labourAmount + vatAmount

  return {
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
    enteredByName: actor?.fullName,
    enteredByUsername: actor?.username,
    enteredByRole: actor?.role,
    updatedByName: actor?.fullName,
    updatedByUsername: actor?.username,
    updatedByRole: actor?.role,
    ...values,
    weight24k,
    weight21k,
    labourAmount,
    vatAmount,
    grandTotal,
  }
}

export function updateEntry(entry: Entry, values: EntryFormValues, settings: WorkshopSettings): Entry {
  const actor = getCurrentSessionUser()
  const formula = formulaMethods[values.formulaMethod]

  let weight24k = Number(values.weight24k ?? 0)
  let weight21k = Number(values.weight21k ?? 0)
  let labourAmount = Number(values.labourAmount ?? 0)

  if (values.entryMode === 'gold' || values.entryMode === 'both') {
    if (weight24k > 0 && weight21k === 0) {
      weight21k = weight24k * formula.factor
    } else if (weight21k > 0 && weight24k === 0) {
      weight24k = weight21k * formula.reverseFactor
    }
  }

  if (values.entryMode === 'labour' || values.entryMode === 'both') {
    labourAmount = Number(values.labourWeight21k ?? 0) * Number(values.labourRate ?? 0)
  }

  let vatAmount = 0
  if (values.vatEnabled) {
    vatAmount = labourAmount * (settings.vatPercentage / 100)
  }

  const grandTotal = labourAmount + vatAmount

  return {
    ...entry,
    ...values,
    updatedByName: actor?.fullName,
    updatedByUsername: actor?.username,
    updatedByRole: actor?.role,
    weight24k,
    weight21k,
    labourAmount,
    vatAmount,
    grandTotal,
    updatedAt: new Date().toISOString(),
  }
}

export function clearAllData() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ENTRIES_STORAGE_KEY)
  window.localStorage.removeItem(SETTINGS_STORAGE_KEY)
  clearLedger()
}

export function exportData() {
  const entries = loadEntries()
  const settings = loadSettings()
  return JSON.stringify({ entries, settings }, null, 2)
}

export function importData(jsonString: string) {
  try {
    const data = JSON.parse(jsonString)
    if (data.entries && Array.isArray(data.entries)) {
      saveEntries(data.entries)
    }
    if (data.settings) {
      saveSettings(data.settings)
    }
    return true
  } catch {
    return false
  }
}

export function addEntry(values: EntryFormValues, settings: WorkshopSettings): Entry {
  const entries = loadEntries()
  const entry = createEntry(values, settings)
  entries.push(entry)
  saveEntries(entries)
  syncEntryToLedger(entry)
  return entry
}

export function updateExistingEntry(entry: Entry, values: EntryFormValues, settings: WorkshopSettings): Entry {
  const entries = loadEntries()
  const updated = updateEntry(entry, values, settings)
  const index = entries.findIndex((e) => e.id === entry.id)
  if (index !== -1) {
    entries[index] = updated
  }
  saveEntries(entries)
  syncEntryToLedger(updated)
  return updated
}

export function deleteEntry(entryId: string) {
  const actor = getCurrentSessionUser()
  const entries = loadEntries()
  const nextEntries = entries.map((entry) => (entry.id === entryId ? { ...entry, isDeleted: true, deletedAt: new Date().toISOString(), deletedByName: actor?.fullName, deletedByUsername: actor?.username, deletedByRole: actor?.role } : entry))
  saveEntries(nextEntries)
  removeEntryFromLedger(entryId)
}

export function duplicateEntry(entryId: string, settings: WorkshopSettings): Entry | null {
  const entries = loadEntries()
  const entry = entries.find((e) => e.id === entryId)
  if (!entry) return null

  const newEntry = createEntry(entry, settings)
  entries.push(newEntry)
  saveEntries(entries)
  syncEntryToLedger(newEntry)
  return newEntry
}

export function clearAllDataWithLedger() {
  clearAllData()
  clearLedger()
}
