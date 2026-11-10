import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const [isLangOpen, setIsLangOpen] = useState(false)
  const dropdownRef = useRef(null)

  const langOptions = [
    { code: 'en', label: 'English', short: 'EN', native: 'English' },
    { code: 'hi', label: 'हिन्दी', short: 'HI', native: 'हिन्दी' },
    { code: 'mr', label: 'मराठी', short: 'MR', native: 'मराठी' }
  ]

  const currentOption = langOptions.find((o) => o.code === language) || langOptions[0]

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="navbar-wrapper">
      <div className="navbar-island">
        <div className="navbar-left" onClick={() => navigate('/')}>
          <div className="brand-badge-wrap">
            <span className="brand-dot"></span>
          </div>
          <div className="brand-text-stack">
            <span className="navbar-logo">HLERS</span>
            <span className="navbar-tagline">{t('nav.tagline')}</span>
          </div>
        </div>

        <div className="navbar-center-status">
          <span className="grid-status-beacon"></span>
          <span className="grid-status-text">{t('nav.liveGrid')}</span>
        </div>

        <div className="navbar-right">
          <div className="lang-switcher-container" ref={dropdownRef}>
            <button
              className="lang-trigger-btn"
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-label="Select Language"
            >
              <span className="lang-globe-icon">🌐</span>
              <span className="lang-code-text">{currentOption.short}</span>
              <span className={`lang-chevron ${isLangOpen ? 'open' : ''}`}>▾</span>
            </button>

            {isLangOpen && (
              <div className="lang-dropdown-menu">
                {langOptions.map((opt) => (
                  <button
                    key={opt.code}
                    className={`lang-option-item ${language === opt.code ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(opt.code)
                      setIsLangOpen(false)
                    }}
                  >
                    <span className="lang-option-native">{opt.native}</span>
                    <span className="lang-option-code">({opt.short})</span>
                    {language === opt.code && <span className="lang-check-icon">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a href="tel:108" className="navbar-108-link">
            {t('nav.helpline')}
          </a>
          <button
            className="navbar-btn"
            onClick={() => navigate('/emergency')}
          >
            {t('nav.reportEmergency')}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar