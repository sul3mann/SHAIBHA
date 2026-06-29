import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl py-20 text-center">
      <Card className="space-y-6">
        <div>
          <h1 className="text-4xl font-semibold text-slate-950">Page not found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The requested page does not exist yet. Use the navigation to return to the main dashboard.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#b58d2e]"
        >
          Go back home
        </Link>
      </Card>
    </div>
  )
}
