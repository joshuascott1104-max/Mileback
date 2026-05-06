import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Car, Copy, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { formatCurrency, formatDate, formatMiles } from '../../utils/formatters'
import StatusBadge from '../ui/StatusBadge'
import EmptyState from '../ui/EmptyState'

export default function MileageList() {
  const navigate = useNavigate()
  const { mileageClaims, addMileageClaim, updateMileageClaim } = useApp()
  const [submitted, setSubmitted] = useState(false)

  const drafts = mileageClaims.filter(c => c.status === 'draft')

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

      {mileageClaims.length === 0 ? (
        <EmptyState icon={Car} title="No mileage claims" description="Start tracking your journeys"
          action={<button onClick={() => navigate('/mileage/add')} className="btn-primary">Add first journey</button>} />
      ) : (
        <div className="px-4 card divide-y divide-surface-800">
          {mileageClaims.map(claim => (
            <div key={claim.id} onClick={() => navigate(`/mileage/edit/${claim.id}`)}
              className="flex items-center gap-3 py-4 cursor-pointer active:bg-surface-800/50 transition-colors">
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
                  <StatusBadge status={claim.status} />
                </div>
                <button onClick={(e) => duplicate(claim, e)} className="p-2 text-surface-400 hover:text-white transition-colors" title="Duplicate">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
