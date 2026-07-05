# SCORE_ENGINE.md — VerifyChain Compliance Health Score

> This is the authoritative specification for all compliance scoring in VerifyChain.
> The implementation (`server/src/services/scoreEngine.js`) must exactly match this document.
> Any change to scoring logic requires updating this document first.

---

## 1. Philosophy

The Compliance Health Score (CHS) is the core intelligence output of VerifyChain. It must be:

- **Transparent:** Every score is returned with a named breakdown array. No score is ever returned without an explanation.
- **Deterministic:** Given the same input data, the same score is always produced.
- **Explainable:** Every contributing rule has a human-readable description a non-technical MSME owner can understand.
- **Rule-based:** No machine learning. No statistical models. Pure weighted rules.
- **Fresh:** Score is never stored in the database. It is computed on every request from live `compliance_records`.

---

## 2. Score Range and Levels

| Range | Level | Color | Meaning |
|---|---|---|---|
| 75 – 100 | HIGH | `#16A34A` (green) | Buyer-ready. Strong compliance across authorities. |
| 40 – 74 | MEDIUM | `#D97706` (amber) | Partial compliance. Gaps exist. Action needed. |
| 0 – 39 | LOW | `#DC2626` (red) | Significant compliance gaps. High rejection risk. |

---

## 3. Score Computation Flow

```
scoreEngine.computeScore(msmeId, prisma)

Step 1: Fetch all compliance_records WHERE msme_id = msmeId
Step 2: Fetch msme_profile WHERE id = msmeId (for context: is_food_business, employee_count, etc.)
Step 3: For each of the 6 authorities, apply authority-level rules
Step 4: Sum rule weights; apply bonuses; apply penalties
Step 5: Cap at 100, floor at 0
Step 6: Determine level from thresholds
Step 7: Return { score, level, breakdown, lastComputed }
```

---

## 4. Authority Weight Allocation

The maximum score per authority reflects its legal and business significance:

| Authority | Max Weight | Rationale |
|---|---|---|
| GST | 25 | Tax compliance is the primary procurement gate |
| EPFO | 20 | Labour law; criminal liability risk |
| ESIC | 15 | Labour law; employee protection |
| MCA / ROC | 15 | Corporate identity; required for GeM |
| Udyam | 15 | MSME identity certificate; required for all schemes |
| FSSAI | 10 | Food businesses only; exempt for others |
| **Total** | **100** | — |

---

## 5. Per-Authority Rules

Each authority has a primary status rule and optional modifier rules.

---

### GST (Max: 25 points)

**Rule: `GST_COMPLIANT`**
- Weight: 25
- Fires when: `compliance_records[GST].status === 'COMPLIANT'`
- Description: "GST registration active and returns filed"

**Rule: `GST_DUE`**
- Weight: 12 (partial credit)
- Fires when: `status === 'DUE'`
- Description: "GST returns due within 30 days"

**Rule: `GST_OVERDUE`**
- Weight: 0 (no credit + penalty applied separately)
- Fires when: `status === 'OVERDUE'`
- Description: "GST returns overdue — immediate action required"

**Penalty: `GST_OVERDUE_PENALTY`**
- Weight: -10 (deducted from total)
- Fires when: `status === 'OVERDUE'`
- Description: "GST overdue penalty: -10 from total score"

---

### EPFO (Max: 20 points)

**Rule: `EPFO_COMPLIANT`**
- Weight: 20
- Fires when: `compliance_records[EPFO].status === 'COMPLIANT'`
- Description: "EPFO contributions current"

**Rule: `EPFO_DUE`**
- Weight: 10
- Fires when: `status === 'DUE'`
- Description: "EPFO contribution due within 30 days"

**Rule: `EPFO_OVERDUE`**
- Weight: 0 + penalty -8
- Description: "EPFO overdue — criminal liability risk"

