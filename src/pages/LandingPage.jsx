import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { lang, setLang, t } = useLang()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #0d2347 60%, #1a3a6b 100%)' }}>
      {/* NAV */}
      <nav className="navbar">
        <span className="navbar-logo">Frozen<span>Mart</span></span>
        <div className="navbar-right">
          <div className="lang-switcher">
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn ${lang === 'te' ? 'active' : ''}`} onClick={() => setLang('te')}>తె</button>
          </div>
          <button className="btn-nav-outline" onClick={() => navigate('/login')}>{t('login')}</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.3)', borderRadius: 50, padding: '6px 20px', marginBottom: 24 }}>
          <span style={{ color: '#00b4d8', fontSize: 13, fontWeight: 600 }}>🧊 Hyderabad's Frozen Food Platform</span>
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: -1, marginBottom: 20 }}>
          {t('heroTitle')}<br />
          <span style={{ color: '#00b4d8' }}>{t('heroSubtitle')}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 18, marginBottom: 40, lineHeight: 1.6 }}>
          {t('heroDesc')}
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <button className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }} onClick={() => navigate('/shop')}>
            {t('orderNow')} →
          </button>
          <button className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px' }} onClick={() => navigate('/login')}>
            {t('bulkQuote')}
          </button>
        </div>

        {/* STATS */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
          {[
            { num: '50+', label: lang === 'en' ? 'Frozen Products' : 'ఫ్రోజన్ ఉత్పత్తులు' },
            { num: '2hr', label: lang === 'en' ? 'Fast Delivery' : 'వేగవంతమైన డెలివరీ' },
            { num: '100%', label: lang === 'en' ? 'Fresh & Quality' : 'తాజా & నాణ్యత' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '20px 32px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#00b4d8' }}>{s.num}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ROLES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { icon: '🛒', title: lang === 'en' ? 'Customer' : 'కస్టమర్', desc: lang === 'en' ? 'Browse & order fresh frozen food' : 'తాజా ఫ్రోజన్ ఫుడ్ ఆర్డర్ చేయండి', action: () => navigate('/shop'), btn: lang === 'en' ? 'Shop Now' : 'షాప్ చేయి' },
            { icon: '🏭', title: lang === 'en' ? 'Supplier' : 'సప్లయర్', desc: lang === 'en' ? 'Manage orders & stock' : 'ఆర్డర్లు & స్టాక్ మేనేజ్ చేయి', action: () => navigate('/login'), btn: lang === 'en' ? 'Supplier Login' : 'సప్లయర్ లాగిన్' },
            { icon: '⚙️', title: lang === 'en' ? 'Admin' : 'అడ్మిన్', desc: lang === 'en' ? 'Full platform control' : 'పూర్తి platform కంట్రోల్', action: () => navigate('/login'), btn: lang === 'en' ? 'Admin Login' : 'అడ్మిన్ లాగిన్' },
          ].map((r, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{r.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16, lineHeight: 1.5 }}>{r.desc}</div>
              <button onClick={r.action} style={{ background: '#00b4d8', color: '#0a1628', border: 'none', padding: '10px 20px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{r.btn}</button>
            </div>
          ))}
        </div>

        {/* SUPPLIER REGISTER */}
        <div style={{ marginTop: 40, padding: '20px 24px', background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.3)', borderRadius: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {lang === 'en' ? 'Want to supply frozen food?' : 'ఫ్రోజన్ ఫుడ్ సప్లై చేయాలా?'}
          </span>
          {' '}
          <button onClick={() => navigate('/supplier-register')} style={{ background: 'none', border: 'none', color: '#ff6b2b', fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}>
            {lang === 'en' ? 'Register as Supplier →' : 'సప్లయర్‌గా రిజిస్టర్ చేయండి →'}
          </button>
        </div>
      </div>
    </div>
  )
}
