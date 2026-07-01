import { useEffect, useMemo, useState } from 'react'
import { Download, Search, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { ACTIVITY_LOG_CHANGED_EVENT, clearActivityLog, loadActivityLog, type ActivityLogEntry } from '../services/activityService'

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function ActivityLog() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([])
  const [query, setQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const sync = () => setEntries(loadActivityLog())
    sync()
    window.addEventListener(ACTIVITY_LOG_CHANGED_EVENT, sync)
    return () => window.removeEventListener(ACTIVITY_LOG_CHANGED_EVENT, sync)
  }, [])

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return entries.filter((entry) => {
      const matchesAction = actionFilter === 'all' || entry.action === actionFilter
      const matchesQuery =
        normalizedQuery.length === 0 ||
        entry.action.toLowerCase().includes(normalizedQuery) ||
        entry.details.toLowerCase().includes(normalizedQuery)
      const entryDate = new Date(entry.createdAt)
      const matchesStart = !startDate || entryDate >= new Date(startDate)
      const matchesEnd = !endDate || entryDate <= new Date(`${endDate}T23:59:59`)
      return matchesAction && matchesQuery && matchesStart && matchesEnd
    })
  }, [actionFilter, endDate, entries, query, startDate])

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredEntries, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'shaibah-activity-log.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCsv = () => {
    const rows = filteredEntries.map((entry) => [entry.action, entry.details, formatDate(entry.createdAt), entry.createdBy ?? 'System'].join(','))
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'shaibah-activity-log.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Activity Log</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Recent workshop activity</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Audit trails for customer actions, entry changes, exports, imports, and settings updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportJson}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="ghost" onClick={() => { clearActivityLog(); setEntries([]) }} className="border border-rose-200 text-rose-600 hover:bg-rose-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear log
          </Button>
        </div>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">Search</span>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="mr-2 h-4 w-4 text-slate-400" />
              <input className="w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search details" />
            </div>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">Action</span>
            <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none" value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
              <option value="all">All actions</option>
              <option value="Customer added">Customer added</option>
              <option value="Customer edited">Customer edited</option>
              <option value="Customer deleted">Customer deleted</option>
              <option value="Entry added">Entry added</option>
              <option value="Entry edited">Entry edited</option>
              <option value="Entry deleted">Entry deleted</option>
              <option value="Entry duplicated">Entry duplicated</option>
              <option value="Ledger viewed">Ledger viewed</option>
              <option value="Report generated">Report generated</option>
              <option value="Data exported">Data exported</option>
              <option value="Data imported">Data imported</option>
              <option value="Settings changed">Settings changed</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">Start date</span>
            <input type="date" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">End date</span>
            <input type="date" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
        </div>
      </Card>

      {filteredEntries.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No activity found for the current filters.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-950">{entry.action}</h2>
                  <Badge tone={entry.action.includes('deleted') ? 'warning' : entry.action.includes('added') || entry.action.includes('import') ? 'success' : 'gold'}>{entry.action}</Badge>
                </div>
                <p className="text-sm text-slate-600">{entry.details}</p>
                <div className="space-y-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <p>{entry.userName ?? entry.createdBy ?? 'System'}</p>
                  <p>{entry.username ? `@${entry.username}` : '—'}</p>
                  <p>{entry.role ?? '—'}</p>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                <p>{formatDate(entry.createdAt)}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleTimeString()}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
