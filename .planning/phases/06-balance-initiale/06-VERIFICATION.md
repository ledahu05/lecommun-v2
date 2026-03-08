---
phase: 06-balance-initiale
verified: 2026-03-08T14:00:00Z
status: passed
score: 5/5 must-haves verified
---

# Phase 6: Balance Initiale Verification Report

**Phase Goal:** Users can initialize the carried-forward balance when the app starts with no prior month data
**Verified:** 2026-03-08
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | When current month has no previous month in DB, an editable balance field appears on the dashboard | VERIFIED | `page.tsx:19` calls `hasPreviousMois()`, passes `editableBalanceReportee={!hasPrev}` at line 42; `BalanceCard.tsx:80` conditionally renders `InitialBalanceForm` |
| 2 | User can enter a signed amount (positive or negative) and submit it | VERIFIED | `InitialBalanceForm.tsx:44` uses `type="number" step="0.01"` with no `min` attribute; `actions.ts:9` Zod schema uses `z.coerce.number()` (allows negative) |
| 3 | After submission, the balance recalculates and the page reflects the new value immediately | VERIFIED | `actions.ts:28` calls `revalidatePath('/')`, `InitialBalanceForm.tsx:26` calls `router.refresh()`; `page.tsx:18` re-fetches with updated `balance_reportee` |
| 4 | The editable field remains available as long as no previous month exists in DB | VERIFIED | `editableBalanceReportee` depends solely on `hasPreviousMois()` return value; updating balance_reportee does not create a previous month row |
| 5 | When a previous month exists in DB, the balance reportee is computed automatically and no edit field appears | VERIFIED | `hasPreviousMois()` returns true -> `editableBalanceReportee={false}` -> static `balance-reportee` display renders at `BalanceCard.tsx:83-86` |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/db/queries/mois.ts` | hasPreviousMois() and updateBalanceReportee() exports | VERIFIED | Lines 81-96, both functions substantive with DB queries |
| `app/(app)/actions.ts` | Server action with Zod validation | VERIFIED | 29 lines, 'use server', Zod schema, safeParse, revalidatePath |
| `components/balance/InitialBalanceForm.tsx` | Client component with number input and submit | VERIFIED | 65 lines, 'use client', useTransition, form with data-testid attrs, 48px touch targets |
| `components/balance/BalanceCard.tsx` | Conditional rendering of form vs static display | VERIFIED | Line 80 conditional on editableBalanceReportee prop, imports InitialBalanceForm |
| `tests/balance-initiale.spec.ts` | E2E tests for INIT-01 through INIT-05 | VERIFIED | 177 lines, 5 test.describe blocks matching INIT-01 through INIT-05, two seed scenarios |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/(app)/page.tsx` | `lib/db/queries/mois.ts` | hasPreviousMois() call | WIRED | Line 2 import, line 19 call |
| `app/(app)/page.tsx` | `components/balance/BalanceCard.tsx` | editableBalanceReportee prop | WIRED | Line 42 passes `editableBalanceReportee={!hasPrev}` |
| `components/balance/BalanceCard.tsx` | `components/balance/InitialBalanceForm.tsx` | Conditional render | WIRED | Line 8 import, line 81 renders `<InitialBalanceForm>` |
| `components/balance/InitialBalanceForm.tsx` | `app/(app)/actions.ts` | actionUpdateBalanceReportee call | WIRED | Line 7 import, line 21 call within startTransition |
| `app/(app)/actions.ts` | `lib/db/queries/mois.ts` | updateBalanceReportee() DB mutation | WIRED | Line 5 import, line 26 call |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| INIT-01 | 06-01-PLAN | Editable field when no previous month | SATISFIED | Form renders conditionally; E2E test at line 57-66 |
| INIT-02 | 06-01-PLAN | Signed amount submission | SATISFIED | No `min` attr, Zod allows negative; E2E test at line 69-95 |
| INIT-03 | 06-01-PLAN | Balance recalculates immediately | SATISFIED | revalidatePath + router.refresh; E2E test at line 98-126 |
| INIT-04 | 06-01-PLAN | Field remains editable for corrections | SATISFIED | key={currentValue} for remount; E2E test at line 128-161 |
| INIT-05 | 06-01-PLAN | Field hidden when previous month exists | SATISFIED | hasPreviousMois() gates display; E2E test at line 163-176 |

No orphaned requirements found.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | - | - | - | - |

No TODOs, FIXMEs, placeholders, empty implementations, or console.log-only handlers found in any phase artifacts.

### Human Verification Required

### 1. Mobile Touch Target Feel

**Test:** Open dashboard on iPhone 14 viewport (390x844) when no previous month exists
**Expected:** Balance input and OK button have comfortable 48px tap areas, input does not trigger iOS zoom (font >= 16px)
**Why human:** Touch target ergonomics and iOS zoom behavior cannot be verified programmatically

### 2. Form Submission Visual Feedback

**Test:** Submit a balance value on mobile and observe the transition
**Expected:** Button shows "..." during pending state, input updates to reflect new value after refresh
**Why human:** Transition timing and visual feedback quality require human observation

### Gaps Summary

No gaps found. All 5 observable truths verified. All artifacts exist, are substantive, and are properly wired. All 5 INIT requirements satisfied with E2E test coverage. Three task commits confirmed in git history (be6fa27, 84b99c4, bc41a86).

---

_Verified: 2026-03-08_
_Verifier: Claude (gsd-verifier)_
