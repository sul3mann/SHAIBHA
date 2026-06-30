import { useEffect, useMemo, useState } from 'react'
import {
  createCustomerFromForm,
  loadCustomers,
  saveCustomers,
  updateCustomerFromForm,
} from '../services/customerService'
import { addNotification } from '../services/notificationService'
import type { Customer, CustomerFormValues } from '../types/customer'

export type CustomerSortKey = 'fullName' | 'city' | 'createdAt' | 'updatedAt'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<CustomerSortKey>('updatedAt')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  useEffect(() => {
    setCustomers(loadCustomers())
  }, [])

  useEffect(() => {
    saveCustomers(customers)
  }, [customers])

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matched = customers.filter((customer) => {
      return [
        customer.fullName,
        customer.phoneNumber,
        customer.whatsappNumber,
        customer.address,
        customer.city,
        customer.notes || '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })

    return matched.sort((a, b) => {
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime()
      }

      return a[sortBy].localeCompare(b[sortBy])
    })
  }, [customers, search, sortBy])

  const openCreate = () => {
    setSelectedCustomer(null)
    setModalOpen(true)
  }

  const openEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setModalOpen(true)
  }

  const closeModal = () => {
    setSelectedCustomer(null)
    setModalOpen(false)
  }

  const saveCustomer = (values: CustomerFormValues) => {
    if (selectedCustomer) {
      setCustomers((current) => {
        const updated = current.map((customer) =>
          customer.id === selectedCustomer.id
            ? updateCustomerFromForm(customer, values)
            : customer,
        )
        addNotification(`Customer updated: ${values.fullName}`, 'success')
        return updated
      })
    } else {
      const duplicate = customers.some((customer) => customer.fullName.toLowerCase() === values.fullName.toLowerCase())
      if (duplicate) {
        addNotification('Customer already exists', 'warning')
        return
      }
      setCustomers((current) => {
        const created = createCustomerFromForm(values)
        addNotification(`Customer added: ${created.fullName}`, 'success')
        return [created, ...current]
      })
    }

    closeModal()
  }

  const requestDeleteCustomer = (customer: Customer) => {
    setDeleteTarget(customer)
  }

  const cancelDelete = () => {
    setDeleteTarget(null)
  }

  const confirmDeleteCustomer = () => {
    if (!deleteTarget) return
    setCustomers((current) => {
      const remaining = current.filter((customer) => customer.id !== deleteTarget.id)
      addNotification(`Customer deleted: ${deleteTarget.fullName}`, 'warning')
      return remaining
    })
    setDeleteTarget(null)
  }

  return {
    customers,
    filteredCustomers,
    search,
    setSearch,
    sortBy,
    setSortBy,
    selectedCustomer,
    isModalOpen,
    deleteTarget,
    openCreate,
    openEdit,
    closeModal,
    saveCustomer,
    requestDeleteCustomer,
    cancelDelete,
    confirmDeleteCustomer,
  }
}
