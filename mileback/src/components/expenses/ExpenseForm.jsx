import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Camera, X } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { EXPENSE_CATEGORIES } from '../../utils/formatters'

function compressImage(file) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const maxWidth = 1200
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = URL.createObjectURL(file)
  })
}

const empty = () => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  category: 'Parking',
  supplier: '',
  description: '',
  amount: '',
  vat: '',
  notes: '',
  receiptImage: '',
  status: 'draft',
})

export default function ExpenseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { expenses, addExpense, updateExpense, deleteExpense } = useApp()
  const existing = id ? expenses.find(e => e.id === id) : null
  const [form, setForm] = useState(existing || empty())
  const fileRef = useRef(null)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleReceiptChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    set('receiptImage', compressed)
    e.target.value = ''
  }

  const handleSubmit = () => {
    if (!form.amount) return
    const expense = { ...form, amount: Number(form.amount), vat: Number(form.vat || 0) }
    if (existing) { updateExpense(id, expense); navigate('/expenses') }
    else { addExpense(expense); navigate('/expenses') }
  }

  return (
    <div className="pb-44">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-semibold text-white">{existing ? 'Edit Expense' : 'Add Expense'}</h1>
      </div>

      <div className="px-4 space-y-4">
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

        <div>
          <label className="label-base">Category</label>
          <select className="input-base" value={form.category} onChange={e => set('category', e.target.value)}>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="label-base">Supplier / Merchant</label>
          <input className="input-base" placeholder="e.g. NCP, Costa Coffee" value={form.supplier}
            onChange={e => set('supplier', e.target.value)} />
        </div>

        <div>
          <label className="label-base">Description</label>
          <input className="input-base" placeholder="Brief description" value={form.description}
            onChange={e => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base">Amount (£)</label>
            <input type="text" inputMode="decimal" className="input-base" placeholder="0.00" value={form.amount}
              onChange={e => set('amount', e.target.value)} />
          </div>
          <div>
            <label className="label-base">VAT (£) optional</label>
            <input type="text" inputMode="decimal" className="input-base" placeholder="0.00" value={form.vat}
              onChange={e => set('vat', e.target.value)} />
          </div>
        </div>

        {/* Receipt photo */}
        <div>
          <label className="label-base">Receipt</label>
          {form.receiptImage ? (
            <div className="relative inline-block">
              <img src={form.receiptImage} alt="Receipt" className="w-full max-h-48 object-cover rounded-xl border border-surface-700" />
              <button
                onClick={() => set('receiptImage', '')}
                className="absolute top-2 right-2 w-7 h-7 bg-surface-950/80 rounded-full flex items-center justify-center text-white"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-surface-800 border border-dashed border-surface-600 rounded-xl py-4 text-sm text-surface-300 active:scale-95 transition-all"
            >
              <Camera size={16} /> Take photo or upload receipt
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleReceiptChange}
          />
        </div>

        <div>
          <label className="label-base">Notes (optional)</label>
          <textarea className="input-base" rows={2} placeholder="Any additional notes…" value={form.notes}
            onChange={e => set('notes', e.target.value)} />
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-surface-950/95 backdrop-blur border-t border-surface-800 p-4 z-50">
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          {existing && (
            <button onClick={() => { deleteExpense(id); navigate('/expenses') }} className="btn-secondary flex-1 text-red-400 border-red-400/30">Delete</button>
          )}
          <button onClick={handleSubmit} className="btn-primary flex-1">
            {existing ? 'Save changes' : 'Save expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
