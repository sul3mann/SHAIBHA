import {
  Activity,
  BarChart3,
  Calculator,
  Home,
  LogOut,
  Settings,
  Users,
  FileText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  name: string
  key: string
  path: string
  icon: LucideIcon
}

export const navigation: NavItem[] = [
  { name: 'Dashboard', key: 'dashboard', path: '/', icon: Home },
  { name: 'Customers', key: 'customers', path: '/customers', icon: Users },
  { name: 'Entries', key: 'entries', path: '/entries', icon: FileText },
  { name: 'Calculator', key: 'calculator', path: '/gold-calculator', icon: Calculator },
  { name: 'Reports', key: 'reports', path: '/reports', icon: BarChart3 },
  { name: 'Activity Log', key: 'activityLog', path: '/activity-log', icon: Activity },
  { name: 'Settings', key: 'settings', path: '/settings', icon: Settings },
  { name: 'Admin Panel', key: 'adminPanel', path: '/admin', icon: LogOut },
]
