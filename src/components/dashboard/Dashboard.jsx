import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Receipt, Download, ArrowRight, Plus, CheckCircle2, Loader2 } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { formatCurrency, formatDate, formatMiles, getFinancialSummary, calcMileageTotal } from '../../utils/formatters'
import StatusBadge from '../ui/StatusBadge'
import { format } from 'date-fns'

function QuickLog({ onSaved }) {
  const { vehicles, settings, addMileageClaim } = useApp()
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ odometerStart: '', odometerEnd: '', reason: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const miles = (() => {
    const s = parseFloat(form.odometerStart)
    const e = parseFloat(form.odometerEnd)
    return (!isNaN(s) && !isNaN(e) && e > s) ? Math.round((e - s) * 10) / 10 : null
  })()

  const handleSave = () => {
    if (miles === null) return
    const defaultVehicle = vehicles.find(v => v.isDefault) || vehicles[0]
    const rate = Number(settings.standardRate || 0.45)
    addMileageClaim({
      date: format(new Date(), 'yyyy-MM-dd'),
      vehicleId: defaultVehicle?.id || '',
      vehicleName: defaultVehicle?.name || '',
      startPostcode: '', endPostcode: '',
      startLocationName: '', endLocationName: '',
      reason: form.reason,
      miles,
      rate,
      odometerStart: form.odometerStart,
      odometerEnd: form.odometerEnd,
      returnJourney: false,
      notes: '',
      status: 'draft',
      total: calcMileageTotal(miles, rate, false),
    })
    setSaved(true)
    setForm({ odometerStart: '', odometerEnd: '', reason: '' })
    onSaved?.()
    setTimeout(() => { setSaved(false); setOpen(false) }, 1800)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 card p-3.5 text-sm font-medium text-brand-400 hover:border-brand-500/50 active:scale-95 transition-all"
      >
        <Plus size={15} /> Log today's journey
      </button>
    )
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="text-xs font-medium text-surface-300 uppercase tracking-wide">Quick Log</p>
      {saved ? (
        <div className="flex items-center justify-center gap-2 py-3 text-emerald-400">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">Journey saved!</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-base">Start reading</label>
              <input type="text" inputMode="decimal" className="input-base" placeholder="e.g. 45230"
                value={form.odometerStart} onChange={e => set('odometerStart', e.target.value)} autoFocus />
            </div>
            <div>
              <label className="label-base">End reading</label>
              <input type="text" inputMode="decimal" className="input-base" placeholder="e.g. 45274"
                value={form.odometerEnd} onChange={e => set('odometerEnd', e.target.value)} />
            </div>
          </div>
          {miles !== null && (
            <p className="text-xs text-brand-400">{miles} miles · £{calcMileageTotal(miles, Number(settings.standardRate || 0.45), false).toFixed(2)}</p>
          )}
          <input className="input-base" placeholder="Reason / customer / reference"
            value={form.reason} onChange={e => set('reason', e.target.value)} />
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
            <button onClick={handleSave} disabled={miles === null} className="btn-primary flex-1 py-2 text-xs disabled:opacity-40">Save as draft</button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { mileageClaims, expenses } = useApp()
  const { owed, draft, submitted, paid } = getFinancialSummary(mileageClaims, expenses)
  const [refreshKey, setRefreshKey] = useState(0)

  const recentActivity = [
    ...mileageClaims.slice(0, 5).map(c => ({ ...c, type: 'mileage' })),
    ...expenses.slice(0, 5).map(e => ({ ...e, type: 'expense' })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-3">
        <p className="text-surface-400 text-sm">{format(new Date(), 'EEEE, d MMMM')}</p>
        <h1 className="text-2xl font-semibold text-white mt-0.5">Dashboard</h1>
      </div>

      {/* Quick Log */}
      <div className="px-4 mb-4">
        <QuickLog onSaved={() => setRefreshKey(k => k + 1)} />
      </div>

      {/* You're Owed hero */}
      <div className="px-4 mb-4">
        <button
          onClick={() => navigate('/reports')}
          className="w-full card p-5 text-left active:scale-[0.99] transition-all hover:border-brand-500/40"
        >
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-1">Outstanding</p>
          <p className="text-3xl font-bold text-white mb-3">{formatCurrency(owed)}</p>
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-surface-500">Draft</p>
              <p className="text-sm font-semibold text-surface-300">{formatCurrency(draft)}</p>
            </div>
            <div>
              <p className="text-xs text-surface-500">Submitted</p>
              <p className="text-sm font-semibold text-amber-400">{formatCurrency(submitted)}</p>
            </div>
            <div>
              <p className="text-xs text-surface-500">Paid</p>
              <p className="text-sm font-semibold text-emerald-400">{formatCurrency(paid)}</p>
            </div>
          </div>
          <p className="text-xs text-surface-600 mt-3 flex items-center gap-1">Tap to view full report <ArrowRight size={10} /></p>
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-4">
        <button onClick={() => navigate('/mileage/add')}
          className="card p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-all hover:border-brand-500/50">
          <div className="w-9 h-9 bg-brand-500/20 rounded-xl flex items-center justify-center">
            <Car size={16} className="text-brand-400" />
          </div>
          <span className="text-xs font-medium text-white text-center">Add Mileage</span>
        </button>
        <button onClick={() => navigate('/expenses/add')}
          className="card p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-all hover:border-brand-500/50">
          <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Receipt size={16} className="text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-white text-center">Add Expense</span>
        </button>
        <button onClick={() => navigate('/reports')}
          className="card p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-all hover:border-brand-500/50">
          <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <Download size={16} className="text-amber-400" />
          </div>
          <span className="text-xs font-medium text-white text-center">Export</span>
        </button>
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
            <p className="text-surface-400 text-sm p-4 text-center">No claims yet — log your first journey above</p>
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
                  {item.type === 'mileage' ? (item.reason || `${item.startPostcode} → ${item.endPostcode}`) : (item.description || item.supplier)}
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
