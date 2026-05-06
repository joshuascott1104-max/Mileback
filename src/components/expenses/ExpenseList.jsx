import { useNavigate } from 'react-router-dom'
import { Plus, Receipt, Camera } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { formatCurrency, formatDate } from '../../utils/formatters'
import StatusBadge from '../ui/StatusBadge'
import EmptyState from '../ui/EmptyState'

export default function ExpenseList() {
  const navigate = useNavigate()
  const { expenses } = useApp()

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Expenses</h1>
        <button onClick={() => navigate('/expenses/add')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add
        </button>
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
                  {exp.receiptImage && <Camera size={11} className="text-emerald-400" />}
                  <p className="text-sm font-semibold text-white">{formatCurrency(exp.amount)}</p>
                </div>
                <StatusBadge status={exp.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
