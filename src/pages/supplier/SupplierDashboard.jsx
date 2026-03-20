import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import toast from 'react-hot-toast'

function SupplierLayout({ children, title }) {
  const { logout, user } = useAuth()
  const { lang, setLang } = useLang()
  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">Frozen<span>Mart</span></div>
        <NavLink to="/supplier" end className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
          📊 {lang === 'en' ? 'Dashboard' : 'డాష్‌బోర్డ్'}
        </NavLink>
        <NavLink to="/supplier/orders" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
          📦 {lang === 'en' ? 'Orders' : 'ఆర్డర్లు'}
        </NavLink>
        <NavLink to="/supplier/items" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
          🥩 {lang === 'en' ? 'My Items' : 'నా Items'}
        </NavLink>
        <NavLink to="/supplier/add-item" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
          ➕ {lang === 'en' ? 'Add New Item' : 'Item Add చేయి'}
        </NavLink>
        <div style={{ marginTop: 'auto', padding: '24px 0 0' }}>
          <div className="dashboard-nav-item" onClick={logout}>🚪 {lang === 'en' ? 'Logout' : 'లాగ్అవుట్'}</div>
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

// SUPPLIER DASHBOARD HOME
export default function SupplierDashboard() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [stats, setStats] = useState({ pendingOrders: 0, completedOrders: 0, pendingItems: 0, approvedItems: 0 })

  useEffect(() => { if (user) fetchStats() }, [user])

  async function fetchStats() {
    const [{ count: pending }, { count: completed }, { count: pendingItems }, { count: approvedItems }] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('supplier_id', user.id).in('status', ['confirmed', 'supplier_preparing']),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('supplier_id', user.id).eq('status', 'delivered'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('supplier_id', user.id).eq('status', 'pending'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('supplier_id', user.id).eq('status', 'approved'),
    ])
    setStats({ pendingOrders: pending || 0, completedOrders: completed || 0, pendingItems: pendingItems || 0, approvedItems: approvedItems || 0 })
  }

  return (
    <SupplierLayout title={lang === 'en' ? 'Supplier Dashboard' : 'సప్లయర్ డాష్‌బోర్డ్'}>
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-num">{stats.pendingOrders}</div>
          <div className="stat-label">{lang === 'en' ? 'Pending Orders' : 'పెండింగ్ ఆర్డర్లు'}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-num">{stats.completedOrders}</div>
          <div className="stat-label">{lang === 'en' ? 'Completed Orders' : 'పూర్తయిన ఆర్డర్లు'}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-num">{stats.pendingItems}</div>
          <div className="stat-label">{lang === 'en' ? 'Items Pending Approval' : 'Approval పెండింగ్ Items'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.approvedItems}</div>
          <div className="stat-label">{lang === 'en' ? 'Live Items' : 'Live Items'}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🥩</div>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 8 }}>
          {lang === 'en' ? 'Want to add new items?' : 'కొత్త items add చేయాలా?'}
        </h3>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 14 }}>
          {lang === 'en'
            ? 'Add your frozen food items. Admin will review and set the customer price.'
            : 'మీ frozen food items add చేయండి. Admin review చేసి customer price set చేస్తారు.'}
        </p>
        <NavLink to="/supplier/add-item">
          <button className="btn-primary">➕ {lang === 'en' ? 'Add New Item' : 'Item Add చేయి'}</button>
        </NavLink>
      </div>
    </SupplierLayout>
  )
}

