import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = { 'Chicken': '🐔', 'Fish': '🐟', 'Mutton': '🐑', 'Prawns': '🍤', 'Vegetables': '🥦', 'Combo Packs': '📦' }
const IMG_CLASS = { 'Chicken': 'chicken', 'Fish': 'fish', 'Mutton': 'mutton', 'Prawns': 'prawns', 'Vegetables': 'vegetables', 'Combo Packs': 'combo' }

export default function CustomerHome() {
  const { lang, setLang, t } = useLang()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('fm_cart') || '[]'))
  const [selectedCat, setSelectedCat] = useState('all')
  const [orderType, setOrderType] = useState('all')
  const [priceMax, setPriceMax] = useState(2000)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, categories(name_en, name_te)').eq('is_active', true),
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
    ])
    setProducts(prods || [])
    setCategories(cats || [])
    setLoading(false)
  }

  function addToCart(product) {
    const existing = cart.find(i => i.id === product.id)
    let newCart
    if (existing) {
      newCart = cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
    } else {
      newCart = [...cart, { ...product, qty: 1 }]
    }
    setCart(newCart)
    localStorage.setItem('fm_cart', JSON.stringify(newCart))
    toast.success(lang === 'en' ? 'Added to cart!' : 'కార్ట్‌కి add అయింది!')
  }

  const filtered = products.filter(p => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat) return false
    if (orderType === 'normal' && !p.is_normal_available) return false
    if (orderType === 'bulk' && !p.is_bulk_available) return false
    if (p.customer_price > priceMax) return false
    if (search && !p.name_en.toLowerCase().includes(search.toLowerCase()) && !p.name_te.includes(search)) return false
    return true
  })

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <span className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Frozen<span>Mart</span></span>
        <div className="navbar-links">
          <a onClick={() => navigate('/shop')}>🏠 {t('home')}</a>
          <a onClick={() => navigate('/products')}>{t('products')}</a>
          <a onClick={() => navigate('/my-orders')}>{t('myOrders')}</a>
        </div>
        <div className="navbar-right">
          <div className="lang-switcher">
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn ${lang === 'te' ? 'active' : ''}`} onClick={() => setLang('te')}>తె</button>
          </div>
          {user ? (
            <button className="btn-nav-outline" onClick={logout}>{t('logout')}</button>
          ) : (
            <button className="btn-nav-outline" onClick={() => navigate('/login')}>{t('login')}</button>
          )}
          <button className="cart-icon-btn" onClick={() => navigate('/cart')}>
            🛒 {t('cart')} {cartCount > 0 && <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 10, padding: '1px 6px', fontSize: 12 }}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <h1 className="hero-title">{t('heroTitle')}<br /><span>{t('heroSubtitle')}</span></h1>
            <p className="hero-desc">{t('heroDesc')}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-primary">{t('orderNow')} →</button>
              <button className="btn-secondary">{t('bulkQuote')}</button>
            </div>
          </div>
          <div className="hero-stats">
            {[{ num: '50+', label: lang === 'en' ? 'Products' : 'ఉత్పత్తులు' },
              { num: '2hr', label: lang === 'en' ? 'Delivery' : 'డెలివరీ' },
              { num: '100%', label: lang === 'en' ? 'Fresh' : 'తాజా' }
            ].map((s, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-num">{s.num}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ background: 'var(--white)', padding: '16px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 12 }}>
          <input className="form-input" style={{ flex: 1 }} placeholder={lang === 'en' ? 'Search chicken, fish, mutton...' : 'చికెన్, చేప, మటన్ వెతకండి...'} value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-primary" style={{ padding: '12px 24px' }}>{lang === 'en' ? 'Search' : 'వెతకు'}</button>
        </div>
      </div>

      {/* SHOP LAYOUT */}
      <div className="shop-layout">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">{t('categories')}</div>
            <div className={`sidebar-option ${selectedCat === 'all' ? 'active' : ''}`} onClick={() => setSelectedCat('all')}>
              🍽️ {t('all')}
            </div>
            {categories.map(cat => (
              <div key={cat.id} className={`sidebar-option ${selectedCat === cat.id ? 'active' : ''}`} onClick={() => setSelectedCat(cat.id)}>
                {CATEGORY_ICONS[cat.name_en] || '📦'} {lang === 'en' ? cat.name_en : cat.name_te}
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">{lang === 'en' ? 'Order Type' : 'ఆర్డర్ రకం'}</div>
            {['all', 'normal', 'bulk'].map(type => (
              <div key={type} className={`sidebar-option ${orderType === type ? 'active' : ''}`} onClick={() => setOrderType(type)}>
                {type === 'all' ? `🛒 ${t('all')}` : type === 'normal' ? `📦 ${t('normal')}` : `🏭 ${t('bulk')}`}
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">{lang === 'en' ? `Price: up to ₹${priceMax}` : `ధర: ₹${priceMax} వరకు`}</div>
            <input type="range" className="price-range" min={100} max={2000} step={50} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} style={{ width: '100%', marginTop: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              <span>₹100</span><span>₹2000</span>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="shop-content">
          <div className="filter-bar">
            {['all', 'normal', 'bulk'].map(type => (
              <div key={type} className={`filter-tab ${orderType === type ? 'active' : ''}`} onClick={() => setOrderType(type)}>
                {type === 'all' ? t('all') : type === 'normal' ? t('normal') : t('bulk')}
              </div>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted)' }}>
              {filtered.length} {lang === 'en' ? 'products' : 'ఉత్పత్తులు'}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ color: 'var(--muted)' }}>{lang === 'en' ? 'No products found' : 'ఉత్పత్తులు కనిపించలేదు'}</p>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map(product => (
                <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
                  <div className={`product-img ${IMG_CLASS[product.categories?.name_en] || 'combo'}`}>
                    <span>{CATEGORY_ICONS[product.categories?.name_en] || '📦'}</span>
                    <div className="product-img-badge">
                      <span className={`badge ${product.is_bulk_available ? 'badge-bulk' : 'badge-normal'}`}>
                        {product.is_bulk_available ? t('bulk') : t('normal')}
                      </span>
                    </div>
                  </div>
                  <div className="product-info">
                    <div className="product-name">{lang === 'en' ? product.name_en : product.name_te}</div>
                    <div className="product-name-sub">{product.stock_qty > 0 ? `✅ ${t('inStock')} · ${product.stock_qty}${product.unit}` : `❌ ${t('outOfStock')}`}</div>
                    <div className="product-bottom">
                      <div className="product-price">₹{product.customer_price} <span>{t('perKg')}</span></div>
                      <button className="add-btn" onClick={e => { e.stopPropagation(); product.stock_qty > 0 ? addToCart(product) : toast.error('Out of stock') }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BULK BANNER */}
          <div className="bulk-banner" style={{ marginTop: 32 }}>
            <div>
              <div className="bulk-banner-title">{t('bulkBannerTitle').split('Special')[0]}<span>Special {lang === 'en' ? 'Price!' : 'ధర!'}</span></div>
              <p className="bulk-banner-desc">{t('bulkBannerDesc')}</p>
            </div>
            <button className="btn-primary" onClick={() => setOrderType('bulk')}>{t('getBulkQuote')}</button>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="bottom-nav">
        <div className="bnav-item active" onClick={() => navigate('/shop')}><span className="bnav-icon">🏠</span>{t('home')}</div>
        <div className="bnav-item" onClick={() => navigate('/products')}><span className="bnav-icon">🛍️</span>{t('products')}</div>
        <div className="bnav-item" onClick={() => navigate('/cart')}><span className="bnav-icon">🛒</span>{t('cart')} {cartCount > 0 && <span className="notif-dot"/>}</div>
        <div className="bnav-item" onClick={() => navigate('/my-orders')}><span className="bnav-icon">📦</span>{t('myOrders')}</div>
        <div className="bnav-item" onClick={() => navigate('/login')}><span className="bnav-icon">👤</span>{t('profile')}</div>
      </div>
    </div>
  )
}
