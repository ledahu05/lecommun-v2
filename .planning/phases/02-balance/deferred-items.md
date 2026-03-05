# Deferred Items — Phase 02-balance

## Pre-existing TS Error: test.todo in tests/balance.spec.ts

**Discovered during:** Task 2 (02-02)
**File:** tests/balance.spec.ts (untracked, not committed)
**Issue:** `test.todo` does not exist in `@playwright/test` v1.58.2 types
**Impact:** TypeScript errors during `npx tsc --noEmit` — 5 errors
**Cause:** Pre-existing file from planning phase; `test.todo` API was removed or never existed in Playwright v1.58.x
**Fix:** Either stub these as `test.skip()` or convert to `test()` with `test.fixme()` when these tests are implemented in Plan 03
**Scope:** Out of scope for 02-02 — not caused by balance/query implementation
