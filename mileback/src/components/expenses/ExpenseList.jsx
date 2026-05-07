import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Receipt, Camera, X, CheckCircle2, Trash2, Search } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { formatCurrency, formatRelativeDate, EXPENSE_CATEGORIES } from '../../utils/formatters'
import StatusBadge from '../ui/StatusBadge'
import EmptyState from '../ui/EmptyState'

const STATUS_CYCLE = { draft: 'submitted', submitted: 'paid', paid: 'draft' }

export default function ExpenseList() {
  const navigate = useNavigate()
  const { expenses, updateExpense, deleteExpense, addExpense } = useApp()
  const [viewingReceipt, setViewingReceipt] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [swipedId, setSwipedId] = useState(null)
  const [undoItem, setUndoItem] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const touchStartX = useRef(0)
  const undoTimer = useRef(null)

  const drafts = expenses.filter(e => e.status === 'draft')
  const filtered = expenses.filter(e => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return `${e.description} ${e.supplier} ${e.category}`.toLowerCase().includes(q)
  })
  const totalValue = filtered.reduce((s, e) => s + (e.amount || 0), 0)

  const submitAllDrafts = () => {
    drafts.forEach(e => updateExpense(e.id, { status: 'submitted' }))
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 1500)
  }

  const handleDelete = (exp) => {
    clearTimeout(undoTimer.current)
    deleteExpense(exp.id)
    setSwipedId(null)
    setUndoItem(exp)
    undoTimer.current = setTimeout(() => setUndoItem(null), 4000)
  }

  const handleUndo = () => {
    clearTimeout(undoTimer.current)
    const { id, ...rest } = undoItem
    addExpense(rest)
    setUndoItem(null)
  }

  const handleRowClick = (id) => {
    if (swipedId) { setSwipedId(null); return }
    navigate(`/expenses/edit/${id}`)
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

      {/* Search + category filter — shown when list is non-trivial */}
      {expenses.length > 3 && (
        <div className="mb-3 space-y-2">
          <div className="px-4 relative">
            <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
            <input
              className="input-base pl-9 pr-8"
              placeholder="Search expenses…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-7 top-1/2 -translate-y-1/2 text-surface-400">
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 px-4 no-scrollbar">
            {['all', ...EXPENSE_CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                  categoryFilter === cat ? 'bg-brand-500 text-white' : 'bg-surface-800 text-surface-400'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <EmptyState icon={Receipt} title="No expenses" description="Start logging your business expenses"
          action={<button onClick={() => navigate('/expenses/add')} className="btn-primary">Add first expense</button>} />
      ) : (
        <>
          {filtered.length === 0 && search && (
            <p className="text-center text-surface-400 text-sm py-12">No expenses match your search</p>
          )}
          <div className="px-4 card divide-y divide-surface-800">
            {filtered.map(exp => (
              <div key={exp.id} className="relative overflow-hidden">
                <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
                  <button onClick={() => handleDelete(exp)} className="text-white p-2 active:opacity-70">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div
                  style={{ transform: swipedId === exp.id ? 'translateX(-80px)' : 'translateX(0)' }}
                  className="flex items-center gap-3 py-4 bg-surface-950 transition-transform duration-200 cursor-pointer active:bg-surface-800/50"
                  onClick={() => handleRowClick(exp.id)}
                  onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
                  onTouchEnd={e => {
                    const dx = touchStartX.current - e.changedTouches[0].clientX
                    if (dx > 60) setSwipedId(exp.id)
                    else if (dx < -20) setSwipedId(null)
                  }}
                >
                  <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Receipt size={15} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{exp.description || exp.supplier}</p>
                    <p className="text-xs text-surface-400">{formatRelativeDate(exp.date)} · {exp.category}</p>
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
                    <StatusBadge
                      status={exp.status}
                      onClick={e => { e.stopPropagation(); updateExpense(exp.id, { status: STATUS_CYCLE[exp.status] || 'draft' }) }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* List total */}
          <div className="px-4 mt-3 flex items-center justify-between card p-3">
            <p className="text-xs text-surface-400">{filtered.length} expense{filtered.length !== 1 ? 's' : ''}</p>
            <p className="text-sm font-semibold text-white">{formatCurrency(totalValue)}</p>
          </div>
        </>
      )}

      {/* Full-screen receipt viewer */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setViewingReceipt(null)}>
          <button className="absolute top-4 right-4 w-9 h-9 bg-surface-800 rounded-full flex items-center justify-center text-white" onClick={() => setViewingReceipt(null)}>
            <X size={18} />
          </button>
          <img src={viewingReceipt} alt="Receipt" className="max-w-full max-h-[90vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Undo toast */}
      {undoItem && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-surface-800 border border-surface-700 rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
          <p className="text-sm text-white">Expense deleted</p>
          <button onClick={handleUndo} className="text-brand-400 text-sm font-semibold active:opacity-70">Undo</button>
        </div>
      )}
    </div>
  )
}
