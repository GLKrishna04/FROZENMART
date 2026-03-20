import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import toast from 'react-hot-toast'

function AdminLayout({ children, title }) {
  const { logout } = useAuth()
  const { lang, setLang, t } = useLang()
  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">Frozen<span>Mart</span></div>
        <NavLink to="/admin" end className={({isActive}) => `dashboard-nav-item ${isActive?'active':''}`}>📊 {t('adminDashboard')}</NavLink>
        <NavLink to="/admin/orders" className={({isActive}) => `dashboard-nav-item ${isActive?'active':''}`}>📦 {t('ordersManager')}</NavLink>
        <NavLink to="/admin/stock" className={({isActive}) => `dashboard-nav-item ${isActive?'active':''}`}>🗃️ {t('stockManager')}</NavLink>
        <NavLink to="/admin/suppliers" className={({isActive}) => `dashboard-nav-item ${isActive?'active':''}`}>🏭 {t('suppliersManager')}</NavLink>
        <NavLink to="/admin/reports" className={({isActive}) => `dashboard-nav-item ${isActive?'active':''}`}>📈 {t('reports')}</NavLink>
        <div style={{marginTop:'auto',padding:'24px 0 0'}}>
          <div className="dashboard-nav-item" onClick={logout}>🚪 {t('logout')}</div>
        </div>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:18}}>{title}</h2>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="lang-switcher">
              <button className={`lang-btn ${lang==='en'?'active':''}`} onClick={()=>setLang('en')}>EN</button>
              <button className={`lang-btn ${lang==='te'?'active':''}`} onClick={()=>setLang('te')}>తె</button>
            </div>
            <span style={{fontSize:14,color:'var(--muted)'}}>👑 Admin</span>
          </div>
        </div>
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { t, lang } = useLang()
  const [stats, setStats] = useState({ todayOrders:0, todayRevenue:0, totalSuppliers:0, pendingApprovals:0, pendingOrders:0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const today = new Date().toISOString().split('T')[0]
    const [
      { count: todayCount },
      { data: todayRev },
      { count: supplierCount },
      { count: pendingApproval },
      { count: pendingOrd },
      { data: orders },
      { data: low },
      { data: notifs }
    ] = await Promise.all([
      supabase.from('orders').select('*',{count:'exact',head:true}).gte('created_at',today),
      supabase.from('orders').select('admin_margin').gte('created_at',today).eq('payment_status','paid'),
      supabase.from('suppliers').select('*',{count:'exact',head:true}).eq('status','approved'),
      supabase.from('supplier_requests').select('*',{count:'exact',head:true}).eq('status','pending'),
      supabase.from('orders').select('*',{count:'exact',head:true}).in('status',['confirmed','supplier_preparing']),
      supabase.from('orders').select('*, suppliers(business_name)').order('created_at',{ascending:false}).limit(8),
      supabase.from('products').select('*, suppliers(business_name)').lt('stock_qty',10).eq('is_active',true),
      supabase.from('notifications').select('*').eq('user_type','admin').eq('is_read',false).order('created_at',{ascending:false}).limit(5)
    ])
    const revenue = todayRev?.reduce((s,o)=>s+(o.admin_margin||0),0) || 0
    setStats({ todayOrders:todayCount||0, todayRevenue:revenue, totalSuppliers:supplierCount||0, pendingApprovals:pendingApproval||0, pendingOrders:pendingOrd||0 })
    setRecentOrders(orders||[])
    setLowStock(low||[])
    setNotifications(notifs||[])
  }

  const statusColor = { pending:'badge-pending', confirmed:'badge-confirmed', supplier_preparing:'badge-confirmed', delivered:'badge-delivered', cancelled:'badge-cancelled' }

  return (
    <AdminLayout title={t('adminDashboard')}>
      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card accent"><div className="stat-num">{stats.todayOrders}</div><div className="stat-label">{t('todayOrders')}</div></div>
        <div className="stat-card success"><div className="stat-num">₹{stats.todayRevenue}</div><div className="stat-label">{t('todayRevenue')}</div></div>
        <div className="stat-card"><div className="stat-num">{stats.totalSuppliers}</div><div className="stat-label">{t('totalSuppliers')}</div></div>
        <div className="stat-card warning"><div className="stat-num">{stats.pendingApprovals}</div><div className="stat-label">{t('pendingApprovals')}</div></div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:24,alignItems:'start'}}>
        {/* RECENT ORDERS */}
        <div>
          <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,marginBottom:16}}>{lang==='en'?'Recent Orders':'ఇటీవలి ఆర్డర్లు'}</h3>
          <table className="data-table">
            <thead><tr><th>Order #</th><th>Supplier</th><th>Total</th><th>{lang==='en'?'My Revenue':'నా Revenue'}</th><th>Status</th></tr></thead>
            <tbody>
              {recentOrders.map(o=>(
                <tr key={o.id}>
                  <td style={{fontWeight:700}}>#{o.order_number}</td>
                  <td style={{fontSize:13,color:'var(--muted)'}}>{o.suppliers?.business_name||'—'}</td>
                  <td style={{fontWeight:700}}>₹{o.total_amount}</td>
                  <td style={{fontWeight:700,color:'var(--success)'}}>₹{o.admin_margin}</td>
                  <td><span className={`badge ${statusColor[o.status]||'badge-pending'}`}>{o.status.replace(/_/g,' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SIDEBAR ALERTS */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* LOW STOCK */}
          {lowStock.length > 0 && (
            <div className="card" style={{border:'2px solid var(--warning)'}}>
              <h4 style={{fontFamily:'Syne,sans-serif',fontWeight:700,marginBottom:12,color:'var(--warning)'}}>⚠️ {lang==='en'?'Low Stock Alert':'తక్కువ స్టాక్ అలర్ట్'}</h4>
              {lowStock.map(p=>(
                <div key={p.id} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8,padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                  <span>{p.name_en}</span>
                  <span style={{fontWeight:700,color:'var(--danger)'}}>{p.stock_qty} {p.unit}</span>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {notifications.length > 0 && (
            <div className="card" style={{border:'2px solid var(--cyan)'}}>
              <h4 style={{fontFamily:'Syne,sans-serif',fontWeight:700,marginBottom:12,color:'var(--blue)'}}>🔔 {lang==='en'?'New Notifications':'కొత్త నోటిఫికేషన్లు'}</h4>
              {notifications.map(n=>(
                <div key={n.id} style={{fontSize:13,marginBottom:10,padding:'8px',background:'var(--gray)',borderRadius:8}}>
                  <div style={{fontWeight:600}}>{n.title}</div>
                  <div style={{color:'var(--muted)',marginTop:2}}>{n.message}</div>
                </div>
              ))}
            </div>
          )}

          {/* PENDING */}
          <div className="card" style={{background:'var(--deep)',border:'none'}}>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:13,marginBottom:8}}>{lang==='en'?'Pending orders in progress':'Process లో ఉన్న orders'}</div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:32,color:'var(--cyan)'}}>{stats.pendingOrders}</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export function AdminOrders() {
  const { t, lang } = useLang()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [filter])

  async function fetchOrders() {
    setLoading(true)
    let query = supabase.from('orders').select('*, suppliers(business_name), order_items(*)').order('created_at',{ascending:false})
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query.limit(50)
    setOrders(data||[])
    setLoading(false)
  }

  async function updateOrderStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    toast.success('Status updated!')
    fetchOrders()
  }

  const filters = [
    {key:'all',label:lang==='en'?'All':'అన్నీ'},
    {key:'confirmed',label:lang==='en'?'New':'కొత్తవి'},
    {key:'supplier_preparing',label:lang==='en'?'Preparing':'తయారవుతున్నవి'},
    {key:'out_for_delivery',label:lang==='en'?'Delivery':'డెలివరీలో'},
    {key:'delivered',label:lang==='en'?'Delivered':'డెలివర్ అయినవి'},
    {key:'cancelled',label:lang==='en'?'Cancelled':'రద్దయినవి'},
  ]

  return (
    <AdminLayout title={t('ordersManager')}>
      <div className="filter-bar" style={{marginBottom:24}}>
        {filters.map(f=>(
          <div key={f.key} className={`filter-tab ${filter===f.key?'active':''}`} onClick={()=>setFilter(f.key)}>{f.label}</div>
        ))}
      </div>

      {loading ? <div style={{textAlign:'center',padding:60}}><div className="spinner" style={{margin:'0 auto'}}/></div>
        : orders.length === 0 ? <div style={{textAlign:'center',padding:60,color:'var(--muted)'}}>No orders found</div>
        : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {orders.map(order=>(
              <div key={order.id} className="card">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:16,alignItems:'center'}}>
                  <div>
                    <div style={{fontFamily:'Syne,sans-serif',fontWeight:700}}>#{order.order_number}</div>
                    <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>📍 {order.delivery_area} · {order.delivery_slot}</div>
                    <div style={{fontSize:12,color:'var(--muted)'}}>🏭 {order.suppliers?.business_name||'—'}</div>
                  </div>
                  <div>
                    <div style={{fontSize:13,color:'var(--muted)',marginBottom:4}}>{lang==='en'?'Items:':'Items:'}</div>
                    {order.order_items?.slice(0,2).map(i=>(
                      <div key={i.id} style={{fontSize:13}}>{lang==='en'?i.product_name_en:i.product_name_te} × {i.quantity}{i.unit}</div>
                    ))}
                    {order.order_items?.length > 2 && <div style={{fontSize:12,color:'var(--muted)'}}>+{order.order_items.length-2} more</div>}
                  </div>
                  <div>
                    <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,color:'var(--blue)'}}>₹{order.total_amount}</div>
                    <div style={{fontSize:12,color:'var(--success)'}}>Revenue: ₹{order.admin_margin}</div>
                    <div style={{fontSize:12,color:'var(--muted)'}}>Supplier: ₹{order.supplier_amount}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
                    <span className={`badge badge-${order.status==='delivered'?'delivered':order.status==='cancelled'?'cancelled':'confirmed'}`}>{order.status.replace(/_/g,' ')}</span>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <select className="form-select" style={{fontSize:12,padding:'4px 8px'}} value={order.status} onChange={e=>updateOrderStatus(order.id,e.target.value)}>
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

export function AdminStock() {
  const { t, lang } = useLang()
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [editMargin, setEditMargin] = useState(null)
  const [form, setForm] = useState({ name_en:'', name_te:'', supplier_id:'', category_id:'', supplier_price:'', margin_percent:20, unit:'kg', min_order_normal:0.5, min_order_bulk:5, stock_qty:0 })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: prods }, { data: sups }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, suppliers(business_name), categories(name_en)').order('created_at',{ascending:false}),
      supabase.from('suppliers').select('id,business_name').eq('status','approved'),
      supabase.from('categories').select('*')
    ])
    setProducts(prods||[])
    setSuppliers(sups||[])
    setCategories(cats||[])
  }

  async function addProduct() {
    if (!form.name_en || !form.supplier_id || !form.supplier_price) return toast.error('Required fields fill చేయండి')
    const { error } = await supabase.from('products').insert(form)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success(lang==='en'?'Product added!':'ఉత్పత్తి add అయింది!')
    setShowAdd(false)
    setForm({ name_en:'', name_te:'', supplier_id:'', category_id:'', supplier_price:'', margin_percent:20, unit:'kg', min_order_normal:0.5, min_order_bulk:5, stock_qty:0 })
    fetchAll()
  }

  async function updateMargin(productId, margin) {
    await supabase.from('products').update({ margin_percent: margin }).eq('id', productId)
    toast.success('Margin updated!')
    setEditMargin(null)
    fetchAll()
  }

  async function toggleProduct(productId, isActive) {
    await supabase.from('products').update({ is_active: !isActive }).eq('id', productId)
    fetchAll()
  }

  return (
    <AdminLayout title={t('stockManager')}>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:24}}>
        <button className="btn-primary" onClick={()=>setShowAdd(true)}>+ {t('addProduct')}</button>
      </div>

      {showAdd && (
        <div className="card" style={{marginBottom:24,border:'2px solid var(--cyan)'}}>
          <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,marginBottom:20}}>{lang==='en'?'Add New Product':'కొత్త ఉత్పత్తి Add చేయి'}</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div className="form-group">
              <label className="form-label">Name (English) *</label>
              <input className="form-input" value={form.name_en} onChange={e=>setForm(p=>({...p,name_en:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">పేరు (Telugu)</label>
              <input className="form-input" value={form.name_te} onChange={e=>setForm(p=>({...p,name_te:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier *</label>
              <select className="form-select" value={form.supplier_id} onChange={e=>setForm(p=>({...p,supplier_id:e.target.value}))}>
                <option value="">Select supplier</option>
                {suppliers.map(s=><option key={s.id} value={s.id}>{s.business_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category_id} onChange={e=>setForm(p=>({...p,category_id:e.target.value}))}>
                <option value="">Select category</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Supplier Price (₹) *</label>
              <input className="form-input" type="number" value={form.supplier_price} onChange={e=>setForm(p=>({...p,supplier_price:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Margin % (Customer price = supplier + margin)</label>
              <input className="form-input" type="number" value={form.margin_percent} onChange={e=>setForm(p=>({...p,margin_percent:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))}>
                <option value="kg">kg</option><option value="piece">piece</option><option value="pack">pack</option><option value="g">grams</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Stock</label>
              <input className="form-input" type="number" value={form.stock_qty} onChange={e=>setForm(p=>({...p,stock_qty:e.target.value}))} />
            </div>
          </div>
          {form.supplier_price && (
            <div style={{background:'#e8f5e9',border:'1px solid #a5d6a7',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:13}}>
              💰 Supplier price: <b>₹{form.supplier_price}</b> → Customer sees: <b>₹{Math.round(form.supplier_price * (1 + form.margin_percent/100))}</b> → Your margin: <b style={{color:'var(--success)'}}>₹{Math.round(form.supplier_price * form.margin_percent/100)}</b>
            </div>
          )}
          <div style={{display:'flex',gap:12}}>
            <button className="btn-primary" onClick={addProduct}>{lang==='en'?'Add Product':'Add చేయి'}</button>
            <button className="btn-outline" onClick={()=>setShowAdd(false)}>{lang==='en'?'Cancel':'రద్దు'}</button>
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>{lang==='en'?'Product':'ఉత్పత్తి'}</th>
            <th>Supplier</th>
            <th>{lang==='en'?'Supplier Price':'సప్లయర్ ధర'}</th>
            <th>Margin %</th>
            <th>{lang==='en'?'Customer Price':'Customer ధర'}</th>
            <th>{lang==='en'?'Stock':'స్టాక్'}</th>
            <th>{lang==='en'?'Actions':'చర్యలు'}</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p=>(
            <tr key={p.id}>
              <td>
                <div style={{fontWeight:700}}>{p.name_en}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>{p.categories?.name_en}</div>
              </td>
              <td style={{fontSize:13,color:'var(--muted)'}}>{p.suppliers?.business_name}</td>
              <td>₹{p.supplier_price}</td>
              <td>
                {editMargin === p.id ? (
                  <div style={{display:'flex',gap:6}}>
                    <input type="number" style={{width:60,padding:'4px 8px',border:'1.5px solid var(--border)',borderRadius:6,fontSize:13}} defaultValue={p.margin_percent}
                      onBlur={e=>updateMargin(p.id,e.target.value)} autoFocus />
                  </div>
                ) : (
                  <span style={{cursor:'pointer',fontWeight:700,color:'var(--blue)'}} onClick={()=>setEditMargin(p.id)}>{p.margin_percent}% ✏️</span>
                )}
              </td>
              <td style={{fontWeight:700,color:'var(--blue)'}}>₹{p.customer_price}</td>
              <td>
                <span style={{color:p.stock_qty<10?'var(--danger)':'var(--success)',fontWeight:700}}>
                  {p.stock_qty<10?'⚠️ ':''}{p.stock_qty} {p.unit}
                </span>
              </td>
              <td>
                <button onClick={()=>toggleProduct(p.id,p.is_active)} className={p.is_active?'btn-danger':'btn-success'} style={{padding:'5px 12px',fontSize:12}}>
                  {p.is_active?(lang==='en'?'Hide':'దాచు'):(lang==='en'?'Show':'చూపించు')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  )
}

export function AdminSuppliers() {
  const { t, lang } = useLang()
  const [requests, setRequests] = useState([])
  const [approved, setApproved] = useState([])
  const [tab, setTab] = useState('pending')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: reqs }, { data: sups }] = await Promise.all([
      supabase.from('supplier_requests').select('*').eq('status','pending').order('created_at',{ascending:false}),
      supabase.from('suppliers').select('*').order('created_at',{ascending:false})
    ])
    setRequests(reqs||[])
    setApproved(sups||[])
  }

  async function approveSupplier(request) {
    const { data: supplier } = await supabase.from('suppliers').insert({
      name: request.name, phone: request.phone, business_name: request.business_name,
      address: request.address, area: request.area, status: 'approved', approved_at: new Date().toISOString()
    }).select().single()
    await supabase.from('supplier_requests').update({ status:'approved' }).eq('id', request.id)
    await supabase.from('notifications').insert({
      user_type: 'supplier', title: 'Application Approved!',
      message: `Congratulations ${request.name}! Your supplier application has been approved. You can now login with your phone number.`,
      type: 'supplier_approved'
    })
    toast.success(lang==='en'?'Supplier approved!':'Supplier approved అయింది!')
    fetchAll()
  }

  async function rejectRequest(requestId) {
    await supabase.from('supplier_requests').update({ status:'rejected' }).eq('id', requestId)
    toast.success('Request rejected')
    fetchAll()
  }

  return (
    <AdminLayout title={t('suppliersManager')}>
      <div className="filter-bar" style={{marginBottom:24}}>
        <div className={`filter-tab ${tab==='pending'?'active':''}`} onClick={()=>setTab('pending')}>
          {lang==='en'?'Pending Requests':'పెండింగ్ Requests'} {requests.length>0&&<span style={{background:'var(--accent)',color:'#fff',borderRadius:10,padding:'1px 6px',fontSize:11,marginLeft:4}}>{requests.length}</span>}
        </div>
        <div className={`filter-tab ${tab==='approved'?'active':''}`} onClick={()=>setTab('approved')}>
          {lang==='en'?'Approved Suppliers':'Approved Suppliers'} ({approved.length})
        </div>
      </div>

      {tab === 'pending' && (
        requests.length === 0 ? (
          <div style={{textAlign:'center',padding:60,color:'var(--muted)'}}>
            <div style={{fontSize:48,marginBottom:12}}>✅</div>
            {lang==='en'?'No pending requests':'పెండింగ్ requests లేవు'}
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {requests.map(req=>(
              <div key={req.id} className="card">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                  <div>
                    <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:16,marginBottom:4}}>{req.business_name}</div>
                    <div style={{fontSize:14,marginBottom:2}}>👤 {req.name}</div>
                    <div style={{fontSize:14,marginBottom:2}}>📞 {req.phone}</div>
                    <div style={{fontSize:13,color:'var(--muted)'}}>📍 {req.address}</div>
                  </div>
                  <div>
                    <div style={{fontSize:13,marginBottom:4}}><b>{lang==='en'?'Products:':'ఉత్పత్తులు:'}</b> {req.product_types}</div>
                    <div style={{fontSize:13,marginBottom:4}}><b>{lang==='en'?'Experience:':'అనుభవం:'}</b> {req.experience}</div>
                    {req.message && <div style={{fontSize:13,color:'var(--muted)',fontStyle:'italic'}}>"{req.message}"</div>}
                    <div style={{fontSize:12,color:'var(--muted)',marginTop:8}}>{new Date(req.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:12}}>
                  <button className="btn-success" onClick={()=>approveSupplier(req)}>✅ {t('approve')}</button>
                  <button className="btn-danger" onClick={()=>rejectRequest(req.id)}>❌ {t('reject')}</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'approved' && (
        <table className="data-table">
          <thead><tr><th>{lang==='en'?'Business':'వ్యాపారం'}</th><th>{lang==='en'?'Contact':'కాంటాక్ట్'}</th><th>Area</th><th>{lang==='en'?'Joined':'చేరిన తేదీ'}</th><th>Status</th></tr></thead>
          <tbody>
            {approved.map(s=>(
              <tr key={s.id}>
                <td><div style={{fontWeight:700}}>{s.business_name}</div><div style={{fontSize:12,color:'var(--muted)'}}>{s.name}</div></td>
                <td style={{fontSize:13}}>{s.phone}</td>
                <td style={{fontSize:13,color:'var(--muted)'}}>{s.area}</td>
                <td style={{fontSize:13,color:'var(--muted)'}}>{new Date(s.created_at).toLocaleDateString()}</td>
                <td><span className="badge badge-delivered">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  )
}

export function AdminReports() {
  const { t, lang } = useLang()
  const [data, setData] = useState({ totalRevenue:0, totalOrders:0, avgOrder:0, topProducts:[], monthlyRevenue:[] })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    const [{ data: orders }, { data: topItems }] = await Promise.all([
      supabase.from('orders').select('admin_margin, total_amount, created_at').eq('payment_status','paid'),
      supabase.from('order_items').select('product_name_en, quantity, total_price')
    ])

    const totalRevenue = orders?.reduce((s,o)=>s+(o.admin_margin||0),0) || 0
    const totalOrders = orders?.length || 0
    const avgOrder = totalOrders > 0 ? Math.round(totalRevenue/totalOrders) : 0

    // Top products
    const productMap = {}
    topItems?.forEach(i => {
      if (!productMap[i.product_name_en]) productMap[i.product_name_en] = { name:i.product_name_en, qty:0, revenue:0 }
      productMap[i.product_name_en].qty += i.quantity
      productMap[i.product_name_en].revenue += i.total_price
    })
    const topProducts = Object.values(productMap).sort((a,b)=>b.revenue-a.revenue).slice(0,5)

    // Monthly revenue (last 6 months)
    const monthlyMap = {}
    orders?.forEach(o => {
      const month = new Date(o.created_at).toLocaleString('default',{month:'short',year:'2-digit'})
      monthlyMap[month] = (monthlyMap[month]||0) + (o.admin_margin||0)
    })
    const monthlyRevenue = Object.entries(monthlyMap).slice(-6).map(([month,rev])=>({month,rev}))

    setData({ totalRevenue, totalOrders, avgOrder, topProducts, monthlyRevenue })
    setLoading(false)
  }

  if (loading) return <AdminLayout title={t('reports')}><div style={{textAlign:'center',padding:60}}><div className="spinner" style={{margin:'0 auto'}}/></div></AdminLayout>

  return (
    <AdminLayout title={t('reports')}>
      <div className="stats-grid" style={{marginBottom:32}}>
        <div className="stat-card success"><div className="stat-num">₹{data.totalRevenue.toLocaleString()}</div><div className="stat-label">{lang==='en'?'Total Revenue (Your margin)':'మొత్తం Revenue (మీ margin)'}</div></div>
        <div className="stat-card accent"><div className="stat-num">{data.totalOrders}</div><div className="stat-label">{lang==='en'?'Total Orders':'మొత్తం ఆర్డర్లు'}</div></div>
        <div className="stat-card"><div className="stat-num">₹{data.avgOrder}</div><div className="stat-label">{lang==='en'?'Avg Revenue/Order':'సగటు Revenue/ఆర్డర్'}</div></div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        {/* TOP PRODUCTS */}
        <div className="card">
          <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,marginBottom:16}}>🏆 {lang==='en'?'Top Selling Products':'ఎక్కువగా అమ్ముడైన ఉత్పత్తులు'}</h3>
          {data.topProducts.length === 0 ? <p style={{color:'var(--muted)',fontSize:14}}>{lang==='en'?'No data yet':'ఇంకా data లేదు'}</p>
            : data.topProducts.map((p,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontFamily:'Syne,sans-serif',fontWeight:800,color:'var(--muted)',fontSize:20,minWidth:28}}>#{i+1}</span>
                  <span style={{fontWeight:600,fontSize:14}}>{p.name}</span>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:700,color:'var(--blue)'}}>₹{p.revenue}</div>
                  <div style={{fontSize:12,color:'var(--muted)'}}>{p.qty} kg sold</div>
                </div>
              </div>
            ))}
        </div>

        {/* MONTHLY REVENUE */}
        <div className="card">
          <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,marginBottom:16}}>📅 {lang==='en'?'Monthly Revenue':'నెలవారీ Revenue'}</h3>
          {data.monthlyRevenue.length === 0 ? <p style={{color:'var(--muted)',fontSize:14}}>{lang==='en'?'No data yet':'ఇంకా data లేదు'}</p>
            : data.monthlyRevenue.map((m,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:13}}>
                  <span style={{fontWeight:600}}>{m.month}</span>
                  <span style={{fontWeight:700,color:'var(--success)'}}>₹{m.rev}</span>
                </div>
                <div style={{height:8,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{height:'100%',background:'var(--success)',borderRadius:4,width:`${Math.min(100,(m.rev/Math.max(...data.monthlyRevenue.map(x=>x.rev)))*100)}%`,transition:'width 0.5s'}}/>
                </div>
              </div>
            ))}
        </div>
      </div>
    </AdminLayout>
  )
}
