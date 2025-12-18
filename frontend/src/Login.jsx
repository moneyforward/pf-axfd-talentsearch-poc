import { useState } from 'react'
import { useLanguage } from './contexts/LanguageContext'
import LanguageToggle from './components/LanguageToggle'
import { Eye, EyeOff } from 'lucide-react'
import './Login.css'

function Login({ onLogin }) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
      {/* Top bar with logo and language toggle */}
      <div className="login-top-bar">
        <img src="/img/logo.png" alt="Logo" className="login-top-bar-logo" />
        <LanguageToggle />
      </div>

      {/* Main content: split layout */}
      <div className="login-content">
        {/* Left column: sign-in form */}
        <section className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-form-content">
              <h1 className="login-title animate-element animate-delay-100">
                <span className="login-title-light">{t('app.title')}</span>
              </h1>
              <p className="login-description animate-element animate-delay-200">{t('login.subtitle')}</p>

              <form onSubmit={handleSubmit} className="login-form">
                {error && <div className="login-error animate-element">{error}</div>}
                
                <div className="login-form-group animate-element animate-delay-300">
                  <label className="login-label">{t('login.email')}</label>
                  <div className="login-input-wrapper">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@moneyforward.com"
                      required
                      autoComplete="email"
                      className="login-input"
                    />
                  </div>
                </div>

                <div className="login-form-group animate-element animate-delay-400">
                  <label className="login-label">{t('login.password')}</label>
                  <div className="login-input-wrapper">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="login-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="login-eye-icon" />
                      ) : (
                        <Eye className="login-eye-icon" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="login-form-options animate-element animate-delay-500">
                  <label className="login-checkbox-label">
                    <input type="checkbox" name="rememberMe" className="login-checkbox" />
                    <span>{t('login.rememberMe')}</span>
                  </label>
                  <a href="#" className="login-forgot-password" onClick={(e) => e.preventDefault()}>
                    {t('login.forgotPassword')}
                  </a>
                </div>

                <button
                  type="submit"
                  className="login-submit-button animate-element animate-delay-600"
                  disabled={loading}
                >
                  {loading ? t('login.loggingIn') : t('login.login')}
                </button>
              </form>

              <div className="login-footer animate-element animate-delay-700">
                <p>{t('login.demoMode')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right column: hero image */}
        <section className="login-hero-section">
          <div className="login-hero-image animate-slide-right animate-delay-300"></div>
          <div className="login-hero-overlay">
            <div className="login-hero-content">
              <img src="/img/logo.png" alt="Logo" className="login-hero-logo animate-element animate-delay-400" />
              <h2 className="login-hero-title animate-element animate-delay-500">{t('app.title')}</h2>
              <p className="login-hero-subtitle animate-element animate-delay-600">{t('login.subtitle')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login

