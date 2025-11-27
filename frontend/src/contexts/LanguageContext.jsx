import { createContext, useContext, useState, useEffect } from 'react'
import i18n from '../i18n/config'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language preference or default to Japanese
    // Sync with i18n's current language
    const saved = localStorage.getItem('language') || 'ja'
    if (i18n.language !== saved) {
      i18n.changeLanguage(saved)
    }
    return saved
  })

  useEffect(() => {
    // Sync i18n language with state
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'ja' ? 'en' : 'ja'
      i18n.changeLanguage(newLang)
      return newLang
    })
  }

  // Helper function to get nested translation keys
  const t = (key) => {
    // Support both old flat keys and new nested keys
    // Try nested path first (e.g., "app.title")
    let translation = i18n.t(key)
    
    // If translation equals the key, try old flat format for backward compatibility
    if (translation === key) {
      // Map old keys to new nested structure
      const keyMap = {
        'appTitle': 'app.title',
        'logout': 'app.logout',
        'backfillSearch': 'app.backfillSearch',
        'jdTemplate': 'app.jdTemplate',
        'jdCreate': 'app.jdCreate',
        'searchPlaceholder': 'search.placeholder',
        'searching': 'search.searching',
        'noDepartment': 'personCard.noDepartment',
        'noJobTitle': 'personCard.noJobTitle',
        'noName': 'personCard.noName',
        'noEmployeeId': 'personCard.noEmployeeId',
        'resume': 'personCard.resume',
        'cv': 'personCard.cv',
        'generatingSkills': 'personCard.generatingSkills',
        'noJobDescription': 'personCard.noJobDescription',
        'findSimilar': 'instruction.findSimilar',
        'searchingResults': 'results.searching',
        'noResults': 'results.noResults',
        'loginSubtitle': 'login.subtitle',
        'email': 'login.email',
        'password': 'login.password',
        'rememberMe': 'login.rememberMe',
        'forgotPassword': 'login.forgotPassword',
        'login': 'login.login',
        'loggingIn': 'login.loggingIn',
        'loginError': 'login.error',
        'demoMode': 'login.demoMode'
      }
      
      const mappedKey = keyMap[key]
      if (mappedKey) {
        translation = i18n.t(mappedKey)
      }
    }
    
    return translation || key
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

