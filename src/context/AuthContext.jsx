import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null) // 'customer', 'supplier', 'admin'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const stored = localStorage.getItem('frozenmart_user')
      if (stored) {
        const userData = JSON.parse(stored)
        setUser(userData)
        setRole(userData.role)
      }
    } catch (e) {
      localStorage.removeItem('frozenmart_user')
    } finally {
      setLoading(false)
    }
  }

  // Customer/Admin OTP login
  async function sendOTP(phone) {
    // In production use Twilio/MSG91
    // For now simulate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    localStorage.setItem('frozenmart_otp', JSON.stringify({ phone, otp, time: Date.now() }))
    console.log('OTP for', phone, ':', otp) // Remove in production
    return { success: true, message: 'OTP sent successfully' }
  }

  async function verifyOTP(phone, enteredOtp) {
    const stored = localStorage.getItem('frozenmart_otp')
    if (!stored) return { success: false, message: 'OTP expired' }

    const { phone: storedPhone, otp, time } = JSON.parse(stored)
    if (Date.now() - time > 5 * 60 * 1000) return { success: false, message: 'OTP expired' }
    if (storedPhone !== phone || otp !== enteredOtp) return { success: false, message: 'Wrong OTP' }

    // Check if admin
    const adminPhone = import.meta.env.VITE_ADMIN_PHONE
    if (phone === adminPhone) {
      const adminUser = { phone, role: 'admin', name: 'Admin' }
      setUser(adminUser)
      setRole('admin')
      localStorage.setItem('frozenmart_user', JSON.stringify(adminUser))
      localStorage.removeItem('frozenmart_otp')
      return { success: true, role: 'admin' }
    }

    // Check if supplier
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('*')
      .eq('phone', phone)
      .eq('status', 'approved')
      .single()

    if (supplier) {
      const supplierUser = { ...supplier, role: 'supplier' }
      setUser(supplierUser)
      setRole('supplier')
      localStorage.setItem('frozenmart_user', JSON.stringify(supplierUser))
      localStorage.removeItem('frozenmart_otp')
      return { success: true, role: 'supplier' }
    }

    // Customer login/register
    let { data: customer } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (!customer) {
      const { data: newCustomer } = await supabase
        .from('users')
        .insert({ phone, role: 'customer' })
        .select()
        .single()
      customer = newCustomer
    }

    const customerUser = { ...customer, role: 'customer' }
    setUser(customerUser)
    setRole('customer')
    localStorage.setItem('frozenmart_user', JSON.stringify(customerUser))
    localStorage.removeItem('frozenmart_otp')
    return { success: true, role: 'customer' }
  }

  function logout() {
    setUser(null)
    setRole(null)
    localStorage.removeItem('frozenmart_user')
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, sendOTP, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