**Rule: `EPFO_UNKNOWN`**
- Weight: 5 (partial — not verified yet)
- Fires when: `status === 'UNKNOWN'`
- Description: "EPFO status not yet verified"

---

### ESIC (Max: 15 points)

**Rule: `ESIC_COMPLIANT`**
- Weight: 15
- Fires when: `status === 'COMPLIANT'`
- Description: "ESIC registration and contributions current"

**Rule: `ESIC_DUE`**
- Weight: 8
- Fires when: `status === 'DUE'`
- Description: "ESIC contribution due within 30 days"

**Rule: `ESIC_OVERDUE`**
- Weight: 0 + penalty -6
- Description: "ESIC overdue"

**Rule: `ESIC_UNKNOWN`**
- Weight: 5
- Description: "ESIC status not yet verified"

---

### MCA / ROC (Max: 15 points)

**Rule: `MCA_COMPLIANT`**
- Weight: 15
- Fires when: `status === 'COMPLIANT'`
- Description: "Company incorporation active; annual returns filed"

**Rule: `MCA_DUE`**
- Weight: 8
- Description: "Annual return due within 30 days"

**Rule: `MCA_OVERDUE`**
- Weight: 0 + penalty -5
- Description: "Annual return overdue"

**Rule: `MCA_UNKNOWN`**
- Weight: 5
- Description: "Company registration status not verified"

---

### Udyam (Max: 15 points)

**Rule: `UDYAM_COMPLIANT`**
- Weight: 15
- Fires when: `status === 'COMPLIANT'`
- Description: "Udyam Registration Certificate valid"

**Rule: `UDYAM_DUE`**
- Weight: 8
- Description: "Udyam renewal approaching"

**Rule: `UDYAM_OVERDUE`**
- Weight: 0 + penalty -5
- Description: "Udyam registration expired — no longer qualifies as MSME"

**Rule: `UDYAM_UNKNOWN`**
- Weight: 5
- Description: "Udyam status not verified"

---

### FSSAI (Max: 10 points)

**Rule: `FSSAI_EXEMPT`**
- Weight: 10 (full credit — exempt = compliant for scoring purposes)
- Fires when: `msme_profile.is_food_business === false`
- Description: "FSSAI not applicable — non-food business (auto-exempt)"

**Rule: `FSSAI_COMPLIANT`**
- Weight: 10
- Fires when: `is_food_business === true && status === 'COMPLIANT'`
- Description: "FSSAI food license valid"

**Rule: `FSSAI_DUE`**
- Weight: 5
- Fires when: `is_food_business === true && status === 'DUE'`
- Description: "FSSAI license renewal due within 30 days"

**Rule: `FSSAI_OVERDUE`**
- Weight: 0 + penalty -8
- Fires when: `is_food_business === true && status === 'OVERDUE'`
- Description: "FSSAI license expired — food business cannot legally operate"

---

## 6. Bonus Rules (Cross-Authority)

**Rule: `ALL_SIX_COMPLIANT`**
- Weight: +5 bonus
- Fires when: all 6 authorities are COMPLIANT or EXEMPT
- Description: "All compliance authorities clear — buyer-ready bonus"

**Rule: `PROFILE_COMPLETE`**
- Weight: +2 bonus
- Fires when: `msme_profile.is_profile_complete === true`
- Description: "Complete business profile improves buyer confidence"

---

## 7. Score Examples

### Example 1: Fully Compliant Manufacturing MSME (non-food)

| Rule | Points |
|---|---|
| GST_COMPLIANT | +25 |
| EPFO_COMPLIANT | +20 |
| ESIC_COMPLIANT | +15 |
| MCA_COMPLIANT | +15 |
| UDYAM_COMPLIANT | +15 |
| FSSAI_EXEMPT | +10 |
| ALL_SIX_COMPLIANT | +5 |
| PROFILE_COMPLETE | +2 |
| **Raw total** | **107 → capped at 100** |
| **Level** | **HIGH** |

---

