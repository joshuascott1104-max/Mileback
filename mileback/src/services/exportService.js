import Papa from 'papaparse'

function buildRows(mileageClaims, expenses) {
  const rows = []

  mileageClaims.forEach(c => {
    rows.push({
      Date: c.date,
      'Claim Type': 'Mileage',
      Vehicle: c.vehicleName || '',
      'Start Postcode': c.startPostcode,
      'End Postcode': c.endPostcode,
      'Reason / Customer': c.reason,
      Miles: c.miles,
      Rate: `£${c.rate}`,
      'Mileage Total': `£${c.total.toFixed(2)}`,
      'Expense Category': '',
      Description: '',
      'Expense Total': '',
      Notes: c.notes || '',
      Status: c.status,
    })
  })

  expenses.forEach(e => {
    rows.push({
      Date: e.date,
      'Claim Type': 'Expense',
      Vehicle: '',
      'Start Postcode': '',
      'End Postcode': '',
      'Reason / Customer': '',
      Miles: '',
      Rate: '',
      'Mileage Total': '',
      'Expense Category': e.category,
      Description: e.description || e.supplier || '',
      'Expense Total': `£${e.amount.toFixed(2)}`,
      Notes: e.notes || '',
      Status: e.status,
    })
  })

  return rows.sort((a, b) => a.Date.localeCompare(b.Date))
}

export function exportToCSV(mileageClaims, expenses, filename = 'mileback-export') {
  const rows = buildRows(mileageClaims, expenses)
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function copyToClipboard(mileageClaims, expenses) {
  const rows = buildRows(mileageClaims, expenses)
  if (rows.length === 0) return Promise.resolve()
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join('\t'),
    ...rows.map(r => headers.map(h => r[h] ?? '').join('\t'))
  ]
  return navigator.clipboard.writeText(lines.join('\n'))
}
