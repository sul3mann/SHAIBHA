import { Card } from '../components/ui/Card'

export default function GoldCalculator() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Gold Calculator</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Calculator workspace</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Prepared for future gold pricing and weight calculations without implementing logic yet.
        </p>
      </div>
      <Card>
        <p className="text-sm text-slate-600">Modern calculator UI placeholders are ready for next development steps.</p>
      </Card>
    </div>
  )
}
