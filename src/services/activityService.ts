import { loadCustomers, saveCustomers } from './customerService'
import { loadEntries, saveEntries } from './entryService'
import { loadLedger, saveLedger } from './ledgerService'
import type { Customer } from '../types/customer'
import type { Entry } from '../types/entry'
import type { LedgerEntry } from '../types/ledger'
import type { WorkshopSettings } from '../types/settings'
import { loadSettings, saveSettings } from './entryService'

export interface ActivityLogEntry {
  id: string
  action: string
  details: string
  createdAt: string
  createdBy?: string
}

export interface BackupPayload {
  version: number
  exportedAt: string
  customers: Customer[]
  entries: Entry[]
  settings: WorkshopSettings
  ledger: LedgerEntry[]
  notifications: Array<{
    id: string
    message: string
    type: 'info' | 'success' | 'warning'
    createdAt: string
  }>
  activityLog: ActivityLogEntry[]
}

const STORAGE_KEY = 'shaibah_activity_log'
const BACKUP_DATE_KEY = 'shaibah_last_backup_date'
export const ACTIVITY_LOG_CHANGED_EVENT = 'shaibah:activity-log-changed'

function emitActivityLogChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ACTIVITY_LOG_CHANGED_EVENT))
  }
}

function getNotificationsStorageKey() {
  return 'shaibah_notifications'
}

export function loadActivityLog(): ActivityLogEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ActivityLogEntry[]) : []
  } catch {
    return []
  }
}

export function saveActivityLog(entries: ActivityLogEntry[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  emitActivityLogChanged()
}

export function addActivityLogEntry(action: string, details: string, createdBy = 'System') {
  const entries = loadActivityLog()
  const nextEntry: ActivityLogEntry = {
    id: crypto.randomUUID(),
    action,
    details,
    createdAt: new Date().toISOString(),
    createdBy,
  }

  const next = [nextEntry, ...entries].slice(0, 300)
  saveActivityLog(next)
  return nextEntry
}

export function clearActivityLog() {
  saveActivityLog([])
}

export function getLastBackupDate() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(BACKUP_DATE_KEY)
}

export function setLastBackupDate(value: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BACKUP_DATE_KEY, value)
}

export function buildBackupPayload(): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    customers: loadCustomers(),
    entries: loadEntries(),
    settings: loadSettings(),
    ledger: loadLedger(),
    notifications: loadNotifications(),
    activityLog: loadActivityLog(),
  }
}

export function exportBackupJson(payload: BackupPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'shaibah-warsha-backup.json'
  link.click()
  URL.revokeObjectURL(url)
}

export function validateBackupPayload(payload: unknown): payload is BackupPayload {
  if (!payload || typeof payload !== 'object') return false
  const candidate = payload as Partial<BackupPayload>
  return Array.isArray(candidate.customers) && Array.isArray(candidate.entries) && !!candidate.settings && Array.isArray(candidate.ledger)
}

export function importBackupPayload(payload: BackupPayload) {
  if (!validateBackupPayload(payload)) return false

  saveCustomers(payload.customers)
  saveEntries(payload.entries)
  saveSettings(payload.settings)
  saveLedger(payload.ledger)
  saveNotifications(payload.notifications)
  saveActivityLog(payload.activityLog)
  setLastBackupDate(new Date().toISOString())
  return true
}

export function loadNotifications() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(getNotificationsStorageKey())
    return raw ? (JSON.parse(raw) as Array<{ id: string; message: string; type: 'info' | 'success' | 'warning'; createdAt: string }>) : []
  } catch {
    return []
  }
}

export function saveNotifications(notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'warning'; createdAt: string }>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getNotificationsStorageKey(), JSON.stringify(notifications))
}

export function clearAllWorkspaceData() {
  if (typeof window === 'undefined') return

  const keysToRemove = [
    'shaibah_customers',
    'shaibah_entries',
    'shaibah_settings',
    'shaibah_ledger',
    'shaibah_notifications',
    'shaibah_activity_log',
    'shaibah_last_backup_date',
    'shaibah_gold_received_entries',
  ]

  keysToRemove.forEach((key) => window.localStorage.removeItem(key))
  window.dispatchEvent(new Event('storage'))
}
