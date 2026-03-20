import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../context/LangContext'

export default function ProductDetail() {
  const { id } = useParams()
  const { lang } = useLang()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)

  useEffect(() => { fetchProduct() }, [id])

  async function fetchProduct() {
    const { data } = await supabase.from('products').select('*, categories(name_en, name_te)').eq('id', id).single()
    setProduct(data)
  }

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('fm_cart') || '[]')
    const existing = cart.find(i => i.id === product.id)
    const newCart = existing
      ? cart.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      : [...cart, { ...product, qty }]
    localStorage.setItem('fm_cart', JSON.stringify(newCart))
    navigate('/cart')
  }

  if (!product) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <div>
      <nav className="navbar">
        <span className="navbar-logo" onClick={() => navigate('/shop')} style={{ cursor: 'pointer' }}>Frozen<span>Mart</span></span>
        <div className="navbar-right">
          <button className="cart-icon-btn" onClick={() => navigate('/cart')}>🛒 Cart</button>
        </div>
      </nav>
      <div className="page-container" style={{ maxWidth: 800 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
          ← {lang === 'en' ? 'Back' : 'వెనక్కి'}
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div style={{ background: '#e3f2fd', borderRadius: 20, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100 }}>
            {product.categories?.name_en === 'Chicken' ? '🐔' : product.categories?.name_en === 'Fish' ? '🐟' : product.categories?.name_en === 'Mutton' ? '🐑' : '🍤'}
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, marginBottom: 8 }}>
              {lang === 'en' ? product.name_en : product.name_te}
            </h1>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: 'var(--blue)', marginBottom: 16 }}>
              ₹{product.customer_price} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>/ {product.unit}</span>
            </div>
            <div className="qty-control" style={{ marginBottom: 20 }}>
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="qty-num" style={{ fontSize: 18 }}>{qty} {product.unit}</span>
              <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="btn-primary" style={{ width: '100%', fontSize: 16 }} onClick={addToCart}>
              {lang === 'en' ? 'Add to Cart' : 'కార్ట్‌కి add చేయి'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}