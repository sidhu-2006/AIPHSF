import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './NotFound.css'

function NotFound() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-code">{t('notFound.code')}</h1>
        <h2 className="notfound-title">{t('notFound.title')}</h2>
        <p className="notfound-message">
          {t('notFound.desc')}
        </p>
        <div className="notfound-actions">
          <button className="notfound-btn primary" onClick={() => navigate('/emergency')}>
            {t('notFound.reportBtn')}
          </button>
          <button className="notfound-btn secondary" onClick={() => navigate('/')}>
            {t('notFound.homeBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound