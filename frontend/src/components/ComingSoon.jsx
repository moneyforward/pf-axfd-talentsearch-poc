import { useLanguage } from '../contexts/LanguageContext'
import './ComingSoon.css'

const ComingSoon = ({ pageName }) => {
  const { t } = useLanguage()
  
  const message = pageName 
    ? `${pageName} ${t('comingSoon.message') || 'will be available soon.'}`
    : (t('comingSoon.message') || 'This feature will be available soon.')
  
  return (
    <div className="coming-soon">
      <div className="coming-soon-content">
        <div className="coming-soon-icon">🚧</div>
        <h2 className="coming-soon-title">
          {t('comingSoon.title') || 'Coming Soon'}
        </h2>
        <p className="coming-soon-message">
          {message}
        </p>
      </div>
    </div>
  )
}

export default ComingSoon

