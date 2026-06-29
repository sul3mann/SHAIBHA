import { useMemo, useState, useEffect } from 'react'
import { Plus, Search, SortAsc, Upload } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Table } from '../components/ui/Table'
import { CustomerCard } from '../components/CustomerCard'
import { CustomerRow } from '../components/CustomerRow'
import { CustomerForm } from '../components/CustomerForm'
import { useCustomers } from '../hooks/useCustomers'
import { calculateCustomerLedgerSummary } from '../services/ledgerService'
import type { CustomerWithLedger } from '../types/customer'

export default function Customers() {
  const {
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
  } = useCustomers()

  const [customersWithLedger, setCustomersWithLedger] = useState<CustomerWithLedger[]>([])

  useEffect(() => {
    const updated = filteredCustomers.map((customer) => {
      const summary = calculateCustomerLedgerSummary(customer.id)
      return {
        ...customer,
        ...summary,
      } as CustomerWithLedger
    })
    setCustomersWithLedger(updated)
  }, [filteredCustomers])

  const resultsLabel = useMemo(() => {
    if (!filteredCustomers.length) return 'No customers found'
    return `${filteredCustomers.length} ${filteredCustomers.length === 1 ? 'customer' : 'customers'}`
  }, [filteredCustomers.length])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Customers</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Customer management</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Manage customer details for the workshop with search, sorting, and responsive lists.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers"
              aria-label="Search customers"
            />
          </div>
          <Button variant="primary" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add customer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Customer list</p>
                <p className="mt-1 text-sm text-slate-600">{resultsLabel} available in the customer directory.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => setSortBy('fullName')}>
                  <SortAsc className="mr-2 h-4 w-4" />
                  Sort by name
                </Button>
                <Button variant="outline" onClick={() => setSortBy(sortBy === 'city' ? 'updatedAt' : 'city')}>
                  {sortBy === 'city' ? 'Sort by last update' : 'Sort by city'}
                </Button>
              </div>
            </div>
          </Card>

          {customersWithLedger.length === 0 ? (
            <EmptyState
              icon={<Upload className="h-6 w-6" />}
              title="No customers yet"
              description="Use the Add customer button to create a new customer record."
            />
          ) : (
            <div className="space-y-4">
              <div className="hidden sm:block">
                <Table headers={['Name', 'Phone', 'WhatsApp', 'City', 'Address', 'Balance (g)']}>
                  {customersWithLedger.map((customer) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      onEdit={openEdit}
                      onDelete={requestDeleteCustomer}
                    />
                  ))}
                </Table>
              </div>
              <div className="grid gap-4 sm:hidden">
                {customersWithLedger.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={openEdit}
                    onDelete={requestDeleteCustomer}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Card className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Customer stats</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Directory overview</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Total customers</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{filteredCustomers.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Last action</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {filteredCustomers[0] ? new Date(filteredCustomers[0].updatedAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={isModalOpen}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
        description={selectedCustomer ? 'Update customer details and save changes.' : 'Create a new customer profile for the workshop.'}
        onClose={closeModal}
      >
        <CustomerForm customer={selectedCustomer} onSave={saveCustomer} onCancel={closeModal} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete customer"
        description="This action cannot be undone. Confirm to remove the customer from the directory."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteCustomer}
        onCancel={cancelDelete}
      />
    </div>
  )
}
