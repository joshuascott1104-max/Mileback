import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import BottomNav from './components/layout/BottomNav'
import Dashboard from './components/dashboard/Dashboard'
import MileageList from './components/mileage/MileageList'
import MileageForm from './components/mileage/MileageForm'
import ExpenseList from './components/expenses/ExpenseList'
import ExpenseForm from './components/expenses/ExpenseForm'
import Reports from './components/reports/Reports'
import Settings from './components/settings/Settings'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen max-w-lg mx-auto relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mileage" element={<MileageList />} />
            <Route path="/mileage/add" element={<MileageForm />} />
            <Route path="/mileage/edit/:id" element={<MileageForm />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/expenses/add" element={<ExpenseForm />} />
            <Route path="/expenses/edit/:id" element={<ExpenseForm />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
