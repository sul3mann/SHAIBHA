import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerLedger from './pages/CustomerLedger'
import CustomerLedgerDetail from './pages/CustomerLedgerDetail'
import Entries from './pages/Entries'
import Reports from './pages/Reports'
import GoldCalculator from './pages/GoldCalculator'
import ActivityLog from './pages/ActivityLog'
import Settings from './pages/Settings'
import AdminPanel from './pages/AdminPanel'
import AuthPage from './pages/AuthPage'
import UserManagementPage from './pages/UserManagement'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customer-ledger" element={<CustomerLedger />} />
          <Route path="customer-ledger/:customerId" element={<CustomerLedgerDetail />} />
          <Route path="entries" element={<Entries />} />
          <Route path="reports" element={<Reports />} />
          <Route path="gold-calculator" element={<GoldCalculator />} />
          <Route path="activity-log" element={<ActivityLog />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="admin/users" element={<UserManagementPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}

export default App
