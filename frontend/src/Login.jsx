import { useState } from 'react'
import { useLanguage } from './contexts/LanguageContext'
import LanguageToggle from './components/LanguageToggle'
import './Login.css'

function Login({ onLogin }) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simple authentication - in production, this would call an API
    // For now, accept any email/password for demo purposes
    setTimeout(() => {
      setLoading(false)
      if (email && password) {
        onLogin({ email, name: email.split('@')[0] })
      } else {
        setError(t('login.error'))
      }
    }, 500)
  }

  return (
    <div className="login-container">
      <div className="login-top-bar">
        <img src="/img/logo.png" alt="Logo" className="login-top-bar-logo" />
        <LanguageToggle />
      </div>
      <div className="login-content-wrapper">
        <div className="login-box">
        <div className="login-header">
          <h1 className="login-logo">{t('app.title')}</h1>
          <p className="login-subtitle">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">{t('login.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@moneyforward.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('login.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>{t('login.rememberMe')}</span>
            </label>
            <a href="#" className="forgot-password">{t('login.forgotPassword')}</a>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? t('login.loggingIn') : t('login.login')}
          </button>
        </form>

        <div className="login-footer">
          <p>{t('login.demoMode')}</p>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Login

