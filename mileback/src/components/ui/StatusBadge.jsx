export default function StatusBadge({ status, onClick }) {
  const classes = {
    draft: 'status-draft',
    submitted: 'status-submitted',
    paid: 'status-paid',
  }
  const labels = { draft: 'Draft', submitted: 'Submitted', paid: 'Paid' }
  const cls = `${classes[status] || 'status-draft'}${onClick ? ' cursor-pointer active:scale-95 transition-transform' : ''}`

  if (onClick) {
    return <button onClick={onClick} className={cls}>{labels[status] || status}</button>
  }
  return <span className={cls}>{labels[status] || status}</span>
}
