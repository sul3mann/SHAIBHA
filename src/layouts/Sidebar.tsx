import { NavLink } from 'react-router-dom'
import { navigation } from '../constants/navigation'
import { classNames } from '../utils/classNames'
import { useLanguage } from '../context/LanguageContext'

export function Sidebar() {
  const { isUrdu, t } = useLanguage()
  return (
    <aside className="hidden h-full w-72 shrink-0 flex-col gap-2 border-r border-slate-200 bg-white px-4 py-6 lg:flex">
      <div className="mb-8 px-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Shaibah Warsha</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{isUrdu ? 'گولڈ ورکشاپ' : 'Gold Workshop'}</h1>
      </div>
      <nav className="space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              classNames(
                'group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-gold text-black shadow-soft'
                  : 'text-slate-700 hover:bg-slate-100',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {t(`nav.${item.key}`)}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
