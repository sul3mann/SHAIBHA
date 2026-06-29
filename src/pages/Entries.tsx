import { useMemo } from 'react'
import { Plus, Search, SlidersHorizontal, Trash2, Copy, Upload } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Table } from '../components/ui/Table'
import { EntryForm } from '../components/EntryForm'
import { useEntries } from '../hooks/useEntries'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function EntriesPage() {
  const {
    entries,
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
  } = useEntries()

  const resultsLabel = useMemo(() => {
    if (!entries.length) return 'No entries found'
    return `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
  }, [entries.length])

  if (!settings) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-sm text-slate-600">Loading settings...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Entries</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">All entries</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Track all gold received and given entries with automatic ledger updates.
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
            <label className="grid gap-2 text-sm text-slate-700 sm:w-44">
              <span>Filter by direction</span>
              <select
                value={selectedDirection}
                onChange={(event) => setSelectedDirection(event.target.value as 'receive' | 'give' | '')}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="">All directions</option>
                <option value="receive">Receive</option>
                <option value="give">Give</option>
              </select>
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
          title="No entries yet"
          description="Add your first entry to start tracking gold transactions."
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden overflow-x-auto sm:block">
            <Table headers={['Date', 'Customer', 'Direction', 'Mode', 'Formula', '24K (g)', '21K (g)', 'Labour (g)', 'Labour Rate', 'Labour (SAR)', 'Total', 'Invoice']}>
              {entries.map((entry) => {
                const customer = customers.find((item) => item.id === entry.customerId)
                return (
                  <tr key={entry.id} className="border-b border-slate-200 last:border-b-0">
                    <td className="px-4 py-4 text-sm text-slate-900">{formatDate(entry.date)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{customer?.fullName ?? 'Unknown'}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 capitalize">{entry.direction}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 capitalize">{entry.entryMode}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{entry.formulaMethod}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{(entry.weight24k ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{(entry.weight21k ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{(entry.labourWeight21k ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{(entry.labourRate ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{(entry.labourAmount ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-950">{entry.grandTotal.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{entry.invoiceNumber || '—'}</td>
                    <td className="px-4 py-4 text-right text-sm text-slate-600">
                      <button className="mr-2 rounded-2xl bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200" onClick={() => openEdit(entry)} title="Edit">
                        ✎
                      </button>
                      <button className="mr-2 rounded-2xl bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100" onClick={() => duplicateExistingEntry(entry)} title="Duplicate">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="rounded-2xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100" onClick={() => requestDeleteEntry(entry)} title="Delete">
                        <Trash2 className="h-4 w-4" />
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
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold capitalize">{entry.direction}</span>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600">
                    <p><span className="font-medium text-slate-900">24K:</span> {(entry.weight24k ?? 0).toFixed(2)}g</p>
                    <p><span className="font-medium text-slate-900">21K:</span> {(entry.weight21k ?? 0).toFixed(2)}g</p>
                    {entry.labourAmount ? <p><span className="font-medium text-slate-900">Labour:</span> {(entry.labourAmount ?? 0).toFixed(2)} SAR</p> : null}
                    <p><span className="font-medium text-slate-900">Total:</span> {entry.grandTotal.toFixed(2)} SAR</p>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
                    <Button variant="outline" onClick={() => openEdit(entry)}>
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => duplicateExistingEntry(entry)}>
                      Duplicate
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

      <Modal open={isModalOpen} title={selectedEntry ? 'Edit Entry' : 'Add Entry'} description="Create or update an entry with automatic calculations." onClose={closeModal}>
        <EntryForm entry={selectedEntry} customers={customers} settings={settings} onSave={saveEntry} onCancel={closeModal} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete entry"
        description="This will remove the entry and update the customer ledger."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteEntry}
        onCancel={cancelDelete}
      />
    </div>
  )
}
