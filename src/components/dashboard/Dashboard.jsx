import { useNavigate } from 'react-router-dom'
import { Car, Receipt, Download, TrendingUp, Route, ArrowRight, Plus } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { formatCurrency, formatDate, formatMiles, getMonthClaims } from '../../utils/formatters'
import StatusBadge from '../ui/StatusBadge'
import { format } from 'date-fns'

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card p-5">
      <p className="text-surface-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${accent || 'text-white'}`}>{value}</p>
      {sub && <p className="text-surface-400 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { mileageClaims, expenses } = useApp()
  const { monthMileage, monthExpenses, mileageTotal, expenseTotal, combined, totalMiles } = getMonthClaims(mileageClaims, expenses)

  const recentActivity = [
    ...mileageClaims.slice(0, 4).map(c => ({ ...c, type: 'mileage' })),
    ...expenses.slice(0, 4).map(e => ({ ...e, type: 'expense' })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-surface-400 text-sm">{format(new Date(), 'MMMM yyyy')}</p>
        <h1 className="text-2xl font-semibold text-white mt-0.5">Dashboard</h1>
      </div>

      {/* Quick Actions */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => navigate('/mileage/add')}
          className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-all hover:border-brand-500/50"
        >
          <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
            <Car size={18} className="text-brand-400" />
          </div>
          <span className="text-xs font-medium text-white text-center">Add Mileage</span>
        </button>
        <button
          onClick={() => navigate('/expenses/add')}
          className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-all hover:border-brand-500/50"
        >
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Receipt size={18} className="text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-white text-center">Add Expense</span>
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-all hover:border-brand-500/50"
        >
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <Download size={18} className="text-amber-400" />
          </div>
          <span className="text-xs font-medium text-white text-center">Export</span>
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-3">This Month</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Claim Value" value={formatCurrency(combined)} accent="text-brand-400" />
          <StatCard label="Total Miles" value={formatMiles(totalMiles)} sub={`${monthMileage.length} journeys`} />
          <StatCard label="Mileage Claims" value={formatCurrency(mileageTotal)} sub={`${monthMileage.length} entries`} />
          <StatCard label="Expenses" value={formatCurrency(expenseTotal)} sub={`${monthExpenses.length} entries`} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium text-surface-400 uppercase tracking-wide">Recent Activity</h2>
          <button onClick={() => navigate('/reports')} className="text-brand-400 text-xs flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="card divide-y divide-surface-800">
          {recentActivity.length === 0 && (
            <p className="text-surface-400 text-sm p-4 text-center">No claims yet</p>
          )}
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'mileage' ? 'bg-brand-500/20' : 'bg-emerald-500/20'}`}>
                {item.type === 'mileage'
                  ? <Car size={15} className="text-brand-400" />
                  : <Receipt size={15} className="text-emerald-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {item.type === 'mileage' ? (item.reason || `${item.startPostcode} → ${item.endPostcode}`) : item.description}
                </p>
                <p className="text-xs text-surface-400">{formatDate(item.date)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-white">
                  {item.type === 'mileage' ? formatCurrency(item.total) : formatCurrency(item.amount)}
                </p>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
