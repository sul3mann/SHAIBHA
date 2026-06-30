import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, TrendingUp, TrendingDown, DollarSign, ChevronRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { loadCustomers } from '../services/customerService'
import { loadEntries } from '../services/entryService'
import { calculateCustomerLedgerSummary, LEDGER_CHANGED_EVENT } from '../services/ledgerService'
import type { Customer } from '../types/customer'
import type { Entry } from '../types/entry'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    const syncData = () => {
      setCustomers(loadCustomers())
      setEntries(loadEntries())
    }

    syncData()
    window.addEventListener(LEDGER_CHANGED_EVENT, syncData)

    return () => {
      window.removeEventListener(LEDGER_CHANGED_EVENT, syncData)
    }
  }, [])

  const stats = useMemo(() => {
    let goldReceived = 0
    let goldGiven = 0
    let labourTotal = 0
    let vatTotal = 0

    entries.forEach((entry) => {
      const weight21k = Number(entry.weight21k ?? 0)
      const labourAmount = Number(entry.labourAmount ?? 0)
      const vatAmount = Number(entry.vatAmount ?? 0)

      if (entry.direction === 'receive') {
        goldReceived += weight21k
      } else {
        goldGiven += weight21k
      }
      labourTotal += labourAmount
      vatTotal += vatAmount
    })

    return {
      totalCustomers: customers.length,
      totalEntries: entries.length,
      goldReceived,
      goldGiven,
      labourTotal,
      vatTotal,
      balance: goldReceived - goldGiven,
    }
  }, [customers, entries])

  const recentEntries = useMemo(() => {
    return entries.slice(0, 5).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [entries])

  const topCustomers = useMemo(() => {
    return customers
      .map((customer) => ({
        ...customer,
        ...calculateCustomerLedgerSummary(customer.id),
      }))
      .sort((a, b) => (b.totalTransactions ?? 0) - (a.totalTransactions ?? 0))
      .slice(0, 5)
  }, [customers])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Welcome to Shaibah Warsha</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Real-time workshop overview showing customers, transactions, and gold inventory.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Customers</p>
            <Users className="h-4 w-4 text-gold" />
          </div>
          <p className="text-3xl font-semibold text-slate-950">{stats.totalCustomers}</p>
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Entries</p>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-3xl font-semibold text-slate-950">{stats.totalEntries}</p>
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Gold Received</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-green-600">{stats.goldReceived.toFixed(1)}g</p>
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Gold Given</p>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-semibold text-rose-600">{stats.goldGiven.toFixed(1)}g</p>
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Balance</p>
            <DollarSign className="h-4 w-4 text-gold" />
          </div>
          <p className={`text-2xl font-semibold ${stats.balance >= 0 ? 'text-gold' : 'text-rose-600'}`}>
            {stats.balance.toFixed(1)}g
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Recent Entries</h2>
              <p className="mt-1 text-sm text-slate-600">Latest 5 transactions across all customers</p>
            </div>
            <Link to="/entries">
              <Button variant="ghost" className="text-xs">
                View All
              </Button>
            </Link>
          </div>

          {recentEntries.length === 0 ? (
            <p className="text-sm text-slate-600">No entries yet. Start by adding an entry.</p>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => {
                const customer = customers.find((c) => c.id === entry.customerId)
                return (
                  <div key={entry.id} className="flex items-center justify-between border-l-4 border-gold bg-slate-50 p-3 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{customer?.fullName ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-600">{formatDate(entry.date)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${entry.direction === 'receive' ? 'text-green-600' : 'text-rose-600'}`}>
                        {entry.direction === 'receive' ? '+' : '-'} {Number(entry.weight21k ?? 0).toFixed(2)}g
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Top Customers</h2>
              <p className="mt-1 text-sm text-slate-600">By transaction count</p>
            </div>
            <Link to="/customers">
              <Button variant="ghost" className="text-xs">
                View All
              </Button>
            </Link>
          </div>

          {topCustomers.length === 0 ? (
            <p className="text-sm text-slate-600">No customers yet. Add your first customer.</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((customer) => (
                <Link key={customer.id} to={`/customer-ledger/${customer.id}`} className="block">
                  <div className="flex items-center justify-between p-3 rounded border border-slate-200 hover:bg-slate-50 transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{customer.fullName}</p>
                      <p className="text-xs text-slate-600">{customer.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{customer.totalTransactions} txn</p>
                      <p className="text-xs text-gold font-semibold">{(customer.balance ?? 0).toFixed(1)}g</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Labour & Fees Summary</h2>
            <p className="mt-1 text-sm text-slate-600">Total labour charges and VAT collected</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Total Labour</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.labourTotal.toFixed(2)} SAR</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Total VAT</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.vatTotal.toFixed(2)} SAR</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-600">Jump to key workflow sections</p>
          </div>
          <div className="space-y-2">
            <Link to="/entries" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span>Add New Entry</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/customers" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span>Manage Customers</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/settings" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span>Settings</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