### Example 2: Partial Compliance (GST overdue, rest compliant)

| Rule | Points |
|---|---|
| GST_OVERDUE | 0 |
| GST_OVERDUE_PENALTY | -10 |
| EPFO_COMPLIANT | +20 |
| ESIC_COMPLIANT | +15 |
| MCA_COMPLIANT | +15 |
| UDYAM_COMPLIANT | +15 |
| FSSAI_EXEMPT | +10 |
| **Total** | **65** |
| **Level** | **MEDIUM** |

---

### Example 3: New MSME — Data Not Yet Fetched

| Rule | Points |
|---|---|
| GST_UNKNOWN | 0 (no credit for unknown) |
| EPFO_UNKNOWN | +5 |
| ESIC_UNKNOWN | +5 |
| MCA_UNKNOWN | +5 |
| UDYAM_UNKNOWN | +5 |
| FSSAI_EXEMPT | +10 |
| **Total** | **30** |
| **Level** | **LOW** |

---

### Example 4: Food Business, FSSAI Overdue, Others Compliant

| Rule | Points |
|---|---|
| GST_COMPLIANT | +25 |
| EPFO_COMPLIANT | +20 |
| ESIC_COMPLIANT | +15 |
| MCA_COMPLIANT | +15 |
| UDYAM_COMPLIANT | +15 |
| FSSAI_OVERDUE | 0 |
| FSSAI_OVERDUE_PENALTY | -8 |
| **Total** | **82** |
| **Level** | **HIGH** (but flagged warning) |

---

## 8. Complete Rules Table

| Rule | Category | Points | Type |
|---|---|---|---|
| GST_COMPLIANT | GST | +25 | Credit |
| GST_DUE | GST | +12 | Partial Credit |
| GST_OVERDUE | GST | 0 | No Credit |
| GST_OVERDUE_PENALTY | GST | -10 | Penalty |
| EPFO_COMPLIANT | EPFO | +20 | Credit |
| EPFO_DUE | EPFO | +10 | Partial Credit |
| EPFO_OVERDUE | EPFO | 0 | No Credit |
| EPFO_OVERDUE_PENALTY | EPFO | -8 | Penalty |
| EPFO_UNKNOWN | EPFO | +5 | Partial Credit |
| ESIC_COMPLIANT | ESIC | +15 | Credit |
| ESIC_DUE | ESIC | +8 | Partial Credit |
| ESIC_OVERDUE | ESIC | 0 | No Credit |
| ESIC_OVERDUE_PENALTY | ESIC | -6 | Penalty |
| ESIC_UNKNOWN | ESIC | +5 | Partial Credit |
| MCA_COMPLIANT | MCA | +15 | Credit |
| MCA_DUE | MCA | +8 | Partial Credit |
| MCA_OVERDUE | MCA | 0 | No Credit |
| MCA_OVERDUE_PENALTY | MCA | -5 | Penalty |
| MCA_UNKNOWN | MCA | +5 | Partial Credit |
| UDYAM_COMPLIANT | Udyam | +15 | Credit |
| UDYAM_DUE | Udyam | +8 | Partial Credit |
| UDYAM_OVERDUE | Udyam | 0 | No Credit |
| UDYAM_OVERDUE_PENALTY | Udyam | -5 | Penalty |
| UDYAM_UNKNOWN | Udyam | +5 | Partial Credit |
| FSSAI_EXEMPT | FSSAI | +10 | Full Credit (exempt) |
| FSSAI_COMPLIANT | FSSAI | +10 | Credit |
| FSSAI_DUE | FSSAI | +5 | Partial Credit |
| FSSAI_OVERDUE | FSSAI | 0 | No Credit |
| FSSAI_OVERDUE_PENALTY | FSSAI | -8 | Penalty |
| ALL_SIX_COMPLIANT | Bonus | +5 | Bonus |
| PROFILE_COMPLETE | Bonus | +2 | Bonus |

---

