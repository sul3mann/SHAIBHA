import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { BookOpen, ChevronRight } from 'lucide-react'
import { loadCustomers } from '../services/customerService'
import { calculateCustomerLedgerSummary } from '../services/ledgerService'
import type { Customer } from '../types/customer'

export default function CustomerLedger() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [ledgerData, setLedgerData] = useState<Record<string, any>>({})

  useEffect(() => {
    const loaded = loadCustomers()
    setCustomers(loaded)

    const data: Record<string, any> = {}
    loaded.forEach((customer) => {
      data[customer.id] = calculateCustomerLedgerSummary(customer.id)
    })
    setLedgerData(data)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Customer Ledger</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">All customer ledgers</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Click on a customer to view their transaction history, running balance, and gold movement.
        </p>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No customers yet"
          description="Customer ledger pages will appear here once records are added."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {customers.map((customer) => {
            const summary = ledgerData[customer.id]
            return (
              <Link key={customer.id} to={`/customer-ledger/${customer.id}`}>
                <Card className="h-full transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-slate-950">{customer.fullName}</h2>
                      <p className="mt-1 text-sm text-slate-600">{customer.phoneNumber}</p>
                      <p className="mt-1 text-sm text-slate-500">{customer.city}</p>
                    </div>
                    <div className="rounded-full bg-gold/10 p-2 text-gold">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                  {summary && (
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Balance</p>
                        <p className={`font-semibold ${summary.balance >= 0 ? 'text-gold' : 'text-rose-600'}`}>
                          {summary.balance.toFixed(1)}g
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Transactions</p>
                        <p className="font-semibold text-slate-900">{summary.totalTransactions}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Received</p>
                        <p className="font-semibold text-slate-900">{summary.goldReceivedTotal.toFixed(1)}g</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Given</p>
                        <p className="font-semibold text-slate-900">{summary.goldGivenTotal.toFixed(1)}g</p>
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
