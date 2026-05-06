export default function StatusBadge({ status }) {
  const classes = {
    draft: 'status-draft',
    submitted: 'status-submitted',
    paid: 'status-paid',
  }
  const labels = { draft: 'Draft', submitted: 'Submitted', paid: 'Paid' }
  return (
    <span className={classes[status] || 'status-draft'}>
      {labels[status] || status}
    </span>
  )
}
