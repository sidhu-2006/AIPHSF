import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [activeSim, setActiveSim] = useState('cardiac')
  const [activeBento, setActiveBento] = useState('traffic')

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const hospitals = {
    cardiac: {
      id: 'cardiac',
      labelKey: 'home.cardiac',
      nameKey: 'home.cardiacName',
      eta: 'Demo estimate: 6 min',
      icu: 'Sample: 4 beds',
      spec: 'Sample: cardiologist',
      distance: '3.2 km',
      path: 'M 50,120 C 130,120 180,50 345,50'
    },
    stroke: {
      id: 'stroke',
      labelKey: 'home.stroke',
      nameKey: 'home.strokeName',
      eta: 'Demo estimate: 8 min',
      icu: 'Sample: 3 beds',
      spec: 'Sample: neurologist',
      distance: '4.7 km',
      path: 'M 50,120 C 140,120 190,190 345,190'
    },
    trauma: {
      id: 'trauma',
      labelKey: 'home.trauma',
      nameKey: 'home.traumaName',
      eta: 'Demo estimate: 5 min',
      icu: 'Sample: 5 beds',
      spec: 'Sample: trauma surgeon',
      distance: '2.8 km',
      path: 'M 50,120 C 160,120 240,120 345,120'
    },
    burns: {
      id: 'burns',
      labelKey: 'home.burns',
      nameKey: 'home.burnsName',
      eta: 'Demo estimate: 11 min',
      icu: 'Sample: 2 beds',
      spec: 'Sample: burn specialist',
      distance: '6.4 km',
      path: 'M 50,120 C 110,120 170,45 240,45'
    }
  }

  const currentHospital = hospitals[activeSim] || hospitals.cardiac

  return (
    <div className="home-page">
      <div className="demo-notice" role="note">{t('home.demoNotice')}</div>
      <section className="hero-section">
        <div className="hero-grid-ambient"></div>
        <div className="hero-glow-orb orb-1"></div>
        <div className="hero-glow-orb orb-2"></div>

        <div className="hero-grid-layout">
          <div className="hero-text-column">
            <div className="hero-badge">
              <span className="live-pulse"></span>
              {t('home.heroBadge')}
            </div>
            <h1 className="hero-title">
              {t('home.heroTitle1')}<span className="highlight-teal">{t('home.heroTitleRight')}</span>{t('home.heroTitle2')}<br />
              {t('home.heroTitle3')}<span className="highlight-red">{t('home.heroTitleNearest')}</span>{t('home.heroTitle4')}
            </h1>
            <p className="hero-description">
              {t('home.heroDesc')}
            </p>
            <div className="hero-cta-group">
              <button
                className="primary-emergency-btn"
                onClick={() => navigate('/emergency')}
              >
                {t('home.reportBtn')}
              </button>
              <button
                className="secondary-info-btn"
                onClick={() => scrollToSection('comparison-section')}
              >
                {t('home.howItWorksBtn')}
              </button>
            </div>

            <div className="hero-metrics">
              <div className="metric-item">
                <span className="metric-val">{t('home.speedVal')}</span>
                <span className="metric-lbl">{t('home.speedLbl')}</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-val">{t('home.bedVal')}</span>
                <span className="metric-lbl">{t('home.bedLbl')}</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-val">{t('home.trafficVal')}</span>
                <span className="metric-lbl">{t('home.trafficLbl')}</span>
              </div>
            </div>
          </div>

          <div className="hero-visual-column">
            <div className="sim-interactive-deck">
              <div className="sim-header">
                <div className="sim-header-left">
                  <span className="sim-radar-dot"></span>
                  <span className="sim-header-title">{t('home.simTitle')}</span>
                </div>
                <div className="sim-tabs-group">
                  {Object.keys(hospitals).map((key) => (
                    <button
                      key={key}
                      className={`sim-tab-pill ${activeSim === key ? 'active' : ''}`}
                      onClick={() => setActiveSim(key)}
                    >
                      {t(hospitals[key].labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sim-canvas slate-canvas">
                <div className="sim-grid-dots"></div>

                <div className="sim-node origin-node">
                  <div className="node-pulse"></div>
                  <div className="node-label">{t('home.yourLocation')}</div>
                </div>

                <svg className="sim-route-svg" viewBox="0 0 400 240" preserveAspectRatio="none">
                  {Object.keys(hospitals).map((key) => {
                    const hosp = hospitals[key]
                    const isSelected = activeSim === key
                    return (
                      <path
                        key={key}
                        className={isSelected ? 'route-path-animated' : 'route-path-idle'}
                        d={hosp.path}
                      />
                    )
                  })}
                </svg>

                <div
                  className="ambulance-tracker"
                  style={{ offsetPath: `path("${currentHospital.path}")` }}
                >
                  <div className="ambulance-beacon"></div>
                </div>

                {Object.keys(hospitals).map((key) => {
                  const hosp = hospitals[key]
                  const isSelected = activeSim === key
                  return (
                    <div
                      key={key}
                      className={`sim-node hospital-node hosp-${key} ${isSelected ? 'active-target' : 'idle-target'}`}
                      onClick={() => setActiveSim(key)}
                    >
                      <div className={`dest-glow ${isSelected ? 'selected-glow' : 'idle-glow'}`}></div>
                      <div className="node-label">{t(hosp.nameKey)}</div>
                    </div>
                  )
                })}
              </div>

              <div className="sim-telemetry slate-telemetry">
                <div className="telem-item">
                  <span className="telem-lbl">{t('home.driveDuration')}</span>
                  <span className="telem-val">{currentHospital.eta}</span>
                </div>
                <div className="telem-item">
                  <span className="telem-lbl">{t('home.icuBeds')}</span>
                  <span className="telem-val green">{currentHospital.icu}</span>
                </div>
                <div className="telem-item">
                  <span className="telem-lbl">{t('home.doctorStatus')}</span>
                  <span className="telem-val green">{currentHospital.spec}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="comparison-section" className="terminal-comparison-section">
        <div className="section-container">
          <div className="section-header-compact">
            <div className="section-kicker">{t('home.comparisonKicker')}</div>
            <h2 className="section-heading">{t('home.comparisonHeading')}</h2>
            <p className="section-subtext">{t('home.comparisonSubtext')}</p>
          </div>

          <div className="comparison-terminal-deck">
            <div className="terminal-card legacy-terminal">
              <div className="terminal-top-bar">
                <span className="terminal-status red">{t('home.legacyStatus')}</span>
                <span className="terminal-label">{t('home.legacySub')}</span>
              </div>

              <div className="terminal-content">
                <h3 className="terminal-title">{t('home.legacyTitle')}</h3>
                <p className="terminal-summary">{t('home.legacyDesc')}</p>

                <div className="terminal-scenario-box warning">
                  <div className="scenario-row">
                    <span className="scenario-label">{t('home.drivingTime')}</span>
                    <span className="scenario-value">{t('home.legacyDrive')}</span>
                  </div>
                  <div className="scenario-row">
                    <span className="scenario-label">{t('home.icuBeds')}:</span>
                    <span className="scenario-value red-text">{t('home.legacyBeds')}</span>
                  </div>
                  <div className="scenario-row">
                    <span className="scenario-label">{t('home.specialist')}</span>
                    <span className="scenario-value red-text">{t('home.legacySpec')}</span>
                  </div>
                  <div className="scenario-outcome red">
                    {t('home.legacyOutcome')}
                  </div>
                </div>

                <ul className="terminal-list">
                  <li>{t('home.legacyLi1')}</li>
                  <li>{t('home.legacyLi2')}</li>
                </ul>
              </div>
            </div>

            <div className="terminal-card hlers-terminal">
              <div className="terminal-top-bar">
                <span className="terminal-status teal">{t('home.hlersStatus')}</span>
                <span className="terminal-label highlight">{t('home.hlersSub')}</span>
              </div>

              <div className="terminal-content">
                <h3 className="terminal-title">{t('home.hlersTitle')}</h3>
                <p className="terminal-summary">{t('home.hlersDesc')}</p>

                <div className="terminal-scenario-box success">
                  <div className="scenario-row">
                    <span className="scenario-label">{t('home.drivingTime')}</span>
                    <span className="scenario-value">{t('home.hlersDrive')}</span>
                  </div>
                  <div className="scenario-row">
                    <span className="scenario-label">{t('home.icuBeds')}:</span>
                    <span className="scenario-value green-text">{t('home.hlersBeds')}</span>
                  </div>
                  <div className="scenario-row">
                    <span className="scenario-label">{t('home.specialist')}</span>
                    <span className="scenario-value green-text">{t('home.hlersSpec')}</span>
                  </div>
                  <div className="scenario-outcome green">
                    {t('home.hlersOutcome')}
                  </div>
                </div>

                <ul className="terminal-list highlight">
                  <li>{t('home.hlersLi1')}</li>
                  <li>{t('home.hlersLi2')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="bento-grid" className="bento-showcase-section">
        <div className="section-container">
          <div className="section-header-compact">
            <div className="section-kicker">{t('home.bentoKicker')}</div>
            <h2 className="section-heading">{t('home.bentoHeading')}</h2>
            <p className="section-subtext">{t('home.bentoSubtext')}</p>
          </div>

          <div className="bento-grid-layout">
            <div
              className={`bento-card featured-bento ${activeBento === 'traffic' ? 'active-focus' : ''}`}
              onClick={() => setActiveBento('traffic')}
            >
              <div className="bento-card-bg-glow glow-teal"></div>
              <div className="bento-top-row">
                <span className="bento-tag">{t('home.step1Tag')}</span>
                <span className="bento-live-badge">{t('home.step1Badge')}</span>
              </div>

              <div className="bento-body">
                <h3 className="bento-title">{t('home.step1Title')}</h3>
                <p className="bento-description">
                  {t('home.step1Desc')}
                </p>

                <div className="bento-interactive-graphic route-graphic">
                  <div className="mini-telemetry-bar">
                    <div className="mini-telem-point">
                      <span className="dot origin"></span>
                      <span>{t('home.yourLocation')}</span>
                    </div>
                    <div className="mini-telem-line">
                      <span className="traveling-pulse"></span>
                    </div>
                    <div className="mini-telem-point">
                      <span className="dot dest"></span>
                      <span>{t('home.cardiacName')}</span>
                    </div>
                  </div>
                  <div className="mini-speed-readout">
                    <span>{t('home.step1Analysis')} <strong>{t('home.step1Avoids')}</strong></span>
                    <span className="latency-pill">{t('home.step1Instant')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`bento-card ${activeBento === 'icu' ? 'active-focus' : ''}`}
              onClick={() => setActiveBento('icu')}
            >
              <div className="bento-card-bg-glow glow-green"></div>
              <div className="bento-top-row">
                <span className="bento-tag">{t('home.step2Tag')}</span>
                <span className="bento-metric-pill">{t('home.step2Badge')}</span>
              </div>

              <div className="bento-body">
                <h3 className="bento-title">{t('home.step2Title')}</h3>
                <p className="bento-description">
                  {t('home.step2Desc')}
                </p>

                <div className="bento-interactive-graphic icu-graphic">
                  <div className="icu-meter-header">
                    <span>{t('home.step2MeterHeader')}</span>
                    <strong className="green-text">{t('home.step2Verified')}</strong>
                  </div>
                  <div className="segmented-capacity-bar">
                    <div className="cap-segment filled"></div>
                    <div className="cap-segment filled"></div>
                    <div className="cap-segment filled"></div>
                    <div className="cap-segment filled"></div>
                    <div className="cap-segment empty"></div>
                    <div className="cap-segment empty"></div>
                  </div>
                  <div className="meter-footer">
                    <span>{t('home.step2MeterFooter1')}</span>
                    <span>Status: <strong>{t('home.step2MeterFooter2')}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`bento-card ${activeBento === 'specialists' ? 'active-focus' : ''}`}
              onClick={() => setActiveBento('specialists')}
            >
              <div className="bento-card-bg-glow glow-blue"></div>
              <div className="bento-top-row">
                <span className="bento-tag">{t('home.step3Tag')}</span>
                <span className="bento-metric-pill">{t('home.step3Badge')}</span>
              </div>

              <div className="bento-body">
                <h3 className="bento-title">{t('home.step3Title')}</h3>
                <p className="bento-description">
                  {t('home.step3Desc')}
                </p>

                <div className="bento-interactive-graphic specialist-graphic">
                  <div className="spec-badge-stack">
                    <div className="spec-item active">
                      <span className="spec-status-dot"></span>
                      <span>{t('home.docHeart')}</span>
                      <span className="spec-state">{t('home.demoSample')}</span>
                    </div>
                    <div className="spec-item active">
                      <span className="spec-status-dot"></span>
                      <span>{t('home.docBrain')}</span>
                      <span className="spec-state">{t('home.demoSample')}</span>
                    </div>
                    <div className="spec-item standby">
                      <span className="spec-status-dot standby"></span>
                      <span>{t('home.docTrauma')}</span>
                      <span className="spec-state">{t('home.demoSample')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-main-grid">
            <div className="footer-col brand-col">
              <div className="footer-brand-title">HLERS</div>
              <p className="footer-brand-sub">{t('home.footerBrandSub')}</p>
              <p className="footer-mission-text">
                {t('home.footerMission')}
              </p>
              <div className="footer-system-status">
                <span className="status-dot-green"></span>
                <span>{t('home.footerHubsOnline')}</span>
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">{t('home.footerTriageHeading')}</h4>
              <ul className="footer-links-list">
                <li><a href="/emergency">{t('home.cardiac')}</a></li>
                <li><a href="/emergency">{t('home.stroke')}</a></li>
                <li><a href="/emergency">{t('home.trauma')}</a></li>
                <li><a href="/emergency">{t('home.burns')}</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">{t('home.footerHowItWorksHeading')}</h4>
              <ul className="footer-links-list">
                <li><a href="#bento-grid">{t('home.step1Title')}</a></li>
                <li><a href="#bento-grid">{t('home.step2Title')}</a></li>
                <li><a href="#bento-grid">{t('home.step3Title')}</a></li>
                <li><a href="/emergency">{t('home.hlersLi1')}</a></li>
              </ul>
            </div>

            <div className="footer-col hotlines-col">
              <h4 className="footer-heading">{t('home.footerHotlinesHeading')}</h4>
              <div className="hotline-card">
                <span className="hotline-label">{t('home.hotlineNational')}</span>
                <a href="tel:108" className="hotline-number">108</a>
              </div>
              <div className="hotline-card">
                <span className="hotline-label">{t('home.hotlinePolice')}</span>
                <a href="tel:100" className="hotline-number sub">100</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p className="footer-disclaimer">
              <strong>{t('home.footerNotice')}</strong> {t('home.footerNoticeText')}
            </p>
            <p className="footer-copyright">{t('home.footerCopyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
