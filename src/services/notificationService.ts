export interface NotificationItem {
  id: string
  message: string
  type: 'info' | 'success' | 'warning'
  createdAt: string
}

const STORAGE_KEY = 'shaibah_notifications'
export const NOTIFICATIONS_CHANGED_EVENT = 'shaibah:notifications-changed'

function emitNotificationsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT))
  }
}

export function loadNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as NotificationItem[]) : []
  } catch {
    return []
  }
}

export function saveNotifications(notifications: NotificationItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  emitNotificationsChanged()
}

export function addNotification(message: string, type: NotificationItem['type'] = 'info') {
  const notifications = loadNotifications()
  const next: NotificationItem[] = [
    {
      id: crypto.randomUUID(),
      message,
      type,
      createdAt: new Date().toISOString(),
    },
    ...notifications,
  ].slice(0, 20)

  saveNotifications(next)
  return next[0]
}

export function clearNotifications() {
  saveNotifications([])
}
