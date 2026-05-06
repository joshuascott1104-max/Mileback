import { STATUS_STYLES, STATUS_LABELS } from '../../utils'

export function Card({ children, className = '', onClick, hover = false }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 shadow-card ${hover ? 'cursor-pointer hover:shadow-card-hover hover:border-slate-300 transition-all duration-150' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = '', icon }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
    secondary: 'bg-surface-2 text-ink hover:bg-surface-3 active:bg-surface-3',
    ghost: 'text-ink-secondary hover:bg-surface-2 hover:text-ink',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-slate-200 text-ink hover:bg-surface-1',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-4 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

export function Badge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">{label}</label>}
      <input
        id={id}
        className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition-colors
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}
          placeholder:text-slate-400`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Select({ label, id, error, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">{label}</label>}
      <select
        id={id}
        className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition-colors appearance-none
          ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Textarea({ label, id, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">{label}</label>}
      <textarea
        id={id}
        rows={3}
        className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition-colors resize-none
          ${error ? 'border-red-400' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}
          placeholder:text-slate-400`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
      </div>
      {label && <span className="text-sm font-medium text-ink">{label}</span>}
    </label>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 bg-surface-2 rounded-xl flex items-center justify-center mb-4 text-ink-muted">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  )
}

export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description && <p className="text-sm text-ink-muted mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}
