import { useEffect, useMemo, useState } from 'react'
import { Printer, Download, Filter } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { loadCustomers } from '../services/customerService'
import { loadEntries } from '../services/entryService'
import type { Customer } from '../types/customer'
import type { Entry } from '../types/entry'
import {
  buildReportPayload,
  exportReportToCsv,
  exportReportToJson,
  getDefaultReportFilters,
  type ReportFilters,
  type ReportType,
} from '../utils/reports'

const reportTypeOptions: Array<{ value: ReportType; label: string }> = [
  { value: 'daily', label: 'Daily report' },
  { value: 'weekly', label: 'Weekly report' },
  { value: 'monthly', label: 'Monthly report' },
  { value: 'yearly', label: 'Yearly report' },
  { value: 'customer', label: 'Customer report' },
  { value: 'gold-received', label: 'Gold Received report' },
  { value: 'gold-given', label: 'Gold Given report' },
  { value: 'labour', label: 'Labour report' },
  { value: 'vat', label: 'VAT report' },
  { value: 'invoice', label: 'Invoice report' },
]

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function Reports() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [reportType, setReportType] = useState<ReportType>('daily')
  const [filters, setFilters] = useState<ReportFilters>(getDefaultReportFilters())
  const [showPrintView, setShowPrintView] = useState(false)

  useEffect(() => {
    setEntries(loadEntries())
    setCustomers(loadCustomers())
  }, [])

  const reportPayload = useMemo(() => buildReportPayload(reportType, filters, entries, customers), [customers, entries, filters, reportType])

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const handlePrint = () => {
    setShowPrintView(true)
    window.setTimeout(() => window.print(), 150)
  }

  const handleExportCsv = () => exportReportToCsv(reportPayload)
  const handleExportJson = () => exportReportToJson(reportPayload)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Reports</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Workshop reports and exports</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Review day-to-day movement, customer activity, labour, VAT, and invoices with filters and export support.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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

      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter className="h-4 w-4 text-gold" />
          <h2 className="text-lg font-semibold text-slate-950">Report filters</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">Report type</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={reportType}
              onChange={(event) => setReportType(event.target.value as ReportType)}
            >
              {reportTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">Start date</span>
            <input
              type="date"
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.startDate}
              onChange={(event) => handleFilterChange('startDate', event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">End date</span>
            <input
              type="date"
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.endDate}
              onChange={(event) => handleFilterChange('endDate', event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">Customer</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.customerId}
              onChange={(event) => handleFilterChange('customerId', event.target.value)}
            >
              <option value="">All customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">Direction</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.direction}
              onChange={(event) => handleFilterChange('direction', event.target.value)}
            >
              <option value="all">All directions</option>
              <option value="receive">Gold Received</option>
              <option value="give">Gold Given</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">Entry mode</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.entryMode}
              onChange={(event) => handleFilterChange('entryMode', event.target.value)}
            >
              <option value="all">All modes</option>
              <option value="gold">Gold Only</option>
              <option value="labour">Labour Only</option>
              <option value="both">Gold + Labour</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">Invoice</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.invoiceFilter}
              onChange={(event) => handleFilterChange('invoiceFilter', event.target.value)}
            >
              <option value="all">All invoices</option>
              <option value="on">Invoice ON</option>
              <option value="off">Invoice OFF</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setFilters(getDefaultReportFilters())}
            >
              Reset filters
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total 24K received', value: `${reportPayload.summary.total24kReceived.toFixed(2)}g`, accent: 'text-gold' },
          { label: 'Total 21K received', value: `${reportPayload.summary.total21kReceived.toFixed(2)}g`, accent: 'text-green-600' },
          { label: 'Total 24K given', value: `${reportPayload.summary.total24kGiven.toFixed(2)}g`, accent: 'text-rose-600' },
          { label: 'Total 21K given', value: `${reportPayload.summary.total21kGiven.toFixed(2)}g`, accent: 'text-slate-900' },
        ].map((stat) => (
          <Card key={stat.label} className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.accent}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Net gold balance', value: `${reportPayload.summary.netGoldBalance.toFixed(2)}g`, accent: reportPayload.summary.netGoldBalance >= 0 ? 'text-gold' : 'text-rose-600' },
          { label: 'Total labour', value: `SAR ${reportPayload.summary.totalLabour.toFixed(2)}`, accent: 'text-slate-900' },
          { label: 'Total VAT', value: `SAR ${reportPayload.summary.totalVat.toFixed(2)}`, accent: 'text-slate-900' },
          { label: 'Grand total', value: `SAR ${reportPayload.summary.grandTotal.toFixed(2)}`, accent: 'text-slate-900' },
          { label: 'Entry count', value: reportPayload.summary.entryCount.toString(), accent: 'text-slate-900' },
        ].map((stat) => (
          <Card key={stat.label} className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.accent}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{reportPayload.title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {reportPayload.filters.startDate || 'All dates'} to {reportPayload.filters.endDate || 'All dates'}
              {reportPayload.filters.customerId ? ` • ${customers.find((customer) => customer.id === reportPayload.filters.customerId)?.fullName ?? 'Selected customer'}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print report
            </Button>
            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {reportPayload.entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            No matching entries for the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Direction</th>
                  <th className="px-3 py-3">Mode</th>
                  <th className="px-3 py-3">24K</th>
                  <th className="px-3 py-3">21K</th>
                  <th className="px-3 py-3">Labour</th>
                  <th className="px-3 py-3">VAT</th>
                  <th className="px-3 py-3">Grand total</th>
                  <th className="px-3 py-3">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {reportPayload.entries.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-3 text-slate-900">{formatDate(item.date)}</td>
                    <td className="px-3 py-3 text-slate-600">{item.customerName}</td>
                    <td className="px-3 py-3 text-slate-600">{item.direction}</td>
                    <td className="px-3 py-3 text-slate-600">{item.entryMode}</td>
                    <td className="px-3 py-3 text-slate-600">{item.weight24k.toFixed(2)}g</td>
                    <td className="px-3 py-3 text-slate-600">{item.weight21k.toFixed(2)}g</td>
                    <td className="px-3 py-3 text-slate-600">SAR {item.labourAmount.toFixed(2)}</td>
                    <td className="px-3 py-3 text-slate-600">SAR {item.vatAmount.toFixed(2)}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">SAR {item.grandTotal.toFixed(2)}</td>
                    <td className="px-3 py-3 text-slate-600">{item.invoiceNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showPrintView ? (
        <div className="hidden print:block">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{reportPayload.businessName}</p>
                <h2 className="mt-2 text-2xl font-semibold">{reportPayload.title}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {reportPayload.filters.startDate || 'All dates'} to {reportPayload.filters.endDate || 'All dates'}
                </p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p>Generated {formatDate(reportPayload.generatedAt)}</p>
                {reportPayload.filters.customerId ? <p>{customers.find((customer) => customer.id === reportPayload.filters.customerId)?.fullName ?? 'Selected customer'}</p> : null}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['Total 24K received', `${reportPayload.summary.total24kReceived.toFixed(2)}g`],
                ['Total 21K received', `${reportPayload.summary.total21kReceived.toFixed(2)}g`],
                ['Net gold balance', `${reportPayload.summary.netGoldBalance.toFixed(2)}g`],
                ['Grand total', `SAR ${reportPayload.summary.grandTotal.toFixed(2)}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Direction</th>
                    <th className="px-3 py-3">Mode</th>
                    <th className="px-3 py-3">21K</th>
                    <th className="px-3 py-3">Labour</th>
                    <th className="px-3 py-3">VAT</th>
                    <th className="px-3 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportPayload.entries.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-3">{formatDate(item.date)}</td>
                      <td className="px-3 py-3">{item.customerName}</td>
                      <td className="px-3 py-3">{item.direction}</td>
                      <td className="px-3 py-3">{item.entryMode}</td>
                      <td className="px-3 py-3">{item.weight21k.toFixed(2)}g</td>
                      <td className="px-3 py-3">SAR {item.labourAmount.toFixed(2)}</td>
                      <td className="px-3 py-3">SAR {item.vatAmount.toFixed(2)}</td>
                      <td className="px-3 py-3 font-semibold">SAR {item.grandTotal.toFixed(2)}</td>
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
