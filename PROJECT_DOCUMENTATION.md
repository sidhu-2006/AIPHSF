# HLERS — HyperLocal Emergency Routing System
## Technical Architecture, Product Specification & Security Portfolio
**Author / Lead Engineer:** Manjiri Kench (Pune, India)  
**Project Category:** Student demonstration / geospatial search / heuristic ranking

> **Phase 1 prototype status:** This repository is a student demonstration. Hospital names, contacts, locations, specialists, bed counts, and operating status in the seed data are illustrative and unverified. The app does not diagnose, confirm capacity, reserve beds, or notify hospitals. A hospital selection is stored only in the demo database. Do not use it to make real care decisions.

---

# 1. Executive Summary & Product Vision

### The Problem
During critical medical emergencies in India (such as acute cardiac arrest, massive stroke, severe trauma, or major burn injuries), **time-to-appropriate-care is the single biggest factor governing patient survival**. 

Existing consumer navigation tools (e.g., standard Google Maps) only locate the physically closest building labeled "Hospital." They possess **zero visibility** into real-time clinical and operational telemetry:
- *Is the ICU currently at 100% capacity?*
- *Is an acute cardiac Cath-Lab or Cardiologist on duty right now?*
- *Is the Emergency Department temporarily closed due to overload?*
- *What is the actual traffic-adjusted driving ETA to reach that specific emergency room?*

Choosing a hospital purely based on physical distance often leads to **life-threatening delays** if the patient arrives at a facility that cannot admit or treat them immediately, forcing a emergency re-transfer.

### The Solution: HLERS
**HLERS (HyperLocal Emergency Routing System)** is a prototype that demonstrates location-based filtering and ranking of sample hospital records for Pune. It is not an operational dispatch service.

The current prototype searches a seeded sample dataset and applies a heuristic ranking formula. It does not receive real-time clinical availability, specialist readiness, or hospital load, and it does not dispatch patients.

---

# 2. Key Product Capabilities

```
  [1. Emergency Category Selection] ──► [2. Heuristic Sample Ranking]
                                                      │
                                                      ▼
  [4. Optional Map Preview] ◄────────── [3. Local Demo Selection Record]
```

1. **Emergency Category Selection**: The form offers cardiac, stroke, accident/trauma, respiratory, burns, and other categories. This is not medical diagnosis or triage.
2. **Location Search**: The user may allow browser GPS or enter latitude and longitude manually. MongoDB performs the nearby sample-record search.
3. **Heuristic Ranking**: The Python service applies a weighted scoring formula to sample facility fields. It is not a trained model and its output is not a clinical recommendation.
4. **Demo Selection Record**: Selecting a facility saves a record to MongoDB. No message is transmitted to the facility and no bed is reserved.
5. **Map Features**: React Leaflet displays OpenStreetMap tiles. Recommendations use straight-line distance; the selected-hospital route preview uses the public OSRM demo service and has no live traffic.

---

# 3. System Architecture & Technical Deep Dive

HLERS keeps the supplied client, API, database, and scoring service as separate local processes. This separation is for the project structure; it does not establish production reliability or scalability.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|               React.js + Vite + Context API + React Leaflet / OSM                  |
+--------------------------------─────────┬────────────────────────────────---------+
                                          |
                                          | REST API (HTTPS / JSON)
                                          ▼
+-----------------------------------------------------------------------------------+
|                                 BACKEND LAYER                                     |
|           Node.js + Express.js API Server (Port 5000)                             |
|    Security: Helmet.js | Rate Limiters | NoSQL Sanitizer | HPP | CORS             |
+──────────────────┬──────────────────────────────────────────┬─────────────────────+
                   │                                          │
                   │ Mongoose ODM                             │ Axios HTTP RPC
                   ▼                                          ▼
