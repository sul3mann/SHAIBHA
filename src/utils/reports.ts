import type { Customer } from '../types/customer'
import type { Entry } from '../types/entry'

export type ReportType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'customer'
  | 'gold-received'
  | 'gold-given'
  | 'labour'
  | 'vat'
  | 'invoice'

export interface ReportFilters {
  startDate: string
  endDate: string
  customerId: string
  direction: 'all' | 'receive' | 'give'
  entryMode: 'all' | 'gold' | 'labour' | 'both'
  invoiceFilter: 'all' | 'on' | 'off'
}

export interface ReportSummary {
  total24kReceived: number
  total21kReceived: number
  total24kGiven: number
  total21kGiven: number
  netGoldBalance: number
  totalLabour: number
  totalVat: number
  grandTotal: number
  entryCount: number
}

export interface ReportEntryRow {
  id: string
  date: string
  customerName: string
  direction: string
  entryMode: string
  invoiceNumber: string
  weight24k: number
  weight21k: number
  labourAmount: number
  vatAmount: number
  grandTotal: number
  notes: string
}

export interface ReportPayload {
  businessName: string
  reportType: ReportType
  title: string
  generatedAt: string
  filters: ReportFilters
  summary: ReportSummary
  entries: ReportEntryRow[]
}

export function getDefaultReportFilters(): ReportFilters {
  const today = new Date().toISOString().slice(0, 10)
  return {
    startDate: '',
    endDate: today,
    customerId: '',
    direction: 'all',
    entryMode: 'all',
    invoiceFilter: 'all',
  }
}

export function getReportTitle(reportType: ReportType, customerName = '') {
  const baseTitles: Record<ReportType, string> = {
    daily: 'Daily Report',
    weekly: 'Weekly Report',
    monthly: 'Monthly Report',
    yearly: 'Yearly Report',
    customer: 'Customer Report',
    'gold-received': 'Gold Received Report',
    'gold-given': 'Gold Given Report',
    labour: 'Labour Report',
    vat: 'VAT Report',
    invoice: 'Invoice Report',
  }

  if (customerName) {
    return `${baseTitles[reportType]} • ${customerName}`
  }

  return baseTitles[reportType]
}

