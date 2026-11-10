# HLERS API Endpoints

These endpoints serve a local student demonstration. Hospital contact, specialist, location, capacity, and operating-status data are sample values. The API does not notify hospitals or reserve beds.

## Hospitals

### GET `/api/hospitals`
Returns all sample hospital records.

### GET `/api/hospitals/:id`
Returns one hospital record by ID.

### POST `/api/hospitals`
Creates a hospital record after schema validation.

### PATCH `/api/hospitals/:id/capacity`
Updates sample fields: `availableICUBeds`, `currentLoad`, `emergencyDeptOpen`, and `specialists`. This does not represent a verified hospital update.

### POST `/api/hospitals/nearby`
Searches open sample records by coordinates and emergency category, then returns heuristic rankings with `distanceMeters` and `straightLineDistanceKm`. These are straight-line distances, not driving distances. Sample capacity and specialist fields are unverified.

## Emergency requests

### POST `/api/emergencies`
Stores a demo request. Required fields: `emergencyType`, `patientAge`, and `userLocation`.

### GET `/api/emergencies`
Returns stored demo requests with any linked hospital populated.

Supported emergency categories include cardiac, stroke, trauma, respiratory, burns, and other.

## Demo selections

### POST `/api/alerts`
Stores a selected hospital and demo request details in MongoDB. Required fields: `hospitalId`, `emergencyType`, and `patientAge`. The response includes `demoOnly: true`. **No network message is sent to a hospital.**

### GET `/api/alerts`
Returns stored demo selections with hospital name, address, and phone fields populated.

## Local health check

### GET `/health`
Returns the API process status. It does not check hospital data or clinical service availability.

## Frontend routes

- `/`: Project overview and demo notice.
- `/emergency`: Emergency category selection and GPS/manual coordinate entry.
- `/hospitals`: Nearby sample records and ranking.
- `/alert-confirmation`: Confirms that a demo selection was recorded locally.
- `*`: Not-found page.
