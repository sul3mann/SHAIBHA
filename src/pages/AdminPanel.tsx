import { Card } from '../components/ui/Card'

export default function AdminPanel() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Admin Panel</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Administration</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Workshop administration and system management tools.
        </p>
      </div>
      <Card>
        <p className="text-sm text-slate-600">Admin panel features coming soon.</p>
      </Card>
    </div>
  )
}