export function getFilteredEntries(entries: Entry[], filters: ReportFilters) {
  const start = filters.startDate ? new Date(filters.startDate) : null
  const end = filters.endDate ? new Date(filters.endDate) : null
  const endOfDay = end ? new Date(end) : null

  if (endOfDay) {
    endOfDay.setHours(23, 59, 59, 999)
  }

  return entries
    .filter((entry) => {
      const entryDate = new Date(entry.date)
      if (start && entryDate < start) return false
      if (endOfDay && entryDate > endOfDay) return false
      if (filters.customerId && entry.customerId !== filters.customerId) return false
      if (filters.direction !== 'all' && entry.direction !== filters.direction) return false
      if (filters.entryMode !== 'all' && entry.entryMode !== filters.entryMode) return false
      if (filters.invoiceFilter === 'on' && !entry.invoiceEnabled) return false
      if (filters.invoiceFilter === 'off' && entry.invoiceEnabled) return false
      return true
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function buildReportSummary(entries: Entry[]): ReportSummary {
  return entries.reduce<ReportSummary>(
    (summary, entry) => {
      const weight24k = Number(entry.weight24k ?? 0)
      const weight21k = Number(entry.weight21k ?? 0)
      const labourAmount = Number(entry.labourAmount ?? 0)
      const vatAmount = Number(entry.vatAmount ?? 0)
      const grandTotal = Number(entry.grandTotal ?? 0)

      if (entry.direction === 'receive') {
        summary.total24kReceived += weight24k
        summary.total21kReceived += weight21k
      } else {
        summary.total24kGiven += weight24k
        summary.total21kGiven += weight21k
      }

      summary.totalLabour += labourAmount
      summary.totalVat += vatAmount
      summary.grandTotal += grandTotal
      summary.entryCount += 1

      return summary
    },
    {
      total24kReceived: 0,
      total21kReceived: 0,
      total24kGiven: 0,
      total21kGiven: 0,
      netGoldBalance: 0,
      totalLabour: 0,
      totalVat: 0,
      grandTotal: 0,
      entryCount: 0,
    },
  )
}

export function buildReportPayload(
  reportType: ReportType,
  filters: ReportFilters,
  entries: Entry[],
  customers: Customer[],
): ReportPayload {
  const filtered = getFilteredEntries(entries, filters)
  const filteredByType = filtered.filter((entry) => {
    if (reportType === 'gold-received') return entry.direction === 'receive'
    if (reportType === 'gold-given') return entry.direction === 'give'
    if (reportType === 'labour') return Number(entry.labourAmount ?? 0) > 0 || entry.entryMode !== 'gold'
    if (reportType === 'vat') return Number(entry.vatAmount ?? 0) > 0
    if (reportType === 'invoice') return entry.invoiceEnabled
    return true
  })
  const summary = buildReportSummary(filteredByType)
  summary.netGoldBalance = summary.total21kReceived - summary.total21kGiven

  const customerName = filters.customerId
    ? customers.find((customer) => customer.id === filters.customerId)?.fullName ?? 'Selected customer'
    : ''

  return {
    businessName: 'Shaibah Warsha',
    reportType,
    title: getReportTitle(reportType, customerName),
    generatedAt: new Date().toISOString(),
    filters,
    summary,
    entries: filteredByType.map((entry) => ({
      id: entry.id,
      date: entry.date,
      customerName: customers.find((customer) => customer.id === entry.customerId)?.fullName ?? 'Unknown',
      direction: entry.direction === 'receive' ? 'Gold Received' : 'Gold Given',
      entryMode: entry.entryMode === 'gold' ? 'Gold Only' : entry.entryMode === 'labour' ? 'Labour Only' : 'Gold + Labour',
      invoiceNumber: entry.invoiceNumber || '—',
      weight24k: Number(entry.weight24k ?? 0),
      weight21k: Number(entry.weight21k ?? 0),
      labourAmount: Number(entry.labourAmount ?? 0),
      vatAmount: Number(entry.vatAmount ?? 0),
      grandTotal: Number(entry.grandTotal ?? 0),
      notes: entry.notes ?? '',
    })),
  }
}

function escapeCsvValue(value: string | number | boolean) {
  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportReportToCsv(payload: ReportPayload) {
  const lines: string[][] = []
  lines.push(['Business Name', payload.businessName])
  lines.push(['Report Title', payload.title])
  lines.push(['Generated At', new Date(payload.generatedAt).toLocaleString()])
  lines.push(['Date Range', payload.filters.startDate || 'All', payload.filters.endDate || 'All'])
  lines.push(['Customer', payload.filters.customerId ? 'Selected customer' : 'All'])
  lines.push([])
  lines.push(['Summary'])
  lines.push(['Total 24K Received', payload.summary.total24kReceived.toFixed(2)])
  lines.push(['Total 21K Received', payload.summary.total21kReceived.toFixed(2)])
  lines.push(['Total 24K Given', payload.summary.total24kGiven.toFixed(2)])
  lines.push(['Total 21K Given', payload.summary.total21kGiven.toFixed(2)])
  lines.push(['Net Gold Balance', payload.summary.netGoldBalance.toFixed(2)])
  lines.push(['Total Labour', payload.summary.totalLabour.toFixed(2)])
  lines.push(['Total VAT', payload.summary.totalVat.toFixed(2)])
  lines.push(['Grand Total', payload.summary.grandTotal.toFixed(2)])
  lines.push(['Entry Count', String(payload.summary.entryCount)])
  lines.push([])
  lines.push(['Date', 'Customer', 'Direction', 'Entry Mode', '24K (g)', '21K (g)', 'Labour (SAR)', 'VAT (SAR)', 'Grand Total (SAR)', 'Invoice', 'Notes'])

  payload.entries.forEach((entry) => {
    lines.push([
      entry.date,
      entry.customerName,
      entry.direction,
      entry.entryMode,
      entry.weight24k.toFixed(2),
      entry.weight21k.toFixed(2),
      entry.labourAmount.toFixed(2),
      entry.vatAmount.toFixed(2),
      entry.grandTotal.toFixed(2),
      entry.invoiceNumber,
      entry.notes,
    ])
  })

  const csvContent = lines.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
  const filename = `${payload.reportType.toLowerCase().replace(/\s+/g, '-') || 'report'}.csv`
  downloadTextFile(filename, csvContent, 'text/csv;charset=utf-8')
}

export function exportReportToJson(payload: ReportPayload) {
  const filename = `${payload.reportType.toLowerCase().replace(/\s+/g, '-') || 'report'}.json`
  downloadTextFile(filename, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8')
}
