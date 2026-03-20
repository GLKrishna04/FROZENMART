import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'

export default function MyOrders() {
  const { lang } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchOrders() }, [user])

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*')
      .eq('customer_id', user.id).order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  return (
    <div>
      <nav className="navbar">
        <span className="navbar-logo" onClick={() => navigate('/shop')} style={{ cursor: 'pointer' }}>Frozen<span>Mart</span></span>
      </nav>
      <div className="page-container">
        <h1 className="section-title" style={{ marginBottom: 24 }}>
          {lang === 'en' ? 'My Orders' : 'నా ఆర్డర్లు'}
        </h1>
        {loading ? <p>Loading...</p> : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <p style={{ color: 'var(--muted)' }}>{lang === 'en' ? 'No orders yet' : 'ఇంకా ఆర్డర్లు లేవు'}</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/shop')}>
              {lang === 'en' ? 'Shop Now' : 'షాప్ చేయి'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order.id} className="card" style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/track/${order.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>#{order.order_number}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--blue)' }}>₹{order.total_amount}</div>
                    <span className="badge badge-confirmed">{order.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}