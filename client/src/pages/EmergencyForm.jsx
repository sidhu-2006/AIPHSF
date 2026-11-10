import './EmergencyForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { findNearbyHospitals, createEmergencyRequest } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function EmergencyForm() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [emergencyType, setEmergencyType] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState(null)
  const [manualLatitude, setManualLatitude] = useState('')
  const [manualLongitude, setManualLongitude] = useState('')
  const [locationError, setLocationError] = useState('')
  const [locating, setLocating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const emergencyOptions = [
    { id: 'cardiac', labelKey: 'emergencyForm.condCardiacTitle', descKey: 'emergencyForm.condCardiacDesc', icon: '🫀' },
    { id: 'stroke', labelKey: 'emergencyForm.condStrokeTitle', descKey: 'emergencyForm.condStrokeDesc', icon: '🧠' },
    { id: 'trauma', labelKey: 'emergencyForm.condTraumaTitle', descKey: 'emergencyForm.condTraumaDesc', icon: '🩸' },
    { id: 'respiratory', labelKey: 'emergencyForm.condRespiratoryTitle', descKey: 'emergencyForm.condRespiratoryDesc', icon: '🫁' },
    { id: 'burns', labelKey: 'emergencyForm.condBurnsTitle', descKey: 'emergencyForm.condBurnsDesc', icon: '🔥' },
    { id: 'other', labelKey: 'emergencyForm.condGeneralTitle', descKey: 'emergencyForm.condGeneralDesc', icon: '🚑' }
  ]

  const selectedOpt = emergencyOptions.find(o => o.id === emergencyType)

  const detectLocation = () => {
    setLocationError('')
    setLocating(true)
    if (!navigator.geolocation) {
      setLocationError(t('emergencyForm.gpsUnavailable'))
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        setLocating(false)
      },
      () => {
        setLocationError(t('emergencyForm.gpsDenied'))
        setLocating(false)
      },
      { timeout: 10000 }
    )
  }

  const useManualLocation = () => {
    setLocationError('')
    const latitude = Number(manualLatitude)
    const longitude = Number(manualLongitude)
    if (manualLatitude.trim() === '' || manualLongitude.trim() === '' ||
        !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setLocation(null)
      setLocationError(t('emergencyForm.manualLocationError'))
      return
    }
    setLocation({ latitude, longitude })
  }

  const setPuneDemoLocation = () => {
    setLocationError('')
    setManualLatitude('18.5204')
    setManualLongitude('73.8567')
    setLocation({ latitude: 18.5204, longitude: 73.8567 })
  }

  const handleSubmit = async () => {
    setError('')
    if (!emergencyType) {
      setError('Please select an emergency type on the left')
      return
    }
    if (!patientAge || patientAge < 0 || patientAge > 120) {
      setError('Please enter the approximate patient age')
      return
    }
    let activeLocation = location
    if (!activeLocation && manualLatitude && manualLongitude) {
      const lat = Number(manualLatitude)
      const lng = Number(manualLongitude)
      if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        activeLocation = { latitude: lat, longitude: lng }
        setLocation(activeLocation)
      }
    }
    if (!activeLocation) {
      activeLocation = { latitude: 18.5204, longitude: 73.8567 }
      setLocation(activeLocation)
    }
    setLoading(true)

    try {
      const nearbyResponse = await findNearbyHospitals({
        longitude: activeLocation.longitude,
        latitude: activeLocation.latitude,
        emergencyType
      })
      await createEmergencyRequest({
        emergencyType,
        patientAge: Number(patientAge),
        notes,
        userLocation: {
          type: 'Point',
          coordinates: [activeLocation.longitude, activeLocation.latitude]
        }
      })

      navigate('/hospitals', {
        state: {
          hospitals: nearbyResponse.data.data,
          emergencyType,
          userLocation: activeLocation,
          recommendation: nearbyResponse.data.recommendation,
          patientAge: Number(patientAge),
          notes
        }
      })
    } catch (err) {
      console.error(err)
      setError(t('emergencyForm.searchError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="emergency-web-container">
      <div className="horizontal-form-panel">
        <div className="left-triage-panel">
          <div className="demo-notice" role="note">{t('home.demoNotice')}</div>
          <div className="triage-panel-header">
            <button onClick={() => navigate('/')} className="form-back-link">
              ← Home
            </button>
            <div className="step-tag">STEP 1</div>
          </div>
          <h2 className="step-title">{t('emergencyForm.step1Title')}</h2>
          <p className="step-subtitle">{t('emergencyForm.headerSub')}</p>

          <div className="horizontal-options-list">
            {emergencyOptions.map((opt) => (
              <div
                key={opt.id}
                className={`horizontal-option-card ${emergencyType === opt.id ? 'selected' : ''}`}
                onClick={() => setEmergencyType(opt.id)}
              >
                <span className="opt-icon">{opt.icon}</span>
                <div className="opt-text">
                  <span className="opt-title">{t(opt.labelKey)}</span>
                  <span className="opt-desc">{t(opt.descKey)}</span>
                </div>
                <div className="opt-radio">
                  {emergencyType === opt.id && <span className="radio-dot"></span>}
                </div>
              </div>
            ))}
          </div>

          {selectedOpt && (
            <div className="triage-protocol-banner">
              <span className="protocol-pulse"></span>
              <div className="protocol-text">{t('emergencyForm.selectionNotice')}</div>
            </div>
          )}
        </div>

        <div className="right-dispatch-panel">
          <div className="step-tag">STEP 2 &amp; 3</div>
          <h2 className="step-title">{t('emergencyForm.step3Title')}</h2>
          <p className="step-subtitle">{t('emergencyForm.locPlaceholder')}</p>

          <div className="input-group">
            <label className="input-label">Patient Age (Years) *</label>
            <input
              type="number"
              placeholder="e.g. 45"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              min="0"
              max="120"
              className="web-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t('emergencyForm.locationLabel')} *</label>
            <button
              type="button"
              className={`web-location-btn ${location ? 'ready' : ''} ${locating ? 'locating' : ''}`}
              onClick={detectLocation}
              disabled={locating}
            >
              {locating ? (
                <>
                  <span className="radar-spinner-dot"></span>
                  <span className="radar-sweep-text">{t('emergencyForm.gpsLocating')}</span>
                </>
              ) : location ? (
                t('emergencyForm.gpsLocked')
              ) : (
                t('emergencyForm.detectLocationButton')
              )}
            </button>
            {location && (
              <div className="gps-readout">
                <span>Lat: {location.latitude.toFixed(4)}</span>
                <span>Lng: {location.longitude.toFixed(4)}</span>
              </div>
            )}
            {locationError && <p className="field-error" role="alert">{locationError}</p>}
            <div className="manual-location-fields">
              <p className="manual-location-help">{t('emergencyForm.manualLocationHelp')}</p>
              <div className="manual-coordinate-row">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={t('emergencyForm.latitudePlaceholder')}
                  aria-label={t('emergencyForm.latitudePlaceholder')}
                  value={manualLatitude}
                  onChange={(e) => setManualLatitude(e.target.value)}
                  min="-90"
                  max="90"
                  step="any"
                  className="web-input"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={t('emergencyForm.longitudePlaceholder')}
                  aria-label={t('emergencyForm.longitudePlaceholder')}
                  value={manualLongitude}
                  onChange={(e) => setManualLongitude(e.target.value)}
                  min="-180"
                  max="180"
                  step="any"
                  className="web-input"
                />
              </div>
              <button type="button" className="web-location-btn manual-location-btn" onClick={useManualLocation}>
                {t('emergencyForm.useManualLocation')}
              </button>
            </div>
            <button
              type="button"
              className="web-location-btn demo-pune-btn"
              onClick={setPuneDemoLocation}
              style={{ marginTop: '10px', backgroundColor: 'var(--teal-light)', borderColor: 'var(--teal-dark)', color: 'var(--teal-dark)' }}
            >
              {t('emergencyForm.useDemoLocation')}
            </button>
            <p className="demo-location-hint" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              {t('emergencyForm.demoLocationHint')}
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">Optional Medical Notes</label>
            <input
              type="text"
              placeholder="e.g. diabetic, head injury, conscious..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={100}
              className="web-input"
            />
          </div>

          {error && <div className="web-error-box">{error}</div>}

          <button
            className="web-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : t('emergencyForm.findBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmergencyForm
