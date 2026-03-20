import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export function CartPage() {
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('fm_cart') || '[]'))

  function updateQty(id, delta) {
    const newCart = cart.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    setCart(newCart)
    localStorage.setItem('fm_cart', JSON.stringify(newCart))
  }

  function removeItem(id) {
    const newCart = cart.filter(i => i.id !== id)
    setCart(newCart)
    localStorage.setItem('fm_cart', JSON.stringify(newCart))
  }

  const subtotal = cart.reduce((sum, i) => sum + i.customer_price * i.qty, 0)
  const gst = Math.round(subtotal * 0.05)
  const delivery = subtotal > 500 ? 0 : 50
  const total = subtotal + gst + delivery

  if (cart.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🛒</div>
      <h2 style={{ fontFamily: 'Syne, sans-serif' }}>{t('emptyCart')}</h2>
      <button className="btn-primary" onClick={() => navigate('/shop')}>{lang === 'en' ? 'Shop Now' : 'షాప్ చేయి'}</button>
    </div>
  )

  return (
    <div>
      <nav className="navbar">
        <span className="navbar-logo" onClick={() => navigate('/shop')} style={{ cursor: 'pointer' }}>Frozen<span>Mart</span></span>
        <div className="navbar-right">
          <button className="btn-nav-outline" onClick={() => navigate('/shop')}>← {lang === 'en' ? 'Continue Shopping' : 'షాపింగ్ కొనసాగించు'}</button>
        </div>
      </nav>

      <div className="page-container">
        <h1 className="section-title" style={{ marginBottom: 24 }}>{t('yourCart')}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          <div className="card">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img" style={{ background: '#e3f2fd' }}>{item.name_en?.includes('Chicken') ? '🐔' : item.name_en?.includes('Fish') ? '🐟' : item.name_en?.includes('Mutton') ? '🐑' : '🍤'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 4 }}>{lang === 'en' ? item.name_en : item.name_te}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>₹{item.customer_price} / {item.unit}</div>
                </div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, minWidth: 70, textAlign: 'right' }}>₹{Math.round(item.customer_price * item.qty)}</div>
                <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 18, marginLeft: 8 }}>✕</button>
              </div>
            ))}
          </div>

          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 20 }}>{t('orderSummary')}</h3>
            {[
              { label: t('subtotal'), value: `₹${subtotal}` },
              { label: t('gst'), value: `₹${gst}` },
              { label: t('deliveryFee'), value: delivery === 0 ? (lang === 'en' ? 'FREE' : 'ఉచితం') : `₹${delivery}` },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: 'var(--muted)' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: row.label === t('deliveryFee') && delivery === 0 ? 'var(--success)' : 'inherit' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>{t('total')}</span>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--blue)' }}>₹{total}</span>
            </div>
            {delivery > 0 && <div style={{ fontSize: 12, color: 'var(--success)', marginBottom: 12, textAlign: 'center' }}>{lang === 'en' ? `Add ₹${500-subtotal} more for FREE delivery!` : `FREE డెలివరీ కోసం ₹${500-subtotal} ఎక్కువ order చేయండి!`}</div>}
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/checkout')}>{t('checkout')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const cart = JSON.parse(localStorage.getItem('fm_cart') || '[]')
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', area: '', pincode: '', slot: 'morning' })

  const subtotal = cart.reduce((sum, i) => sum + i.customer_price * i.qty, 0)
  const gst = Math.round(subtotal * 0.05)
  const delivery = subtotal > 500 ? 0 : 50
  const total = subtotal + gst + delivery

  function update(field, val) { setForm(p => ({ ...p, [field]: val })) }

  async function handlePlaceOrder() {
    if (!form.name || !form.phone || !form.address || !form.pincode) {
      return toast.error(lang === 'en' ? 'Fill all required fields' : 'అన్ని fields fill చేయండి')
    }
    setLoading(true)

    // Create Razorpay order
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: 'INR',
      name: 'FrozenMart',
      description: 'Frozen Food Order',
      handler: async function(response) {
        // Save order to Supabase
        const supplierId = cart[0]?.supplier_id
        const adminMargin = cart.reduce((sum, i) => sum + (i.customer_price - i.supplier_price) * i.qty, 0)
        const supplierAmount = subtotal - adminMargin

        const { data: order, error } = await supabase.from('orders').insert({
          customer_id: user?.id,
          supplier_id: supplierId,
          delivery_address: `${form.address}, ${form.area}, ${form.pincode}`,
          delivery_area: form.area,
          delivery_pincode: form.pincode,
          delivery_slot: form.slot,
          subtotal, gst_amount: gst, delivery_fee: delivery, total_amount: total,
          admin_margin: Math.round(adminMargin),
          supplier_amount: Math.round(supplierAmount),
          payment_status: 'paid',
          razorpay_payment_id: response.razorpay_payment_id,
          status: 'confirmed'
        }).select().single()

        if (!error && order) {
          // Save order items
          await supabase.from('order_items').insert(
            cart.map(i => ({
              order_id: order.id,
              product_id: i.id,
              product_name_en: i.name_en,
              product_name_te: i.name_te,
              quantity: i.qty,
              unit: i.unit,
              supplier_price: i.supplier_price,
              customer_price: i.customer_price,
              margin_amount: (i.customer_price - i.supplier_price) * i.qty,
              total_price: i.customer_price * i.qty
            }))
          )
          localStorage.removeItem('fm_cart')
          toast.success(lang === 'en' ? 'Order placed successfully!' : 'ఆర్డర్ successfully place అయింది!')
          navigate(`/track/${order.id}`)
        }
      },
      prefill: { name: form.name, contact: '+91' + form.phone },
      theme: { color: '#1565c0' }
    }

    try {
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      toast.error('Payment failed. Try again.')
    }
    setLoading(false)
  }

  return (
    <div>
      <nav className="navbar">
        <span className="navbar-logo" onClick={() => navigate('/shop')} style={{ cursor: 'pointer' }}>Frozen<span>Mart</span></span>
      </nav>

      <div className="page-container">
        <h1 className="section-title" style={{ marginBottom: 24 }}>{lang === 'en' ? 'Checkout' : 'చెక్అవుట్'}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 20 }}>{t('deliveryAddress')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">{t('fullName')} *</label>
                <input className="form-input" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('phone')} *</label>
                <input className="form-input" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('address')} *</label>
              <textarea className="form-input" rows={2} value={form.address} onChange={e => update('address', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">{t('area')}</label>
                <input className="form-input" placeholder="Kukatpally, Hitech City..." value={form.area} onChange={e => update('area', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('pincode')} *</label>
                <input className="form-input" maxLength={6} value={form.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('deliverySlot')}</label>
              <select className="form-select" value={form.slot} onChange={e => update('slot', e.target.value)}>
                <option value="morning">{t('morning')}</option>
                <option value="evening">{t('evening')}</option>
              </select>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>{t('orderSummary')}</h3>
              {cart.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span>{lang === 'en' ? i.name_en : i.name_te} × {i.qty}</span>
                  <span style={{ fontWeight: 600 }}>₹{Math.round(i.customer_price * i.qty)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
                {[{ l: t('subtotal'), v: `₹${subtotal}` }, { l: t('gst'), v: `₹${gst}` }, { l: t('deliveryFee'), v: delivery === 0 ? 'FREE' : `₹${delivery}` }].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--muted)' }}>{r.l}</span><span>{r.v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{t('total')}</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--blue)' }}>₹{total}</span>
                </div>
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%', fontSize: 16, padding: '14px' }} onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Processing...' : `${t('placeOrder')} ₹${total}`}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>🔒 {lang === 'en' ? 'Secure payment via Razorpay' : 'Razorpay ద్వారా secure payment'}</span>
            </div>
          </div>
        </div>
      </div>

      <script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  )
}
