import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { useApp } from '../../store/AppContext'
import { EXPENSE_CATEGORIES } from '../../utils/formatters'

const empty = () => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  category: 'Parking',
  supplier: '',
  description: '',
  amount: '',
  vat: '',
  notes: '',
  status: 'draft',
})

export default function ExpenseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { expenses, addExpense, updateExpense } = useApp()
  const existing = id ? expenses.find(e => e.id === id) : null
  const [form, setForm] = useState(existing || empty())

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

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

        <div>
          <label className="label-base">Notes (optional)</label>
          <textarea className="input-base" rows={2} placeholder="Any additional notes…" value={form.notes}
            onChange={e => set('notes', e.target.value)} />
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-surface-950/95 backdrop-blur border-t border-surface-800 p-4 z-50">
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1">
            {existing ? 'Save changes' : 'Save expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
