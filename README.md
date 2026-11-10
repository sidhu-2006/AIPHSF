# HLERS — HyperLocal Emergency Routing System

HLERS is a student project prototype for exploring location-based hospital search. It keeps the existing React/Vite client, Express API, MongoDB database, and Python/Flask scoring service.

## Demonstration and safety notice

The hospital records in `server/seed.js`, including contacts, locations, specialists, bed counts, and operational status, are **illustrative demonstration data**. They are not verified or current. Do not use these records to make care decisions. The application does not diagnose, confirm hospital capacity, reserve beds, or notify hospitals. Selecting a hospital only saves a demonstration record in the local database. Call emergency services or the hospital directly for real assistance.

## Features in this prototype

- Select cardiac, stroke, accident/trauma, respiratory, burns, or other emergency categories. The selection is a search category, not diagnosis or triage.
- Use browser GPS or enter latitude and longitude manually. Manual coordinates avoid a geocoding API dependency.
- Search the sample hospital records by location and category.
- View sample contact, specialist, and capacity fields with straight-line distances. A selected destination can request an estimated road route from the public OSRM demo service; it has no live traffic.
- Save a hospital selection to the local database. This does not contact the hospital.
- Use the existing English, Hindi, and Marathi interface.

## Technology

- Frontend: React, Vite, React Router, React Leaflet, Leaflet, and OpenStreetMap tiles.
- Backend: Node.js, Express, Mongoose, and MongoDB.
- Scoring service: Python, Flask, NumPy, and scikit-learn.

## Windows setup

Install Node.js (with npm), MongoDB Community Server, and Python. Start MongoDB before the API. Open three PowerShell windows in the `HLERS-main` folder.

### 1. Configure and start the API

```powershell
cd server
npm install
Copy-Item .env.example .env
```

The example is set up for local development. Confirm `MONGODB_URI=mongodb://localhost:27017/hlers`, `CLIENT_URL=http://localhost:5173`, and `ML_SERVICE_URL=http://localhost:5001/score`. Maps use OpenStreetMap tiles and require no map API key. Road routes use the public OSRM demo endpoint, which is best-effort, has no uptime guarantee, and must be queried at no more than one request per second. Do not use it for bulk requests or offline tile downloads. If the service is unavailable, maps and straight-line distances remain usable. Follow the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/) and the [OSRM demo server usage guidance](https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server).

Seed the demonstration records, then run the API:

```powershell
node seed.js
npm run dev
```

**Warning:** `node seed.js` clears the `hospitals` collection in the selected database before inserting sample records. Use a disposable local database.

### 2. Start the scoring service

```powershell
cd ml
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

If Python 3.12 is not installed, use a Python version compatible with the pinned dependencies. The service listens on `http://localhost:5001`.

### 3. Configure and start the website

In another PowerShell window:

```powershell
cd client
npm install
```

Create `client/.env` with:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Only `VITE_API_URL` is required. Then start Vite:

```powershell
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. Browser GPS works on localhost when permission is granted; if permission is denied, enter coordinates manually. For a Pune demo, coordinates near `18.5204, 73.8567` are a reasonable sample starting point.

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `MONGODB_URI` | API and seed script | MongoDB connection; required |
| `PORT` | API | API port; defaults to `5000` |
| `CLIENT_URL` | API | Allowed browser origin; defaults to Vite localhost |
| `ML_SERVICE_URL` | API | Scoring service URL; defaults to `http://localhost:5001/score` |
| `VITE_API_URL` | Client | API base URL, including `/api`; required |

The map displays the OpenStreetMap attribution on screen. Its standard tile server has a fair-use policy and no service-level guarantee. Avoid bulk downloads, prefetching, and offline use. The OSRM public demo service is a shared demonstration endpoint; the application limits route lookups to one per second, but the service can still be unavailable.

Keep real secrets out of source control. The repository `.gitignore` excludes `.env` files.

## License and attribution

This project retains the MIT license and original attribution in `LICENSE` (Copyright © 2026 Manjiri Kench). Preserve that notice when redistributing the project.
