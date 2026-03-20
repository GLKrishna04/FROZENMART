import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import toast from 'react-hot-toast'

function AdminLayout({ children, title }) {
  const { logout } = useAuth()
  const { lang, setLang } = useLang()
  const [unread, setUnread] = useState(0)

  useEffect(() => { fetchUnread() }, [])

  async function fetchUnread() {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false)
    setUnread(count || 0)
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">Frozen<span>Mart</span></div>
        <NavLink to="/admin" end className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/admin/suppliers" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
          🏭 Suppliers
        </NavLink>
        <NavLink to="/admin/items" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
          🥩 Items {unread > 0 && <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 11, marginLeft: 4 }}>{unread}</span>}
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
          📦 Orders
        </NavLink>
        <NavLink to="/admin/reports" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
          📈 Reports
        </NavLink>
        <div style={{ marginTop: 'auto', padding: '24px 0 0' }}>
          <div className="dashboard-nav-item" onClick={logout}>🚪 Logout</div>
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
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>👑 Admin</span>
          </div>
        </div>
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  )
}

// ADMIN DASHBOARD HOME
export default function AdminDashboard() {
  const { lang } = useLang()
  const [stats, setStats] = useState({ todayOrders: 0, todayRevenue: 0, totalSuppliers: 0, pendingRequests: 0, pendingItems: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const today = new Date().toISOString().split('T')[0]
    const [
      { count: todayCount },
      { data: todayRev },
      { count: supplierCount },
      { count: pendingReq },
      { count: pendingItems },
      { data: orders },
      { data: notifs }
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('orders').select('admin_earning').gte('created_at', today).eq('payment_status', 'paid'),
      supabase.from('suppliers').select('*', { count: 'exact', head: true }),
      supabase.from('supplier_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('*, suppliers(business_name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('notifications').select('*').eq('is_read', false).order('created_at', { ascending: false }).limit(5)
    ])
    const revenue = todayRev?.reduce((s, o) => s + (o.admin_earning || 0), 0) || 0
    setStats({ todayOrders: todayCount || 0, todayRevenue: revenue, totalSuppliers: supplierCount || 0, pendingRequests: pendingReq || 0, pendingItems: pendingItems || 0 })
    setRecentOrders(orders || [])
    setNotifications(notifs || [])
  }

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="stats-grid">
        <div className="stat-card accent"><div className="stat-num">{stats.todayOrders}</div><div className="stat-label">Today's Orders</div></div>
        <div className="stat-card success"><div className="stat-num">₹{stats.todayRevenue}</div><div className="stat-label">Today's Revenue</div></div>
        <div className="stat-card"><div className="stat-num">{stats.totalSuppliers}</div><div className="stat-label">Total Suppliers</div></div>
        <div className="stat-card warning"><div className="stat-num">{stats.pendingRequests}</div><div className="stat-label">Pending Supplier Requests</div></div>
        <div className="stat-card warning"><div className="stat-num">{stats.pendingItems}</div><div className="stat-label">Items Pending Approval</div></div>
      </div>

      {notifications.length > 0 && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid var(--cyan)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16, color: 'var(--blue)' }}>
            🔔 New Notifications ({notifications.length})
          </h3>
          {notifications.map(n => (
            <div key={n.id} style={{ padding: '10px 12px', background: 'var(--gray)', borderRadius: 8, marginBottom: 8, fontSize: 14 }}>
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{n.message}</div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>Recent Orders</h3>
      <table className="data-table">
        <thead><tr><th>Order #</th><th>Supplier</th><th>Total</th><th>My Revenue</th><th>Status</th></tr></thead>
        <tbody>
          {recentOrders.map(o => (
            <tr key={o.id}>
              <td style={{ fontWeight: 700 }}>#{o.order_number}</td>
              <td style={{ fontSize: 13, color: 'var(--muted)' }}>{o.suppliers?.business_name || '—'}</td>
              <td style={{ fontWeight: 700 }}>₹{o.total_amount}</td>
              <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{o.admin_earning}</td>
              <td><span className={`badge badge-${o.status === 'delivered' ? 'delivered' : 'confirmed'}`}>{o.status.replace(/_/g, ' ')}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  )
}

// ADMIN SUPPLIERS PAGE
export function AdminSuppliers() {
  const { lang } = useLang()
  const [tab, setTab] = useState('requests')
  const [requests, setRequests] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [supplierItems, setSupplierItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: reqs }, { data: sups }] = await Promise.all([
      supabase.from('supplier_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('suppliers').select('*').order('created_at', { ascending: false })
    ])
    setRequests(reqs || [])
    setSuppliers(sups || [])
    setLoading(false)
  }

  async function approveSupplier(req) {
    await supabase.from('suppliers').insert({
      name: req.name, phone: req.phone, email: req.email,
      business_name: req.business_name, location: req.location, status: 'approved'
    })
    await supabase.from('supplier_requests').update({ status: 'approved' }).eq('id', req.id)
    toast.success('Supplier approved! They can now login.')
    fetchAll()
  }

  async function rejectRequest(id) {
    await supabase.from('supplier_requests').update({ status: 'rejected' }).eq('id', id)
    toast.success('Request rejected')
    fetchAll()
  }

  async function viewSupplierDetails(supplier) {
    setSelectedSupplier(supplier)
    const { data } = await supabase.from('products').select('*, categories(name_en)')
      .eq('supplier_id', supplier.id).order('created_at', { ascending: false })
    setSupplierItems(data || [])
  }

  // SUPPLIER DETAIL VIEW
  if (selectedSupplier) return (
    <AdminLayout title={`Supplier: ${selectedSupplier.business_name}`}>
      <button onClick={() => setSelectedSupplier(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', marginBottom: 20, fontSize: 14 }}>
        ← Back to Suppliers
      </button>

      {/* SUPPLIER INFO */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>Supplier Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
          <div><span style={{ color: 'var(--muted)' }}>Name:</span> <b>{selectedSupplier.name}</b></div>
          <div><span style={{ color: 'var(--muted)' }}>Business:</span> <b>{selectedSupplier.business_name}</b></div>
          <div><span style={{ color: 'var(--muted)' }}>Phone:</span> <b>{selectedSupplier.phone}</b></div>
          <div><span style={{ color: 'var(--muted)' }}>Email:</span> <b>{selectedSupplier.email || '—'}</b></div>
          <div><span style={{ color: 'var(--muted)' }}>Location:</span> <b>{selectedSupplier.location}</b></div>
          <div><span style={{ color: 'var(--muted)' }}>Joined:</span> <b>{new Date(selectedSupplier.created_at).toLocaleDateString()}</b></div>
        </div>
      </div>

      {/* SUPPLIER ITEMS */}
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>
        Items by this Supplier ({supplierItems.length})
      </h3>
      {supplierItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          No items added yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {supplierItems.map(item => (
            <div key={item.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{item.name_en}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                    {item.categories?.name_en} · ₹{item.supplier_price}/{item.unit} · Stock: {item.stock_qty} {item.unit}
                    {item.grade && ` · ${item.grade}`}
                    {item.expiry_date && ` · Expiry: ${new Date(item.expiry_date).toLocaleDateString()}`}
                  </div>
                </div>
                <span style={{
                  background: item.status === 'approved' ? '#e8f5e9' : item.status === 'rejected' ? '#ffebee' : '#fff8e1',
                  color: item.status === 'approved' ? '#2e7d32' : item.status === 'rejected' ? '#c62828' : '#f57f17',
                  fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 6
                }}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )

  return (
    <AdminLayout title="Suppliers">
      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <div className={`filter-tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
          Pending Requests {requests.length > 0 && <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 11, marginLeft: 4 }}>{requests.length}</span>}
        </div>
        <div className={`filter-tab ${tab === 'approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>
          Approved Suppliers ({suppliers.length})
        </div>
      </div>

      {tab === 'requests' && (
        requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            No pending requests
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {requests.map(req => (
              <div key={req.id} className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{req.business_name}</div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>👤 {req.name}</div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>📞 {req.phone}</div>
                    {req.email && <div style={{ fontSize: 14, marginBottom: 4 }}>📧 {req.email}</div>}
                    <div style={{ fontSize: 14, color: 'var(--muted)' }}>📍 {req.location}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Applied: {new Date(req.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-success" onClick={() => approveSupplier(req)}>✅ Approve</button>
                  <button className="btn-danger" onClick={() => rejectRequest(req.id)}>❌ Reject</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'approved' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {suppliers.map(sup => (
            <div key={sup.id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => viewSupplierDetails(sup)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--blue)' }}>
                  {sup.business_name?.charAt(0) || sup.name?.charAt(0)}
                </div>
                <span style={{ fontSize: 20 }}>👁️</span>
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{sup.business_name}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 2 }}>👤 {sup.name}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 2 }}>📞 {sup.phone}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>📍 {sup.location}</div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>
                Click to view details & items →
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

// ADMIN ITEMS APPROVAL PAGE
export function AdminItems() {
  const { lang } = useLang()
  const [items, setItems] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [marginInput, setMarginInput] = useState({})

  useEffect(() => { fetchItems() }, [tab])

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase.from('products')
      .select('*, suppliers(name, business_name), categories(name_en, name_te)')
      .eq('status', tab).order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  async function approveItem(item) {
    const margin = parseFloat(marginInput[item.id] || 20)
    const customerPrice = Math.round(item.supplier_price * (1 + margin / 100) * 100) / 100

    await supabase.from('products').update({
      status: 'approved',
      is_active: true,
      admin_margin: margin,
      customer_price: customerPrice
    }).eq('id', item.id)

    // Mark notification as read
    await supabase.from('notifications').update({ is_read: true }).eq('type', 'new_item')

    toast.success(`Item approved! Customer price: ₹${customerPrice}`)
    fetchItems()
  }

  async function rejectItem(itemId) {
    await supabase.from('products').update({ status: 'rejected', is_active: false }).eq('id', itemId)
    toast.success('Item rejected')
    fetchItems()
  }

  return (
    <AdminLayout title="Items Management">
      <div className="filter-bar" style={{ marginBottom: 24 }}>
        {['pending', 'approved', 'rejected'].map(t => (
          <div key={t} className={`filter-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'pending' ? '⏳ Pending Review' : t === 'approved' ? '✅ Approved (Live)' : '❌ Rejected'}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {tab === 'pending' ? '✅' : tab === 'approved' ? '🥩' : '❌'}
          </div>
          No {tab} items
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} className="card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: tab === 'pending' ? 16 : 0 }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                    {item.name_en} {item.name_te && `/ ${item.name_te}`}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span>🏭 {item.suppliers?.business_name}</span>
                    <span>📂 {item.categories?.name_en}</span>
                    <span>💰 Supplier: ₹{item.supplier_price}/{item.unit}</span>
                    <span>📦 Stock: {item.stock_qty} {item.unit}</span>
                    {item.grade && <span>⭐ {item.grade}</span>}
                    {item.item_code && <span>🔖 Code: {item.item_code}</span>}
                    {item.expiry_date && <span>📅 Expiry: {new Date(item.expiry_date).toLocaleDateString()}</span>}
                    {item.availability && <span>📊 {item.availability}</span>}
                  </div>
                  {item.description && (
                    <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>"{item.description}"</div>
                  )}
                  {tab === 'approved' && (
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      <span style={{ color: 'var(--success)', fontWeight: 700 }}>✅ Customer Price: ₹{item.customer_price}/{item.unit}</span>
                      <span style={{ color: 'var(--muted)', marginLeft: 12 }}>Margin: {item.admin_margin}%</span>
                      <span style={{ color: 'var(--blue)', marginLeft: 12 }}>Your earning: ₹{Math.round((item.customer_price - item.supplier_price) * 100) / 100}/{item.unit}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* APPROVE SECTION */}
              {tab === 'pending' && (
                <div style={{ background: 'var(--gray)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Set Customer Price:</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Margin %</div>
                      <input type="number" style={{ width: 90, padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}
                        placeholder="20" defaultValue={20}
                        onChange={e => setMarginInput(p => ({ ...p, [item.id]: e.target.value }))} />
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ color: 'var(--muted)', marginBottom: 2 }}>Supplier price: ₹{item.supplier_price}</div>
                      <div style={{ color: 'var(--blue)', fontWeight: 700, fontSize: 16 }}>
                        Customer price: ₹{Math.round(item.supplier_price * (1 + (marginInput[item.id] || 20) / 100) * 100) / 100}
                      </div>
                      <div style={{ color: 'var(--success)', fontSize: 12 }}>
                        Your earning: ₹{Math.round(item.supplier_price * (marginInput[item.id] || 20) / 100 * 100) / 100}/{item.unit}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                      <button className="btn-success" onClick={() => approveItem(item)}>✅ Approve & Go Live</button>
                      <button className="btn-danger" onClick={() => rejectItem(item.id)}>❌ Reject</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

// ADMIN ORDERS
export function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [filter])

  async function fetchOrders() {
    setLoading(true)
    let query = supabase.from('orders').select('*, suppliers(business_name), order_items(*)').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query.limit(50)
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    toast.success('Status updated!')
    fetchOrders()
  }

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'New' },
    { key: 'supplier_preparing', label: 'Preparing' },
    { key: 'out_for_delivery', label: 'Delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <AdminLayout title="Orders Manager">
      <div className="filter-bar" style={{ marginBottom: 24 }}>
        {filters.map(f => (
          <div key={f.key} className={`filter-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</div>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        : orders.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>No orders found</div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map(order => (
                <div key={order.id} className="card">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>#{order.order_number}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>📍 {order.delivery_area}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>🏭 {order.suppliers?.business_name}</div>
                    </div>
                    <div>
                      {order.order_items?.slice(0, 2).map(i => (
                        <div key={i.id} style={{ fontSize: 13 }}>{i.product_name} × {i.quantity}</div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--blue)' }}>₹{order.total_amount}</div>
                      <div style={{ fontSize: 12, color: 'var(--success)' }}>Revenue: ₹{order.admin_earning}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span className={`badge badge-${order.status === 'delivered' ? 'delivered' : order.status === 'cancelled' ? 'cancelled' : 'confirmed'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <select className="form-select" style={{ fontSize: 12, padding: '4px 8px' }}
                          value={order.status} onChange={e => updateStatus(order.id, e.target.value)}>
                          <option value="confirmed">Confirmed</option>
                          <option value="supplier_preparing">Preparing</option>
                          <option value="ready_for_pickup">Ready Pickup</option>
                          <option value="out_for_delivery">Out Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
    </AdminLayout>
  )
}

// ADMIN REPORTS
export function AdminReports() {
  const [data, setData] = useState({ totalRevenue: 0, totalOrders: 0, topProducts: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    const [{ data: orders }, { data: topItems }] = await Promise.all([
      supabase.from('orders').select('admin_earning, total_amount, created_at').eq('payment_status', 'paid'),
      supabase.from('order_items').select('product_name, quantity, total_price')
    ])
    const totalRevenue = orders?.reduce((s, o) => s + (o.admin_earning || 0), 0) || 0
    const totalOrders = orders?.length || 0
    const productMap = {}
    topItems?.forEach(i => {
      if (!productMap[i.product_name]) productMap[i.product_name] = { name: i.product_name, qty: 0, revenue: 0 }
      productMap[i.product_name].qty += i.quantity
      productMap[i.product_name].revenue += i.total_price
    })
    const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    setData({ totalRevenue, totalOrders, topProducts })
    setLoading(false)
  }

  if (loading) return <AdminLayout title="Reports"><div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div></AdminLayout>

  return (
    <AdminLayout title="Reports">
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card success"><div className="stat-num">₹{data.totalRevenue.toLocaleString()}</div><div className="stat-label">Total Revenue (Your margin)</div></div>
        <div className="stat-card accent"><div className="stat-num">{data.totalOrders}</div><div className="stat-label">Total Orders</div></div>
        <div className="stat-card"><div className="stat-num">₹{data.totalOrders > 0 ? Math.round(data.totalRevenue / data.totalOrders) : 0}</div><div className="stat-label">Avg Revenue/Order</div></div>
      </div>

      <div className="card">
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>🏆 Top Selling Products</h3>
        {data.topProducts.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No data yet</p>
        ) : data.topProducts.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--muted)', fontSize: 20 }}>#{i + 1}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: 'var(--blue)' }}>₹{p.revenue}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.qty} units sold</div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}