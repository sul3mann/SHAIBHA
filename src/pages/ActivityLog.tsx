import { Card } from '../components/ui/Card'

export default function ActivityLog() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Activity Log</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Recent workshop activity</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          A timeline view for future activity and audit trails, designed for transparency and accountability.
        </p>
      </div>
      <Card>
        <p className="text-sm text-slate-600">This page will display log entries once actions are connected to the system.</p>
      </Card>
    </div>
  )
}
