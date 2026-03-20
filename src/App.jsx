import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider } from './context/LangContext'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SupplierRegisterPage from './pages/SupplierRegisterPage'
import CustomerHome from './pages/customer/CustomerHome'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import OrderTracking from './pages/customer/OrderTracking'
import MyOrders from './pages/customer/MyOrders'
import ProductDetail from './pages/customer/ProductDetail'
import SupplierDashboard, { SupplierOrders, SupplierAddItem, SupplierItems } from './pages/supplier/SupplierDashboard'
import AdminDashboard, { AdminSuppliers, AdminItems, AdminOrders, AdminReports } from './pages/admin/AdminDashboard'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/supplier-register" element={<SupplierRegisterPage />} />
      <Route path="/shop" element={<CustomerHome />} />
      <Route path="/products" element={<CustomerHome />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<ProtectedRoute allowedRoles={['customer']}><CartPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><CheckoutPage /></ProtectedRoute>} />
      <Route path="/track/:orderId" element={<OrderTracking />} />
      <Route path="/my-orders" element={<ProtectedRoute allowedRoles={['customer']}><MyOrders /></ProtectedRoute>} />
      <Route path="/supplier" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierDashboard /></ProtectedRoute>} />
      <Route path="/supplier/orders" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierOrders /></ProtectedRoute>} />
      <Route path="/supplier/add-item" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierAddItem /></ProtectedRoute>} />
      <Route path="/supplier/items" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierItems /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/suppliers" element={<ProtectedRoute allowedRoles={['admin']}><AdminSuppliers /></ProtectedRoute>} />
      <Route path="/admin/items" element={<ProtectedRoute allowedRoles={['admin']}><AdminItems /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
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