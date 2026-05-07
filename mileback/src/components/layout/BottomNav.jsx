import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Car, Receipt, BarChart2, Settings } from 'lucide-react'
import { useApp } from '../../store/AppContext'

export default function BottomNav() {
  const { mileageClaims, expenses } = useApp()
  const draftCount = mileageClaims.filter(c => c.status === 'draft').length
                   + expenses.filter(e => e.status === 'draft').length

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/mileage', icon: Car, label: 'Mileage', badge: draftCount },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/reports', icon: BarChart2, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-950/95 backdrop-blur border-t border-surface-800 z-40">
      <div className="flex">
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${isActive ? 'text-brand-400' : 'text-surface-500'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={20} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 bg-amber-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
                <span className={`w-1 h-1 rounded-full transition-opacity ${isActive ? 'bg-brand-400 opacity-100' : 'opacity-0'}`} />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
