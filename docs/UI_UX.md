# UI_UX.md — VerifyChain Interface Design Guide

---

## 1. Design Philosophy

VerifyChain's UI must communicate compliance status with instant visual clarity. An MSME owner glancing at their dashboard must know in under 3 seconds whether they are buyer-ready or at risk.

**Design principles:**
- Score level (HIGH / MEDIUM / LOW) communicated through color before text is read
- Compliance badges per authority are scannable — not buried in tables
- Buyer card must be printable and shareable without login
- All pages work at 375px minimum width (mobile-first)
- Every page handles: loading, error, empty, success states

---

## 2. Design Tokens

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-high` | `#16A34A` | HIGH compliance, COMPLIANT badge |
| `--color-high-bg` | `#F0FDF4` | HIGH score card background |
| `--color-medium` | `#D97706` | MEDIUM compliance, DUE badge |
| `--color-medium-bg` | `#FFFBEB` | MEDIUM score card background |
| `--color-low` | `#DC2626` | LOW compliance, OVERDUE badge |
| `--color-low-bg` | `#FEF2F2` | LOW score card background |
| `--color-exempt` | `#6B7280` | EXEMPT badge (gray — neutral) |
| `--color-unknown` | `#9CA3AF` | UNKNOWN badge |
| `--color-brand` | `#1E40AF` | Primary brand (deep blue) |
| `--color-brand-light` | `#3B82F6` | Buttons, links |
| `--color-gray-50` | `#F9FAFB` | Page backgrounds |
| `--color-gray-900` | `#111827` | Headings |

### Tailwind Config Extensions

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: { DEFAULT: '#1E40AF', light: '#3B82F6' },
      high:   { DEFAULT: '#16A34A', bg: '#F0FDF4' },
      medium: { DEFAULT: '#D97706', bg: '#FFFBEB' },
      low:    { DEFAULT: '#DC2626', bg: '#FEF2F2' },
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    }
  }
}
```

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Display / Hero | Inter | 4xl–5xl | 700 |
| Heading | Inter | 2xl–3xl | 600 |
| Sub-heading | Inter | xl | 600 |
| Body | Inter | base (16px) | 400 |
| Label / Badge | Inter | sm (14px) | 500 |
| Score Number | Inter | 6xl | 700 |
| GSTIN / Code | `font-mono` | sm | 400 |

Google Fonts: `Inter:wght@400;500;600;700`

### Spacing & Radius

- Page horizontal padding: `px-4 sm:px-6 lg:px-8`
- Card padding: `p-6`
- Card radius: `rounded-2xl`
- Badge radius: `rounded-full`
- Button radius: `rounded-lg`
- Input radius: `rounded-lg`
- Section gap: `gap-6` or `gap-8`

---

## 3. Core Components

### ScoreRing

An animated circular progress ring displaying the compliance score (0–100) with level color.

```
         ┌─────────────┐
         │   ◯ ring    │
         │   82        │  ← Score number (font-bold text-6xl)
         │   HIGH      │  ← Level label (color-coded)
         └─────────────┘
```

**Props:** `{ score: Number, level: 'HIGH'|'MEDIUM'|'LOW' }`

**Implementation:** SVG circle with `stroke-dasharray` and `stroke-dashoffset` computed from score. Animate with CSS transition on mount.

**Colors:** Stroke color matches level: HIGH → `#16A34A`, MEDIUM → `#D97706`, LOW → `#DC2626`.

---

### ComplianceBadge

Per-authority status indicator.

```
[ ✓ GST COMPLIANT ]   ← green pill
[ ⚠ ESIC DUE       ]   ← amber pill
[ ✗ EPFO OVERDUE   ]   ← red pill
[ — FSSAI EXEMPT   ]   ← gray pill
[ ? MCA UNKNOWN    ]   ← light gray pill
```

**Props:** `{ authority: String, status: String }`

**Badge map:**
```javascript
const badgeStyles = {
  COMPLIANT: 'bg-green-100 text-green-800 border-green-200',
  DUE:       'bg-yellow-100 text-yellow-800 border-yellow-200',
  OVERDUE:   'bg-red-100 text-red-800 border-red-200',
  EXEMPT:    'bg-gray-100 text-gray-600 border-gray-200',
  UNKNOWN:   'bg-gray-50 text-gray-400 border-gray-100',
};

const badgeIcon = {
  COMPLIANT: '✓',
  DUE:       '⚠',
  OVERDUE:   '✗',
  EXEMPT:    '—',
  UNKNOWN:   '?',
};
```

---

### AlertCard

Displays a single compliance alert.

```
┌──────────────────────────────────────────────────────┐
│  ⚠  ESIC Renewal Due                                 │
│     Expiry: 13 July 2026 · 15 days remaining         │
│     Status: SENT   · Sent: 28 Jun 2026 08:02 AM      │
└──────────────────────────────────────────────────────┘
```