+──────────────────────────────────+       +────────────────────────────────────────+
|          DATABASE LAYER          |       |                ML LAYER                |
|      MongoDB Database            |       |     Python 3 + Flask API (Port 5001)   |
|   (2dsphere GeoJSON Indexing)    |       |   scikit-learn (MinMaxScaler Scorer)   |
+──────────────────────────────────+       +────────────────────────────────────────+
```

---

# 4. Component-by-Component Breakdown & Purpose

### 4.1 Frontend Application (`/client`)
- **Technology:** React.js, Vite, React Router, React Leaflet, Leaflet, OpenStreetMap tiles, Context API.
- **Purpose:** Provides the user interface for a student demonstration. It is not an emergency service.
- **Key Modules:**
  - `EmergencyForm.jsx`: Emergency category, GPS/manual coordinates, and sample search.
  - `HospitalList.jsx`: Ranked sample records with explicit demo-data notices.
  - `AlertConfirmation.jsx`: Confirms a locally recorded demo selection; it does not indicate hospital notification.
  - `MapView.jsx`: Responsive Leaflet map with patient and hospital markers, browser GPS tracking, route preview, and turn-step list. The route and time are estimates without live traffic.

### 4.2 Core API Microservice (`/server`)
- **Technology:** Node.js, Express.js.
- **Purpose:** Serves the client, queries the sample dataset, calculates straight-line distances, calls the heuristic scoring service, and stores demo records.
- **Key Services & Routes:**
  - `hospitalRoutes.js`: Exposes `/api/hospitals/nearby` with `$near` GeoJSON queries.
  - `emergencyRoutes.js`: Handles emergency request logging.
  - `alertRoutes.js`: Stores a local demo selection record; it does not send a hospital notification.
  - Nearby hospital search returns Haversine straight-line distance. The browser requests the selected destination road route from OSRM's shared public demo service.
  - `mlService.js`: Performs internal HTTP RPC calls to the Python ML microservice.

### 4.3 Heuristic Scoring Microservice (`/ml`)
- **Technology:** Python 3, Flask, NumPy, scikit-learn (`MinMaxScaler`).
- **What It Does:** Applies a small weighted ranking formula to sample hospital fields. It does not train a model or diagnose a patient; the separate service is retained from the starting architecture.

### 4.4 Geospatial Database (`/server/models`)
- **Technology:** MongoDB, Mongoose ODM.
- **Purpose:** Uses GeoJSON `Point` schemas and a `2dsphere` index for proximity queries. Query latency depends on the local environment and dataset.

---

# 5. Heuristic Ranking Formula & Limitations

The Python service applies a heuristic score to the current sample candidates and normalizes values with `MinMaxScaler`. It is not a trained machine-learning model or clinical assessment. The current code declares an emergency-open weight but does not include it in the scoring matrix; also, category-matched candidates already pass the database filter, so the emergency-match factor does not meaningfully distinguish them. Treat scores as prototype output only.

$$\text{Prototype Score} = 100 \times \left( 0.30 \cdot S_{\text{match}} + 0.25 \cdot S_{\text{icu}} + 0.20 \cdot S_{\text{load}} + 0.15 \cdot S_{\text{distance}} \right)$$

### Factor Breakdown
1. **Emergency & Specialist Match Score ($S_{\text{match}}$, Weight: 30%)**: A sample emergency-category and specialist field check. Seed values are not confirmed, and the current cap means the specialist bonus may not change matching-candidate scores.
2. **ICU Bed Availability Ratio ($S_{\text{icu}}$, Weight: 25%)**:
   - Ratio $= \frac{\text{Available ICU Beds}}{\text{Total ICU Beds}}$.
3. **Current Facility Occupancy Load ($S_{\text{load}}$, Weight: 20%)**:
   - Inverse load factor $= 1 - \frac{\text{Current Load}}{10}$.
4. **Straight-line Distance ($S_{\text{distance}}$, Weight: 15%)**:
   - Inverse normalized Haversine distance $= 1 - \frac{\min(\text{Distance Metres}, 30000)}{30000}$. This is not driving distance or travel time.

The four implemented weights total 0.90, so the displayed result is a relative prototype score, not a calibrated probability. A single candidate is assigned a fixed score of 85 in the current implementation.

---

# 6. Built-in Security Architecture (Protected from Day 1)

Security in an emergency medical application is critical to prevent denial-of-service, data tampering, or unauthorized access. HLERS incorporates security best practices into its core code from day one:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SECURITY DEFENSE LAYERS                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. HTTP Security Headers       ──►  Helmet.js Middleware               │
│ 2. Rate Limiting / DoS         ──►  express-rate-limit (10 req/min)     │
│ 3. NoSQL Injection Defense     ──►  Custom Request Sanitizer           │
│ 4. Parameter Pollution Guard   ──►  HPP Middleware                     │
│ 5. Strict Payload Size Limits  ──►  express.json({ limit: '10kb' })    │
│ 6. Strict Data Validation      ──►  Mongoose Schema Range Validation   │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Helmet.js HTTP Security Headers**: Secures Express HTTP responses by setting X-Content-Type-Options, Strict-Transport-Security (HSTS), X-Frame-Options (clickjacking protection), and hiding `X-Powered-By: Express`.
2. **Multi-Tier Rate Limiting (Anti-DoS Protection)**:
   - **Global Limiter**: Caps general API endpoints to 100 requests per 15-minute window.
   - **Emergency Endpoint Limiter**: Caps requests to emergency and demo-selection endpoints at **10 requests per minute** per IP.
3. **NoSQL Injection Sanitization**: Implemented custom request sanitization middleware (`sanitize.js`) that strips dangerous MongoDB operators (`$gt`, `$where`, `$ne`, etc.) from incoming query params and body objects.
4. **HTTP Parameter Pollution (HPP) Defense**: Integrated `hpp` middleware to prevent attackers from causing server errors or unexpected behavior via duplicated URL parameters.
5. **Strict Request Body Size Capping**: Server limits JSON payload size to `10kb` (`express.json({ limit: '10kb' })`), preventing memory exhaustion attacks via large body payloads.
6. **Mongoose Schema Level Validation**: Enforces strict enum checks (e.g. valid emergency categories), numeric range constraints (`currentLoad: 0..10`, `patientAge: 0..120`), and 10-digit phone number regex patterns (`/^[0-9]{10}$/`).

---

# 7. Sample Dataset & Geospatial Search (32 Seed Entries)

The seed script contains **32 illustrative Pune-area entries** spanning multiple localities. Names, phone numbers, locations, staffing, capacity, and status have not been verified and must not be treated as operational hospital information:

- **Locations Covered**: Kothrud, Hadapsar, Wakad, Pimpri-Chinchwad (PCMC), Baner, Aundh, Shivajinagar, Deccan, Swargate, Sahakarnagar, Bibwewadi, Kondhwa, Wanowrie, Camp, Koregaon Park, Viman Nagar, Kharadi, Yerawada, Sinhagad Road, Warje, Pashan, Hinjawadi, and Gangadham.
- **Key Featured Hospitals**: Ruby Hall Clinic (Sassoon Rd & Wanowrie), Deenanath Mangeshkar, Sassoon General, KEM Hospital, Jehangir, Sahyadri Kothrud & Warje, Aditya Birla Memorial, Jupiter Baner, Ace Hospital & Research Centre, Rao Nursing Home, Namoh Hospital, Noble Hadapsar, Command Hospital Pashan, and more.
- **Stress-Test Scenarios Included**: Closed ERs, Zero-bed ICUs, High-occupancy facilities (load 8-10), and specialized-only clinics.

---

# 8. Technical Stack Summary

| Layer | Technologies & Tools |
|---|---|
| **Frontend UI** | React.js (v19), Vite, CSS, React Router (v7), React Leaflet |
| **Backend API** | Node.js, Express.js, Axios, dotenv, CORS |
| **Database** | MongoDB, Mongoose ODM, GeoJSON 2dsphere Indexing |
| **Heuristic Ranking** | Python 3, Flask, NumPy, scikit-learn (`MinMaxScaler`) |
| **Maps & Routing** | Leaflet, OpenStreetMap tiles, OSRM public demo route service, Geolocation API |
| **Security** | Helmet.js, express-rate-limit, HPP, NoSQL Sanitizer |

---

# 9. Current Prototype Limits

HLERS demonstrates a student-level full-stack flow using geospatial queries, heuristic ranking, an optional map integration, and local demo records. Seeded hospital and clinical data are unverified; there is no hospital notification integration, bed reservation, or live capacity feed. This repository must not be represented as ready for real-world emergency use.
