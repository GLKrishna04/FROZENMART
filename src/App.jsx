import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider } from './context/LangContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SupplierRegisterPage from './pages/SupplierRegisterPage'

// Customer Pages
import CustomerHome from './pages/customer/CustomerHome'
import CustomerProducts from './pages/customer/CustomerProducts'
import ProductDetail from './pages/customer/ProductDetail'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import OrderTracking from './pages/customer/OrderTracking'
import MyOrders from './pages/customer/MyOrders'

// Supplier Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard'
import SupplierOrders from './pages/supplier/SupplierOrders'
import SupplierStock from './pages/supplier/SupplierStock'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminStock from './pages/admin/AdminStock'
import AdminSuppliers from './pages/admin/AdminSuppliers'
import AdminReports from './pages/admin/AdminReports'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner"/></div>
  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  const { role, user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/supplier-register" element={<SupplierRegisterPage />} />

      {/* Customer Routes */}
      <Route path="/shop" element={<CustomerHome />} />
      <Route path="/products" element={<CustomerProducts />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<ProtectedRoute allowedRoles={['customer']}><CartPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><CheckoutPage /></ProtectedRoute>} />
      <Route path="/track/:orderId" element={<OrderTracking />} />
      <Route path="/my-orders" element={<ProtectedRoute allowedRoles={['customer']}><MyOrders /></ProtectedRoute>} />

      {/* Supplier Routes */}
      <Route path="/supplier" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierDashboard /></ProtectedRoute>} />
      <Route path="/supplier/orders" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierOrders /></ProtectedRoute>} />
      <Route path="/supplier/stock" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierStock /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/stock" element={<ProtectedRoute allowedRoles={['admin']}><AdminStock /></ProtectedRoute>} />
      <Route path="/admin/suppliers" element={<ProtectedRoute allowedRoles={['admin']}><AdminSuppliers /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <AppRoutes />
          <Toaster position="top-center" />
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