**Color-coded left border:** PENDING → yellow, SENT → green, FAILED → red.

---

### SupplierCard (Buyer-facing)

The public-facing card printed / shared with buyers. Full page render.

```
┌───────────────────────────────────────────────────────────┐
│  ✅ VerifyChain Verified Supplier                         │
│                                                           │
│  Gupta Textiles Pvt Ltd                                   │
│  GSTIN: 27AABCU9603R1ZX · UDYAM-MH-00-0012345            │
│  Manufacturing · Maharashtra                              │
│                                                           │
│  ┌───────────────┐   Compliance Health Score              │
│  │   82 HIGH     │   Last Verified: 28 Jun 2026           │
│  └───────────────┘                                        │
│                                                           │
│  [ ✓ GST ]  [ ✓ EPFO ]  [ ⚠ ESIC ]  [ ✓ MCA ]          │
│  [ ✓ UDYAM ] [ — FSSAI (exempt) ]                        │
│                                                           │
│  Powered by VerifyChain · verifychain.dev                │
└───────────────────────────────────────────────────────────┘
```

---

## 4. Page Designs

### Page 1: Landing (`/`)

**Purpose:** Communicate the problem and convert visitors into registered MSME owners.

```
NAVBAR: VerifyChain logo | Features | How It Works | Login | Register

HERO:
  5 in 10 MSMEs lose contracts because buyers can't verify their compliance.
  VerifyChain fixes that in 48 hours.
  [ Get Your Free Verified Profile ] → /register

STATS ROW:
  7.4 Cr MSMEs · ₹30L Cr Credit Gap · 6 Authorities in One Dashboard

HOW IT WORKS (3 steps):
  1. Register with GSTIN  →  2. Get Your Score  →  3. Share Your Card

FEATURE CARDS (3 columns):
  📊 Compliance Dashboard | ✅ Verified Supplier Card | 🔔 Expiry Alerts

SCHEME HIGHLIGHT:
  "Eligible for 200+ government schemes? Find out instantly."

FOOTER
```

**Empty state:** N/A — always renders.
**Mobile:** Single column; hero CTA button full-width.

---

### Page 2: Register (`/register`)

**Layout:** Centered card, max-width 440px.

**Fields:**
1. Full Name
2. Email Address
3. Password (min 8 chars)
4. Phone Number (optional)

**Post-register:** Redirect to `/dashboard` with a `Welcome! Set up your business profile` banner.

**Link:** Already have an account? → `/login`

---

### Page 3: Login (`/login`)

**Layout:** Centered card, max-width 440px.

**Post-login:** Redirect to `/dashboard`.

**Error:** Invalid credentials → inline banner above form.

---

### Page 4: Dashboard (`/dashboard`)

**Purpose:** The MSME owner's home. Central hub showing health at a glance.

```
HEADER: "Good morning, Ramesh" · Last sync: 28 Jun 08:00

SCORE HERO:
  ┌─────────────────────────────────────────────────────┐
  │  ScoreRing (82 / HIGH)    Compliance Health Score    │
  │                           82 out of 100 — Buyer Ready│
  │  [ View Full Report ]     Last computed: just now    │
  └─────────────────────────────────────────────────────┘

AUTHORITY GRID (2×3 on desktop, 1 column mobile):
  [ GST COMPLIANT ] [ EPFO COMPLIANT ] [ ESIC DUE ]
  [ MCA COMPLIANT ] [ UDYAM COMPLIANT ] [ FSSAI EXEMPT ]

ALERTS PREVIEW (top 3):
  ⚠ ESIC renewal due in 15 days → [ View All Alerts ]

QUICK ACTIONS:
  [ Share Supplier Card ] [ Upload Document ] [ View Schemes ]

COMPLIANCE SNAPSHOT (bar chart):
  Shows score trend if multiple refreshes have occurred
  (Chart.js horizontal bar per authority)
```

**States:**
- Loading: skeleton cards
- No profile yet: "Complete your business profile to see compliance data" → link to `/dashboard/setup`
- Error: "Could not load compliance data. Try refreshing."

---

### Page 5: Compliance Status (`/compliance`)

**Purpose:** Detailed view of all 6 authorities with explanations.

