import type { ComponentType, SVGProps } from 'react'

export interface PageMeta {
  title: string
  subtitle: string
}

export interface NavigationItem {
  name: string
  path: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}
