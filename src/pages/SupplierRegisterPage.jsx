import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLang } from '../context/LangContext'
import toast from 'react-hot-toast'

export default function SupplierRegisterPage() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    business_name: '',
    location: ''
  })

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.phone || !form.business_name || !form.location) {
      return toast.error(lang === 'en' ? 'Please fill all required fields' : 'అన్ని fields fill చేయండి')
    }
    if (form.phone.length !== 10) {
      return toast.error(lang === 'en' ? 'Enter valid 10 digit phone number' : 'Valid 10 digit phone number ఇవ్వండి')
    }
    setLoading(true)
    const { error } = await supabase.from('supplier_requests').insert(form)
    setLoading(false)
    if (error) {
      toast.error('Something went wrong. Try again.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="login-page">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, marginBottom: 12 }}>
          {lang === 'en' ? 'Application Submitted!' : 'Application Submit అయింది!'}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
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
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 480 }}>
        <div className="login-logo" style={{ marginBottom: 4 }}>
          Frozen<span>Mart</span>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
          {lang === 'en' ? 'Supplier Registration' : 'సప్లయర్ రిజిస్ట్రేషన్'}
        </p>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Full Name *' : 'పూర్తి పేరు *'}</label>
          <input className="form-input" placeholder={lang === 'en' ? 'Your full name' : 'మీ పూర్తి పేరు'}
            value={form.name} onChange={e => update('name', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Mobile Number *' : 'మొబైల్ నంబర్ *'}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: 'var(--gray)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: 'var(--muted)', flexShrink: 0 }}>+91</div>
            <input className="form-input" style={{ flex: 1 }} type="tel" maxLength={10}
              placeholder="9876543210" value={form.phone}
              onChange={e => update('phone', e.target.value.replace(/\D/g, ''))} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Email' : 'ఇమెయిల్'}</label>
          <input className="form-input" type="email" placeholder="example@gmail.com"
            value={form.email} onChange={e => update('email', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Business Name *' : 'వ్యాపార పేరు *'}</label>
          <input className="form-input" placeholder={lang === 'en' ? 'Your business name' : 'మీ వ్యాపార పేరు'}
            value={form.business_name} onChange={e => update('business_name', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{lang === 'en' ? 'Location *' : 'లొకేషన్ *'}</label>
          <input className="form-input" placeholder={lang === 'en' ? 'Area, City (e.g. Kukatpally, Hyderabad)' : 'ఏరియా, సిటీ (ఉదా: కూకట్‌పల్లి, హైదరాబాద్)'}
            value={form.location} onChange={e => update('location', e.target.value)} />
        </div>

        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#f57f17' }}>
          ⏰ {lang === 'en'
            ? 'Our team will review and respond within 24 hours after submission.'
            : 'Submit చేసిన తర్వాత మా team 24 గంటల్లో respond చేస్తుంది.'}
        </div>

        <button className="btn-primary" style={{ width: '100%' }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : (lang === 'en' ? 'Submit Application' : 'Application Submit చేయి')}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
            ← {lang === 'en' ? 'Already a supplier? Login' : 'ఇప్పటికే supplier? Login చేయి'}
          </button>
        </div>
      </div>
    </div>
  )
}