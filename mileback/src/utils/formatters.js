import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

export const formatCurrency = (amount) =>
  `£${Number(amount || 0).toFixed(2)}`

export const formatDate = (dateStr) => {
  try { return format(parseISO(dateStr), 'd MMM yyyy') }
  catch { return dateStr }
}

export const formatMiles = (miles) =>
  `${Number(miles || 0).toFixed(1)} mi`

export const calcMileageTotal = (miles, rate, returnJourney) => {
  const m = Number(miles || 0)
  const r = Number(rate || 0)
  return returnJourney ? m * 2 * r : m * r
}

export const getMonthClaims = (mileageClaims, expenses) => {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)
  const inMonth = (dateStr) => {
    try { return isWithinInterval(parseISO(dateStr), { start, end }) }
    catch { return false }
  }
  const monthMileage = mileageClaims.filter(c => inMonth(c.date))
  const monthExpenses = expenses.filter(e => inMonth(e.date))
  const mileageTotal = monthMileage.reduce((s, c) => s + (c.total || 0), 0)
  const expenseTotal = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0)
  return {
    monthMileage,
    monthExpenses,
    mileageTotal,
    expenseTotal,
    combined: mileageTotal + expenseTotal,
    totalMiles: monthMileage.reduce((s, c) => s + (c.returnJourney ? c.miles * 2 : c.miles), 0),
  }
}

export const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  paid: 'Paid',
}

export const EXPENSE_CATEGORIES = [
  'Fuel', 'Parking', 'Food', 'Hotel', 'Train', 'Taxi', 'Office Supplies', 'Other'
]