```
HEADER: Compliance Status · [ Refresh Data ] button

FOR EACH AUTHORITY (6 cards):
  ┌────────────────────────────────────────────────────────┐
  │  GST — Goods & Services Tax                            │
  │  Status: ✓ COMPLIANT                                   │
  │  Expiry: 31 March 2027                                 │
  │  Last Checked: 28 Jun 2026 08:00                       │
  │  Notes: GSTR-3B filed on time                          │
  │  [ Upload Certificate ]                                │
  └────────────────────────────────────────────────────────┘

SCORE BREAKDOWN TABLE:
  Rule                 Authority    Points
  GST_COMPLIANT        GST          +25
  EPFO_COMPLIANT       EPFO         +20
  ESIC_DUE             ESIC         +8
  MCA_COMPLIANT        MCA          +15
  UDYAM_COMPLIANT      UDYAM        +15
  FSSAI_EXEMPT         FSSAI        +10
  ALL_SIX_COMPLIANT    BONUS        --  (not fired: ESIC is DUE)
  PROFILE_COMPLETE     BONUS        +2
  ─────────────────────────────────
  TOTAL                             95 → capped at 82

  Wait — show actual score: 75 (example)
```

**Refresh Rate Limit:** If clicked again within 24h, show "Next refresh available in X hours."

---

### Page 6: Document Vault (`/documents`)

**Purpose:** Upload, view, and manage compliance certificates.

```
HEADER: Document Vault · [ Upload Certificate ]

UPLOAD PANEL (collapsible):
  Authority Type: [ GST ▼ ]
  Document Type:  [ GST Certificate ▼ ]
  Validity Date:  [ Calendar picker ]
  Notes:          [ Optional text ]
  [ Choose File (PDF/PNG/JPG, max 5MB) ]
  [ Upload ]

DOCUMENTS LIST:
  ┌────────────────────────────────────────────────────────┐
  │  📄 gst-certificate-2026.pdf                           │
  │  Authority: GST · Type: GST Certificate                │
  │  Valid until: 31 Mar 2027 · Size: 245 KB              │
  │  Uploaded: 28 Jun 2026                                 │
  │  [ Download ] [ Delete ]                               │
  └────────────────────────────────────────────────────────┘
```

**Empty state:** "No documents yet. Upload your first compliance certificate."

**Loading:** Skeleton list items.

**Upload error states:**
- File too large: "File exceeds 5MB limit."
- Wrong type: "Only PDF, PNG, and JPG files are accepted."
- Server error: "Upload failed. Please try again."

---

### Page 7: Supplier Profile (`/supplier-profile`)

**Purpose:** MSME's view of their own Supplier Card + QR code.

```
HEADER: Your Verified Supplier Card

PREVIEW TAB:
  Full SupplierCard component (same as what buyers see)

QR CODE SECTION:
  QR Code (qrcode.react)
  "Point any camera at this QR code to view your profile"
  URL: http://localhost:3000/buyer/1
  [ Copy URL ] [ Download QR as PNG ] [ Download Card as PDF ]

SHARE TIPS:
  "Add this QR to your business card, email signature, or WhatsApp status"
```

---

### Page 8: Schemes Matcher (`/schemes`)

**Purpose:** Show matched government schemes with eligibility details.

```
HEADER: Government Schemes for You · X schemes matched

FILTER ROW:
  [ All ] [ Credit ] [ Subsidy ] [ Training ] [ Market Access ]

SCHEME CARDS (grid):
  ┌────────────────────────────────────────────────────────┐
  │  CGTMSE — Credit Guarantee Scheme          MATCH: 92%  │
  │  Ministry of MSME                                      │
  │  Collateral-free credit up to ₹2 crore                │
  │                                                        │
  │  Why you match:                                        │
  │  ✓ Manufacturing business                              │
  │  ✓ Udyam registration verified                        │
  │  ✓ Employees within limit (≤50)                       │
  │                                                        │
  │  [ Apply Now ↗ ] [ Explain This Scheme ]              │
  └────────────────────────────────────────────────────────┘

AI EXPLANATION MODAL (on "Explain This Scheme"):
  Plain-language explanation from Ollama
  Loading state: spinner + "Getting explanation..."
  Fallback: "AI explanation unavailable. Visit scheme URL for details."
```

**Empty state:** "Complete your business profile to see scheme matches."

---

### Page 9: Alerts (`/alerts`)

**Purpose:** Show all compliance expiry alerts.

```
HEADER: Compliance Alerts

FILTER TABS: [ All ] [ Pending ] [ Sent ] [ Failed ]

ALERT LIST:
  AlertCard per alert, sorted by scheduled_for DESC

EMPTY STATE (no alerts):
  "No alerts yet. Alerts will appear when compliance deadlines approach."
```

---

### Page 10: Buyer View (`/buyer/:msmeId`) — PUBLIC

**Purpose:** Public-facing supplier verification page. No login. No navbar showing auth links.

**Important:** This is a separate layout — no sidebar, minimal navbar showing only VerifyChain branding.

