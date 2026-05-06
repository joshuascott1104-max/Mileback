import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Receipt, Camera, X, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { formatCurrency, formatDate } from '../../utils/formatters'
import StatusBadge from '../ui/StatusBadge'
import EmptyState from '../ui/EmptyState'

export default function ExpenseList() {
  const navigate = useNavigate()
  const { expenses, updateExpense } = useApp()
  const [viewingReceipt, setViewingReceipt] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const drafts = expenses.filter(e => e.status === 'draft')

  const submitAllDrafts = () => {
    drafts.forEach(e => updateExpense(e.id, { status: 'submitted' }))
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 1500)
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Expenses</h1>
        <div className="flex items-center gap-2">
          {drafts.length > 0 && (
            <button onClick={submitAllDrafts} className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl px-3 py-2 text-xs font-medium transition-all active:scale-95">
              {submitted ? <><CheckCircle2 size={13} /> Submitted!</> : `Submit ${drafts.length} draft${drafts.length > 1 ? 's' : ''}`}
            </button>
          )}
          <button onClick={() => navigate('/expenses/add')} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <EmptyState icon={Receipt} title="No expenses" description="Start logging your business expenses"
          action={<button onClick={() => navigate('/expenses/add')} className="btn-primary">Add first expense</button>} />
      ) : (
        <div className="px-4 card divide-y divide-surface-800">
          {expenses.map(exp => (
            <div key={exp.id} onClick={() => navigate(`/expenses/edit/${exp.id}`)}
              className="flex items-center gap-3 py-4 cursor-pointer active:bg-surface-800/50 transition-colors">
              <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Receipt size={15} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{exp.description || exp.supplier}</p>
                <p className="text-xs text-surface-400">{formatDate(exp.date)} · {exp.category}{exp.supplier ? ` · ${exp.supplier}` : ''}</p>
              </div>
              <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5">
                  {exp.receiptImage && (
                    <button
                      onClick={e => { e.stopPropagation(); setViewingReceipt(exp.receiptImage) }}
                      className="p-1 text-emerald-400 active:scale-90 transition-transform"
                    >
                      <Camera size={13} />
                    </button>
                  )}
                  <p className="text-sm font-semibold text-white">{formatCurrency(exp.amount)}</p>
                </div>
                <StatusBadge status={exp.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-screen receipt viewer */}
      {viewingReceipt && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingReceipt(null)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 bg-surface-800 rounded-full flex items-center justify-center text-white"
            onClick={() => setViewingReceipt(null)}
          >
            <X size={18} />
          </button>
          <img
            src={viewingReceipt}
            alt="Receipt"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
