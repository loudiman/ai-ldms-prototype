import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'

interface NavItem {
  to: string
  label: string
  stories: string
  icon: JSX.Element
}

const I = (d: string) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const NAV: NavItem[] = [
  { to: '/', label: 'Parcel Map', stories: 'US-001 · 002 · 003', icon: I('M9 20l-5.4 1.8a1 1 0 01-1.3-1V5.6a1 1 0 01.7-1L9 3m0 17l6-2m-6 2V3m6 15l5.4 1.8a1 1 0 001.3-1V4.6a1 1 0 00-.7-1L15 1.8m0 16.2V1.8m0 0L9 3') },
  { to: '/environment', label: 'Environment', stories: 'US-004 · 005 · 006', icon: I('M12 22s8-4 8-11a8 8 0 10-16 0c0 7 8 11 8 11zM12 7v8M9 10l3-3 3 3') },
  { to: '/permits', label: 'Permits', stories: 'US-007 · 008 · 009', icon: I('M9 12h6M9 16h6M9 8h2M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM14 3v5h5') },
  { to: '/valuation', label: 'Valuation', stories: 'US-010 · 011', icon: I('M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6') },
  { to: '/community', label: 'Community', stories: 'US-012 · 013', icon: I('M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75') },
  { to: '/analytics', label: 'Analytics', stories: 'US-014 · 015', icon: I('M3 3v18h18M7 14l4-4 3 3 5-6') },
]

export default function Layout() {
  const [alertsOpen, setAlertsOpen] = useState(false)
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-brand text-white flex flex-col">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center w-9 h-9 rounded-lg bg-white/15">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" /></svg>
            </div>
            <div>
              <div className="font-bold leading-tight">AI-LDMS</div>
              <div className="text-[11px] text-white/70 leading-tight">Land Development &amp; Management</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto scroll-thin">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ' +
                (isActive ? 'bg-white/15 border-l-4 border-white font-semibold' : 'border-l-4 border-transparent text-white/85 hover:bg-white/10')
              }
            >
              <span className="opacity-90">{n.icon}</span>
              <span className="flex flex-col">
                <span>{n.label}</span>
                <span className="text-[10px] text-white/55">{n.stories}</span>
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-3 text-[10px] text-white/50 border-t border-white/10">
          Prototype v0.1 · Demonstration build
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-amber-100 text-amber-900 text-xs text-center py-1 border-b border-amber-200">
          Demonstration prototype — all parcels, AI outputs and figures shown are simulated sample data.
        </div>
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-gray-500">
            Malinao Valley District · <span className="text-gray-700 font-medium">National Land Authority</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAlertsOpen((v) => !v)}
              className="relative inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" /></svg>
              AI Alerts
              <span className="absolute -top-1.5 left-3 bg-red-600 text-white text-[10px] rounded-full px-1.5 leading-4">11</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-light text-brand grid place-items-center text-xs font-bold">LA</div>
              <span className="text-sm text-gray-600">Administrator</span>
            </div>
          </div>
        </header>

        {alertsOpen && (
          <div className="absolute right-6 top-24 z-[1200] w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-3 text-sm">
            <div className="font-semibold text-gray-700 mb-2">AI Alerts (sample)</div>
            <ul className="space-y-2">
              <li className="flex gap-2"><span className="text-red-600">●</span> 3 critical deforestation alerts — Environment</li>
              <li className="flex gap-2"><span className="text-red-600">●</span> 1 boundary dispute (double-titling) — Parcel Map</li>
              <li className="flex gap-2"><span className="text-amber-600">●</span> 3 under-valued transactions — Valuation</li>
              <li className="flex gap-2"><span className="text-amber-600">●</span> 1 indigenous-domain consultation due — Community</li>
            </ul>
          </div>
        )}

        <main className="flex-1 overflow-y-auto scroll-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
