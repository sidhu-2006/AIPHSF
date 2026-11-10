# HLERS — Security Implementation Notes

## Security Approach
HLERS follows the Secure Software Development Lifecycle (SSDLC).
Every security measure was built before the feature it protects, 
not added after.

## Implemented Security Layers

### 1. Helmet.js
- Sets 14 HTTP security headers automatically on every request
- Prevents clickjacking, MIME sniffing, and XSS attacks
- Applied: server/index.js

### 2. CORS
- Controls which domains can send requests to the backend
- Currently open for development, will be restricted on deployment
- Applied: server/index.js

### 3. JSON Payload Limiting
- All incoming requests capped at 10kb
- Prevents JSON payload bomb attacks
- Applied: server/index.js

### 4. Custom NoSQL Sanitizer
- Strips MongoDB operators ($gt, $where, $regex) from all requests
- Prevents NoSQL injection attacks
- Written from scratch for Node.js v24 compatibility
- Applied: server/middleware/sanitize.js
- Tested and verified: injection attempt returned 400 ValidationError

### 5. HTTP Parameter Pollution Protection
- Removes duplicate query parameters from requests
- Prevents parameter pollution attacks
- Applied: server/index.js

### 6. Rate Limiting
- Global: 100 requests per 15 minutes per IP
- Emergency endpoints: 10 requests per minute per IP
- Tested and verified: 11th request returns 429 Too Many Requests
- Applied: server/index.js

### 7. Schema Validation
- All fields validated at database level by Mongoose
- Enum restrictions on emergency types and specialist types
- Min/max on numeric fields (ICU beds, current load)
- Required fields enforced before any data touches MongoDB

### 8. Whitelist-based Updates
- PATCH endpoint only allows 4 specific fields to be updated
- All other fields in request body are silently ignored
- Prevents mass assignment attacks
- Applied: server/routes/hospitalRoutes.js

### 9. Environment Variables
- All secrets in .env file blocked from GitHub by .gitignore
- .env.example provided as safe template
- Applied: server/.env + server/.env.example

### 10. Minimal Error Exposure
- Only error.message logged, never full error objects
- Generic error messages returned to client
- Internal server details never exposed in responses
- Applied: all route files

## Security Tests Performed
- NoSQL injection attempt — blocked ✅
- Rate limit breach — blocked ✅
- Oversized payload — blocked ✅
- Invalid field types — rejected by schema ✅
- Mass assignment attempt — ignored by whitelist ✅