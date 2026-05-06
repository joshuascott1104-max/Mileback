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
  odometerStart: '',
  odometerEnd: '',
  returnJourney: false,
  notes: '',
  status: 'draft',
})

export default function MileageForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { mileageClaims, addMileageClaim, updateMileageClaim, deleteMileageClaim, vehicles, settings, favouriteJourneys, addFavouriteJourney } = useApp()

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

  const usingOdometer = form.odometerStart !== '' && form.odometerEnd !== ''

  const calcOdometerMiles = (start, end) => {
    const s = parseFloat(start)
    const e = parseFloat(end)
    if (!isNaN(s) && !isNaN(e) && e > s) return Math.round((e - s) * 10) / 10
    return null
  }

  const handleOdometerChange = (field, value) => {
    const next = { ...form, [field]: value }
    const miles = calcOdometerMiles(next.odometerStart, next.odometerEnd)
    if (miles !== null) {
      setForm(f => ({ ...f, [field]: value, miles, returnJourney: false }))
    } else {
      set(field, value)
    }
  }

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
      if (andAnother) setForm({ ...empty(), date: form.date, rate: form.rate, vehicleId: form.vehicleId, vehicleName: form.vehicleName })
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

        {/* Odometer readings — primary method */}
        <div className="card p-4 space-y-3">
          <p className="text-xs font-medium text-surface-300 uppercase tracking-wide">Vehicle Mileage Readings</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Start of Journey</label>
              <input type="text" inputMode="decimal" className="input-base" placeholder="e.g. 45230" value={form.odometerStart}
                onChange={e => handleOdometerChange('odometerStart', e.target.value)} />
            </div>
            <div>
              <label className="label-base">End of Journey</label>
              <input type="text" inputMode="decimal" className="input-base" placeholder="e.g. 45274" value={form.odometerEnd}
                onChange={e => handleOdometerChange('odometerEnd', e.target.value)} />
            </div>
          </div>
          {usingOdometer && (
            <p className="text-xs text-brand-400">
              {calcOdometerMiles(form.odometerStart, form.odometerEnd) !== null
                ? `${calcOdometerMiles(form.odometerStart, form.odometerEnd)} miles calculated from readings`
                : 'End reading must be greater than start'}
            </p>
          )}
        </div>

        {/* Postcodes — optional for reference */}
        <div>
          <p className="label-base mb-2">Journey Locations (optional)</p>
          <div className="grid grid-cols-2 gap-2">
            <input className="input-base" placeholder="Start postcode" value={form.startPostcode}
              onChange={e => set('startPostcode', e.target.value.toUpperCase())} />
            <input className="input-base" placeholder="End postcode" value={form.endPostcode}
              onChange={e => set('endPostcode', e.target.value.toUpperCase())}
              onBlur={() => { if (form.startPostcode && form.endPostcode && !form.miles) handleCalculate() }} />
          </div>
          {!usingOdometer && form.startPostcode && form.endPostcode && (
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="mt-2 flex items-center gap-2 bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-white disabled:opacity-50 transition-all active:scale-95"
            >
              {calculating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
              {calculating ? 'Calculating…' : 'Calculate miles from postcodes'}
            </button>
          )}
          {calcError && <p className="text-xs text-red-400 mt-1">{calcError}</p>}
        </div>

        {/* Miles + Rate */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">Miles {usingOdometer && <span className="text-brand-400 normal-case font-normal">(from odometer)</span>}</label>
            <input type="text" inputMode="decimal" className="input-base" placeholder="0.0" value={form.miles}
              onChange={e => set('miles', e.target.value)} />
          </div>
          <div>
            <label className="label-base">Rate (£/mile)</label>
            <input type="text" inputMode="decimal" className="input-base" placeholder="0.45" value={form.rate}
              onChange={e => set('rate', e.target.value)} />
          </div>
        </div>

        {/* Return journey — disabled when using odometer */}
        <div className={`flex items-center justify-between card p-4 ${usingOdometer ? 'opacity-40' : ''}`}>
          <div className="flex items-center gap-3">
            <RotateCcw size={16} className="text-surface-400" />
            <div>
              <p className="text-sm font-medium text-white">Return journey</p>
              <p className="text-xs text-surface-400">
                {usingOdometer ? 'Odometer already captures full distance' : 'Doubles the mileage total'}
              </p>
            </div>
          </div>
          <button
            onClick={() => !usingOdometer && set('returnJourney', !form.returnJourney)}
            disabled={usingOdometer}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.returnJourney && !usingOdometer ? 'bg-brand-500' : 'bg-surface-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${form.returnJourney && !usingOdometer ? 'left-[22px]' : 'left-0.5'}`} />
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
          {existing && (
            <button onClick={() => { deleteMileageClaim(id); navigate('/mileage') }} className="btn-secondary flex-1 text-red-400 border-red-400/30">Delete</button>
          )}
          <button onClick={() => handleSubmit(false)} className="btn-primary flex-1">
            {existing ? 'Save changes' : 'Save claim'}
          </button>
        </div>
      </div>
    </div>
  )
}
