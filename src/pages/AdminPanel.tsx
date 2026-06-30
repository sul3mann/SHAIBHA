import { useEffect, useMemo, useState } from 'react'
import { Download, Upload, ShieldCheck, DatabaseZap, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { loadCustomers } from '../services/customerService'
import { loadEntries } from '../services/entryService'
import { buildBackupPayload, exportBackupJson, importBackupPayload, validateBackupPayload, clearAllWorkspaceData, getLastBackupDate, addActivityLogEntry } from '../services/activityService'
import { loadLedger } from '../services/ledgerService'
import { loadNotifications } from '../services/notificationService'

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  const units = ['KB', 'MB', 'GB']
  let value = size / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

export default function AdminPanel() {
  const [customers, setCustomers] = useState(() => loadCustomers())
  const [entries, setEntries] = useState(() => loadEntries())
  const [ledger, setLedger] = useState(() => loadLedger())
  const [notifications, setNotifications] = useState(() => loadNotifications())
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(getLastBackupDate())

  useEffect(() => {
    const refresh = () => {
      setCustomers(loadCustomers())
      setEntries(loadEntries())
      setLedger(loadLedger())
      setNotifications(loadNotifications())
      setLastBackupDate(getLastBackupDate())
    }

    refresh()
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])

  const storageSize = useMemo(() => {
    const raw = Object.entries(window.localStorage).reduce((acc, [key, value]) => acc + key.length + value.length, 0)
    return formatBytes(raw)
  }, [customers, entries, ledger, notifications])

  const handleExportAll = () => {
    const payload = buildBackupPayload()
    exportBackupJson(payload)
    addActivityLogEntry('Data exported', 'Downloaded full backup from admin panel')
    setLastBackupDate(new Date().toISOString())
  }

  const handleImportAll = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        try {
          const parsed = JSON.parse(loadEvent.target?.result as string)
          if (!validateBackupPayload(parsed)) {
            alert('Invalid backup file. Please use a valid Shaibah backup export.')
            return
          }
          const imported = importBackupPayload(parsed)
          if (imported) {
            addActivityLogEntry('Data imported', 'Imported full backup from admin panel')
            alert('Backup restored successfully')
            window.location.reload()
          }
        } catch {
          alert('The selected file could not be restored.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClearAll = () => {
    const confirmed = window.confirm('This will remove all local customers, entries, settings, ledger, notifications, and logs. Continue?')
    if (!confirmed) return
    clearAllWorkspaceData()
    addActivityLogEntry('Data cleared', 'Cleared all data from admin panel')
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Admin Panel</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Administration</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Manage customers, data integrity, backups, and safety tools for the workshop.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total customers', value: customers.length.toString() },
          { label: 'Total entries', value: entries.length.toString() },
          { label: 'Storage used', value: storageSize },
          { label: 'Last backup/export', value: lastBackupDate ? new Date(lastBackupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not yet' },
        ].map((item) => (
          <Card key={item.label} className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="text-2xl font-semibold text-slate-950">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-gold" />
          <h2 className="text-xl font-semibold text-slate-950">Data health check</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Customers</p>
            <p className="mt-1">{customers.length > 0 ? 'Customer records are available.' : 'No customer records yet.'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Entries</p>
            <p className="mt-1">{entries.length > 0 ? 'Entry records are available.' : 'No entry records yet.'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Ledger</p>
            <p className="mt-1">{ledger.length > 0 ? 'Ledger data is synced.' : 'No ledger records available.'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Notifications</p>
            <p className="mt-1">{notifications.length > 0 ? 'Notifications are active.' : 'No notifications recorded yet.'}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <DatabaseZap className="h-5 w-5 text-gold" />
          <h2 className="text-xl font-semibold text-slate-950">Backup & restore</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={handleExportAll}>
            <Download className="mr-2 h-4 w-4" />
            Download full backup JSON
          </Button>
          <Button variant="outline" onClick={handleImportAll}>
            <Upload className="mr-2 h-4 w-4" />
            Restore from backup JSON
          </Button>
          <Button variant="ghost" onClick={handleClearAll} className="border border-rose-200 text-rose-600 hover:bg-rose-50">
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear all data
          </Button>
        </div>
      </Card>
    </div>
  )
}