## 9. Implementation Pseudocode

```javascript
// server/src/services/scoreEngine.js

const AUTHORITY_RULES = {
  GST: {
    COMPLIANT:        { weight: 25,  type: 'credit',  desc: 'GST registration active and returns filed' },
    DUE:              { weight: 12,  type: 'partial',  desc: 'GST returns due within 30 days' },
    OVERDUE:          { weight: 0,   type: 'none',     desc: 'GST returns overdue' },
    OVERDUE_PENALTY:  { weight: -10, type: 'penalty',  desc: 'GST overdue penalty' },
    UNKNOWN:          { weight: 0,   type: 'none',     desc: 'GST status not yet verified' },
  },
  EPFO: {
    COMPLIANT:        { weight: 20, type: 'credit',  desc: 'EPFO contributions current' },
    DUE:              { weight: 10, type: 'partial',  desc: 'EPFO contribution due within 30 days' },
    OVERDUE:          { weight: 0,  type: 'none',     desc: 'EPFO contributions overdue' },
    OVERDUE_PENALTY:  { weight: -8, type: 'penalty',  desc: 'EPFO overdue penalty' },
    UNKNOWN:          { weight: 5,  type: 'partial',  desc: 'EPFO status not yet verified' },
  },
  ESIC: {
    COMPLIANT:        { weight: 15, type: 'credit',  desc: 'ESIC contributions current' },
    DUE:              { weight: 8,  type: 'partial',  desc: 'ESIC contribution due within 30 days' },
    OVERDUE:          { weight: 0,  type: 'none',     desc: 'ESIC contributions overdue' },
    OVERDUE_PENALTY:  { weight: -6, type: 'penalty',  desc: 'ESIC overdue penalty' },
    UNKNOWN:          { weight: 5,  type: 'partial',  desc: 'ESIC status not yet verified' },
  },
  MCA: {
    COMPLIANT:        { weight: 15, type: 'credit',  desc: 'Company incorporation active; returns filed' },
    DUE:              { weight: 8,  type: 'partial',  desc: 'Annual return due within 30 days' },
    OVERDUE:          { weight: 0,  type: 'none',     desc: 'Annual return overdue' },
    OVERDUE_PENALTY:  { weight: -5, type: 'penalty',  desc: 'MCA overdue penalty' },
    UNKNOWN:          { weight: 5,  type: 'partial',  desc: 'Company registration status not verified' },
  },
  UDYAM: {
    COMPLIANT:        { weight: 15, type: 'credit',  desc: 'Udyam Registration Certificate valid' },
    DUE:              { weight: 8,  type: 'partial',  desc: 'Udyam renewal approaching' },
    OVERDUE:          { weight: 0,  type: 'none',     desc: 'Udyam registration expired' },
    OVERDUE_PENALTY:  { weight: -5, type: 'penalty',  desc: 'Udyam overdue penalty' },
    UNKNOWN:          { weight: 5,  type: 'partial',  desc: 'Udyam status not verified' },
  },
  FSSAI: {
    EXEMPT:           { weight: 10, type: 'credit',  desc: 'FSSAI not applicable — non-food business (auto-exempt)' },
    COMPLIANT:        { weight: 10, type: 'credit',  desc: 'FSSAI food license valid' },
    DUE:              { weight: 5,  type: 'partial',  desc: 'FSSAI license renewal due within 30 days' },
    OVERDUE:          { weight: 0,  type: 'none',     desc: 'FSSAI license expired' },
    OVERDUE_PENALTY:  { weight: -8, type: 'penalty',  desc: 'FSSAI overdue penalty — food business cannot legally operate' },
    UNKNOWN:          { weight: 3,  type: 'partial',  desc: 'FSSAI status not verified' },
  },
};

const SCORE_LEVEL_HIGH   = 75;
const SCORE_LEVEL_MEDIUM = 40;
const SCORE_MAX          = 100;
const SCORE_MIN          = 0;

async function computeScore(msmeId, prisma) {
  const msme = await prisma.msmeProfile.findUnique({
    where: { id: msmeId },
    select: { is_food_business: true, is_profile_complete: true },
  });

  const records = await prisma.complianceRecord.findMany({
    where: { msme_id: msmeId },
  });

  const recordMap = {};
  for (const rec of records) {
    recordMap[rec.authority] = rec;
  }

  const breakdown = [];
  let totalScore = 0;

  for (const [authority, rules] of Object.entries(AUTHORITY_RULES)) {
    const record = recordMap[authority];

    // FSSAI special case: auto-exempt for non-food
    if (authority === 'FSSAI' && !msme.is_food_business) {
      const rule = rules.EXEMPT;
      breakdown.push({ rule: `FSSAI_EXEMPT`, authority, ...rule });
      totalScore += rule.weight;
      continue;
    }

    const status = record ? record.status : 'UNKNOWN';
    const primaryRule = rules[status];

    if (primaryRule) {
      breakdown.push({ rule: `${authority}_${status}`, authority, ...primaryRule });
      totalScore += primaryRule.weight;
    }

    // Apply penalty if overdue
    if (status === 'OVERDUE' && rules.OVERDUE_PENALTY) {
      const penalty = rules.OVERDUE_PENALTY;
      breakdown.push({ rule: `${authority}_OVERDUE_PENALTY`, authority, ...penalty });
      totalScore += penalty.weight; // negative weight
    }
  }

  // Bonus: all compliant or exempt
  const allClear = ['GST','EPFO','ESIC','MCA','UDYAM'].every(
    auth => ['COMPLIANT', 'DUE'].includes(recordMap[auth]?.status)
  ) && (
    !msme.is_food_business ||
    ['COMPLIANT', 'DUE'].includes(recordMap['FSSAI']?.status)
  );

  if (allClear) {
    breakdown.push({ rule: 'ALL_SIX_COMPLIANT', authority: 'BONUS', weight: 5, type: 'bonus', desc: 'All compliance authorities clear — buyer-ready bonus' });
    totalScore += 5;
  }

  // Bonus: complete profile
  if (msme.is_profile_complete) {
    breakdown.push({ rule: 'PROFILE_COMPLETE', authority: 'BONUS', weight: 2, type: 'bonus', desc: 'Complete business profile improves buyer confidence' });
    totalScore += 2;
  }

  // Cap and floor
  totalScore = Math.min(SCORE_MAX, Math.max(SCORE_MIN, totalScore));

  const level = totalScore >= SCORE_LEVEL_HIGH   ? 'HIGH'
              : totalScore >= SCORE_LEVEL_MEDIUM  ? 'MEDIUM'
              : 'LOW';

  return {
    score: totalScore,
    level,
    breakdown,
    lastComputed: new Date().toISOString(),
  };
}

module.exports = { computeScore };
```

---

## 10. Edge Cases

| Scenario | Behaviour |
|---|---|
| No compliance records exist yet | All authorities = UNKNOWN; score near 0; level LOW |
| Non-food business (is_food_business = false) | FSSAI_EXEMPT fires: +10 points |
| All statuses COMPLIANT | ALL_SIX_COMPLIANT bonus fires: +5 |
| Score calculation produces negative (many penalties) | Floor at 0 |
| Score calculation produces > 100 (many bonuses) | Capped at 100 |
| One authority has no record in DB | Treated as UNKNOWN |
| MSME has incomplete profile | PROFILE_COMPLETE bonus does not fire |

---

## 11. Score Engine Invariants (Never Change)

- Score is never stored. Computed fresh on every request.
- Penalties are real negative values added to the total — they are not caps.
- FSSAI is always EXEMPT for `is_food_business = false`. This is hardcoded, not a DB value.
- The `breakdown` array is always returned — never an empty array with just a score.
- All rules that fire appear in the breakdown. Rules that do not fire are not included.
