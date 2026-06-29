import { Card } from '../components/ui/Card'

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Reports</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Insight dashboards</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Build polished reports for workshop performance, material usage, and customer activity in the next phase.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Workflow reports</h2>
          <p className="mt-2 text-sm text-slate-600">Ready for charts and summary metrics.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Inventory reports</h2>
          <p className="mt-2 text-sm text-slate-600">A professional layout for gold holdings and usage.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Customer insights</h2>
          <p className="mt-2 text-sm text-slate-600">Placeholders for customer activity and performance graphs.</p>
        </Card>
      </div>
    </div>
  )
}
