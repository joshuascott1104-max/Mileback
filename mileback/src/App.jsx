import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import ErrorBoundary from './components/ui/ErrorBoundary'
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
    <ErrorBoundary>
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
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-6 text-center">
                  <p className="text-2xl font-semibold text-white">Page not found</p>
                  <Link to="/" className="btn-primary">Go home</Link>
                </div>
              } />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}
