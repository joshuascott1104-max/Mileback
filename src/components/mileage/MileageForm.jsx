import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { MapPin, RotateCcw, Star, Loader2, ChevronDown } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { calcMileageTotal, EXPENSE_CATEGORIES } from '../../utils/formatters'
import { calculateMileage, isApiConfigured } from '../../services/mileageApi'

const empty = () => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  vehicleId: '',
  vehicleName: '',
  startPostcode: '',
  endPostcode: '',
  startLocationName: '',
  endLocationName: '',
  reason: '',
  miles: '',
  rate: '',
  returnJourney: false,
  notes: '',
  status: 'draft',
})

export default function MileageForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { mileageClaims, addMileageClaim, updateMileageClaim, vehicles, settings, favouriteJourneys, addFavouriteJourney } = useApp()

  const existing = id ? mileageClaims.find(c => c.id === id) : null
  const [form, setForm] = useState(existing || empty())
  const [calculating, setCalculating] = useState(false)
  const [calcError, setCalcError] = useState('')
  const [addAnother, setAddAnother] = useState(false)

  // Pre-fill defaults for new claims
  useEffect(() => {
    if (!existing) {
      const defaultVehicle = vehicles.find(v => v.isDefault) || vehicles[0]
      setForm(f => ({
        ...f,
        rate: settings.standardRate || 0.45,
        vehicleId: defaultVehicle?.id || '',
        vehicleName: defaultVehicle?.name || '',
      }))
    }
  }, [])

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const total = calcMileageTotal(form.miles, form.rate, form.returnJourney)

  const handleVehicleChange = (e) => {
    const v = vehicles.find(v => v.id === e.target.value)
    set('vehicleId', e.target.value)
    set('vehicleName', v?.name || '')
    if (v?.defaultRate) set('rate', v.defaultRate)
  }

  const handleCalculate = async () => {
    if (!form.startPostcode || !form.endPostcode) return
    setCalculating(true)
    setCalcError('')
    try {
      const miles = await calculateMileage(form.startPostcode, form.endPostcode)
      set('miles', miles)
    } catch (err) {
      setCalcError('Could not auto-calculate. Enter miles manually.')
    } finally {
      setCalculating(false)
    }
  }

  const handleFavourite = (fav) => {
    set('startPostcode', fav.startPostcode)
    set('endPostcode', fav.endPostcode)
    set('startLocationName', fav.startName || '')
    set('endLocationName', fav.endName || '')
  }

  const handleSubmit = (andAnother = false) => {
    if (!form.miles || !form.rate) return
    const claim = {
      ...form,
      miles: Number(form.miles),
      rate: Number(form.rate),
      total: calcMileageTotal(Number(form.miles), Number(form.rate), form.returnJourney),
    }
    if (existing) {
      updateMileageClaim(id, claim)
      navigate('/mileage')
    } else {
      addMileageClaim(claim)
      if (andAnother) setForm({ ...empty(), rate: settings.standardRate || 0.45, vehicleId: form.vehicleId, vehicleName: form.vehicleName })
      else navigate('/mileage')
    }
  }

  return (
    <div className="pb-52">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-semibold text-white">{existing ? 'Edit Mileage' : 'Add Mileage'}</h1>
      </div>

      {/* Favourite journeys */}
      {!existing && favouriteJourneys.length > 0 && (
        <div className="px-4 mb-4">
          <p className="label-base">Favourite Journeys</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {favouriteJourneys.map(fav => (
              <button
                key={fav.id}
                onClick={() => handleFavourite(fav)}
                className="flex-shrink-0 flex items-center gap-1.5 bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white whitespace-nowrap"
              >
                <Star size={11} className="text-amber-400" />
                {fav.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 space-y-4">
        {/* Date + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">Date</label>
            <input type="date" className="input-base" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className="label-base">Status</label>
            <select className="input-base" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Vehicle */}
        <div>
          <label className="label-base">Vehicle</label>
          <select className="input-base" value={form.vehicleId} onChange={handleVehicleChange}>
            <option value="">Select vehicle</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name}{v.registration ? ` (${v.registration})` : ''}</option>
            ))}
          </select>
        </div>

        {/* Postcodes */}
        <div>
          <label className="label-base">Start</label>
          <div className="grid grid-cols-2 gap-2">
            <input className="input-base" placeholder="Postcode" value={form.startPostcode}
              onChange={e => set('startPostcode', e.target.value.toUpperCase())} />
            <input className="input-base" placeholder="Location name (opt)" value={form.startLocationName}
              onChange={e => set('startLocationName', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label-base">End</label>
          <div className="grid grid-cols-2 gap-2">
            <input className="input-base" placeholder="Postcode" value={form.endPostcode}
              onChange={e => set('endPostcode', e.target.value.toUpperCase())} />
            <input className="input-base" placeholder="Location name (opt)" value={form.endLocationName}
              onChange={e => set('endLocationName', e.target.value)} />
          </div>
        </div>

        {/* Calculate button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCalculate}
            disabled={calculating || !form.startPostcode || !form.endPostcode}
            className="flex items-center gap-2 bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-white disabled:opacity-50 transition-all active:scale-95"
          >
            {calculating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
            {calculating ? 'Calculating…' : 'Calculate mileage'}
          </button>
          {!isApiConfigured() && (
            <p className="text-xs text-surface-400">Add API key to enable auto-calc</p>
          )}
        </div>
        {calcError && <p className="text-xs text-red-400">{calcError}</p>}

        {/* Miles + Rate */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">Miles</label>
            <input type="text" inputMode="decimal" className="input-base" placeholder="0.0" value={form.miles}
              onChange={e => set('miles', e.target.value)} />
          </div>
          <div>
            <label className="label-base">Rate (£/mile)</label>
            <input type="text" inputMode="decimal" className="input-base" placeholder="0.45" value={form.rate}
              onChange={e => set('rate', e.target.value)} />
          </div>
        </div>

        {/* Return journey */}
        <div className="flex items-center justify-between card p-4">
          <div className="flex items-center gap-3">
            <RotateCcw size={16} className="text-surface-400" />
            <div>
              <p className="text-sm font-medium text-white">Return journey</p>
              <p className="text-xs text-surface-400">Doubles the mileage total</p>
            </div>
          </div>
          <button
            onClick={() => set('returnJourney', !form.returnJourney)}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.returnJourney ? 'bg-brand-500' : 'bg-surface-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${form.returnJourney ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Reason */}
        <div>
          <label className="label-base">Journey Reason / Customer / Reference</label>
          <input className="input-base" placeholder="e.g. Client meeting - Acme Ltd" value={form.reason}
            onChange={e => set('reason', e.target.value)} />
        </div>

        {/* Notes */}
        <div>
          <label className="label-base">Notes (optional)</label>
          <textarea className="input-base" rows={2} placeholder="Any additional notes…" value={form.notes}
            onChange={e => set('notes', e.target.value)} />
        </div>

        {/* Save as favourite */}
        {!existing && form.startPostcode && form.endPostcode && (
          <button
            onClick={() => {
              const name = prompt('Name this journey (e.g. Leeds → Manchester)')
              if (name) addFavouriteJourney({ name, startPostcode: form.startPostcode, endPostcode: form.endPostcode, startName: form.startLocationName, endName: form.endLocationName })
            }}
            className="flex items-center gap-2 text-xs text-amber-400 btn-ghost"
          >
            <Star size={12} /> Save as favourite journey
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-16 left-0 right-0 bg-surface-950/95 backdrop-blur border-t border-surface-800 p-4 space-y-2 z-50">
        {form.miles && form.rate && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-surface-400">Claim total</span>
            <span className="text-lg font-semibold text-brand-400">
              £{calcMileageTotal(Number(form.miles), Number(form.rate), form.returnJourney).toFixed(2)}
              {form.returnJourney && <span className="text-xs text-surface-400 ml-1">(return)</span>}
            </span>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          {!existing && (
            <button onClick={() => handleSubmit(true)} className="btn-secondary flex-1">Save + Add another</button>
          )}
          <button onClick={() => handleSubmit(false)} className="btn-primary flex-1">
            {existing ? 'Save changes' : 'Save claim'}
          </button>
        </div>
      </div>
    </div>
  )
}
