import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../context/LangContext'

export default function OrderTracking() {
  const { orderId } = useParams()
  const { lang } = useLang()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])

  useEffect(() => { fetchOrder() }, [orderId])

  async function fetchOrder() {
    const { data } = await supabase.from('orders').select('*').eq('id', orderId).single()
    const { data: oi } = await supabase.from('order_items').select('*').eq('order_id', orderId)
    setOrder(data)
    setItems(oi || [])
  }

  const steps = [
    { key: 'pending',            en: 'Order Placed',      te: 'ఆర్డర్ చేశారు',        icon: '📝' },
    { key: 'confirmed',          en: 'Confirmed',         te: 'కన్ఫర్మ్ అయింది',      icon: '✅' },
    { key: 'supplier_preparing', en: 'Preparing',         te: 'తయారు చేస్తున్నారు',    icon: '👨‍🍳' },
    { key: 'ready_for_pickup',   en: 'Ready for Pickup',  te: 'పికప్‌కు రెడీ',         icon: '📦' },
    { key: 'out_for_delivery',   en: 'Out for Delivery',  te: 'డెలివరీకి బయలుదేరింది', icon: '🚗' },
    { key: 'delivered',          en: 'Delivered',         te: 'డెలివర్ అయింది',       icon: '🎉' },
  ]

  const flow = ['pending','confirmed','supplier_preparing','ready_for_pickup','out_for_delivery','delivered']
  const currentIdx = order ? flow.indexOf(order.status) : 0

  if (!order) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <div>
      <nav className="navbar">
        <span className="navbar-logo" onClick={() => navigate('/shop')} style={{ cursor: 'pointer' }}>Frozen<span>Mart</span></span>
        <div className="navbar-right">
          <button className="btn-nav-outline" onClick={() => navigate('/my-orders')}>
            {lang === 'en' ? 'My Orders' : 'నా ఆర్డర్లు'}
          </button>
        </div>
      </nav>
      <div className="page-container" style={{ maxWidth: 700 }}>
        <h1 className="section-title" style={{ marginBottom: 24 }}>
          {lang === 'en' ? 'Track Your Order' : 'మీ ఆర్డర్ ట్రాక్ చేయండి'}
        </h1>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="tracking-steps">
            {steps.map((step, i) => (
              <div key={step.key} className={`tracking-step ${i < currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}`}>
                <div className="step-dot">{i < currentIdx ? '✓' : step.icon}</div>
                <div className="step-info">
                  <div className="step-title">{lang === 'en' ? step.en : step.te}</div>
                  {i === currentIdx && <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>Current</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>
            {lang === 'en' ? 'Order Items' : 'ఆర్డర్ వివరాలు'}
          </h3>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span>{lang === 'en' ? item.product_name_en : item.product_name_te} × {item.quantity}</span>
              <span style={{ fontWeight: 700 }}>₹{item.total_price}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 800, fontSize: 16 }}>
            <span>{lang === 'en' ? 'Total Paid' : 'మొత్తం'}</span>
            <span style={{ color: 'var(--blue)' }}>₹{order.total_amount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}