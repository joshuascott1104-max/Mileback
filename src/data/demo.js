import { format, subDays } from 'date-fns'

export const demoVehicles = [
  { id: 'v1', name: 'Ford Transit', registration: 'LK21 XYZ', defaultRate: 0.45, isDefault: true },
  { id: 'v2', name: 'VW Golf', registration: 'BN19 ABC', defaultRate: 0.45, isDefault: false },
]

export const demoMileageClaims = [
  {
    id: 'm1',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    vehicleId: 'v1',
    vehicleName: 'Ford Transit',
    startPostcode: 'LS1 1BA',
    endPostcode: 'M1 1AE',
    startLocationName: 'Leeds Office',
    endLocationName: 'Manchester Client',
    reason: 'Client meeting - Acme Ltd',
    miles: 44,
    rate: 0.45,
    returnJourney: true,
    notes: '',
    status: 'submitted',
    total: 39.60,
  },
  {
    id: 'm2',
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    vehicleId: 'v1',
    vehicleName: 'Ford Transit',
    startPostcode: 'LS1 1BA',
    endPostcode: 'BD1 1HX',
    startLocationName: 'Leeds Office',
    endLocationName: 'Bradford Site',
    reason: 'Site survey - Plot 14',
    miles: 9,
    rate: 0.45,
    returnJourney: false,
    notes: 'Parking paid separately',
    status: 'draft',
    total: 4.05,
  },
  {
    id: 'm3',
    date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    vehicleId: 'v2',
    vehicleName: 'VW Golf',
    startPostcode: 'LS1 1BA',
    endPostcode: 'YO1 9WT',
    startLocationName: 'Leeds Office',
    endLocationName: 'York Depot',
    reason: 'Delivery - Order #5521',
    miles: 24,
    rate: 0.45,
    returnJourney: true,
    notes: '',
    status: 'paid',
    total: 21.60,
  },
]

export const demoExpenses = [
  {
    id: 'e1',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    category: 'Parking',
    supplier: 'NCP Leeds',
    description: 'City centre parking - client visit',
    amount: 8.50,
    vat: 1.42,
    notes: '',
    status: 'submitted',
  },
  {
    id: 'e2',
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    category: 'Food',
    supplier: 'Costa Coffee',
    description: 'Working lunch with client',
    amount: 12.40,
    vat: 0,
    notes: '',
    status: 'draft',
  },
  {
    id: 'e3',
    date: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    category: 'Train',
    supplier: 'Northern Rail',
    description: 'Leeds to Sheffield - sales meeting',
    amount: 24.00,
    vat: 0,
    notes: 'Return ticket',
    status: 'paid',
  },
]

export const demoSettings = {
  userName: 'Josh Wilson',
  companyName: 'West Yorkshire Group Ltd',
  standardRate: 0.45,
  defaultVehicleId: 'v1',
  exportFormat: 'csv',
}

export const demoFavouriteJourneys = [
  { id: 'fj1', name: 'Leeds → Manchester', startPostcode: 'LS1 1BA', endPostcode: 'M1 1AE', startName: 'Leeds Office', endName: 'Manchester City Centre' },
  { id: 'fj2', name: 'Leeds → Bradford', startPostcode: 'LS1 1BA', endPostcode: 'BD1 1HX', startName: 'Leeds Office', endName: 'Bradford Site' },
]
