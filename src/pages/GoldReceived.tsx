import { useMemo } from 'react'
import { Plus, Search, SortAsc, SlidersHorizontal, Upload } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Table } from '../components/ui/Table'
import { GoldReceivedForm } from '../components/GoldReceivedForm'
import { useGoldReceived } from '../hooks/useGoldReceived'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function GoldReceived() {
  const {
    entries,
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
  } = useGoldReceived()

  const resultsLabel = useMemo(() => {
    if (!entries.length) return 'No entries found'
    return `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
  }, [entries.length])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Gold Received</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Gold received records</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Record gold received from customers and keep each entry linked to the customer ledger.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add entry
        </Button>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm sm:w-72">
              <Search className="mr-2 h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search entries"
                aria-label="Search entries"
              />
            </div>
            <label className="grid gap-2 text-sm text-slate-700 sm:w-48">
              <span>Filter by customer</span>
              <select
                value={selectedCustomerId}
                onChange={(event) => setSelectedCustomerId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="">All customers</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-slate-700 sm:w-44">
              <span>Filter by date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </label>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <SlidersHorizontal className="h-4 w-4" />
            {resultsLabel}
          </div>
        </div>
      </Card>

      {entries.length === 0 ? (
        <EmptyState
          icon={<Upload className="h-6 w-6" />}
          title="No gold received entries yet"
          description="Add your first entry to start tracking customer gold received records."
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden sm:block">
            <Table headers={['Date', 'Customer', 'Gold Type', 'Weight', 'Purity', 'Description', 'Actions']}>
              {entries.map((entry) => {
                const customer = customers.find((item) => item.id === entry.customerId)
                return (
                  <tr key={entry.id} className="border-b border-slate-200 last:border-b-0">
                    <td className="px-4 py-4 text-sm text-slate-900">{formatDate(entry.date)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{customer?.fullName ?? 'Unknown'}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{entry.goldType}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{entry.weight.toFixed(2)} g</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{entry.purity}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{entry.description}</td>
                    <td className="px-4 py-4 text-right text-sm text-slate-600">
                      <button className="mr-2 rounded-2xl bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200" onClick={() => openEdit(entry)}>
                        <SortAsc className="h-4 w-4" />
                      </button>
                      <button className="rounded-2xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100" onClick={() => requestDeleteEntry(entry)}>
                        <Upload className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </Table>
          </div>

          <div className="grid gap-4 sm:hidden">
            {entries.map((entry) => {
              const customer = customers.find((item) => item.id === entry.customerId)
              return (
                <Card key={entry.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{customer?.fullName ?? 'Unknown'}</p>
                      <p className="mt-1 text-sm text-slate-500">{formatDate(entry.date)}</p>
                    </div>
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">{entry.goldType}</span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><span className="font-medium text-slate-900">Weight:</span> {entry.weight.toFixed(2)} g</p>
                    <p><span className="font-medium text-slate-900">Purity:</span> {entry.purity}</p>
                    <p><span className="font-medium text-slate-900">Description:</span> {entry.description}</p>
                    {entry.notes ? <p><span className="font-medium text-slate-900">Notes:</span> {entry.notes}</p> : null}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => openEdit(entry)}>
                      Edit
                    </Button>
                    <Button variant="ghost" onClick={() => requestDeleteEntry(entry)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <Modal open={isModalOpen} title={selectedEntry ? 'Edit Entry' : 'Add Entry'} description="Create or update a gold received record." onClose={closeModal}>
        <GoldReceivedForm entry={selectedEntry} customers={customers} onSave={saveEntry} onCancel={closeModal} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete gold received entry"
        description="This will remove the entry and its linked ledger transaction."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteEntry}
        onCancel={cancelDelete}
      />
    </div>
  )
}
