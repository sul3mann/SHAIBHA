import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Footer } from './Footer'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Topbar />
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:gap-6 lg:px-6">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
