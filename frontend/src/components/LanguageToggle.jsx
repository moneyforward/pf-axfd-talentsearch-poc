import { useLanguage } from '../contexts/LanguageContext'
import './LanguageToggle.css'

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button 
      className="language-toggle"
      onClick={toggleLanguage}
      aria-label="Toggle language"
    >
      {language === 'ja' ? 'EN' : '日本語'}
    </button>
  )
}

export default LanguageToggle

