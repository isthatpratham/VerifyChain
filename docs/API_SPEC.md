# API_SPEC.md — VerifyChain REST API Specification

Base URL: `http://localhost:5000/api`
Format: JSON
Authentication: `Authorization: Bearer <JWT>` on protected routes

---

## Standard Response Shapes

**Success:**
```json
{ "data": "...", "message": "optional success message" }
```

**Error:**
```json
{ "error": "Human readable description" }
```

**Validation Error:**
```json
{
  "error": "Validation failed",
  "details": [{ "field": "gstin", "message": "GSTIN must be 15 characters" }]
}
```

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation / client error |
| 401 | Unauthenticated |
| 403 | Wrong role |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |

---

## SYSTEM

### GET /health

```json
{ "status": "ok", "timestamp": "2026-06-28T10:00:00.000Z" }
```

---

## AUTH

### POST /auth/register

Create MSME owner account.

**Auth:** None

**Body:**
```json
{
  "name": "Ramesh Gupta",
  "email": "ramesh@example.com",
  "password": "MyPass@123",
  "phone": "9876543210"
}
```

**Validation:**
- `name`: required, 2–100 chars
- `email`: required, valid format
- `password`: required, min 8 chars
- `phone`: optional, 10-digit Indian mobile

**Response 201:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Ramesh Gupta", "email": "ramesh@example.com", "role": "MSME_OWNER" }
}
```

---

### POST /auth/login

**Body:** `{ "email", "password" }`

**Response 200:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Ramesh Gupta", "email": "ramesh@example.com", "role": "MSME_OWNER", "msmeId": 1 }
}
```

---

### GET /auth/me

**Auth:** Required

**Response 200:**
```json
{
  "id": 1, "name": "Ramesh Gupta", "email": "ramesh@example.com",
  "role": "MSME_OWNER", "createdAt": "2026-06-01T10:00:00.000Z"
}
```

---

## MSME PROFILE

### POST /msme/profile

Create MSME business profile (called once after registration).

**Auth:** Required (MSME_OWNER)

**Body:**
```json
{
  "businessName": "Gupta Textiles Pvt Ltd",
  "gstin": "27AABCU9603R1ZX",
  "udyamNumber": "UDYAM-MH-00-0012345",
  "businessType": "MANUFACTURING",
  "sector": "Textiles",
  "state": "Maharashtra",
  "district": "Surat",
  "employeeCount": 12,
  "annualTurnoverLakh": 45.5,
  "isFoodBusiness": false
}
```

