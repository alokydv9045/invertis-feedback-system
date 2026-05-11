# Testing Strategy

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **Version**      | 2.0                              |
| **Last Updated** | 2026-05-10                        |

---

## 2. Testing Pyramid

```
            ┌───────────┐
            │   E2E     │   5-10 critical flows
            │  Tests    │   (Browser-based)
            ├───────────┤
            │Integration│   20-30 tests
            │  Tests    │   (API + DB)
            ├───────────┤
            │   Unit    │   50+ tests
            │  Tests    │   (Functions, hooks, utils)
            └───────────┘
```

| Layer       | Tool                     | Scope                                | Count Target |
| ----------- | ------------------------ | ------------------------------------ | ------------ |
| Unit        | Vitest                   | Utils, validators, formatters, hooks | 50+          |
| Integration | Vitest + Supabase local  | API flows, DB queries, RLS policies  | 20-30        |
| E2E         | Playwright               | Full user journeys in browser        | 5-10         |
| Manual      | Human QA                 | Responsive, brand, UX review         | Per phase    |

---

## 3. Unit Testing

### 3.1 What to Unit Test

| Category          | Examples                                              |
| ----------------- | ----------------------------------------------------- |
| Validators        | `validateEmail()`, `validateYearRange()`, `validateFileSize()` |
| Formatters        | `formatDate()`, `formatRating()`, `formatPercentage()` |
| Constants         | Rating scale labels, status mappings                   |
| Custom Hooks      | `useAuth` (mock Supabase), `usePagination`            |
| Pure Components   | Badge, EmptyState, LoadingSpinner (render tests)       |

### 3.2 Example Unit Tests

```javascript
// validators.test.js
import { describe, it, expect } from 'vitest';
import { validateYearRange, validateFileSize } from '@/core/utils/validators';

describe('validateYearRange', () => {
  it('returns true when end > start', () => {
    expect(validateYearRange(2024, 2028)).toBe(true);
  });
  it('returns false when end <= start', () => {
    expect(validateYearRange(2028, 2024)).toBe(false);
  });
  it('returns false when equal', () => {
    expect(validateYearRange(2024, 2024)).toBe(false);
  });
});

describe('validateFileSize', () => {
  it('accepts files under 5 MB', () => {
    expect(validateFileSize(4 * 1024 * 1024)).toBe(true);
  });
  it('rejects files over 5 MB', () => {
    expect(validateFileSize(6 * 1024 * 1024)).toBe(false);
  });
});
```

### 3.3 Configuration (`vitest.config.js`)

```javascript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { lines: 70, branches: 60, functions: 70 }
    }
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
});
```

---

## 4. Integration Testing

### 4.1 RLS Policy Tests

Test that Row-Level Security correctly blocks unauthorized access.

| Test Case                                           | Expected Result           |
| --------------------------------------------------- | ------------------------- |
| Student reads own `student_accounts` row             | ✅ Allowed                |
| Student reads another student's row                  | ❌ Blocked (empty result)  |
| Student reads `reviews` table                        | ❌ Blocked                 |
| Student inserts into `reviews` with own ID           | ✅ Allowed                |
| Student inserts into `reviews` with fake ID          | ❌ Blocked                 |
| HOD reads `feedback_forms` for own department        | ✅ Allowed                |
| HOD reads `feedback_forms` for other department      | ❌ Blocked                 |
| HOD inserts into `feedback_forms`                    | ✅ Allowed                |
| Admin reads all tables                               | ✅ Allowed                |
| Unauthenticated user reads any table                 | ❌ Blocked                 |

### 4.2 SQL View Tests

| View                       | Test Case                                    | Expected                  |
| -------------------------- | -------------------------------------------- | ------------------------- |
| `leaderboard_view`         | Student with 5 reviews ranks above 3 reviews | Correct rank order         |
| `leaderboard_view`         | Suspended student excluded                   | Not in results             |
| `leaderboard_view`         | Tied counts get same rank                    | Both rank = N              |
| `trainer_performance_view` | Trainer with ratings → correct AVG           | AVG matches manual calc    |
| `trainer_performance_view` | Trainer with 0 reviews → avg_rating = 0      | Returns 0                  |
| `course_submission_view`   | 10 enrolled, 7 submitted → 70%               | submission_rate_pct = 70   |
| `course_submission_view`   | 0 enrolled → 0%                              | No division error          |

### 4.3 API Integration Tests

| Flow                         | Steps                                                    | Assert                        |
| ---------------------------- | -------------------------------------------------------- | ----------------------------- |
| Student registration         | signUp → upload ID → insert profile                      | Auth user + profile + storage  |
| Login + role detection       | signIn → get_user_role RPC                               | Correct role returned          |
| Submit review                | Insert review → check unique constraint                   | 201 first time, 409 duplicate  |
| Publish form                 | Insert form + questions → verify student sees it          | Form appears in assigned list  |
| Delete user (admin)          | Delete → verify cascade (profile + reviews removed)       | All related data gone          |

---

## 5. End-to-End Testing

### 5.1 Critical E2E Flows

| #  | Flow Name                    | Steps                                                                      |
| -- | ---------------------------- | -------------------------------------------------------------------------- |
| 1  | Student Registration         | Open /register → fill form → upload ID → submit → redirected to /login     |
| 2  | Student Login + Dashboard    | Open /login → enter creds → redirected to dashboard → see assigned forms    |
| 3  | Feedback Submission          | Login → click pending form → fill review → submit → see confirmation        |
| 4  | HOD Form Publishing          | Login as HOD → go to forms → create form → verify it appears for students   |
| 5  | Admin User Management        | Login as admin → go to users → create HOD → delete student → verify         |

