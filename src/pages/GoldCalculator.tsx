import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { formulaMethods, type FormulaMethod } from '../types/entry'
import { loadSettings } from '../services/entryService'
import type { WorkshopSettings } from '../types/settings'
import { useLanguage } from '../context/LanguageContext'

function parseDecimal(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00'
}

export default function GoldCalculator() {
  const { isUrdu } = useLanguage()
  const [settings, setSettings] = useState<WorkshopSettings | null>(null)
  const [formulaMethod, setFormulaMethod] = useState<FormulaMethod>('method1')
  const [twentyFourKInput, setTwentyFourKInput] = useState('1')
  const [twentyOneKInput, setTwentyOneKInput] = useState('1')
  const [labourWeight, setLabourWeight] = useState('1')
  const [labourRate, setLabourRate] = useState('100')
  const [cashIn, setCashIn] = useState('1000')
  const [cashOut, setCashOut] = useState('250')
  const [balance, setBalance] = useState('750')

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const conversionFormula = formulaMethods[formulaMethod]
  const twentyOneKResult = useMemo(() => parseDecimal(twentyFourKInput) * conversionFormula.factor, [conversionFormula.factor, twentyFourKInput])
  const twentyFourKResult = useMemo(() => parseDecimal(twentyOneKInput) * conversionFormula.reverseFactor, [conversionFormula.reverseFactor, twentyOneKInput])
  const labourAmount = useMemo(() => parseDecimal(labourWeight) * parseDecimal(labourRate), [labourRate, labourWeight])
  const vatPercentage = settings?.vatPercentage ?? 15
  const vatAmount = useMemo(() => labourAmount * (vatPercentage / 100), [labourAmount, vatPercentage])
  const grandTotal = useMemo(() => labourAmount + vatAmount, [labourAmount, vatAmount])

  const handleCashFieldChange = (field: 'cashIn' | 'cashOut' | 'balance', value: string) => {
    const numericValue = parseDecimal(value)
    if (field === 'cashIn') {
      setCashIn(value)
      setBalance((numericValue - parseDecimal(cashOut)).toString())
    } else if (field === 'cashOut') {
      setCashOut(value)
      setBalance((parseDecimal(cashIn) - numericValue).toString())
    } else {
      setBalance(value)
      setCashIn((parseDecimal(cashOut) + numericValue).toString())
    }
  }

  const ui = {
    title: isUrdu ? 'گولڈ کیلکولیٹر' : 'Gold Calculator',
    subtitle: isUrdu ? 'سونے کی وزن، مزدوری اور نقدی حساب کتاب' : 'Calculate gold weights, labour, VAT, and cash movement',
    conversionTitle: isUrdu ? 'وزن کی تبدیلی' : 'Weight Conversion',
    conversionDescription: isUrdu ? '24K اور 21K وزن کے درمیان براہ راست تبدیلی' : 'Convert between 24K and 21K weights instantly',
    formulaLabel: isUrdu ? 'فارمولا منتخب کریں' : 'Select formula',
    twentyFourKLabel: isUrdu ? '24K وزن (g)' : '24K Weight (g)',
    twentyOneKLabel: isUrdu ? '21K وزن (g)' : '21K Weight (g)',
    resultLabel: isUrdu ? 'نتیجہ' : 'Result',
    labourTitle: isUrdu ? 'مزدوری اور VAT' : 'Labour and VAT',
    labourDescription: isUrdu ? 'مزدوری کی مقدار اور وی اے ٹی کا حساب' : 'Calculate labour amount and VAT using the workshop settings',
    weightLabel: isUrdu ? 'وزن (g)' : 'Weight (g)',
    rateLabel: isUrdu ? 'شرح (SAR/g)' : 'Rate (SAR/g)',
    labourAmountLabel: isUrdu ? 'مزدوری' : 'Labour Amount',
    vatLabel: isUrdu ? 'وی اے ٹی' : 'VAT',
    totalLabel: isUrdu ? 'کل' : 'Grand Total',
    cashTitle: isUrdu ? 'نقدی حساب' : 'Cash Calculator',
    cashDescription: isUrdu ? 'کیش ان، کیش آؤٹ اور بیلنس کے درمیان تبدیلی' : 'Calculate cash in, cash out, and balance',
    cashInLabel: isUrdu ? 'کیش ان' : 'Cash In',
    cashOutLabel: isUrdu ? 'کیش آؤٹ' : 'Cash Out',
    balanceLabel: isUrdu ? 'بیلنس' : 'Balance',
    formulaOptions: {
      method1: isUrdu ? 'فارمولا 1: ×1.14' : 'Formula 1: ×1.14',
      method2: isUrdu ? 'فارمولا 2: ×1.142' : 'Formula 2: ×1.142',
      method3: isUrdu ? 'فارمولا 3: ×(24/21)' : 'Formula 3: ×(24/21)',
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{ui.title}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{ui.subtitle}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{ui.subtitle}</p>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-950">{ui.conversionTitle}</h2>
          <p className="text-sm text-slate-600">{ui.conversionDescription}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">{ui.formulaLabel}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(formulaMethods).map(([key]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormulaMethod(key as FormulaMethod)}
                className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${formulaMethod === key ? 'border-gold bg-gold text-black' : 'border-slate-200 bg-white text-slate-700 hover:border-gold'}`}
              >
                {key === 'method1' ? ui.formulaOptions.method1 : key === 'method2' ? ui.formulaOptions.method2 : ui.formulaOptions.method3}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <span>{ui.twentyFourKLabel}</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={twentyFourKInput}
              onChange={(event) => setTwentyFourKInput(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
            <div className="rounded-2xl border border-gold/20 bg-gold/5 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{ui.resultLabel}</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{formatNumber(twentyOneKResult)} g 21K</p>
            </div>
          </label>

          <label className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <span>{ui.twentyOneKLabel}</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={twentyOneKInput}
              onChange={(event) => setTwentyOneKInput(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
            <div className="rounded-2xl border border-gold/20 bg-gold/5 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{ui.resultLabel}</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{formatNumber(twentyFourKResult)} g 24K</p>
            </div>
          </label>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-950">{ui.labourTitle}</h2>
          <p className="text-sm text-slate-600">{ui.labourDescription}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="grid gap-2 text-sm text-slate-700">
            <span>{ui.weightLabel}</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={labourWeight}
              onChange={(event) => setLabourWeight(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            <span>{ui.rateLabel}</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={labourRate}
              onChange={(event) => setLabourRate(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{ui.labourAmountLabel}</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">SAR {formatNumber(labourAmount)}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{ui.vatLabel}</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">SAR {formatNumber(vatAmount)} ({vatPercentage}%)</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{ui.totalLabel}</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">SAR {formatNumber(grandTotal)}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-950">{ui.cashTitle}</h2>
          <p className="text-sm text-slate-600">{ui.cashDescription}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="grid gap-2 text-sm text-slate-700">
            <span>{ui.cashInLabel}</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={cashIn}
              onChange={(event) => handleCashFieldChange('cashIn', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            <span>{ui.cashOutLabel}</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={cashOut}
              onChange={(event) => handleCashFieldChange('cashOut', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            <span>{ui.balanceLabel}</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={balance}
              onChange={(event) => handleCashFieldChange('balance', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
        </div>
      </Card>
    </div>
  )
}
