import { useEffect, useState } from 'react'
import { Download, Upload, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formulaMethods } from '../types/entry'
import { loadSettings, saveSettings, exportData, importData, clearAllDataWithLedger } from '../services/entryService'
import { addActivityLogEntry, buildBackupPayload, exportBackupJson, importBackupPayload, validateBackupPayload } from '../services/activityService'
import type { WorkshopSettings } from '../types/settings'
import { useLanguage } from '../context/LanguageContext'

export default function SettingsPage() {
  const { t } = useLanguage()
  const [settings, setSettings] = useState<WorkshopSettings | null>(null)
  const [localSettings, setLocalSettings] = useState<WorkshopSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    setLocalSettings(loaded)
  }, [])

  const handleSaveSettings = () => {
    if (!localSettings) return
    setIsSaving(true)
    setTimeout(() => {
      saveSettings(localSettings)
      setSettings(localSettings)
      addActivityLogEntry('Settings changed', `Updated settings for ${localSettings.workshopName}`)
      setIsSaving(false)
    }, 300)
  }

  const handleExportData = () => {
    const data = exportData()
    addActivityLogEntry('Data exported', 'Exported data from settings page')
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(data))
    element.setAttribute('download', 'shaibah-warsha-export.json')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          if (importData(content)) {
            addActivityLogEntry('Data imported', 'Imported data from uploaded backup file')
            alert('Data imported successfully')
            window.location.reload()
          } else {
            alert('Failed to import data. Please check the file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleClearAll = () => {
    clearAllDataWithLedger()
    addActivityLogEntry('Data cleared', 'Cleared all local workshop data')
    alert('All data cleared')
    window.location.reload()
  }

  const handleBackupDownload = () => {
    const payload = buildBackupPayload()
    exportBackupJson(payload)
    addActivityLogEntry('Data exported', 'Downloaded full backup JSON')
  }

  const handleBackupImport = () => {
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
            alert('Invalid backup file. Please select a valid Shaibah backup export.')
            return
          }
          const imported = importBackupPayload(parsed)
          if (imported) {
            addActivityLogEntry('Data imported', 'Restored data from backup JSON')
            alert('Backup restored successfully')
            window.location.reload()
          } else {
            alert('The backup file could not be restored.')
          }
        } catch {
          alert('The backup file could not be read.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  if (!settings || !localSettings) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-sm text-slate-600">{t('common.loading')}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('common.settings')}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{t('settings.title')}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t('settings.description')}</p>
      </div>

      <Card className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-950">{t('settings.workshopInfo')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t('settings.workshopName')}
            value={localSettings.workshopName}
            onChange={(e) => setLocalSettings({ ...localSettings, workshopName: e.target.value })}
          />
          <Input
            label={t('settings.phone')}
            value={localSettings.workshopPhone}
            onChange={(e) => setLocalSettings({ ...localSettings, workshopPhone: e.target.value })}
          />
          <div className="md:col-span-2">
            <Input
              label={t('settings.address')}
              value={localSettings.workshopAddress}
              onChange={(e) => setLocalSettings({ ...localSettings, workshopAddress: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-950">{t('settings.businessRules')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-700">
            <span>{t('settings.vatPercentage')}</span>
            <input
              type="number"
              step="0.01"
              value={localSettings.vatPercentage}
              onChange={(e) => setLocalSettings({ ...localSettings, vatPercentage: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            <span>{t('settings.currency')}</span>
            <input
              type="text"
              value={localSettings.currency}
              onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-700 md:col-span-2">
            <span>{t('settings.defaultFormula')}</span>
            <select
              value={localSettings.defaultFormula}
              onChange={(e) => setLocalSettings({ ...localSettings, defaultFormula: e.target.value as any })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              {Object.entries(formulaMethods).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card className="space-y-4 border-t-2 border-gold pt-6">
        <h2 className="text-xl font-semibold text-slate-950">{t('settings.dataManagement')}</h2>
        <p className="text-sm text-slate-600">{t('settings.dataDescription')}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            {t('settings.exportData')}
          </Button>
          <Button variant="outline" onClick={handleImportData}>
            <Upload className="mr-2 h-4 w-4" />
            {t('settings.importData')}
          </Button>
          <Button variant="outline" onClick={handleBackupDownload}>
            <Download className="mr-2 h-4 w-4" />
            {t('settings.backupJson')}
          </Button>
          <Button variant="outline" onClick={handleBackupImport}>
            <Upload className="mr-2 h-4 w-4" />
            {t('settings.restoreBackup')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowClearConfirm(true)}
            className="border border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('settings.clearAllData')}
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? t('common.loading') : t('common.saveSettings')}
        </Button>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title={t('settings.clearAllTitle')}
        description={t('settings.clearAllDescription')}
        confirmLabel={t('settings.confirmClearAll')}
        cancelLabel={t('settings.cancel')}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  )
}
