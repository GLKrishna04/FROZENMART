import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [loading, setLoading] = useState(false)
  const { sendOTP, verifyOTP } = useAuth()
  const { lang, setLang, t } = useLang()
  const navigate = useNavigate()

  async function handleSendOTP() {
    if (phone.length !== 10) return toast.error('Valid 10-digit number ఇవ్వండి')
    setLoading(true)
    const res = await sendOTP(phone)
    setLoading(false)
    if (res.success) {
      toast.success('OTP sent! Check console for test OTP')
      setStep('otp')
    }
  }

  async function handleVerifyOTP() {
    if (otp.length !== 6) return toast.error('6-digit OTP ఇవ్వండి')
    setLoading(true)
    const res = await verifyOTP(phone, otp)
    setLoading(false)
    if (res.success) {
      toast.success('Login successful!')
      if (res.role === 'admin') navigate('/admin')
      else if (res.role === 'supplier') navigate('/supplier')
      else navigate('/shop')
    } else {
      toast.error(res.message || 'Wrong OTP')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">Frozen<span>Mart</span></div>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          {t('loginTitle')}
        </p>

        {/* Lang switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div className="lang-switcher" style={{ background: 'var(--gray)', borderColor: 'var(--border)' }}>
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')} style={{ color: lang === 'en' ? '' : 'var(--text)' }}>EN</button>
            <button className={`lang-btn ${lang === 'te' ? 'active' : ''}`} onClick={() => setLang('te')} style={{ color: lang === 'te' ? '' : 'var(--text)' }}>తె</button>
          </div>
        </div>

        {step === 'phone' ? (
          <>
            <div className="form-group">
              <label className="form-label">{t('enterPhone')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ background: 'var(--gray)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: 'var(--muted)', flexShrink: 0 }}>+91</div>
                <input className="form-input" style={{ flex: 1 }} type="tel" maxLength={10} placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && handleSendOTP()} />
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={handleSendOTP} disabled={loading}>
              {loading ? 'Sending...' : t('sendOtp')}
            </button>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => navigate('/supplier-register')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                {t('newSupplier')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>
              {lang === 'en' ? `OTP sent to +91 ${phone}` : `+91 ${phone} కి OTP పంపించాం`}
            </p>
            <div className="form-group">
              <label className="form-label">{t('enterOtp')}</label>
              <input className="form-input" type="tel" maxLength={6} placeholder="123456" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()} style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }} />
            </div>
            <button className="btn-primary" style={{ width: '100%', marginBottom: 12 }} onClick={handleVerifyOTP} disabled={loading}>
              {loading ? 'Verifying...' : t('verifyOtp')}
            </button>
            <button onClick={() => setStep('phone')} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
              ← {lang === 'en' ? 'Change number' : 'నంబర్ మార్చు'}
            </button>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
            ← {lang === 'en' ? 'Back to home' : 'హోమ్‌కి వెళ్ళు'}
          </button>
        </div>
      </div>
    </div>
  )
}
