import { useEffect, useMemo, useState } from 'react'
import { loadCustomers } from '../services/customerService'
import {
  createGoldReceivedEntry,
  loadGoldReceivedEntries,
  removeGoldReceivedFromLedger,
  saveGoldReceivedEntries,
  syncGoldReceivedToLedger,
  updateGoldReceivedEntry,
} from '../services/goldReceivedService'
import type { Customer } from '../types/customer'
import type { GoldReceivedEntry, GoldReceivedFormValues } from '../types/goldReceived'

export function useGoldReceived() {
  const [entries, setEntries] = useState<GoldReceivedEntry[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<GoldReceivedEntry | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GoldReceivedEntry | null>(null)

  useEffect(() => {
    setEntries(loadGoldReceivedEntries())
    setCustomers(loadCustomers())
  }, [])

  useEffect(() => {
    saveGoldReceivedEntries(entries)
  }, [entries])

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase()

    return entries
      .filter((entry) => {
        const matchesCustomer = !selectedCustomerId || entry.customerId === selectedCustomerId
        const matchesDate = !selectedDate || entry.date === selectedDate
        const matchesQuery =
          !query ||
          entry.description.toLowerCase().includes(query) ||
          entry.notes?.toLowerCase().includes(query) ||
          entry.goldType.toLowerCase().includes(query)

        return matchesCustomer && matchesDate && matchesQuery
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [entries, search, selectedCustomerId, selectedDate])

  const openCreate = () => {
    setSelectedEntry(null)
    setModalOpen(true)
  }

  const openEdit = (entry: GoldReceivedEntry) => {
    setSelectedEntry(entry)
    setModalOpen(true)
  }

  const closeModal = () => {
    setSelectedEntry(null)
    setModalOpen(false)
  }

  const saveEntry = (values: GoldReceivedFormValues) => {
    if (selectedEntry) {
      setEntries((current) =>
        current.map((entry) => (entry.id === selectedEntry.id ? updateGoldReceivedEntry(entry, values) : entry)),
      )
    } else {
      const createdEntry = createGoldReceivedEntry(values)
      setEntries((current) => [createdEntry, ...current])
      syncGoldReceivedToLedger(createdEntry)
    }

    closeModal()
  }

  const requestDeleteEntry = (entry: GoldReceivedEntry) => {
    setDeleteTarget(entry)
  }

  const cancelDelete = () => {
    setDeleteTarget(null)
  }

  const confirmDeleteEntry = () => {
    if (!deleteTarget) return
    setEntries((current) => current.filter((entry) => entry.id !== deleteTarget.id))
    removeGoldReceivedFromLedger(deleteTarget.customerId, deleteTarget.id)
    setDeleteTarget(null)
  }

  return {
    entries: filteredEntries,
    customers,
    search,
    setSearch,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedDate,
    setSelectedDate,
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
  }
}