```
┌───────────────────────────────────────────────────────────────┐
│  🔒 VerifyChain — Verified Supplier Profile                   │
├───────────────────────────────────────────────────────────────┤
│  Full SupplierCard component                                  │
│                                                               │
│  ─────────────────────────────────────────────────────────    │
│  ℹ This compliance data is refreshed daily by VerifyChain.   │
│  ℹ Last verified: 28 Jun 2026 08:00 IST                      │
│                                                               │
│  Powered by VerifyChain — verifychain.dev                     │
└───────────────────────────────────────────────────────────────┘
```

**Print styles (`@media print`):**
- Hide browser chrome elements
- Show full card with VerifyChain watermark
- Scale to A4 paper

**Error (MSME not found):**
```
Profile Not Found
This supplier profile does not exist or has been removed.
```

---

### Page 11: Admin Dashboard (`/admin`)

```
HEADER: Platform Administration

STATS CARDS (4):
  [ 48 Total MSMEs ] [ 22 HIGH ] [ 18 MEDIUM ] [ 8 LOW ]

CHARTS ROW:
  Pie: MSMEs by Level (Chart.js)
  Bar: Alerts sent last 7 days (Chart.js)

RECENT ALERTS TABLE:
  MSME Name | Authority | Threshold | Status | Date

QUICK LINKS:
  [ View All MSMEs → ] [ Manage Schemes → ]
```

---

### Page 12: Admin — MSMEs List (`/admin/msmes`)

```
HEADER: All MSMEs  [ Filter: Level ▼ ] [ State ▼ ]

TABLE:
  # | Business Name | GSTIN | State | Score | Level | Last Sync | Actions

ACTIONS per row:
  [ View Details ]

PAGINATION: Page 1 of 3 | < 1 2 3 >
```

---

## 5. States Reference

All pages must implement all four states:

| State | Implementation |
|---|---|
| **Loading** | `animate-pulse` skeleton cards or centered spinner |
| **Error** | Red banner: "Could not load [content]. Please try again." |
| **Empty** | Illustrated message + call-to-action link |
| **Success** | The actual content |

---

## 6. Responsive Layout

| Breakpoint | Layout Behaviour |
|---|---|
| < 640px | Single column, stacked, full-width inputs, hamburger nav |
| 640–1024px | 2-column cards, full nav |
| > 1024px | Sidebar nav (dashboard pages) + 3-column content grids |

**Sidebar navigation (dashboard layout, desktop only):**
```
┌──────────────┬────────────────────────────────────┐
│ VerifyChain  │  Dashboard content                 │
│              │                                    │
│ 📊 Dashboard │                                    │
│ ✅ Compliance│                                    │
│ 📁 Documents │                                    │
│ 🏷 Profile   │                                    │
│ 🎯 Schemes   │                                    │
│ 🔔 Alerts    │                                    │
│              │                                    │
│ [User name]  │                                    │
│ [Logout]     │                                    │
└──────────────┴────────────────────────────────────┘
```

**Mobile:** Bottom tab navigation or hamburger menu revealing the same items.

---

## 7. Navigation Routes

| Path | Page | Auth |
|---|---|---|
| `/` | Landing | Public |
| `/register` | Register | Public |
| `/login` | Login | Public |
| `/buyer/:msmeId` | Buyer View | Public |
| `/dashboard` | Dashboard | MSME_OWNER |
| `/compliance` | Compliance Status | MSME_OWNER |
| `/documents` | Document Vault | MSME_OWNER |
| `/supplier-profile` | Supplier Profile + QR | MSME_OWNER |
| `/schemes` | Schemes Matcher | MSME_OWNER |
| `/alerts` | Alerts | MSME_OWNER |
| `/admin` | Admin Dashboard | ADMIN |
| `/admin/msmes` | Admin MSME List | ADMIN |
| `*` | NotFound (404) | Public |

---

## 8. Accessibility

- Focus rings on all interactive elements: `focus:ring-2 focus:ring-brand-light`
- Score level communicated via color + text + icon (never color alone)
- Form fields have associated `<label>` elements
- Errors linked to fields via `aria-describedby`
- Print-optimized Buyer Card (CSS `@media print`)

---

## 9. Key UX Flows

### First-Time MSME Owner

```
Landing → Register → Dashboard (empty, no profile)
  → "Set up your business profile" prompt
  → Fill profile form (GSTIN, Udyam, business details)
  → Submit → Compliance data fetched automatically
  → Dashboard reloads with live score + authority badges
  → "Share your Supplier Card" CTA appears
```

### Returning MSME Owner

```
Login → Dashboard (score + badges visible)
  → Click "Refresh Data" → Compliance updated
  → See new score
  → Navigate to Alerts → See upcoming deadlines
  → Navigate to Schemes → Browse eligible schemes
```

### Buyer (No Account)

```
Receives URL or scans QR code
→ /buyer/:msmeId loads (no login)
→ Sees SupplierCard with score + badges + timestamp
→ Decision made in < 30 seconds
```
