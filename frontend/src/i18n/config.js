import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import jaTranslations from './locales/ja.json'
import enTranslations from './locales/en.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ja: {
        translation: jaTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    lng: localStorage.getItem('language') || 'ja', // Default to Japanese
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  })

export default i18n

