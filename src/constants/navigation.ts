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
  path: string
  icon: LucideIcon
}

export const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Entries', path: '/entries', icon: FileText },
  { name: 'Calculator', path: '/gold-calculator', icon: Calculator },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Activity Log', path: '/activity-log', icon: Activity },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Admin Panel', path: '/admin', icon: LogOut },
]