### 5.2 Playwright Configuration

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ]
});
```

### 5.3 Example E2E Test

```javascript
// e2e/student-registration.spec.js
import { test, expect } from '@playwright/test';

test('student can register successfully', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="fullName"]', 'Test Student');
  await page.fill('[name="email"]', `test${Date.now()}@invertis.edu.in`);
  await page.fill('[name="password"]', 'testpass123');
  await page.fill('[name="confirmPassword"]', 'testpass123');
  await page.selectOption('[name="courseId"]', { index: 1 });
  await page.selectOption('[name="startYear"]', '2024');
  await page.selectOption('[name="endYear"]', '2028');
  // Upload ID card
  await page.setInputFiles('[name="idCard"]', 'e2e/fixtures/test-id-card.jpg');
  await page.click('button[type="submit"]');
  // Should redirect to login with success message
  await expect(page).toHaveURL('/login');
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

---

## 6. Security Testing

| Test Area                    | Test                                              | Method          |
| ---------------------------- | ------------------------------------------------- | --------------- |
| RLS bypass attempts          | Direct Supabase query without matching role        | Integration     |
| Storage access               | Access ID card URL without auth                    | Manual / curl   |
| XSS in review text           | Submit `<script>alert(1)</script>` as review       | E2E             |
| SQL injection                | Submit `'; DROP TABLE reviews;--` as review text   | E2E             |
| Role escalation              | Student tries to access /admin/* routes            | E2E             |
| Token expiry                 | Use expired JWT to access API                      | Integration     |
| Leaderboard privacy          | Verify no review content in leaderboard response   | Integration     |

---

## 7. Performance Testing

| Test                              | Tool        | Target            |
| --------------------------------- | ----------- | ------------------ |
| Lighthouse Performance score      | Lighthouse  | ≥ 90               |
| Lighthouse Accessibility score    | Lighthouse  | ≥ 85               |
| Leaderboard view query time       | SQL EXPLAIN | ≤ 50ms             |
| Trainer performance view time     | SQL EXPLAIN | ≤ 100ms            |
| ID card upload (5 MB file)        | Manual      | ≤ 3s               |
| Page load (LCP)                   | Lighthouse  | ≤ 2.5s             |
| Bundle size (gzipped)             | Vite build  | ≤ 300 KB           |

---

## 8. Responsive / Visual Testing

### 8.1 Device Matrix

| Device           | Width  | Test Method       |
| ---------------- | ------ | ----------------- |
| iPhone SE        | 375px  | Chrome DevTools   |
| iPhone 14        | 390px  | Chrome DevTools   |
| iPad             | 768px  | Chrome DevTools   |
| Laptop           | 1366px | Chrome DevTools   |
| Desktop          | 1920px | Native            |

### 8.2 Visual Checklist

- [ ] Sidebar collapses to drawer on mobile (< 768px)
- [ ] Cards stack vertically on mobile
- [ ] Forms are full-width on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Tap targets ≥ 44px on touch devices
- [ ] Logo visible on all screen sizes
- [ ] No horizontal overflow on any page

---

## 9. Test Data Strategy

### 9.1 Seed Data for Development

| Entity           | Count | Purpose                              |
| ---------------- | ----- | ------------------------------------ |
| Admin accounts   | 1     | System admin login                    |
| HOD accounts     | 4     | One per department                    |
| Student accounts | 50    | Realistic student population          |
| Courses          | 8     | Across 5 departments                  |
| Trainers         | 8     | Across departments                    |
| Feedback forms   | 8     | One per course                        |
| Questions        | 40    | 5 per form                            |
| Reviews          | ~150  | 60% of enrolled students              |
| Review answers   | ~750  | 5 answers per review                  |

### 9.2 Test Credentials

| Role    | Email                        | Password    |
| ------- | ---------------------------- | ----------- |
| Admin   | admin@invertis.edu.in        | admin123    |
| HOD     | hod.cse@invertis.edu.in      | staff123    |
| Student | student1@invertis.edu.in     | student123  |

---

## 10. Test Execution Plan by Phase

| Phase | Tests to Run                                              |
| ----- | --------------------------------------------------------- |
| 1     | Unit: validators, formatters. Manual: login flow, layout. |
| 2     | Unit: hooks. Integration: registration, submission. E2E: flow 1-3. |
| 3     | Integration: SQL views, leaderboard privacy. Performance: view query times. |
| 4     | Integration: admin CRUD, cascade delete. E2E: flow 4-5.  |
| 5     | Full regression. Responsive matrix. Lighthouse audit. Security tests. |

---

## 11. CI Test Integration

```yaml
# In .github/workflows/ci.yml
- name: Run unit tests
  run: npm run test --workspace=packages/frontend

- name: Run E2E tests
  run: npx playwright test --workspace=packages/frontend
  env:
    VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
```

---

## 12. Bug Severity Classification

| Severity | Definition                                    | Response Time  |
| -------- | --------------------------------------------- | -------------- |
| P0       | Data loss, security breach, complete outage    | Fix immediately |
| P1       | Core flow broken (can't login/submit)          | Fix within 24h  |
| P2       | Non-blocking bug, workaround exists            | Fix this sprint |
| P3       | Cosmetic issue, minor UI glitch                | Backlog         |
