let lastRequestAt = 0
let requestQueue = Promise.resolve()

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

function requestAfterLimit(task) {
  const queued = requestQueue.then(async () => {
    const wait = Math.max(0, 1000 - (Date.now() - lastRequestAt))
    if (wait) await delay(wait)
    lastRequestAt = Date.now()
    return task()
  })
  requestQueue = queued.catch(() => {})
  return queued
}

export function formatDistance(meters) {
  if (!Number.isFinite(meters)) return 'Distance unavailable'
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
}

export function fetchDrivingRoute(origin, destination) {
  return requestAfterLimit(async () => {
    const coordinates = `${origin.longitude},${origin.latitude};${destination[1]},${destination[0]}`
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true&alternatives=false`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Routing service returned ${response.status}`)
    const data = await response.json()
    const selectedRoute = data.routes?.[0]
    if (data.code !== 'Ok' || !selectedRoute) throw new Error('No route found')
    const steps = selectedRoute.legs.flatMap((leg) => leg.steps).map((step) => {
      const action = step.maneuver?.modifier || step.maneuver?.type || 'Continue'
      const [longitude, latitude] = step.maneuver?.location || []
      return {
        instruction: `${action.replaceAll('_', ' ')}${step.name ? ` onto ${step.name}` : ''}`,
        distanceMeters: step.distance,
        maneuverLocation: Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : null
      }
    })
    return { geometry: selectedRoute.geometry, distanceMeters: selectedRoute.distance, durationSeconds: selectedRoute.duration, steps }
  })
}
