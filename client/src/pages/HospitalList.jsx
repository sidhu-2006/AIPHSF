import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { sendAlert, findNearbyHospitals } from '../services/api'
import './HospitalList.css'
import MapView from '../components/MapView'

function HospitalList() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { hospitals, emergencyType, userLocation, recommendation, patientAge, notes } = location.state || {}
  const [alertError, setAlertError] = useState('')
  const [dispatchingHospital, setDispatchingHospital] = useState(null)
  const [dispatchStep, setDispatchStep] = useState(1)
  const [retrying, setRetrying] = useState(false)

  const handleSearchDemoPune = async () => {
    try {
      setRetrying(true)
      const res = await findNearbyHospitals({
        latitude: 18.5204,
        longitude: 73.8567,
        emergencyType: emergencyType || 'cardiac'
      })
      navigate('/hospitals', {
        state: {
          hospitals: res.data.data,
          emergencyType: emergencyType || 'cardiac',
          userLocation: { latitude: 18.5204, longitude: 73.8567 },
          recommendation: res.data.recommendation,
          patientAge: patientAge || 30,
          notes: notes || ''
        }
      })
    } catch (e) {
      console.error(e)
    } finally {
      setRetrying(false)
    }
  }

  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="results-wrapper empty-layout">
        <div className="no-results-card">
          <h1>No Available Hospitals Found</h1>
          <p>We could not find matching emergency facilities for <strong>{emergencyType || 'this condition'}</strong> within the immediate 30 km radius.</p>
          <p style={{ margin: '8px 0 20px', color: '#666', fontSize: '0.88rem' }}>
            The demonstration dataset includes 32 sample hospitals across Pune, Maharashtra.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleSearchDemoPune} className="primary-action-btn" disabled={retrying}>
              {retrying ? 'Loading...' : '📍 Search Pune Demo Area (18.5204, 73.8567)'}
            </button>
            <button onClick={() => navigate('/emergency')} className="primary-action-btn" style={{ background: '#555' }}>
              ← Edit Emergency Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  const primaryHospital = recommendation || hospitals[0]
  const otherHospitals = hospitals.filter(h => h._id !== primaryHospital._id)

  const handleAlert = async (hospital) => {
    try {
      setAlertError('')
      setDispatchingHospital(hospital)
      setDispatchStep(1)

      const timer1 = setTimeout(() => setDispatchStep(2), 700)
      const timer2 = setTimeout(() => setDispatchStep(3), 1400)

      await sendAlert({
        hospitalId: hospital._id,
        emergencyType: emergencyType || 'general',
        patientAge: Number(patientAge) || 30,
        notes: notes || ''
      })

      setTimeout(() => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        navigate('/alert-confirmation', {
          state: {
            hospital,
            allHospitals: hospitals,
            emergencyType,
            userLocation,
            patientAge: Number(patientAge) || 30,
            notes
          }
        })
      }, 2100)
    } catch (err) {
      console.error(err)
      setDispatchingHospital(null)
      setAlertError(t('hospitalList.saveError'))
    }
  }

  return (
    <div className="results-wrapper">
      <div className="split-layout">
        <div className="left-scroll-panel">
          <div className="demo-notice" role="note">{t('hospitalList.demoNotice')}</div>
          <div className="results-top-bar">
            <button onClick={() => navigate('/emergency')} className="back-link">
              ← {t('hospitalList.editCategory')}
            </button>
            <div className="badge-group">
              <span className="live-status-pill">{t('hospitalList.demoData')}</span>
              <span className="emergency-type-badge">
                {emergencyType?.toUpperCase() || 'EMERGENCY'}
              </span>
            </div>
          </div>

          {alertError && <div className="alert-error-banner">{alertError}</div>}

          <div className="hero-hospital-section">
            <div className="hero-rec-card">
              <div className="hero-badge-row">
                <span className="top-choice-tag">#1 {t('hospitalList.sortBest').toUpperCase()}</span>
                {primaryHospital.hlers_score && (
                  <span className="ml-score-pill">ML Match Score: {primaryHospital.hlers_score}</span>
                )}
              </div>

              <h1 className="hero-hospital-title">{primaryHospital.name}</h1>
              <p className="hero-hospital-address">{primaryHospital.address}</p>

              <div className="hero-stats-grid">
                <div className="hero-stat-box highlight">
                  <span className="stat-value">{primaryHospital.straightLineDistanceKm ?? 'N/A'} km</span>
                  <span className="stat-label">Straight-line distance</span>
                </div>
                <div className="hero-stat-box">
                  <span className="stat-value">{primaryHospital.distanceMeters != null ? `${Math.round(primaryHospital.distanceMeters)} m` : 'N/A'}</span>
                  <span className="stat-label">{t('hospitalList.distanceAway')}</span>
                </div>
                <div className="hero-stat-box">
                  <span className={`stat-value ${primaryHospital.availableICUBeds === 0 ? 'red-text' : 'green-text'}`}>
                    {primaryHospital.availableICUBeds}/{primaryHospital.totalICUBeds}
                  </span>
                  <span className="stat-label">{t('hospitalList.bedsAvailable')}</span>
                </div>
                <div className="hero-stat-box">
                  <span className="stat-value">{primaryHospital.currentLoad}/10</span>
                  <span className="stat-label">Load Level</span>
                </div>
              </div>

              {primaryHospital.specialists && primaryHospital.specialists.length > 0 && (
                <div className="hero-specialists-group">
                  <span className="hero-spec-label">{t('hospitalList.specialistOnDuty')}:</span>
                  <div className="hero-spec-tags">
                    {primaryHospital.specialists.map((spec) => (
                      <span
                        key={spec._id || spec.name}
                        className={`spec-pill ${spec.available ? 'active' : 'inactive'}`}
                      >
                        {spec.type} {spec.available ? '(Available)' : '(Unavailable)'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="hero-alert-btn"
                onClick={() => handleAlert(primaryHospital)}
                disabled={!!dispatchingHospital}
              >
                {t('hospitalList.directAlertBtn')}
              </button>
            </div>
          </div>

          {otherHospitals.length > 0 && (
            <div className="other-hospitals-section">
              <h2 className="other-section-title">Other Nearby Facilities ({otherHospitals.length})</h2>
              <div className="other-hospitals-list">
                {otherHospitals.map((hospital, idx) => (
                  <div key={hospital._id} className="secondary-hospital-card">
                    <div className="sec-card-header">
                      <span className="sec-rank-badge">Rank #{idx + 2}</span>
                      <h3 className="sec-hospital-title">{hospital.name}</h3>
                    </div>
                    <p className="sec-hospital-address">{hospital.address}</p>

                    <div className="sec-stats-row">
                      <span><strong>Distance:</strong> {hospital.straightLineDistanceKm ?? 'N/A'} km (straight-line)</span>
                      <span><strong>ICU:</strong> {hospital.availableICUBeds}/{hospital.totalICUBeds}</span>
                    </div>

                    <button
                      className="sec-alert-btn"
                      onClick={() => handleAlert(hospital)}
                      disabled={!!dispatchingHospital}
                    >
                      {t('hospitalList.directAlertBtn')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="right-map-panel">
          <div className="map-layer-badge">
            <span className="map-radar-pulse"></span>
            {t('hospitalList.viewMap')}
          </div>
          <MapView hospitals={hospitals} userLocation={userLocation} />
        </div>
      </div>

      {dispatchingHospital && (
        <div className="dispatch-loader-backdrop">
          <div className="dispatch-loader-modal">
            <div className="radar-spinner">
              <div className="radar-core"></div>
              <div className="radar-wave wave-1"></div>
              <div className="radar-wave wave-2"></div>
            </div>

            <h2 className="dispatch-title">{t('hospitalList.recordingTitle')}</h2>
            <p className="dispatch-target">{t('hospitalList.recordingTarget')}: <strong>{dispatchingHospital.name}</strong></p>

            <div className="dispatch-stepper">
              <div className={`step-row ${dispatchStep >= 1 ? 'done' : ''}`}>
                <span className="step-dot"></span>
                <span>{t('hospitalList.recordingStep1')}</span>
              </div>
              <div className={`step-row ${dispatchStep >= 2 ? 'done' : ''}`}>
                <span className="step-dot"></span>
                <span>{t('hospitalList.recordingStep2')}</span>
              </div>
              <div className={`step-row ${dispatchStep >= 3 ? 'done' : ''}`}>
                <span className="step-dot"></span>
                <span>{t('hospitalList.recordingStep3')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HospitalList
