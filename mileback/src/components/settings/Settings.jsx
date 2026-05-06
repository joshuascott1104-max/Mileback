import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Star, Car, Check, Download, Upload, History } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { exportBackup, readBackupFile } from '../../services/backupService'
import { getLatestAutoBackup } from '../../services/autoBackupService'

function Section({ title, children }) {
  return (
    <div className="px-4 mb-6">
      <p className="label-base mb-3">{title}</p>
      <div className="card divide-y divide-surface-800">{children}</div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between p-4 gap-4">
      <p className="text-sm text-white flex-shrink-0">{label}</p>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { settings, setSettings, vehicles, addVehicle, updateVehicle, deleteVehicle, setDefaultVehicle, favouriteJourneys, deleteFavouriteJourney, mileageClaims, expenses, restoreBackup } = useApp()
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ name: '', registration: '', defaultRate: '' })
  const [saved, setSaved] = useState(false)
  const [rateInput, setRateInput] = useState(String(settings.standardRate ?? 0.45))
  const [importError, setImportError] = useState('')
  const [autoBackupInfo, setAutoBackupInfo] = useState(null)
  const importRef = useRef(null)

  useEffect(() => {
    getLatestAutoBackup().then(b => setAutoBackupInfo(b))
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleAddVehicle = () => {
    if (!newVehicle.name) return
    addVehicle({ ...newVehicle, isDefault: vehicles.length === 0 })
    setNewVehicle({ name: '', registration: '', defaultRate: '' })
    setShowAddVehicle(false)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    try {
      const data = await readBackupFile(file)
      if (!window.confirm(`This will replace all your current data with the backup from ${data.exportedAt?.split('T')[0] || 'unknown date'}. Are you sure?`)) return
      restoreBackup(data)
    } catch (err) {
      setImportError(err.message)
    }
    e.target.value = ''
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <Row label="Your name">
          <input className="input-base max-w-[180px] text-right" value={settings.userName || ''}
            onChange={e => setSettings(s => ({ ...s, userName: e.target.value }))} placeholder="Your name" />
        </Row>
        <Row label="Company name">
          <input className="input-base max-w-[180px] text-right" value={settings.companyName || ''}
            onChange={e => setSettings(s => ({ ...s, companyName: e.target.value }))} placeholder="Company name" />
        </Row>
      </Section>

      {/* Mileage */}
      <Section title="Mileage">
        <Row label="Standard rate (£/mile)">
          <input type="text" inputMode="decimal" className="input-base max-w-[120px] text-right"
            value={rateInput}
            onChange={e => {
              setRateInput(e.target.value)
              const num = parseFloat(e.target.value)
              if (!isNaN(num) && num >= 0) setSettings(s => ({ ...s, standardRate: num }))
            }}
            onBlur={() => {
              const num = parseFloat(rateInput)
              if (isNaN(num) || num < 0) setRateInput(String(settings.standardRate ?? 0.45))
            }}
          />
        </Row>
        <div className="p-4">
          <p className="text-xs text-surface-400">Rate changes only apply to new claims. Existing claims keep their original rate.</p>
        </div>
      </Section>

      {/* Vehicles */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="label-base mb-0">Vehicles</p>
          <button onClick={() => setShowAddVehicle(true)} className="btn-ghost text-brand-400 flex items-center gap-1 text-xs">
            <Plus size={12} /> Add vehicle
          </button>
        </div>
        <div className="card divide-y divide-surface-800">
          {vehicles.map(v => (
            <div key={v.id} className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 bg-surface-800 rounded-lg flex items-center justify-center">
                <Car size={14} className="text-surface-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{v.name}</p>
                <p className="text-xs text-surface-400">{v.registration || 'No reg'}</p>
              </div>
              <div className="flex items-center gap-2">
                {v.isDefault && <span className="text-xs text-brand-400 font-medium">Default</span>}
                {!v.isDefault && (
                  <button onClick={() => setDefaultVehicle(v.id)} className="text-xs text-surface-400 hover:text-brand-400 transition-colors">
                    Set default
                  </button>
                )}
                <button onClick={() => deleteVehicle(v.id)} className="p-1 text-surface-600 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {showAddVehicle && (
            <div className="p-4 space-y-3">
              <input className="input-base" placeholder="Vehicle name *" value={newVehicle.name}
                onChange={e => setNewVehicle(v => ({ ...v, name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input-base" placeholder="Registration" value={newVehicle.registration}
                  onChange={e => setNewVehicle(v => ({ ...v, registration: e.target.value }))} />
                <input type="number" className="input-base" placeholder="Rate £/mi" value={newVehicle.defaultRate}
                  onChange={e => setNewVehicle(v => ({ ...v, defaultRate: e.target.value }))} step="0.01" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddVehicle(false)} className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
                <button onClick={handleAddVehicle} className="btn-primary flex-1 py-2 text-xs">Add vehicle</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Favourite Journeys */}
      {favouriteJourneys.length > 0 && (
        <div className="px-4 mb-6">
          <p className="label-base mb-3">Favourite Journeys</p>
          <div className="card divide-y divide-surface-800">
            {favouriteJourneys.map(j => (
              <div key={j.id} className="flex items-center gap-3 p-4">
                <Star size={14} className="text-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{j.name}</p>
                  <p className="text-xs text-surface-400">{j.startPostcode} → {j.endPostcode}</p>
                </div>
                <button onClick={() => deleteFavouriteJourney(j.id)} className="p-1 text-surface-600 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API */}
      <Section title="Mileage API">
        <div className="p-4">
          <p className="text-sm text-white mb-1">Auto-calculate mileage</p>
          <p className="text-xs text-surface-400 mb-3">Add an API key to your <code className="text-brand-400">.env</code> file to enable automatic postcode-to-postcode mileage calculation.</p>
          <div className="bg-surface-800 rounded-xl p-3 font-mono text-xs text-surface-300 space-y-1">
            <p>VITE_GOOGLE_MAPS_API_KEY=…</p>
            <p>VITE_ORS_API_KEY=…</p>
            <p>VITE_MAPBOX_API_KEY=…</p>
          </div>
        </div>
      </Section>

      {/* Data */}
      <Section title="Data">
        <div className="p-4 space-y-3">
          <button onClick={() => exportBackup({ mileageClaims, expenses, vehicles, settings, favouriteJourneys })}
            className="w-full flex items-center justify-center gap-2 btn-secondary">
            <Download size={15} /> Export backup
          </button>
          <button onClick={() => importRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 btn-secondary">
            <Upload size={15} /> Import backup
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          {importError && <p className="text-xs text-red-400">{importError}</p>}
          <p className="text-xs text-surface-400">Backup includes all claims, expenses, vehicles and settings.</p>
        </div>
      </Section>

      {/* Auto-backup */}
      <Section title="Auto-backup">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <History size={15} className="text-brand-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-white">Device auto-save</p>
              <p className="text-xs text-surface-400">
                {autoBackupInfo
                  ? `Last saved: ${autoBackupInfo.savedAt?.split('T')[0] || autoBackupInfo.day}`
                  : 'Saves automatically to this device after every change'}
              </p>
            </div>
          </div>
          {autoBackupInfo && (
            <button
              onClick={() => {
                if (!window.confirm(`Restore auto-save from ${autoBackupInfo.day}? This will replace all current data.`)) return
                restoreBackup(autoBackupInfo)
              }}
              className="w-full flex items-center justify-center gap-2 btn-secondary text-xs py-2"
            >
              <History size={13} /> Restore from auto-save ({autoBackupInfo.day})
            </button>
          )}
        </div>
      </Section>
    </div>
  )
}
