import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0)
}

export function formatMiles(miles) {
  return `${miles} mi`
}

export function formatDate(dateStr) {
  try {
    return format(parseISO(dateStr), 'd MMM yyyy')
  } catch {
    return dateStr
  }
}

export function getMileageClaimTotal(claim) {
  const miles = claim.isReturn ? claim.miles * 2 : claim.miles
  return parseFloat((miles * claim.rate).toFixed(2))
}

export function getThisMonthClaims(mileageClaims, expenses) {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

  const inMonth = (item) => {
    try {
      return isWithinInterval(parseISO(item.date), { start, end })
    } catch { return false }
  }

  const monthMileage = mileageClaims.filter(inMonth)
  const monthExpenses = expenses.filter(inMonth)

  const totalMiles = monthMileage.reduce((sum, c) => {
    return sum + (c.isReturn ? c.miles * 2 : c.miles)
  }, 0)

  const totalMileageValue = monthMileage.reduce((sum, c) => sum + getMileageClaimTotal(c), 0)
  const totalExpenseValue = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return {
    mileageClaims: monthMileage,
    expenses: monthExpenses,
    totalMiles,
    totalMileageValue,
    totalExpenseValue,
    totalValue: totalMileageValue + totalExpenseValue,
    journeyCount: monthMileage.length,
    expenseCount: monthExpenses.length,
  }
}

export const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-50 text-blue-700',
  paid: 'bg-emerald-50 text-emerald-700',
}

export const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  paid: 'Paid',
}

export const EXPENSE_CATEGORIES = [
  'Fuel', 'Parking', 'Food', 'Hotel', 'Train', 'Taxi', 'Office supplies', 'Other'
]

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
