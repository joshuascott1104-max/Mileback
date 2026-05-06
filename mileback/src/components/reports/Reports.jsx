import { useState } from 'react'
import { Download, Clipboard, ClipboardCheck, Filter } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { formatCurrency, formatDate, formatMiles } from '../../utils/formatters'
import { exportToCSV, copyToClipboard } from '../../services/exportService'
import StatusBadge from '../ui/StatusBadge'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns'

export default function Reports() {
  const { mileageClaims, expenses } = useApp()
  const [copied, setCopied] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd'),
    status: 'all',
    type: 'all',
  })

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  const setPeriod = (type) => {
    const today = new Date()
    if (type === 'week') {
      setFilters(f => ({ ...f, dateFrom: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'), dateTo: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd') }))
    } else if (type === 'month') {
      setFilters(f => ({ ...f, dateFrom: format(startOfMonth(today), 'yyyy-MM-dd'), dateTo: format(endOfMonth(today), 'yyyy-MM-dd') }))
    } else if (type === 'lastmonth') {
      const last = subMonths(today, 1)
      setFilters(f => ({ ...f, dateFrom: format(startOfMonth(last), 'yyyy-MM-dd'), dateTo: format(endOfMonth(last), 'yyyy-MM-dd') }))
    } else if (type === 'taxyear') {
      const y = today.getMonth() > 3 || (today.getMonth() === 3 && today.getDate() >= 6) ? today.getFullYear() : today.getFullYear() - 1
      setFilters(f => ({ ...f, dateFrom: `${y}-04-06`, dateTo: `${y + 1}-04-05` }))
    }
  }

  const filteredMileage = mileageClaims.filter(c => {
    if (filters.type === 'expense') return false
    if (filters.status !== 'all' && c.status !== filters.status) return false
    if (filters.dateFrom && c.date < filters.dateFrom) return false
    if (filters.dateTo && c.date > filters.dateTo) return false
    return true
  })

  const filteredExpenses = expenses.filter(e => {
    if (filters.type === 'mileage') return false
    if (filters.status !== 'all' && e.status !== filters.status) return false
    if (filters.dateFrom && e.date < filters.dateFrom) return false
    if (filters.dateTo && e.date > filters.dateTo) return false
    return true
  })

  const mileageTotal = filteredMileage.reduce((s, c) => s + (c.total || 0), 0)
  const expenseTotal = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0)
  const combined = mileageTotal + expenseTotal

  const handleCopy = async () => {
    await copyToClipboard(filteredMileage, filteredExpenses)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-semibold text-white">Reports & Export</h1>
      </div>

      {/* Filters */}
      <div className="px-4 mb-4">
        <div className="card p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {[['week', 'This week'], ['month', 'This month'], ['lastmonth', 'Last month'], ['taxyear', 'Tax year']].map(([key, label]) => (
              <button key={key} onClick={() => setPeriod(key)}
                className="flex-1 bg-surface-800 border border-surface-700 rounded-xl py-2 text-xs font-medium text-surface-300 hover:text-white hover:border-surface-600 active:scale-95 transition-all whitespace-nowrap">
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">From</label>
              <input type="date" className="input-base" value={filters.dateFrom} onChange={e => setFilter('dateFrom', e.target.value)} />
            </div>
            <div>
              <label className="label-base">To</label>
              <input type="date" className="input-base" value={filters.dateTo} onChange={e => setFilter('dateTo', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Status</label>
              <select className="input-base" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="label-base">Type</label>
              <select className="input-base" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
                <option value="all">All types</option>
                <option value="mileage">Mileage only</option>
                <option value="expense">Expenses only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="px-4 mb-4 grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xs text-surface-400 mb-1">Mileage</p>
          <p className="text-sm font-semibold text-brand-400">{formatCurrency(mileageTotal)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-surface-400 mb-1">Expenses</p>
          <p className="text-sm font-semibold text-emerald-400">{formatCurrency(expenseTotal)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-surface-400 mb-1">Total</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(combined)}</p>
        </div>
      </div>

      {/* Export buttons */}
      <div className="px-4 mb-4 flex gap-3">
        <button onClick={() => exportToCSV(filteredMileage, filteredExpenses)} className="btn-primary flex items-center gap-2 flex-1">
          <Download size={15} /> Export CSV
        </button>
        <button onClick={handleCopy} className="btn-secondary flex items-center gap-2 flex-1">
          {copied ? <ClipboardCheck size={15} className="text-emerald-400" /> : <Clipboard size={15} />}
          {copied ? 'Copied!' : 'Copy table'}
        </button>
      </div>

      {/* Results */}
      {filteredMileage.length > 0 && (
        <div className="px-4 mb-4">
          <p className="label-base mb-2">Mileage ({filteredMileage.length})</p>
          <div className="card divide-y divide-surface-800">
            {filteredMileage.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.reason || `${c.startPostcode} → ${c.endPostcode}`}</p>
                  <p className="text-xs text-surface-400">{formatDate(c.date)} · {c.vehicleName} · {formatMiles(c.returnJourney ? c.miles * 2 : c.miles)} @ £{c.rate}/mi</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-white">{formatCurrency(c.total)}</p>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredExpenses.length > 0 && (
        <div className="px-4 mb-4">
          <p className="label-base mb-2">Expenses ({filteredExpenses.length})</p>
          <div className="card divide-y divide-surface-800">
            {filteredExpenses.map(e => (
              <div key={e.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{e.description || e.supplier}</p>
                  <p className="text-xs text-surface-400">{formatDate(e.date)} · {e.category} · {e.supplier}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-white">{formatCurrency(e.amount)}</p>
                  <StatusBadge status={e.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredMileage.length === 0 && filteredExpenses.length === 0 && (
        <p className="text-center text-surface-400 text-sm py-12">No claims match these filters</p>
      )}
    </div>
  )
}
