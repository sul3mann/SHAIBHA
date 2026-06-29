import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, BookOpen } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Table } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { useLedger } from '../hooks/useLedger'
import { calculateCustomerLedgerSummary } from '../services/ledgerService'
import { loadCustomers } from '../services/customerService'
import type { Customer } from '../types/customer'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function CustomerLedgerDetail() {
  const { customerId = '' } = useParams()
  const navigate = useNavigate()
  const { transactions } = useLedger(customerId)
  const [query, setQuery] = useState('')
  const [customers] = useState<Customer[]>(() => loadCustomers())

  const customer = customers.find((c) => c.id === customerId)
  const summary = calculateCustomerLedgerSummary(customerId)

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return transactions.filter((transaction) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        transaction.invoiceNumber?.toLowerCase().includes(normalizedQuery) ||
        transaction.notes.toLowerCase().includes(normalizedQuery) ||
        transaction.direction.toLowerCase().includes(normalizedQuery)

      return matchesQuery
    })
  }, [transactions, query])

  if (!customerId || !customer) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to customers
        </Button>
        <Card>
          <p className="text-sm text-slate-600">Customer not found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => navigate('/customers')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to customers
          </Button>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Customer Ledger</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{customer.fullName}</h1>
          <p className="mt-1 text-sm text-slate-600">{customer.phoneNumber}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="space-y-2">
          <p className="text-sm font-medium text-slate-500">Gold Received</p>
          <p className="text-2xl font-semibold text-gold">{summary.goldReceivedTotal.toFixed(2)}g</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm font-medium text-slate-500">Gold Given</p>
          <p className="text-2xl font-semibold text-slate-950">{summary.goldGivenTotal.toFixed(2)}g</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm font-medium text-slate-500">Balance</p>
          <p className={`text-2xl font-semibold ${summary.balance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
            {summary.balance.toFixed(2)}g
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm font-medium text-slate-500">Labour (SAR)</p>
          <p className="text-2xl font-semibold text-slate-950">{summary.labourTotal.toFixed(2)}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm font-medium text-slate-500">VAT (SAR)</p>
          <p className="text-2xl font-semibold text-slate-950">{summary.vatTotal.toFixed(2)}</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Transaction history</h2>
            <p className="mt-1 text-sm text-slate-600">All entries for this customer sorted by newest first</p>
          </div>
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by invoice or notes"
              aria-label="Search transactions"
            />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="No transactions yet"
            description="Entries for this customer will appear here."
          />
        ) : (
          <div className="hidden overflow-x-auto sm:block">
            <Table
              headers={[
                'Date',
                'Direction',
                'Mode',
                'Formula',
                '24K (g)',
                '21K (g)',
                'Labour (g)',
                'Labour Rate',
                'Labour (SAR)',
                'VAT (SAR)',
                'Total (SAR)',
                'Invoice',
              ]}
            >
              {filteredTransactions.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-200 last:border-b-0">
                  <td className="px-4 py-4 text-sm text-slate-900">{formatDate(entry.date)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 capitalize">{entry.direction}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 capitalize">{entry.entryMode}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.formulaMethod}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.weight24k.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.weight21k.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.labourWeight21k.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.labourRate.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.labourAmount.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.vatAmount.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-950">{entry.grandTotal.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.invoiceNumber || '—'}</td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {filteredTransactions.length > 0 && (
          <div className="grid gap-4 sm:hidden">
            {filteredTransactions.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{formatDate(entry.date)}</span>
                  <span className="rounded-full bg-gold/10 px-2 py-1 text-xs font-semibold text-gold capitalize">{entry.direction}</span>
                </div>
                <div className="space-y-2 text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">21K:</span> {entry.weight21k.toFixed(2)}g
                  </p>
                  {entry.labourAmount > 0 && (
                    <p>
                      <span className="font-medium text-slate-900">Labour:</span> {entry.labourAmount.toFixed(2)} SAR
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-slate-900">Total:</span> {entry.grandTotal.toFixed(2)} SAR
                  </p>
                  {entry.invoiceNumber && (
                    <p>
                      <span className="font-medium text-slate-900">Invoice:</span> {entry.invoiceNumber}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
