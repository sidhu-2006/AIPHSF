import { useLocation, useNavigate } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './AlertConfirmation.css'
import MapView from '../components/MapView'
import { formatDistance } from '../services/routeService'

function AlertConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { hospital: initialHospital, allHospitals, emergencyType, userLocation, patientAge, notes } = location.state || {}
  const [activeHospital, setActiveHospital] = useState(initialHospital)
  const [isNavigating, setIsNavigating] = useState(false)
  const [switchFeedback, setSwitchFeedback] = useState('')
  const [routeEstimate, setRouteEstimate] = useState(null)
  const handleRouteUpdate = useCallback((route) => setRouteEstimate(route), [])

  if (!activeHospital) {
    return (
      <div className="alert-page-fallback">
        <div className="fallback-card">
          <h1>No Demo Selection</h1>
          <p>Return to the sample hospital list and choose a facility to record a demo selection.</p>
          <button onClick={() => navigate('/emergency')} className="fallback-btn">
            Browse Demo Hospitals
          </button>
        </div>
      </div>
    )
  }

  const alternatives = (allHospitals || []).filter(h => h._id !== activeHospital._id)

  const getRankBadge = (h) => {
    const originalIndex = (allHospitals || []).findIndex(item => item._id === h._id)
    if (originalIndex === 0) return 'Option #1 (Primary Match)'
    if (originalIndex > 0) return `Option #${originalIndex + 1}`
    return 'Alternate Facility'
  }

  const activeIndex = (allHospitals || []).findIndex(item => item._id === activeHospital._id)
  const activeBadge = activeIndex === 0 ? 'Primary #1 Facility' : `Option #${activeIndex + 1} (Active)`

  const handleBackToHospitals = () => {
    navigate('/hospitals', {
      state: {
        hospitals: allHospitals,
        emergencyType,
        userLocation,
        recommendation: allHospitals?.[0] || activeHospital,
        patientAge,
        notes
      }
    })
  }

  const handleSwitchHospital = (newHospital) => {
    setActiveHospital(newHospital)
    setSwitchFeedback(`Route updated to ${newHospital.name}`)
    setTimeout(() => setSwitchFeedback(''), 3000)
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-top-banner">
        <div className="banner-left">
          <span className="live-alert-beacon"></span>
          <span className="banner-main-title">{t('alertConfirm.alertSuccessTitle')}</span>
        </div>
        <div className="banner-right">
          <span className="eta-badge">Road estimate: {routeEstimate ? `${Math.round(routeEstimate.durationSeconds / 60)} min` : 'Unavailable'} · no live traffic</span>
        </div>
      </div>

      <div className="confirmation-split-layout">
        <div className="confirm-left-panel">
          <div className="demo-notice" role="note">{t('hospitalList.demoNotice')}</div>
          <div className="change-alert-bar">
            <button onClick={handleBackToHospitals} className="change-alert-action-btn">
              ← {t('alertConfirm.cancelAlertBtn')}
            </button>
          </div>

          <div className="hospital-dispatch-card">
            <div className="hospital-title-group">
              <span className="card-badge">{activeBadge}</span>
              <h1 className="dispatched-hospital-name">{activeHospital.name}</h1>
              <p className="dispatched-hospital-address">{activeHospital.address}</p>
            </div>

            <div className="essential-stats-row">
              <div className="essential-stat">
                <span className="stat-num">{routeEstimate ? `${Math.round(routeEstimate.durationSeconds / 60)} min` : 'Unavailable'}</span>
                <span className="stat-lbl">Road route estimate (no live traffic)</span>
              </div>
              <div className="essential-stat">
                <span className="stat-num">{activeHospital.availableICUBeds} Beds</span>
                <span className="stat-lbl">{t('alertConfirm.bedStatusLabel')}</span>
              </div>
            </div>

            <div className="patient-triage-pill">
              <span className="triage-label">{t('alertConfirm.conditionLabel')}:</span>
              <span className="triage-val">
                {emergencyType?.toUpperCase()} {patientAge ? `(${patientAge} yrs)` : ''}
              </span>
            </div>

            {notes && (
              <div className="patient-notes-pill">
                <span className="notes-label">Notes:</span> {notes}
              </div>
            )}

            <div className="emergency-actions-row">
              {activeHospital.phone && (
                <a href={`tel:${activeHospital.phone}`} className="call-er-btn">
                  {t('hospitalList.callDesk')}
                </a>
              )}
              <a href="tel:108" className="call-108-btn">
                {t('nav.helpline')}
              </a>
            </div>
          </div>

          {switchFeedback && (
            <div className="switch-feedback-toast">
              {switchFeedback}
            </div>
          )}

          {alternatives.length > 0 && (
            <div className="contingency-routing-section">
              <div className="contingency-header">
                <span className="contingency-title">{t('alertConfirm.alternateOptions')}</span>
                <span className="contingency-hint">{t('alertConfirm.alternateHint')}</span>
              </div>

              <div className="contingency-list">
                {alternatives.map((alt) => (
                  <div key={alt._id} className="contingency-card">
                    <div className="contingency-top">
                      <div className="contingency-info">
                        <span className="alt-tag">{getRankBadge(alt)}</span>
                        <h4 className="alt-name">{alt.name}</h4>
                        <p className="alt-address">{alt.address}</p>
                      </div>
                      <button
                        className="switch-reroute-btn"
                        onClick={() => handleSwitchHospital(alt)}
                      >
                        Switch Route
                      </button>
                    </div>

                    <div className="contingency-metrics">
                      <span><strong>Distance:</strong> {alt.straightLineDistanceKm ?? 'N/A'} km straight-line</span>
                      <span><strong>ICU:</strong> {alt.availableICUBeds} Beds</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="confirm-right-panel">
          <button
            className={`smart-nav-bar ${isNavigating ? 'active' : ''}`}
            onClick={() => setIsNavigating(!isNavigating)}
          >
            <div className="smart-nav-left">
              <div className="smart-nav-icon-wrap">
                <span className={`nav-live-dot ${isNavigating ? 'active' : ''}`}></span>
              </div>
              <div className="smart-nav-text">
                <span className="smart-nav-title">
                  {isNavigating ? t('alertConfirm.gpsActive') : t('alertConfirm.startNavBtn')}
                </span>
                <span className="smart-nav-sub">
                  {isNavigating
                    ? `${t('alertConfirm.gpsTracking')} ${activeHospital.name}`
                    : `${t('alertConfirm.routePreview')} ${activeHospital.name} · ${routeEstimate ? `${formatDistance(routeEstimate.distanceMeters)} route estimate` : 'route unavailable'}`}
                </span>
              </div>
            </div>
            <div className="smart-nav-btn-pill">
              {isNavigating ? t('alertConfirm.pauseGps') : t('alertConfirm.startNavBtn')}
            </div>
          </button>

          <div className="map-view-container">
            <MapView
              hospitals={[activeHospital]}
              targetHospital={activeHospital}
              userLocation={userLocation}
              mode="navigation"
              isNavigating={isNavigating}
              onRouteUpdate={handleRouteUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertConfirmation
