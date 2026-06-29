import type { ReactNode } from 'react'

interface TableProps {
  headers: string[]
  children: ReactNode
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <table className="min-w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-4 font-semibold uppercase tracking-[0.12em] text-slate-500">
                {header}
              </th>
            ))}
            <th className="px-4 py-4 text-right font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
