import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Car, Receipt, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mileage', icon: Car, label: 'Mileage' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface-1 flex flex-col">
      {/* Top bar - mobile */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-ink text-base tracking-tight">MileBack</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-slate-200 py-5 px-3 shrink-0">
          <div className="flex items-center gap-2.5 px-3 mb-7">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Car className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-ink text-base tracking-tight">MileBack</span>
          </div>

          <nav className="flex flex-col gap-0.5 flex-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100
                  ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-secondary hover:bg-surface-1 hover:text-ink'}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav - mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 gap-1 text-xs font-medium transition-colors
              ${isActive ? 'text-brand-600' : 'text-ink-muted'}`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
