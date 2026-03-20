import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../context/LangContext'
import toast from 'react-hot-toast'

export default function SupplierRegisterPage() {
  const { lang, t } = useLang()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', business_name: '', address: '',
    area: '', product_types: '', experience: '', message: ''
  })

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.phone || !form.business_name) {
      return toast.error(lang === 'en' ? 'Please fill required fields' : 'అవసరమైన fields fill చేయండి')
    }
    setLoading(true)
    const { error } = await supabase.from('supplier_requests').insert(form)
    setLoading(false)
    if (error) { toast.error('Something went wrong'); return }
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="login-page">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, marginBottom: 12 }}>
          {lang === 'en' ? 'Request Submitted!' : 'రిక్వెస్ట్ submit అయింది!'}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
          {lang === 'en'
            ? 'Our team will review your application and respond within 24 hours.'
            : 'మా team మీ application review చేసి 24 గంటల్లో respond చేస్తుంది.'}
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          {lang === 'en' ? 'Back to Home' : 'హోమ్‌కి వెళ్ళు'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="login-page" style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <div className="login-card" style={{ maxWidth: 520 }}>
        <div className="login-logo" style={{ marginBottom: 4 }}>Frozen<span>Mart</span></div>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          {t('supplierRegister')}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">{lang === 'en' ? 'Full Name *' : 'పూర్తి పేరు *'}</label>
            <input className="form-input" placeholder={lang === 'en' ? 'Your name' : 'మీ పేరు'} value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{lang === 'en' ? 'Phone *' : 'ఫోన్ *'}</label>
            <input className="form-input" type="tel" placeholder="9876543210" maxLength={10} value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, ''))} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Business Name *' : 'వ్యాపార పేరు *'}</label>
          <input className="form-input" placeholder={lang === 'en' ? 'Your business name' : 'మీ వ్యాపార పేరు'} value={form.business_name} onChange={e => update('business_name', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Address' : 'అడ్రస్'}</label>
          <textarea className="form-input" rows={2} placeholder={lang === 'en' ? 'Your address in Hyderabad' : 'హైదరాబాద్‌లో మీ అడ్రస్'} value={form.address} onChange={e => update('address', e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Products you supply' : 'మీరు సప్లై చేసే ఉత్పత్తులు'}</label>
          <input className="form-input" placeholder={lang === 'en' ? 'e.g. Chicken, Fish, Mutton' : 'ఉదా: చికెన్, చేప, మటన్'} value={form.product_types} onChange={e => update('product_types', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Experience' : 'అనుభవం'}</label>
          <input className="form-input" placeholder={lang === 'en' ? 'Years of experience' : 'ఎన్ని సంవత్సరాల అనుభవం'} value={form.experience} onChange={e => update('experience', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Additional message' : 'అదనపు సందేశం'}</label>
          <textarea className="form-input" rows={2} placeholder={lang === 'en' ? 'Anything else you want to tell us' : 'మీరు చెప్పాలనుకున్నది'} value={form.message} onChange={e => update('message', e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div style={{ background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#e65100' }}>
          {lang === 'en'
            ? '⏰ Our team will review and respond within 24 hours after submission.'
            : '⏰ Submit చేసిన తర్వాత మా team 24 గంటల్లో respond చేస్తుంది.'}
        </div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : (lang === 'en' ? 'Submit Application' : 'Application Submit చేయి')}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
            ← {lang === 'en' ? 'Already registered? Login' : 'ఇప్పటికే registered? Login చేయి'}
          </button>
        </div>
      </div>
    </div>
  )
}
