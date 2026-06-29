import { useEffect, useState } from 'react'
import type { Entry, EntryFormValues, FormulaMethod } from '../types/entry'
import { formulaMethods } from '../types/entry'
import type { WorkshopSettings } from '../types/settings'

export function useEntryForm(entry: Entry | null, settings: WorkshopSettings | null) {
  const [formData, setFormData] = useState<EntryFormValues>({
    customerId: '',
    date: new Date().toISOString().slice(0, 10),
    direction: 'receive',
    entryMode: 'gold',
    formulaMethod: 'method1',
    weight24k: 0,
    weight21k: 0,
    labourWeight21k: 0,
    labourRate: 0,
    labourAmount: 0,
    vatEnabled: false,
    vatAmount: 0,
    invoiceEnabled: false,
    invoiceNumber: '',
    notes: '',
    photos: [],
  })

  useEffect(() => {
    if (entry) {
      setFormData({
        customerId: entry.customerId,
        date: entry.date,
        direction: entry.direction,
        entryMode: entry.entryMode,
        formulaMethod: entry.formulaMethod,
        weight24k: entry.weight24k,
        weight21k: entry.weight21k,
        labourWeight21k: entry.labourWeight21k,
        labourRate: entry.labourRate,
        labourAmount: entry.labourAmount,
        vatEnabled: entry.vatEnabled,
        vatAmount: entry.vatAmount,
        invoiceEnabled: entry.invoiceEnabled,
        invoiceNumber: entry.invoiceNumber,
        notes: entry.notes,
        photos: entry.photos,
      })
    } else if (settings) {
      setFormData((prev) => ({
        ...prev,
        formulaMethod: settings.defaultFormula,
        vatEnabled: false,
      }))
    }
  }, [entry, settings])

  const updateField = (field: keyof EntryFormValues, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      const formula = formulaMethods[updated.formulaMethod as FormulaMethod]

      if (updated.entryMode === 'gold' || updated.entryMode === 'both') {
        if (field === 'weight24k' && value > 0) {
          updated.weight21k = parseFloat((value * formula.factor).toFixed(4))
        } else if (field === 'weight21k' && value > 0) {
          updated.weight24k = parseFloat((value * formula.reverseFactor).toFixed(4))
        }
      }

      if (updated.entryMode === 'labour' || updated.entryMode === 'both') {
        if (field === 'labourWeight21k' || field === 'labourRate') {
          updated.labourAmount = parseFloat(((updated.labourWeight21k ?? 0) * (updated.labourRate ?? 0)).toFixed(2))
        }
      }

      if (updated.vatEnabled && settings) {
        const baseAmount = (updated.weight24k ?? 0) * 100 + (updated.labourAmount ?? 0)
        updated.vatAmount = parseFloat((baseAmount * (settings.vatPercentage / 100)).toFixed(2))
      } else {
        updated.vatAmount = 0
      }

      return updated
    })
  }

  const calculateGrandTotal = () => {
    const goldValue = (formData.weight24k ?? 0) * 100
    const labour = formData.labourAmount ?? 0
    const vat = formData.vatAmount ?? 0
    return goldValue + labour + vat
  }

  return {
    formData,
    updateField,
    calculateGrandTotal,
  }
}
