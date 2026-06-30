import { useEffect, useMemo, useState } from 'react'
import { loadCustomers } from '../services/customerService'
import { loadEntries, loadSettings, addEntry, updateExistingEntry, deleteEntry, duplicateEntry } from '../services/entryService'
import { LEDGER_CHANGED_EVENT } from '../services/ledgerService'
import { addNotification } from '../services/notificationService'
import { addActivityLogEntry } from '../services/activityService'
import type { Customer } from '../types/customer'
import type { Entry, EntryFormValues } from '../types/entry'
import type { WorkshopSettings } from '../types/settings'

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [settings, setSettings] = useState<WorkshopSettings | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedDirection, setSelectedDirection] = useState<'receive' | 'give' | ''>('')
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null)

  useEffect(() => {
    const syncData = () => {
      setEntries(loadEntries())
      setCustomers(loadCustomers())
      setSettings(loadSettings())
    }

    syncData()
    window.addEventListener(LEDGER_CHANGED_EVENT, syncData)

    return () => {
      window.removeEventListener(LEDGER_CHANGED_EVENT, syncData)
    }
  }, [])

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase()

    return entries
      .filter((entry) => {
        const matchesCustomer = !selectedCustomerId || entry.customerId === selectedCustomerId
        const matchesDate = !selectedDate || entry.date === selectedDate
        const matchesDirection = !selectedDirection || entry.direction === selectedDirection
        const matchesQuery = !query || entry.notes?.toLowerCase().includes(query) || entry.invoiceNumber?.toLowerCase().includes(query)

        return matchesCustomer && matchesDate && matchesDirection && matchesQuery
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [entries, search, selectedCustomerId, selectedDate, selectedDirection])

  const openCreate = () => {
    setSelectedEntry(null)
    setModalOpen(true)
  }

  const openEdit = (entry: Entry) => {
    setSelectedEntry(entry)
    setModalOpen(true)
  }

  const closeModal = () => {
    setSelectedEntry(null)
    setModalOpen(false)
  }

  const saveEntry = (values: EntryFormValues) => {
    if (!settings) return

    if (selectedEntry) {
      const updated = updateExistingEntry(selectedEntry, values, settings)
      setEntries((current) => current.map((entry) => (entry.id === selectedEntry.id ? updated : entry)))
      addNotification('Entry updated', 'success')
      addActivityLogEntry('Entry edited', `Edited entry for ${selectedEntry.customerId}`, 'System')
    } else {
      const created = addEntry(values, settings)
      setEntries((current) => [created, ...current])
      addNotification('Entry added', 'success')
      addActivityLogEntry('Entry added', `Added entry for ${values.customerId}`, 'System')
    }

    closeModal()
  }

  const requestDeleteEntry = (entry: Entry) => {
    setDeleteTarget(entry)
  }

  const cancelDelete = () => {
    setDeleteTarget(null)
  }

  const confirmDeleteEntry = () => {
    if (!deleteTarget) return
    deleteEntry(deleteTarget.id)
    setEntries((current) => current.filter((entry) => entry.id !== deleteTarget.id))
    addNotification('Entry deleted', 'warning')
    addActivityLogEntry('Entry deleted', `Deleted entry ${deleteTarget.id}`, 'System')
    setDeleteTarget(null)
  }

  const duplicateExistingEntry = (entry: Entry) => {
    if (!settings) return
    const duplicated = duplicateEntry(entry.id, settings)
    if (duplicated) {
      setEntries((current) => [duplicated, ...current])
      addNotification('Entry duplicated', 'info')
      addActivityLogEntry('Entry duplicated', `Duplicated entry ${entry.id}`, 'System')
    }
  }

  return {
    entries: filteredEntries,
    customers,
    settings,
    search,
    setSearch,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedDate,
    setSelectedDate,
    selectedDirection,
    setSelectedDirection,
    selectedEntry,
    isModalOpen,
    deleteTarget,
    openCreate,
    openEdit,
    closeModal,
    saveEntry,
    requestDeleteEntry,
    cancelDelete,
    confirmDeleteEntry,
    duplicateExistingEntry,
  }
}
