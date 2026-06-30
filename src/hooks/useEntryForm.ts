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
      const numericValue = Number(value)

      if (updated.entryMode === 'gold' || updated.entryMode === 'both') {
        if (field === 'weight24k') {
          updated.weight21k = numericValue > 0 ? String(numericValue * formula.factor) : ''
        } else if (field === 'weight21k') {
          updated.weight24k = numericValue > 0 ? String(numericValue * formula.reverseFactor) : ''
        } else if (field === 'formulaMethod') {
          const current24k = Number(updated.weight24k)
          const current21k = Number(updated.weight21k)
          if (current24k > 0) {
            updated.weight21k = String(current24k * formula.factor)
          } else if (current21k > 0) {
            updated.weight24k = String(current21k * formula.reverseFactor)
          }
        }
      }

      if (updated.entryMode === 'labour' || updated.entryMode === 'both') {
        if (field === 'labourWeight21k' || field === 'labourRate') {
          const labourWeight = Number(updated.labourWeight21k)
          const labourRate = Number(updated.labourRate)
          updated.labourAmount = labourWeight > 0 && labourRate > 0 ? String(labourWeight * labourRate) : ''
        }
      }

      if (updated.vatEnabled && settings) {
        const labourAmount = Number(updated.labourAmount)
        updated.vatAmount = labourAmount > 0 ? String(labourAmount * (settings.vatPercentage / 100)) : ''
      } else {
        updated.vatAmount = 0
      }

      return updated
    })
  }

  const calculateGrandTotal = () => {
    const labour = Number(formData.labourAmount ?? 0)
    const vat = Number(formData.vatAmount ?? 0)
    return labour + vat
  }

  return {
    formData,
    updateField,
    calculateGrandTotal,
  }
}
