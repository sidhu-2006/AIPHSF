import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'
import { fetchDrivingRoute, formatDistance } from '../services/routeService'

const hospitalIcon = new L.Icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})
const targetIcon = new L.Icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [28, 46], iconAnchor: [14, 46], popupAnchor: [1, -38], shadowSize: [46, 46],
  className: 'hlers-target-marker'
})

const coordinatesFor = (hospital) => {
  const coords = hospital?.location?.coordinates
  return Array.isArray(coords) && coords.length >= 2 ? [coords[1], coords[0]] : null
}

function MapViewport({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [36, 36], maxZoom: 15 })
    else if (points.length === 1) map.setView(points[0], 14)
  }, [map, points])
  return null
}

function MapView({ hospitals = [], userLocation, targetHospital, mode = 'overview', isNavigating = false, onRouteUpdate }) {
  const [gpsPosition, setGpsPosition] = useState(null)
  const [routeState, setRouteState] = useState(null)
  const [routeErrorKey, setRouteErrorKey] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [showSteps, setShowSteps] = useState(false)
  const activeStepRef = useRef(0)
  const routeRef = useRef(null)
  const liveUserPos = gpsPosition || userLocation || null
  const effectiveTarget = targetHospital || (hospitals.length === 1 ? hospitals[0] : null)
  const destination = useMemo(() => coordinatesFor(effectiveTarget), [effectiveTarget])
  const originKey = userLocation ? `${userLocation.latitude},${userLocation.longitude}` : ''
  const destinationKey = destination ? `${destination[0]},${destination[1]}` : ''
  const currentRouteKey = `${originKey}|${destinationKey}`
  const route = routeState?.key === currentRouteKey ? routeState.data : null
  const routeError = routeErrorKey === currentRouteKey

  useEffect(() => {
    if (!isNavigating || !navigator.geolocation) return undefined
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const position = { latitude: coords.latitude, longitude: coords.longitude }
        setGpsPosition(position)
        const maneuver = routeRef.current?.steps?.[activeStepRef.current]?.maneuverLocation
        if (maneuver) {
          const latitudeDelta = (maneuver[0] - position.latitude) * Math.PI / 180
          const longitudeDelta = (maneuver[1] - position.longitude) * Math.PI / 180
          const a = Math.sin(latitudeDelta / 2) ** 2
            + Math.cos(position.latitude * Math.PI / 180) * Math.cos(maneuver[0] * Math.PI / 180)
            * Math.sin(longitudeDelta / 2) ** 2
          const meters = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          if (meters < 30 && activeStepRef.current < routeRef.current.steps.length - 1) {
            activeStepRef.current += 1
            setActiveStep(activeStepRef.current)
          }
        }
      },
      (error) => console.warn('GPS tracking unavailable:', error.message),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [isNavigating])

  useEffect(() => {
    let cancelled = false
    if (mode === 'overview' || !userLocation || !destination) {
      onRouteUpdate?.(null)
      return undefined
    }
    fetchDrivingRoute(userLocation, destination).then((result) => {
      if (cancelled) return
      const routeWithManeuvers = { ...result, destinationKey }
      routeRef.current = routeWithManeuvers
      setRouteState({ key: currentRouteKey, data: routeWithManeuvers })
      setRouteErrorKey('')
      activeStepRef.current = 0
      setActiveStep(0)
      onRouteUpdate?.(result)
    }).catch(() => {
      if (cancelled) return
      setRouteErrorKey(currentRouteKey)
      onRouteUpdate?.(null)
    })
    return () => { cancelled = true }
  }, [mode, currentRouteKey, destination, destinationKey, userLocation, onRouteUpdate])

  const points = useMemo(() => {
    const listed = hospitals.map(coordinatesFor).filter(Boolean)
    const origin = liveUserPos ? [liveUserPos.latitude, liveUserPos.longitude] : null
    return [...(origin ? [origin] : []), ...listed]
  }, [hospitals, liveUserPos])
  const center = points[0] || [18.5204, 73.8567]
  const routePositions = route?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || []
  const steps = useMemo(() => route?.steps || [], [route])

  return (
    <div className="map-gps-wrapper">
      {mode !== 'overview' && route && isNavigating && (
        <div className="gps-turn-hud">
          <div className="hud-primary-row">
            <div className="hud-instruction">
              <span className="hud-next-step">{steps[activeStep]?.instruction || `Route to ${effectiveTarget?.name}`}</span>
              <span className="hud-sub-metric">{formatDistance(steps[activeStep]?.distanceMeters || route.distanceMeters)} · {Math.round(route.durationSeconds / 60)} min estimate · no live traffic</span>
            </div>
            <button className="hud-toggle-btn" onClick={() => setShowSteps(!showSteps)}>{showSteps ? 'Hide' : 'Turns'}</button>
          </div>
          {showSteps && <div className="hud-steps-list">{steps.map((step, index) => (
              <button type="button" key={`${index}-${step.instruction}`} className={`step-item ${activeStep === index ? 'current' : ''}`} onClick={() => { activeStepRef.current = index; setActiveStep(index) }}>
              <span className="step-num">{index + 1}</span><span className="step-text">{step.instruction}</span><span className="step-dist">{formatDistance(step.distanceMeters)}</span>
            </button>
          ))}</div>}
        </div>
      )}
      {mode !== 'overview' && routeError && <div className="map-route-message" role="status">Road route unavailable. Straight-line distance remains available.</div>}
      {mode !== 'overview' && !liveUserPos && <div className="map-route-message" role="status">Set a location to preview the road route.</div>}
      <MapContainer center={center} zoom={13} scrollWheelZoom className="hlers-leaflet-map">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapViewport points={points} />
        {liveUserPos && <CircleMarker center={[liveUserPos.latitude, liveUserPos.longitude]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#0d7377', fillOpacity: 1 }}>
          <Popup><strong>Your location</strong><br />GPS/manual location</Popup>
        </CircleMarker>}
        {hospitals.map((hospital) => {
          const position = coordinatesFor(hospital)
          if (!position) return null
          const isTarget = hospital._id === effectiveTarget?._id
          return <Marker key={hospital._id || hospital.name} position={position} icon={isTarget ? targetIcon : hospitalIcon}>
            <Popup><strong>{hospital.name}</strong><br />{hospital.address}<br />{hospital.straightLineDistanceKm != null ? `${hospital.straightLineDistanceKm} km straight-line` : 'Demonstration record'}<br /><small>Sample hospital information · verify directly</small></Popup>
          </Marker>
        })}
        {routePositions.length > 1 && <Polyline positions={routePositions} pathOptions={{ color: '#0F5E63', weight: 5, opacity: 0.85 }} />}
        {mode !== 'overview' && isNavigating && liveUserPos && <MapLocationUpdater position={liveUserPos} />}
      </MapContainer>
      <div className="map-attribution-note">Road route/time is an estimate; no traffic data. Map &copy; OpenStreetMap contributors.</div>
    </div>
  )
}

function MapLocationUpdater({ position }) {
  const map = useMap()
  useEffect(() => { map.panTo([position.latitude, position.longitude], { animate: true }) }, [map, position.latitude, position.longitude])
  return null
}

export default MapView
