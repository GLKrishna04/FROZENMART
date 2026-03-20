import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import toast from 'react-hot-toast'

function SupplierLayout({ children, title }) {
  const { logout, user } = useAuth()
  const { lang, setLang, t } = useLang()
  const navigate = useNavigate()
  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">Frozen<span>Mart</span></div>
        <NavLink to="/supplier" end className={({isActive}) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>📊 {t('supplierDashboard')}</NavLink>
        <NavLink to="/supplier/orders" className={({isActive}) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>📦 {t('newOrders')}</NavLink>
        <NavLink to="/supplier/stock" className={({isActive}) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>📋 {t('stockManagement')}</NavLink>
        <div style={{ marginTop: 'auto', padding: '24px 0 0' }}>
          <div className="dashboard-nav-item" onClick={logout}>🚪 {t('logout')}</div>
        </div>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18 }}>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="lang-switcher">
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
              <button className={`lang-btn ${lang === 'te' ? 'active' : ''}`} onClick={() => setLang('te')}>తె</button>
            </div>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>👤 {user?.business_name || user?.name}</span>
          </div>
        </div>
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  )
}

export default function SupplierDashboard() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const [stats, setStats] = useState({ new: 0, pending: 0, completed: 0, lowStock: 0 })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => { if (user) fetchStats() }, [user])

  async function fetchStats() {
    const today = new Date().toISOString().split('T')[0]
    const [{ count: newCount }, { count: pendingCount }, { count: doneCount }, { data: low }] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('supplier_id', user.id).eq('status', 'confirmed'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('supplier_id', user.id).eq('status', 'supplier_preparing'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('supplier_id', user.id).eq('status', 'delivered').gte('created_at', today),
      supabase.from('products').select('id').eq('supplier_id', user.id).lt('stock_qty', 10),
    ])
    setStats({ new: newCount || 0, pending: pendingCount || 0, completed: doneCount || 0, lowStock: low?.length || 0 })

    const { data: orders } = await supabase.from('orders').select('*').eq('supplier_id', user.id).order('created_at', { ascending: false }).limit(5)
    setRecentOrders(orders || [])
  }

  return (
    <SupplierLayout title={t('supplierDashboard')}>
      <div className="stats-grid">
        <div className="stat-card accent"><div className="stat-num">{stats.new}</div><div className="stat-label">{t('newOrders')}</div></div>
        <div className="stat-card"><div className="stat-num">{stats.pending}</div><div className="stat-label">{t('pendingOrders')}</div></div>
        <div className="stat-card success"><div className="stat-num">{stats.completed}</div><div className="stat-label">{t('completedToday')}</div></div>
        <div className="stat-card warning"><div className="stat-num">{stats.lowStock}</div><div className="stat-label">{t('stockAlert')}</div></div>
      </div>

      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>{lang === 'en' ? 'Recent Orders' : 'ఇటీవలి ఆర్డర్లు'}</h3>
      <table className="data-table">
        <thead><tr><th>Order #</th><th>{lang === 'en' ? 'Date' : 'తేదీ'}</th><th>{lang === 'en' ? 'Amount' : 'మొత్తం'}</th><th>Status</th></tr></thead>
        <tbody>
          {recentOrders.map(o => (
            <tr key={o.id}>
              <td style={{ fontWeight: 700 }}>#{o.order_number}</td>
              <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(o.created_at).toLocaleDateString()}</td>
              <td style={{ fontWeight: 700, color: 'var(--blue)' }}>₹{o.supplier_amount}</td>
              <td><span className={`badge badge-${o.status === 'delivered' ? 'delivered' : 'confirmed'}`}>{o.status.replace(/_/g, ' ')}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </SupplierLayout>
  )
}

export function SupplierOrders() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchOrders() }, [user])

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('supplier_id', user.id).in('status', ['confirmed', 'supplier_preparing']).order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    if (status === 'ready_for_pickup') {
      toast.success(lang === 'en' ? 'Delivery partner will be assigned automatically!' : 'Delivery partner automatically assign అవుతారు!')
    }
    fetchOrders()
  }

  return (
    <SupplierLayout title={t('newOrders')}>
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
        : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <p style={{ color: 'var(--muted)' }}>{lang === 'en' ? 'No pending orders' : 'పెండింగ్ ఆర్డర్లు లేవు'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>#{order.order_number}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>📍 {order.delivery_address}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>⏰ {order.delivery_slot === 'morning' ? (lang === 'en' ? 'Morning' : 'ఉదయం') : (lang === 'en' ? 'Evening' : 'సాయంత్రం')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--blue)', fontSize: 18 }}>₹{order.supplier_amount}</div>
                    <span className="badge badge-confirmed">{order.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--gray)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  {order.order_items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                      <span>{lang === 'en' ? item.product_name_en : item.product_name_te}</span>
                      <span style={{ fontWeight: 700 }}>{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  {order.status === 'confirmed' && (
                    <>
                      <button className="btn-success" onClick={() => updateStatus(order.id, 'supplier_preparing')}>{t('acceptOrder')}</button>
                      <button className="btn-danger" onClick={() => updateStatus(order.id, 'cancelled')}>{t('rejectOrder')}</button>
                    </>
                  )}
                  {order.status === 'supplier_preparing' && (
                    <button className="btn-primary" onClick={() => updateStatus(order.id, 'ready_for_pickup')}>✅ {t('readyForPickup')}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </SupplierLayout>
  )
}

export function SupplierStock() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const [products, setProducts] = useState([])
  const [newItem, setNewItem] = useState({ name_en: '', name_te: '', supplier_price: '', unit: 'kg', stock_qty: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchProducts() }, [user])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*, categories(name_en)').eq('supplier_id', user.id)
    setProducts(data || [])
    setLoading(false)
  }

  async function updateStock(productId, qty) {
    await supabase.from('products').update({ stock_qty: qty }).eq('id', productId)
    await supabase.from('stock_updates').insert({ product_id: productId, supplier_id: user.id, new_qty: qty })
    toast.success(lang === 'en' ? 'Stock updated!' : 'స్టాక్ update అయింది!')
    fetchProducts()
  }

  async function requestNewItem() {
    if (!newItem.name_en || !newItem.supplier_price) return toast.error('Required fields fill చేయండి')
    await supabase.from('notifications').insert({
      user_type: 'admin',
      title: 'New Product Request',
      message: `Supplier ${user.business_name} wants to add: ${newItem.name_en} at ₹${newItem.supplier_price}/${newItem.unit}`,
      type: 'new_product_request'
    })
    toast.success(lang === 'en' ? 'Request sent to admin! They will add it within 24 hours.' : 'Admin కి request పంపించాం! 24 గంటల్లో add చేస్తారు.')
    setShowAdd(false)
    setNewItem({ name_en: '', name_te: '', supplier_price: '', unit: 'kg', stock_qty: '' })
  }

  return (
    <SupplierLayout title={t('stockManagement')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div/>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ {lang === 'en' ? 'Request New Item' : 'కొత్త ఐటమ్ Request చేయి'}</button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid var(--cyan)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>{lang === 'en' ? 'Request New Item' : 'కొత్త ఐటమ్ Request'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Name (English) *</label>
              <input className="form-input" placeholder="e.g. Chicken Curry Cut" value={newItem.name_en} onChange={e => setNewItem(p => ({ ...p, name_en: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">పేరు (Telugu)</label>
              <input className="form-input" placeholder="ఉదా: చికెన్ కర్రీ కట్" value={newItem.name_te} onChange={e => setNewItem(p => ({ ...p, name_te: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Your Price (₹) *' : 'మీ ధర (₹) *'}</label>
              <input className="form-input" type="number" placeholder="200" value={newItem.supplier_price} onChange={e => setNewItem(p => ({ ...p, supplier_price: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={newItem.unit} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))}>
                <option value="kg">kg</option>
                <option value="piece">piece</option>
                <option value="pack">pack</option>
                <option value="g">grams</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Available Stock' : 'అందుబాటులో ఉన్న స్టాక్'}</label>
              <input className="form-input" type="number" placeholder="50" value={newItem.stock_qty} onChange={e => setNewItem(p => ({ ...p, stock_qty: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn-primary" onClick={requestNewItem}>{lang === 'en' ? 'Send Request' : 'Request పంపు'}</button>
            <button className="btn-outline" onClick={() => setShowAdd(false)}>{lang === 'en' ? 'Cancel' : 'రద్దు'}</button>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
            ℹ️ {lang === 'en' ? 'Admin will review and set the customer price. You will be notified.' : 'Admin review చేసి customer price set చేస్తారు. మీకు notify చేస్తారు.'}
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>{lang === 'en' ? 'Product' : 'ఉత్పత్తి'}</th>
            <th>{lang === 'en' ? 'Your Price' : 'మీ ధర'}</th>
            <th>{lang === 'en' ? 'Customer Price' : 'Customer ధర'}</th>
            <th>{lang === 'en' ? 'Stock' : 'స్టాక్'}</th>
            <th>{lang === 'en' ? 'Update' : 'అప్‌డేట్'}</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <StockRow key={product.id} product={product} lang={lang} onUpdate={updateStock} />
          ))}
        </tbody>
      </table>
    </SupplierLayout>
  )
}

function StockRow({ product, lang, onUpdate }) {
  const [qty, setQty] = useState(product.stock_qty)
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 700 }}>{lang === 'en' ? product.name_en : product.name_te}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{product.categories?.name_en}</div>
      </td>
      <td style={{ color: 'var(--muted)' }}>₹{product.supplier_price}/{product.unit}</td>
      <td style={{ fontWeight: 700, color: 'var(--blue)' }}>₹{product.customer_price}/{product.unit}</td>
      <td>
        <span style={{ color: product.stock_qty < 10 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
          {product.stock_qty < 10 ? '⚠️ ' : '✅ '}{product.stock_qty} {product.unit}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="number" style={{ width: 80, padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }} value={qty} onChange={e => setQty(Number(e.target.value))} />
          <button className="btn-success" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => onUpdate(product.id, qty)}>Save</button>
        </div>
      </td>
    </tr>
  )
}