**Validation:**
- `gstin`: required, 15-char alphanumeric, regex: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`
- `udyamNumber`: required, format: `UDYAM-XX-00-0000000`
- `businessType`: required, enum value
- `businessName`, `sector`, `state`, `district`: required strings
- `employeeCount`: required, integer >= 0

**Response 201:**
```json
{
  "msmeProfile": {
    "id": 1,
    "businessName": "Gupta Textiles Pvt Ltd",
    "gstin": "27AABCU9603R1ZX",
    "isProfileComplete": false
  },
  "message": "Profile created. Compliance data is being fetched."
}
```

**Side effect:** Triggers `complianceFetcher.fetchAll(msmeId)` asynchronously.

---

### GET /msme/profile

Get current user's MSME profile.

**Auth:** Required

**Response 200:**
```json
{
  "id": 1,
  "businessName": "Gupta Textiles Pvt Ltd",
  "gstin": "27AABCU9603R1ZX",
  "udyamNumber": "UDYAM-MH-00-0012345",
  "businessType": "MANUFACTURING",
  "sector": "Textiles",
  "state": "Maharashtra",
  "district": "Surat",
  "employeeCount": 12,
  "annualTurnoverLakh": 45.5,
  "isFoodBusiness": false,
  "isProfileComplete": true,
  "lastComplianceSync": "2026-06-28T08:00:00.000Z"
}
```

---

### PATCH /msme/profile

Update MSME profile fields.

**Auth:** Required

**Body:** Any subset of profile fields (partial update).

**Response 200:** Updated profile object.

---

## COMPLIANCE

### GET /compliance/dashboard

Get compliance status for all authorities + health score.

**Auth:** Required

**Response 200:**
```json
{
  "score": 82,
  "level": "HIGH",
  "breakdown": [
    { "rule": "GST_COMPLIANT", "authority": "GST", "weight": 25, "type": "credit", "desc": "GST registration active and returns filed" },
    { "rule": "EPFO_COMPLIANT", "authority": "EPFO", "weight": 20, "type": "credit", "desc": "EPFO contributions current" },
    { "rule": "FSSAI_EXEMPT", "authority": "FSSAI", "weight": 10, "type": "credit", "desc": "FSSAI not applicable — non-food business (auto-exempt)" }
  ],
  "lastComputed": "2026-06-28T10:30:00.000Z",
  "authorities": [
    {
      "authority": "GST",
      "status": "COMPLIANT",
      "expiryDate": "2027-03-31T00:00:00.000Z",
      "lastChecked": "2026-06-28T08:00:00.000Z",
      "notes": "GSTR-3B filed on time"
    },
    {
      "authority": "EPFO",
      "status": "COMPLIANT",
      "expiryDate": null,
      "lastChecked": "2026-06-28T08:00:00.000Z",
      "notes": null
    },
    {
      "authority": "FSSAI",
      "status": "EXEMPT",
      "expiryDate": null,
      "lastChecked": "2026-06-28T08:00:00.000Z",
      "notes": "Non-food business"
    }
  ]
}
```

---

### POST /compliance/refresh

Manually trigger compliance data refresh.

**Auth:** Required

**Rate limit:** Once per 24 hours per MSME.

**Response 200:**
```json
{ "message": "Compliance data refreshed successfully.", "lastSync": "2026-06-28T10:30:00.000Z" }
```

**Response 429:**
```json
{ "error": "Compliance data was last refreshed less than 24 hours ago." }
```

---

## SUPPLIER CARD (PUBLIC)

### GET /buyer/card/:msmeId

**Auth:** None required — fully public endpoint.

**Response 200:**
```json
{
  "businessName": "Gupta Textiles Pvt Ltd",
  "gstin": "27AABCU9603R1ZX",
  "udyamNumber": "UDYAM-MH-00-0012345",
  "businessType": "MANUFACTURING",
  "sector": "Textiles",
  "state": "Maharashtra",
  "score": 82,
  "level": "HIGH",
  "lastVerified": "2026-06-28T08:00:00.000Z",
  "authorityBadges": [
    { "authority": "GST",   "status": "COMPLIANT" },
    { "authority": "EPFO",  "status": "COMPLIANT" },
    { "authority": "ESIC",  "status": "DUE" },
    { "authority": "MCA",   "status": "COMPLIANT" },
    { "authority": "UDYAM", "status": "COMPLIANT" },
    { "authority": "FSSAI", "status": "EXEMPT" }
  ]
}
```

**Side effect:** Creates a row in `buyer_view_logs`.

**Response 404:**
```json
{ "error": "Supplier profile not found." }
```

---

## DOCUMENTS

### POST /documents/upload

Upload a compliance certificate.

**Auth:** Required

**Content-Type:** `multipart/form-data`

**Fields:**
- `file`: The certificate file (PDF / PNG / JPG, max 5MB)
- `documentType`: e.g., `GST_CERTIFICATE`
- `authority`: e.g., `GST`
- `validityDate`: ISO date string (optional)
- `notes`: string (optional)

**Response 201:**
```json
{
  "id": 5,
  "fileName": "gst-certificate-2026.pdf",
  "documentType": "GST_CERTIFICATE",
  "authority": "GST",
  "validityDate": "2027-03-31T00:00:00.000Z",
  "uploadedAt": "2026-06-28T10:00:00.000Z"
}
```

**Response 400 (invalid type):**
```json
{ "error": "Only PDF, PNG, and JPG files are accepted." }
```

**Response 400 (too large):**
```json
{ "error": "File size exceeds the 5MB limit." }
```

---

### GET /documents

List all documents for the authenticated MSME.

**Auth:** Required

**Response 200:**
```json
{
  "documents": [
    {
      "id": 5,
      "fileName": "gst-certificate-2026.pdf",
      "documentType": "GST_CERTIFICATE",
      "authority": "GST",
      "validityDate": "2027-03-31T00:00:00.000Z",
      "fileSizeKb": 245,
      "uploadedAt": "2026-06-28T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### GET /documents/:id/download

Download a specific document.

**Auth:** Required (own documents only)

**Response:** File stream (Content-Type matches file type)

**Response 404:**
```json
{ "error": "Document not found." }
```

---

### DELETE /documents/:id

Delete a document.

**Auth:** Required (own documents only)

**Response 200:**
```json
{ "message": "Document deleted." }
```

---

## ALERTS

### GET /alerts

Get all alerts for the authenticated MSME.

**Auth:** Required

**Query:** `?status=PENDING` (optional filter)

**Response 200:**
```json
{
  "alerts": [
    {
      "id": 1,
      "authority": "ESIC",
      "threshold": "DAYS_15",
      "expiryDate": "2026-07-13T00:00:00.000Z",
      "status": "SENT",
      "sentAt": "2026-06-28T08:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

## SCHEMES

### GET /schemes/matches

Get government schemes matched to the authenticated MSME.

**Auth:** Required

**Response 200:**
```json
{
  "matches": [
    {
      "schemeId": 4,
      "schemeName": "CGTMSE — Credit Guarantee Scheme",
      "ministry": "Ministry of MSME",
      "description": "Collateral-free credit for micro and small enterprises.",
      "matchScore": 92,
      "matchReasons": [
        "Business type matches: MANUFACTURING",
        "Employee count within limit (≤50)",
        "Udyam registration verified"
      ],
      "benefitType": "Credit Guarantee",
      "maxBenefitLakh": 200,
      "applicationUrl": "https://www.cgtmse.in"
    }
  ],
  "total": 8
}
```

---

### POST /schemes/refresh-matches

Re-run scheme matcher for the current MSME profile.

**Auth:** Required

**Response 200:**
```json
{ "message": "Scheme matching complete.", "matchesFound": 8 }
```

---

### GET /schemes/:schemeId/explain

Get Ollama AI plain-language explanation of a scheme. Optional feature — degrades gracefully if Ollama is not running.

**Auth:** Required

**Response 200 (Ollama available):**
```json
{
  "schemeId": 4,
  "schemeName": "CGTMSE — Credit Guarantee Scheme",
  "explanation": "This scheme helps small businesses like yours get loans without providing collateral (like property or gold). The government guarantees up to ₹2 crore of the loan on your behalf..."
}
```

**Response 200 (Ollama unavailable):**
```json
{
  "schemeId": 4,
  "schemeName": "CGTMSE — Credit Guarantee Scheme",
  "explanation": null,
  "message": "AI explanation unavailable. Please visit the scheme URL for details."
}
```

---

## ADMIN

All admin endpoints require `role = ADMIN`.

### GET /admin/stats

**Response 200:**
```json
{
  "totalMsmes": 48,
  "byLevel": { "HIGH": 22, "MEDIUM": 18, "LOW": 8 },
  "totalAlertsSent": 124,
  "pendingAlerts": 7,
  "totalDocuments": 96,
  "totalSchemeMatches": 312
}
```

---

### GET /admin/msmes

List all MSMEs with compliance level.

**Auth:** Admin

**Query:** `?level=LOW&page=1&limit=20`

**Response 200:**
```json
{
  "msmes": [
    {
      "id": 1,
      "businessName": "Gupta Textiles Pvt Ltd",
      "gstin": "27AABCU9603R1ZX",
      "state": "Maharashtra",
      "score": 82,
      "level": "HIGH",
      "lastSync": "2026-06-28T08:00:00.000Z"
    }
  ],
  "total": 48,
  "page": 1,
  "limit": 20
}
```

---

### GET /admin/msmes/:msmeId

Get full MSME profile + compliance records. Admin view only.

**Response 200:** Full msme_profile object with nested compliance_records array.

---

### GET /admin/schemes

List all government schemes.

**Response 200:**
```json
{
  "schemes": [ { "id": 1, "schemeName": "...", "ministry": "...", "isActive": true } ],
  "total": 200
}
```

---

### PATCH /admin/schemes/:schemeId

Update a government scheme (active/inactive, update eligibility criteria).

**Body:** `{ "isActive": false }` or partial scheme fields.

**Response 200:** Updated scheme object.
