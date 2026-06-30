import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, LayoutDashboard, Search, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { loadNotifications, NOTIFICATIONS_CHANGED_EVENT, type NotificationItem } from '../services/notificationService'

export function Topbar() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    const sync = () => setNotifications(loadNotifications())
    sync()
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, sync)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, sync)
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-xl lg:px-6">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden h-12 w-12 items-center justify-center rounded-3xl bg-gold text-black md:flex">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500 md:text-xs">Workshop Management</p>
            <h2 className="text-lg font-semibold text-slate-950">Dashboard Overview</h2>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 md:max-w-md">
          <div className="relative hidden w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-500 shadow-sm sm:flex">
            <Search className="h-4 w-4" />
            <input
              type="search"
              placeholder="Search records"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => setOpen((value) => !value)}>
            Notifications
          </Button>
          <Link
            to="/settings"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 sm:inline-flex"
          >
            Settings
          </Link>
          <div className="relative">
            <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-slate-300" onClick={() => setOpen((value) => !value)}>
              <Bell className="h-5 w-5" />
            </button>
            {open && (
              <div className="absolute right-0 mt-3 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950">Notifications</p>
                  <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-600">No notifications yet.</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        <p>{notification.message}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
