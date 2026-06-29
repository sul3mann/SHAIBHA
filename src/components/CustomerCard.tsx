import { MessageCircleMore, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Customer, CustomerWithLedger } from '../types/customer'

interface CustomerCardProps {
  customer: Customer & Partial<Omit<CustomerWithLedger, keyof Customer>>
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onView?: (customerId: string) => void
}

export function CustomerCard({ customer, onEdit, onDelete, onView }: CustomerCardProps) {
  const navigate = useNavigate()

  const handleView = () => {
    if (onView) {
      onView(customer.id)
    } else {
      navigate(`/customer-ledger/${customer.id}`)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 cursor-pointer" onClick={handleView}>
          <p className="text-sm font-semibold text-slate-950">{customer.fullName}</p>
          <p className="mt-1 text-sm text-slate-600">{customer.city}</p>
        </div>
        <button
          className="rounded-2xl bg-gold/10 p-2 text-gold transition hover:bg-gold/20"
          onClick={handleView}
          title="View ledger"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-900">Phone:</span> {customer.phoneNumber}
        </p>
        <p className="flex items-center gap-2">
          <MessageCircleMore className="h-4 w-4 text-green-600" />
          {customer.whatsappNumber}
        </p>
        <p>{customer.address}</p>
        {customer.notes && <p>{customer.notes}</p>}
      </div>

      {customer.goldReceivedTotal !== undefined && (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 text-xs">
          <div>
            <p className="text-slate-500">Gold Received</p>
            <p className="font-semibold text-gold">{(customer.goldReceivedTotal ?? 0).toFixed(1)}g</p>
          </div>
          <div>
            <p className="text-slate-500">Balance</p>
            <p className={`font-semibold ${(customer.balance ?? 0) >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
              {(customer.balance ?? 0).toFixed(1)}g
            </p>
          </div>
          <div>
            <p className="text-slate-500">Labour</p>
            <p className="font-semibold text-slate-900">{(customer.labourTotal ?? 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-slate-500">Transactions</p>
            <p className="font-semibold text-slate-900">{customer.totalTransactions ?? 0}</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button className="rounded-2xl bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200" onClick={() => onEdit(customer)}>
          <Pencil className="h-4 w-4" />
        </button>
        <button className="rounded-2xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100" onClick={() => onDelete(customer)}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
