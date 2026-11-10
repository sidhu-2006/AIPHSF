# HLERS — Database Schema Design

## Database: MongoDB
## Collections: 3

---

## 1. hospitals

Stores seeded demonstration hospital records. Values are not verified or current.

| Field              | Type        | Description                                      |
|--------------------|-------------|--------------------------------------------------|
| _id                | ObjectId    | Auto-generated unique ID                         |
| name               | String      | Hospital name                                    |
| address            | String      | Full address                                     |
| location           | GeoJSON     | { type: "Point", coordinates: [lng, lat] }       |
| phone              | String      | Emergency contact number                         |
| emergencyTypes     | [String]    | e.g. ["cardiac", "trauma", "burns", "stroke"]    |
| totalICUBeds       | Number      | Total ICU bed capacity                           |
| availableICUBeds   | Number      | Currently available ICU beds                     |
| specialists        | [Object]    | [{ name, type, available: true/false }]          |
| emergencyDeptOpen  | Boolean     | Is emergency dept open right now?                |
| currentLoad        | Number      | Active emergencies being handled (0–10 scale)    |
| lastUpdated        | Date        | When capacity info was last updated              |

---

## 2. emergencyRequests

Stores each emergency request made by a user.

| Field            | Type      | Description                                      |
|------------------|-----------|--------------------------------------------------|
| _id              | ObjectId  | Auto-generated unique ID                         |
| emergencyType    | String    | "cardiac", "trauma", "burns", "stroke", "other"  |
| patientAge       | Number    | Approximate age of patient                       |
| userLocation     | GeoJSON   | { type: "Point", coordinates: [lng, lat] }       |
| notes            | String    | Optional brief notes (max 100 chars)             |
| recommendedHospital | ObjectId | Reference to hospitals._id                    |
| status           | String    | "pending", "routed", "admitted"                  |
| createdAt        | Date      | Timestamp of request                             |

---

## 3. alerts

Stores local demo hospital selections. No hospital notification is sent.

| Field          | Type      | Description                                      |
|----------------|-----------|--------------------------------------------------|
| _id            | ObjectId  | Auto-generated unique ID                         |
| hospitalId     | ObjectId  | Reference to hospitals._id                       |
| emergencyType  | String    | Type of emergency                                |
| patientAge     | Number    | Approximate patient age                          |
| notes          | String    | Brief patient notes                              |
| createdAt      | Date      | When the demo selection was recorded             |
| status         | String    | "demo_recorded" for selections created by this prototype |

---

## Key Design Decisions

- location fields use GeoJSON Point format — required for MongoDB $near geospatial queries
- hospitals.currentLoad is a 0–10 scale updated manually for prototype; later can be automated
- No patient name/identity stored — privacy by design (important for patent and real-world use)
- specialists stored as array of objects so we can filter by type (cardiologist, trauma surgeon, etc.)
