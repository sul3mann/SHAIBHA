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
import { useLanguage } from '../context/LanguageContext'

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
  const { t, isUrdu } = useLanguage()
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
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('common.reportTitle')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{t('reports.title')}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t('reports.description')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t('common.print')}
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
          <h2 className="text-lg font-semibold text-slate-950">{t('reports.filters')}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">{t('reports.reportType')}</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={reportType}
              onChange={(event) => setReportType(event.target.value as ReportType)}
            >
              {reportTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {isUrdu ? option.label : option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">{t('reports.startDate')}</span>
            <input
              type="date"
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.startDate}
              onChange={(event) => handleFilterChange('startDate', event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">{t('reports.endDate')}</span>
            <input
              type="date"
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.endDate}
              onChange={(event) => handleFilterChange('endDate', event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">{t('reports.customer')}</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.customerId}
              onChange={(event) => handleFilterChange('customerId', event.target.value)}
            >
              <option value="">{isUrdu ? 'تمام مشتری' : 'All customers'}</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">{t('reports.direction')}</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.direction}
              onChange={(event) => handleFilterChange('direction', event.target.value)}
            >
              <option value="all">{isUrdu ? 'تمام سمتیں' : 'All directions'}</option>
              <option value="receive">{t('entryForm.goldReceived')}</option>
              <option value="give">{t('entryForm.goldGiven')}</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">{t('reports.entryMode')}</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.entryMode}
              onChange={(event) => handleFilterChange('entryMode', event.target.value)}
            >
              <option value="all">{isUrdu ? 'تمام اقسام' : 'All modes'}</option>
              <option value="gold">{t('entryForm.goldOnly')}</option>
              <option value="labour">{t('entryForm.labourOnly')}</option>
              <option value="both">{t('entryForm.goldPlusLabour')}</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">{t('reports.invoice')}</span>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 outline-none"
              value={filters.invoiceFilter}
              onChange={(event) => handleFilterChange('invoiceFilter', event.target.value)}
            >
              <option value="all">{isUrdu ? 'تمام انوائس' : 'All invoices'}</option>
              <option value="on">{isUrdu ? 'انوائس فعال' : 'Invoice ON'}</option>
              <option value="off">{isUrdu ? 'انوائس غیر فعال' : 'Invoice OFF'}</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setFilters(getDefaultReportFilters())}
            >
              {t('reports.resetFilters')}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('reports.total24kReceived'), value: `${reportPayload.summary.total24kReceived.toFixed(2)}g`, accent: 'text-gold' },
          { label: t('reports.total21kReceived'), value: `${reportPayload.summary.total21kReceived.toFixed(2)}g`, accent: 'text-green-600' },
          { label: t('reports.total24kGiven'), value: `${reportPayload.summary.total24kGiven.toFixed(2)}g`, accent: 'text-rose-600' },
          { label: t('reports.total21kGiven'), value: `${reportPayload.summary.total21kGiven.toFixed(2)}g`, accent: 'text-slate-900' },
        ].map((stat) => (
          <Card key={stat.label} className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.accent}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: t('reports.netGoldBalance'), value: `${reportPayload.summary.netGoldBalance.toFixed(2)}g`, accent: reportPayload.summary.netGoldBalance >= 0 ? 'text-gold' : 'text-rose-600' },
          { label: t('reports.totalLabour'), value: `SAR ${reportPayload.summary.totalLabour.toFixed(2)}`, accent: 'text-slate-900' },
          { label: t('reports.totalVat'), value: `SAR ${reportPayload.summary.totalVat.toFixed(2)}`, accent: 'text-slate-900' },
          { label: t('reports.grandTotal'), value: `SAR ${reportPayload.summary.grandTotal.toFixed(2)}`, accent: 'text-slate-900' },
          { label: t('reports.entryCount'), value: reportPayload.summary.entryCount.toString(), accent: 'text-slate-900' },
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
              {reportPayload.filters.startDate || (isUrdu ? 'تمام تاریخیں' : 'All dates')} {isUrdu ? 'تک' : 'to'} {reportPayload.filters.endDate || (isUrdu ? 'تمام تاریخیں' : 'All dates')}
              {reportPayload.filters.customerId ? ` • ${customers.find((customer) => customer.id === reportPayload.filters.customerId)?.fullName ?? (isUrdu ? 'منتخب مشتری' : 'Selected customer')}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              {t('reports.printReport')}
            </Button>
            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              {t('reports.exportCsv')}
            </Button>
          </div>
        </div>

        {reportPayload.entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            {t('reports.noEntries')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="px-3 py-3">{t('common.date')}</th>
                  <th className="px-3 py-3">{t('common.customer')}</th>
                  <th className="px-3 py-3">{t('reports.direction')}</th>
                  <th className="px-3 py-3">{t('common.mode')}</th>
                  <th className="px-3 py-3">24K</th>
                  <th className="px-3 py-3">21K</th>
                  <th className="px-3 py-3">{t('common.labourAmount')}</th>
                  <th className="px-3 py-3">VAT</th>
                  <th className="px-3 py-3">{t('reports.grandTotal')}</th>
                  <th className="px-3 py-3">{t('reports.invoice')}</th>
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
                  {reportPayload.filters.startDate || (isUrdu ? 'تمام تاریخیں' : 'All dates')} {isUrdu ? 'تک' : 'to'} {reportPayload.filters.endDate || (isUrdu ? 'تمام تاریخیں' : 'All dates')}
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
                    <th className="px-3 py-3">{t('common.date')}</th>
                    <th className="px-3 py-3">{t('common.customer')}</th>
                    <th className="px-3 py-3">{t('reports.direction')}</th>
                    <th className="px-3 py-3">{t('common.mode')}</th>
                    <th className="px-3 py-3">21K</th>
                    <th className="px-3 py-3">{t('common.labourAmount')}</th>
                    <th className="px-3 py-3">VAT</th>
                    <th className="px-3 py-3">{t('reports.grandTotal')}</th>
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
