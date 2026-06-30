import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, BookOpen, BadgeCheck, FileText, Camera, Printer, Download } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Table } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { useLedger } from '../hooks/useLedger'
import { calculateCustomerLedgerSummary } from '../services/ledgerService'
import { loadCustomers } from '../services/customerService'
import type { Customer } from '../types/customer'
import { downloadTextFile } from '../utils/reports'

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
  const [showPrintView, setShowPrintView] = useState(false)

  const customer = customers.find((c) => c.id === customerId)
  const summary = calculateCustomerLedgerSummary(customerId)

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return transactions
      .filter((transaction) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          transaction.invoiceNumber?.toLowerCase().includes(normalizedQuery) ||
          transaction.notes.toLowerCase().includes(normalizedQuery) ||
          transaction.direction.toLowerCase().includes(normalizedQuery)

        return matchesQuery
      })
      .reduce<Array<(typeof transactions)[number] & { runningBalance: number }>>((acc, transaction) => {
        const previousBalance = acc.length ? acc[acc.length - 1].runningBalance : 0
        const runningBalance =
          transaction.direction === 'receive'
            ? previousBalance + transaction.weight21k
            : previousBalance - transaction.weight21k

        acc.push({ ...transaction, runningBalance })
        return acc
      }, [])
  }, [transactions, query])

  const handlePrint = () => {
    setShowPrintView(true)
    window.setTimeout(() => window.print(), 150)
  }

  const handleExportCsv = () => {
    const lines: string[][] = []
    lines.push(['Date', 'Direction', 'Mode', '24K (g)', '21K (g)', 'Labour (SAR)', 'VAT (SAR)', 'Grand Total (SAR)', 'Invoice', 'Notes'])
    filteredTransactions.forEach((transaction) => {
      lines.push([
        transaction.date,
        transaction.direction === 'receive' ? 'Gold Received' : 'Gold Given',
        transaction.entryMode,
        transaction.weight24k.toFixed(2),
        transaction.weight21k.toFixed(2),
        transaction.labourAmount.toFixed(2),
        transaction.vatAmount.toFixed(2),
        transaction.grandTotal.toFixed(2),
        transaction.invoiceNumber || '—',
        transaction.notes,
      ])
    })
    const csvContent = lines.map((row) => row.join(',')).join('\n')
    downloadTextFile(`${customer?.fullName ?? 'customer'}-ledger.csv`, csvContent, 'text/csv;charset=utf-8')
  }

  const handleExportJson = () => {
    const payload = {
      customer: customer?.fullName ?? 'Customer',
      summary,
      transactions: filteredTransactions,
    }
    downloadTextFile(`${customer?.fullName ?? 'customer'}-ledger.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8')
  }

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate('/customers')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to customers
          </Button>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Customer Ledger</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{customer.fullName}</h1>
          <p className="mt-1 text-sm text-slate-600">{customer.phoneNumber}</p>
          <p className="mt-1 text-sm text-slate-500">{customer.city} • {customer.address}</p>
        </div>
        {customer.photo ? (
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-3">
            <img src={customer.photo} alt={customer.fullName} className="h-16 w-16 rounded-2xl object-cover" />
            <div>
              <p className="text-sm font-semibold text-slate-950">Customer photo</p>
              <p className="text-sm text-slate-600">Attached to this profile</p>
            </div>
          </div>
        ) : null}
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
          <div className="flex flex-wrap items-center gap-2">
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
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportJson}>
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
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
                'Running Balance',
                'Total (SAR)',
                'Invoice',
              ]}
            >
              {filteredTransactions.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-200 last:border-b-0">
                  <td className="px-4 py-4 text-sm text-slate-900">{formatDate(entry.date)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.direction === 'receive' ? 'Gold Received' : 'Gold Given'}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 capitalize">{entry.entryMode}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.formulaMethod}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.weight24k.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.weight21k.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.labourWeight21k.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.labourRate.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.labourAmount.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{entry.vatAmount.toFixed(2)}</td>
                  <td className={`px-4 py-4 text-sm font-semibold ${entry.runningBalance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>{entry.runningBalance.toFixed(2)}g</td>
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
                  <span className="rounded-full bg-gold/10 px-2 py-1 text-xs font-semibold text-gold">{entry.direction === 'receive' ? 'Gold Received' : 'Gold Given'}</span>
                </div>
                <div className="space-y-2 text-slate-700">
                  <p className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-gold" />
                    <span className="font-medium text-slate-900">Type:</span> {entry.entryMode}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">21K:</span> {entry.weight21k.toFixed(2)}g
                  </p>
                  {entry.labourAmount > 0 && (
                    <p>
                      <span className="font-medium text-slate-900">Labour:</span> {entry.labourAmount.toFixed(2)} SAR
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-slate-900">Running balance:</span> {entry.runningBalance.toFixed(2)}g
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Total:</span> {entry.grandTotal.toFixed(2)} SAR
                  </p>
                  {entry.invoiceNumber && (
                    <p>
                      <span className="font-medium text-slate-900">Invoice:</span> {entry.invoiceNumber}
                    </p>
                  )}
                  {entry.notes ? (
                    <p className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 text-slate-500" />
                      <span className="text-sm">{entry.notes}</span>
                    </p>
                  ) : null}
                  {entry.photos?.length ? (
                    <p className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-slate-500" />
                      <span>{entry.photos.length} photo{entry.photos.length > 1 ? 's' : ''}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showPrintView ? (
        <div className="hidden print:block">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Shaibah Warsha</p>
                <h2 className="mt-2 text-2xl font-semibold">Customer statement</h2>
                <p className="mt-2 text-sm text-slate-600">{customer.fullName}</p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p>Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                <p>{summary.totalTransactions} transactions</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Gold received</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{summary.goldReceivedTotal.toFixed(2)}g</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Gold given</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{summary.goldGivenTotal.toFixed(2)}g</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Balance</p>
                <p className={`mt-2 text-lg font-semibold ${summary.balance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>{summary.balance.toFixed(2)}g</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Direction</th>
                    <th className="px-3 py-3">Mode</th>
                    <th className="px-3 py-3">21K</th>
                    <th className="px-3 py-3">Labour</th>
                    <th className="px-3 py-3">VAT</th>
                    <th className="px-3 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-3">{formatDate(entry.date)}</td>
                      <td className="px-3 py-3">{entry.direction === 'receive' ? 'Gold Received' : 'Gold Given'}</td>
                      <td className="px-3 py-3">{entry.entryMode}</td>
                      <td className="px-3 py-3">{entry.weight21k.toFixed(2)}g</td>
                      <td className="px-3 py-3">SAR {entry.labourAmount.toFixed(2)}</td>
                      <td className="px-3 py-3">SAR {entry.vatAmount.toFixed(2)}</td>
                      <td className="px-3 py-3 font-semibold">SAR {entry.grandTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
