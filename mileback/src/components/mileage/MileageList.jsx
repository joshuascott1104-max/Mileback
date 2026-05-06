import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Car, Copy, CheckCircle2, Trash2, Search, X } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { formatCurrency, formatDate, formatMiles } from '../../utils/formatters'
import StatusBadge from '../ui/StatusBadge'
import EmptyState from '../ui/EmptyState'

const STATUS_CYCLE = { draft: 'submitted', submitted: 'paid', paid: 'draft' }

export default function MileageList() {
  const navigate = useNavigate()
  const { mileageClaims, addMileageClaim, updateMileageClaim, deleteMileageClaim } = useApp()
  const [submitted, setSubmitted] = useState(false)
  const [swipedId, setSwipedId] = useState(null)
  const [undoItem, setUndoItem] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const touchStartX = useRef(0)
  const undoTimer = useRef(null)

  const drafts = mileageClaims.filter(c => c.status === 'draft')

  const filtered = mileageClaims.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!`${c.reason} ${c.startPostcode} ${c.endPostcode} ${c.startLocationName} ${c.endLocationName}`.toLowerCase().includes(q)) return false
    }
    return true
  })

  const totalMiles = filtered.reduce((s, c) => s + (c.returnJourney ? c.miles * 2 : c.miles), 0)
  const totalValue = filtered.reduce((s, c) => s + (c.total || 0), 0)

  const duplicate = (claim, e) => {
    e.stopPropagation()
    const { id, ...rest } = claim
    addMileageClaim({ ...rest, status: 'draft' })
  }

  const submitAllDrafts = () => {
    drafts.forEach(c => updateMileageClaim(c.id, { status: 'submitted' }))
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 1500)
  }

  const handleDelete = (claim) => {
    clearTimeout(undoTimer.current)
    deleteMileageClaim(claim.id)
    setSwipedId(null)
    setUndoItem(claim)
    undoTimer.current = setTimeout(() => setUndoItem(null), 4000)
  }

  const handleUndo = () => {
    clearTimeout(undoTimer.current)
    const { id, ...rest } = undoItem
    addMileageClaim(rest)
    setUndoItem(null)
  }

  const handleRowClick = (id) => {
    if (swipedId) { setSwipedId(null); return }
    navigate(`/mileage/edit/${id}`)
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Mileage Claims</h1>
        <div className="flex items-center gap-2">
          {drafts.length > 0 && (
            <button onClick={submitAllDrafts} className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl px-3 py-2 text-xs font-medium transition-all active:scale-95">
              {submitted ? <><CheckCircle2 size={13} /> Submitted!</> : `Submit ${drafts.length} draft${drafts.length > 1 ? 's' : ''}`}
            </button>
          )}
          <button onClick={() => navigate('/mileage/add')} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Search & filter — shown when list is non-trivial */}
      {mileageClaims.length > 5 && (
        <div className="px-4 mb-3 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
            <input
              className="input-base pl-9 pr-8"
              placeholder="Search journeys…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
                <X size={13} />
              </button>
            )}
          </div>
          <select className="input-base w-32 flex-shrink-0" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      )}

      {mileageClaims.length === 0 ? (
        <EmptyState icon={Car} title="No mileage claims" description="Start tracking your journeys"
          action={<button onClick={() => navigate('/mileage/add')} className="btn-primary">Add first journey</button>} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-surface-400 text-sm py-12">No journeys match your search</p>
      ) : (
        <>
          <div className="px-4 card divide-y divide-surface-800">
            {filtered.map(claim => (
              <div key={claim.id} className="relative overflow-hidden">
                <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
                  <button onClick={() => handleDelete(claim)} className="text-white p-2 active:opacity-70">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div
                  style={{ transform: swipedId === claim.id ? 'translateX(-80px)' : 'translateX(0)' }}
                  className="flex items-center gap-3 py-4 bg-surface-950 transition-transform duration-200 cursor-pointer active:bg-surface-800/50"
                  onClick={() => handleRowClick(claim.id)}
                  onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
                  onTouchEnd={e => {
                    const dx = touchStartX.current - e.changedTouches[0].clientX
                    if (dx > 60) setSwipedId(claim.id)
                    else if (dx < -20) setSwipedId(null)
                  }}
                >
                  <div className="w-9 h-9 bg-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car size={15} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {claim.reason || `${claim.startPostcode} → ${claim.endPostcode}`}
                    </p>
                    <p className="text-xs text-surface-400">
                      {formatDate(claim.date)} · {formatMiles(claim.returnJourney ? claim.miles * 2 : claim.miles)}
                      {claim.vehicleName ? ` · ${claim.vehicleName}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatCurrency(claim.total)}</p>
                      <StatusBadge
                        status={claim.status}
                        onClick={e => { e.stopPropagation(); updateMileageClaim(claim.id, { status: STATUS_CYCLE[claim.status] || 'draft' }) }}
                      />
                    </div>
                    <button onClick={(e) => duplicate(claim, e)} className="p-2 text-surface-400 hover:text-white transition-colors" title="Duplicate">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* List totals */}
          <div className="px-4 mt-3 flex items-center justify-between card p-3">
            <p className="text-xs text-surface-400">{filtered.length} claim{filtered.length !== 1 ? 's' : ''} · {formatMiles(totalMiles)}</p>
            <p className="text-sm font-semibold text-white">{formatCurrency(totalValue)}</p>
          </div>
        </>
      )}

      {/* Undo toast */}
      {undoItem && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-surface-800 border border-surface-700 rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
          <p className="text-sm text-white">Journey deleted</p>
          <button onClick={handleUndo} className="text-brand-400 text-sm font-semibold active:opacity-70">Undo</button>
        </div>
      )}
    </div>
  )
}
