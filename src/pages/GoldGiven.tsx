import { Card } from '../components/ui/Card'

export default function GoldGiven() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Gold Given</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Gold disbursement</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Tracking gold issued to clients and transfers, designed for later task-based inventory controls.
        </p>
      </div>
      <Card>
        <p className="text-sm text-slate-600">This section is prepared for disbursement summaries and gold distribution management.</p>
      </Card>
    </div>
  )
}