// ADD NEW ITEM PAGE
export function SupplierAddItem() {
  const { user } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name_en: '',
    name_te: '',
    item_code: '',
    category_id: '',
    description: '',
    supplier_price: '',
    unit: 'kg',
    stock_qty: '',
    availability: 'available',
    grade: '',
    expiry_date: '',
  })

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
    setCategories(data || [])
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.name_en || !form.supplier_price || !form.stock_qty || !form.category_id) {
      return toast.error(lang === 'en' ? 'Fill all required fields' : 'అన్ని required fields fill చేయండి')
    }
    setLoading(true)

    const { error } = await supabase.from('products').insert({
      ...form,
      supplier_id: user.id,
      supplier_price: parseFloat(form.supplier_price),
      stock_qty: parseFloat(form.stock_qty),
      status: 'pending',
      is_active: false,
    })

    // Admin కి notification
    await supabase.from('notifications').insert({
      type: 'new_item',
      title: 'New Item Added by Supplier',
      message: `${user.business_name || user.name} added new item: ${form.name_en} at ₹${form.supplier_price}/${form.unit}`,
      is_read: false,
    })

    setLoading(false)
    if (error) { toast.error('Error: ' + error.message); return }
    setSubmitted(true)
  }

  if (submitted) return (
    <SupplierLayout title={lang === 'en' ? 'Add New Item' : 'Item Add చేయి'}>
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 12 }}>
          {lang === 'en' ? 'Item Submitted!' : 'Item Submit అయింది!'}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
          {lang === 'en'
            ? 'Admin will review your item and set the customer price. It will go live after approval.'
            : 'Admin మీ item review చేసి customer price set చేస్తారు. Approve అయిన తర్వాత live అవుతుంది.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ name_en: '', name_te: '', item_code: '', category_id: '', description: '', supplier_price: '', unit: 'kg', stock_qty: '', availability: 'available', grade: '', expiry_date: '' }) }}>
            {lang === 'en' ? 'Add Another Item' : 'మరో Item Add చేయి'}
          </button>
          <button className="btn-outline" onClick={() => navigate('/supplier/items')}>
            {lang === 'en' ? 'View My Items' : 'నా Items చూడు'}
          </button>
        </div>
      </div>
    </SupplierLayout>
  )

  return (
    <SupplierLayout title={lang === 'en' ? 'Add New Item' : 'కొత్త Item Add చేయి'}>
      <div style={{ maxWidth: 700 }}>
        <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#1565c0' }}>
          ℹ️ {lang === 'en'
            ? 'After you submit, Admin will review and set the customer price. Item will go live after approval.'
            : 'Submit చేసిన తర్వాత Admin review చేసి customer price set చేస్తారు. Approve అయిన తర్వాత customers కి కనిపిస్తుంది.'}
        </div>

        {/* BASIC INFO */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>
            {lang === 'en' ? 'Item Information' : 'Item వివరాలు'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Item Name (English) *' : 'Item పేరు (English) *'}</label>
              <input className="form-input" placeholder="e.g. Chicken Curry Cut"
                value={form.name_en} onChange={e => update('name_en', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Item Name (Telugu)' : 'Item పేరు (Telugu)'}</label>
              <input className="form-input" placeholder="ఉదా: చికెన్ కర్రీ కట్"
                value={form.name_te} onChange={e => update('name_te', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Category *' : 'వర్గం *'}</label>
              <select className="form-select" value={form.category_id} onChange={e => update('category_id', e.target.value)}>
                <option value="">{lang === 'en' ? 'Select category' : 'వర్గం select చేయండి'}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {lang === 'en' ? c.name_en : c.name_te}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Item Code' : 'Item కోడ్'}</label>
              <input className="form-input" placeholder="e.g. CHK001"
                value={form.item_code} onChange={e => update('item_code', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{lang === 'en' ? 'Description' : 'వివరణ'}</label>
            <textarea className="form-input" rows={2} style={{ resize: 'vertical' }}
              placeholder={lang === 'en' ? 'Item description, storage instructions...' : 'Item వివరణ, నిల్వ సూచనలు...'}
              value={form.description} onChange={e => update('description', e.target.value)} />
          </div>
        </div>

        {/* PRICING & STOCK */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>
            {lang === 'en' ? 'Pricing & Stock' : 'ధర & స్టాక్'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Your Price (₹) *' : 'మీ ధర (₹) *'}</label>
              <input className="form-input" type="number" placeholder="0.00"
                value={form.supplier_price} onChange={e => update('supplier_price', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Unit *' : 'యూనిట్ *'}</label>
              <select className="form-select" value={form.unit} onChange={e => update('unit', e.target.value)}>
                <option value="kg">kg</option>
                <option value="g">grams</option>
                <option value="piece">piece</option>
                <option value="pack">pack</option>
                <option value="litre">litre</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Stock Quantity *' : 'స్టాక్ పరిమాణం *'}</label>
              <input className="form-input" type="number" placeholder="0"
                value={form.stock_qty} onChange={e => update('stock_qty', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Availability' : 'అందుబాటు'}</label>
              <select className="form-select" value={form.availability} onChange={e => update('availability', e.target.value)}>
                <option value="available">{lang === 'en' ? 'Available' : 'అందుబాటులో ఉంది'}</option>
                <option value="limited">{lang === 'en' ? 'Limited Stock' : 'తక్కువ స్టాక్'}</option>
                <option value="seasonal">{lang === 'en' ? 'Seasonal' : 'సీజనల్'}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Grade / Quality' : 'గ్రేడ్ / నాణ్యత'}</label>
              <input className="form-input" placeholder="e.g. A Grade, Premium"
                value={form.grade} onChange={e => update('grade', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'en' ? 'Expiry Date' : 'గడువు తేదీ'}</label>
              <input className="form-input" type="date"
                value={form.expiry_date} onChange={e => update('expiry_date', e.target.value)} />
            </div>
          </div>

          {form.supplier_price && (
            <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
              💡 {lang === 'en'
                ? `Your price: ₹${form.supplier_price}/${form.unit}. Admin will add margin and set customer price.`
                : `మీ ధర: ₹${form.supplier_price}/${form.unit}. Admin margin add చేసి customer price set చేస్తారు.`}
            </div>
          )}
        </div>

        <button className="btn-primary" style={{ width: '100%', fontSize: 16, padding: 14 }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : (lang === 'en' ? 'Submit for Approval →' : 'Approval కోసం Submit చేయి →')}
        </button>
      </div>
    </SupplierLayout>
  )
}

// MY ITEMS PAGE
export function SupplierItems() {
  const { user } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchItems() }, [user])

  async function fetchItems() {
    const { data } = await supabase.from('products').select('*, categories(name_en, name_te)')
      .eq('supplier_id', user.id).order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  const statusBadge = {
    pending: { color: '#f57f17', bg: '#fff8e1', label: lang === 'en' ? 'Pending Review' : 'Review పెండింగ్' },
    approved: { color: '#2e7d32', bg: '#e8f5e9', label: lang === 'en' ? 'Live ✅' : 'Live ✅' },
    rejected: { color: '#c62828', bg: '#ffebee', label: lang === 'en' ? 'Rejected' : 'రిజెక్ట్ అయింది' },
  }

  return (
    <SupplierLayout title={lang === 'en' ? 'My Items' : 'నా Items'}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn-primary" onClick={() => navigate('/supplier/add-item')}>
          ➕ {lang === 'en' ? 'Add New Item' : 'Item Add చేయి'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🥩</div>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>{lang === 'en' ? 'No items added yet' : 'ఇంకా items add చేయలేదు'}</p>
          <button className="btn-primary" onClick={() => navigate('/supplier/add-item')}>
            ➕ {lang === 'en' ? 'Add First Item' : 'మొదటి Item Add చేయి'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(item => {
            const badge = statusBadge[item.status] || statusBadge.pending
            return (
              <div key={item.id} className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>
                        {lang === 'en' ? item.name_en : (item.name_te || item.name_en)}
                      </span>
                      <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap' }}>
                      <span>📂 {lang === 'en' ? item.categories?.name_en : item.categories?.name_te}</span>
                      <span>💰 ₹{item.supplier_price}/{item.unit}</span>
                      {item.customer_price > 0 && <span style={{ color: 'var(--blue)', fontWeight: 600 }}>🏷️ Customer: ₹{item.customer_price}/{item.unit}</span>}
                      <span>📦 Stock: {item.stock_qty} {item.unit}</span>
                      {item.grade && <span>⭐ {item.grade}</span>}
                      {item.expiry_date && <span>📅 Expiry: {new Date(item.expiry_date).toLocaleDateString()}</span>}
                    </div>
                    {item.status === 'pending' && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#f57f17' }}>
                        ⏳ {lang === 'en' ? 'Admin will review and set customer price soon' : 'Admin review చేసి customer price set చేస్తారు'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SupplierLayout>
  )
}

// SUPPLIER ORDERS PAGE
export function SupplierOrders() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchOrders() }, [user])

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*, order_items(*)')
      .eq('supplier_id', user.id).in('status', ['confirmed', 'supplier_preparing'])
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    if (status === 'ready_for_pickup') {
      toast.success(lang === 'en' ? 'Delivery will be assigned automatically!' : 'Delivery automatically assign అవుతుంది!')
    } else {
      toast.success('Status updated!')
    }
    fetchOrders()
  }

  return (
    <SupplierLayout title={lang === 'en' ? 'Orders' : 'ఆర్డర్లు'}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : orders.length === 0 ? (
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
                    <span>{item.product_name}</span>
                    <span style={{ fontWeight: 700 }}>{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {order.status === 'confirmed' && (
                  <>
                    <button className="btn-success" onClick={() => updateStatus(order.id, 'supplier_preparing')}>
                      ✅ {lang === 'en' ? 'Accept' : 'అంగీకరించు'}
                    </button>
                    <button className="btn-danger" onClick={() => updateStatus(order.id, 'cancelled')}>
                      ❌ {lang === 'en' ? 'Reject' : 'తిరస్కరించు'}
                    </button>
                  </>
                )}
                {order.status === 'supplier_preparing' && (
                  <button className="btn-primary" onClick={() => updateStatus(order.id, 'ready_for_pickup')}>
                    📦 {lang === 'en' ? 'Ready for Pickup' : 'పికప్‌కు రెడీ'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SupplierLayout>
  )
}