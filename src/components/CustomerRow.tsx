import { MessageCircleMore, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Customer, CustomerWithLedger } from '../types/customer'

interface CustomerRowProps {
  customer: Customer & Partial<Omit<CustomerWithLedger, keyof Customer>>
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onView?: (customerId: string) => void
}

export function CustomerRow({ customer, onEdit, onDelete, onView }: CustomerRowProps) {
  const navigate = useNavigate()

  const handleView = () => {
    if (onView) {
      onView(customer.id)
    } else {
      navigate(`/customer-ledger/${customer.id}`)
    }
  }

  return (
    <tr className="border-b border-slate-200 last:border-b-0 cursor-pointer hover:bg-slate-50" onClick={handleView}>
      <td className="px-4 py-4 text-sm font-medium text-slate-900">
        <div className="flex items-center gap-3">
          {customer.photo ? <img src={customer.photo} alt={customer.fullName} className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-semibold text-gold">{customer.fullName.charAt(0).toUpperCase()}</div>}
          <span>{customer.fullName}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">{customer.phoneNumber}</td>
      <td className="px-4 py-4 flex items-center gap-2 text-sm text-slate-600">
        <MessageCircleMore className="h-4 w-4 text-green-600" />
        {customer.whatsappNumber}
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">{customer.city}</td>
      <td className="px-4 py-4 text-sm text-slate-600 hidden xl:table-cell">{customer.address}</td>
      <td className="px-4 py-4 text-sm text-gold font-semibold hidden lg:table-cell">{(customer.balance ?? 0).toFixed(1)}g</td>
      <td className="px-4 py-4 text-right text-sm text-slate-600">
        <button
          className="mr-2 rounded-2xl bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(customer)
          }}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="mr-2 rounded-2xl bg-gold/10 p-2 text-gold transition hover:bg-gold/20"
          onClick={(e) => {
            e.stopPropagation()
            handleView()
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          className="rounded-2xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(customer)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}
