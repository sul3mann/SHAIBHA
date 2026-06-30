import { useMemo, useState, useEffect } from 'react'
import { Plus, Search, SortAsc, Upload, X } from 'lucide-react'
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
import { calculateCustomerLedgerSummary, getCustomerLedger, LEDGER_CHANGED_EVENT } from '../services/ledgerService'
import type { CustomerWithLedger } from '../types/customer'
import type { LedgerEntry } from '../types/ledger'

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
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedCustomerLedger, setSelectedCustomerLedger] = useState<LedgerEntry[]>([])

  useEffect(() => {
    const syncLedgerData = () => {
      const updated = filteredCustomers.map((customer) => {
        const summary = calculateCustomerLedgerSummary(customer.id)
        return {
          ...customer,
          ...summary,
        } as CustomerWithLedger
      })
      setCustomersWithLedger(updated)
    }

    syncLedgerData()
    window.addEventListener(LEDGER_CHANGED_EVENT, syncLedgerData)

    return () => {
      window.removeEventListener(LEDGER_CHANGED_EVENT, syncLedgerData)
    }
  }, [filteredCustomers])

  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomerLedger([])
      return
    }

    const syncCustomerLedger = () => {
      setSelectedCustomerLedger(getCustomerLedger(selectedCustomerId))
    }

    syncCustomerLedger()
    window.addEventListener(LEDGER_CHANGED_EVENT, syncCustomerLedger)

    return () => {
      window.removeEventListener(LEDGER_CHANGED_EVENT, syncCustomerLedger)
    }
  }, [selectedCustomerId])

  useEffect(() => {
    if (!search.trim()) {
      setSelectedCustomerId('')
      return
    }

    if (filteredCustomers.length === 1) {
      setSelectedCustomerId(filteredCustomers[0].id)
    }
  }, [filteredCustomers, search])

  const resultsLabel = useMemo(() => {
    if (!filteredCustomers.length) return 'No customers found'
    return `${filteredCustomers.length} ${filteredCustomers.length === 1 ? 'customer' : 'customers'}`
  }, [filteredCustomers.length])

  const totals = useMemo(() => {
    return customersWithLedger.reduce(
      (acc, customer) => ({
        received: acc.received + (customer.goldReceivedTotal ?? 0),
        given: acc.given + (customer.goldGivenTotal ?? 0),
        labour: acc.labour + (customer.labourTotal ?? 0),
        balance: acc.balance + (customer.balance ?? 0),
      }),
      { received: 0, given: 0, labour: 0, balance: 0 },
    )
  }, [customersWithLedger])

  const activeCustomer = useMemo(() => {
    return filteredCustomers.find((customer) => customer.id === selectedCustomerId) ?? null
  }, [filteredCustomers, selectedCustomerId])

  const selectedCustomerTotals = useMemo(() => {
    if (!activeCustomer) return null

    const goldReceived = selectedCustomerLedger.reduce((sum, entry) => sum + (entry.direction === 'receive' ? Number(entry.weight21k ?? 0) : 0), 0)
    const goldGiven = selectedCustomerLedger.reduce((sum, entry) => sum + (entry.direction === 'give' ? Number(entry.weight21k ?? 0) : 0), 0)
    const labour = selectedCustomerLedger.reduce((sum, entry) => sum + Number(entry.labourAmount ?? 0), 0)
    const vat = selectedCustomerLedger.reduce((sum, entry) => sum + Number(entry.vatAmount ?? 0), 0)
    const grandTotal = selectedCustomerLedger.reduce((sum, entry) => sum + Number(entry.grandTotal ?? 0), 0)
    const netBalance = goldReceived - goldGiven

    return {
      goldReceived,
      goldGiven,
      netBalance,
      labour,
      vat,
      grandTotal,
      moneyOwed: grandTotal,
      entryCount: selectedCustomerLedger.length,
      lastTransactionDate: selectedCustomerLedger[0]?.date ?? null,
    }
  }, [activeCustomer, selectedCustomerLedger])

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

        <div className="space-y-6">
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
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-gold/20 bg-gold/5 p-4">
                <p className="text-sm text-slate-500">Gold received</p>
                <p className="mt-1 text-xl font-semibold text-gold">{totals.received.toFixed(1)}g</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Gold given</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{totals.given.toFixed(1)}g</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Labour total</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{totals.labour.toFixed(2)} SAR</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Balance</p>
                <p className={`mt-1 text-xl font-semibold ${totals.balance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>{totals.balance.toFixed(1)}g</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Selected customer</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Customer totals</h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  value={selectedCustomerId}
                  onChange={(event) => setSelectedCustomerId(event.target.value)}
                >
                  <option value="">All customers</option>
                  {filteredCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName}
                    </option>
                  ))}
                </select>
                <Button variant="outline" onClick={() => setSelectedCustomerId('')}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Customer Filter
                </Button>
              </div>
            </div>

            {!activeCustomer || !selectedCustomerTotals ? (
              <p className="text-sm text-slate-600">Search or select a customer to view that customer&apos;s totals and transaction history.</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {activeCustomer.photo ? (
                      <img src={activeCustomer.photo} alt={activeCustomer.fullName} className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-lg font-semibold text-gold">
                        {activeCustomer.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{activeCustomer.fullName}</p>
                      <p className="text-sm text-slate-600">{activeCustomer.city}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p className="font-medium text-slate-900">Entry count: {selectedCustomerTotals.entryCount}</p>
                    <p>Last transaction: {selectedCustomerTotals.lastTransactionDate ? new Date(selectedCustomerTotals.lastTransactionDate).toLocaleDateString() : '—'}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-3xl border border-gold/20 bg-gold/5 p-4">
                    <p className="text-sm text-slate-500">Total Gold Received</p>
                    <p className="mt-1 text-xl font-semibold text-gold">{selectedCustomerTotals.goldReceived.toFixed(1)}g</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">Total Gold Given</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">{selectedCustomerTotals.goldGiven.toFixed(1)}g</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">Net Gold Balance</p>
                    <p className={`mt-1 text-xl font-semibold ${selectedCustomerTotals.netBalance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>{selectedCustomerTotals.netBalance.toFixed(1)}g</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">Total Labour Amount</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">{selectedCustomerTotals.labour.toFixed(2)} SAR</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">Total VAT</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">{selectedCustomerTotals.vat.toFixed(2)} SAR</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">Total Grand Total</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">{selectedCustomerTotals.grandTotal.toFixed(2)} SAR</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">Money still owed</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">{selectedCustomerTotals.moneyOwed.toFixed(2)} SAR</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">Gold still owed</p>
                    <p className={`mt-1 text-xl font-semibold ${selectedCustomerTotals.netBalance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                      {selectedCustomerTotals.netBalance >= 0
                        ? `Customer still has ${selectedCustomerTotals.netBalance.toFixed(1)}g with us.`
                        : `We gave extra gold / customer owes ${Math.abs(selectedCustomerTotals.netBalance).toFixed(1)}g.`}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-950">Transaction history</h3>
                  <div className="overflow-x-auto">
                    <Table headers={['Date', 'Direction', 'Mode', 'Formula', '24K', '21K', 'Labour', 'VAT', 'Total', 'Invoice', 'Notes']}>
                      {selectedCustomerLedger.map((entry) => (
                        <tr key={entry.id} className="border-b border-slate-200 last:border-b-0">
                          <td className="px-4 py-4 text-sm text-slate-700">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.direction === 'receive' ? 'Gold Received' : 'Gold Given'}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.entryMode === 'gold' ? 'Gold Only' : entry.entryMode === 'labour' ? 'Labour Only' : 'Gold + Labour'}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.formulaMethod === 'method1' ? '×1.14' : entry.formulaMethod === 'method2' ? '×1.142' : '×(24/21)'}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.weight24k.toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.weight21k.toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.labourAmount.toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.vatAmount.toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.grandTotal.toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.invoiceNumber || '—'}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.notes || '—'}</td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
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
