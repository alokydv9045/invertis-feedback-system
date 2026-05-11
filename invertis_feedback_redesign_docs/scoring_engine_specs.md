# Scoring Engine Specifications

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **Scope**        | Leaderboard, Analytics, Ratings  |
| **Last Updated** | 2026-05-10                        |

---

## 2. Overview

The Scoring Engine is the subsystem responsible for:

1. **Leaderboard Ranking** — Ranks students by participation volume.
2. **Trainer Performance Scoring** — Computes average trainer quality metrics.
3. **Course Submission Rate** — Tracks feedback completion percentage per course.
4. **Department Aggregate Scores** — Rolls up analytics to the department level.

All scoring is performed at the **database level** using SQL views and functions, eliminating the N+1 query loops present in the old system's application-level analytics.

---

## 3. Scoring Domains

### 3.1 Domain Map

```
┌─────────────────────────────────────────────────────────────┐
│                     SCORING ENGINE                           │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   LEADERBOARD    │  │ TRAINER PERF     │                │
│  │   SCORING        │  │ SCORING          │                │
│  │                  │  │                  │                │
│  │  Input: reviews  │  │  Input: reviews  │                │
│  │  Metric: COUNT   │  │  + review_answers│                │
│  │  Output: rank    │  │  Metric: AVG     │                │
│  │                  │  │  Output: rating   │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   COURSE         │  │ DEPARTMENT       │                │
│  │   SUBMISSION     │  │ AGGREGATE        │                │
│  │   SCORING        │  │ SCORING          │                │
│  │                  │  │                  │                │
│  │  Input: reviews  │  │  Input: all      │                │
│  │  + students      │  │  domain scores   │                │
│  │  Metric: %       │  │  Metric: AVG/SUM │                │
│  │  Output: rate    │  │  Output: overview │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Leaderboard Scoring Engine

### 4.1 Purpose

Rank students by the total number of feedback forms they have completed, to gamify participation and encourage higher submission rates.

### 4.2 Scoring Formula

```
Leaderboard Score = COUNT(reviews WHERE student_id = S)
```

| Variable              | Source                     | Description                      |
| --------------------- | -------------------------- | -------------------------------- |
| `student_id`          | `student_accounts.id`      | The student being scored          |
| `reviews`             | `reviews` table            | Submitted feedback records        |
| `submission_count`    | `COUNT(reviews.id)`        | Total completed submissions       |
| `rank`                | `RANK() OVER (...)`        | Position based on count           |

### 4.3 Ranking Logic

```sql
RANK() OVER (ORDER BY COUNT(r.id) DESC)
```

- **Tie-breaking**: Students with equal counts receive the **same rank** (standard competition ranking).
- **Example**: If 3 students have 10 submissions each, they all get rank 1. The next student gets rank 4.

### 4.4 SQL Implementation

```sql
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
    sa.id AS student_id,
    sa.full_name,
    COUNT(r.id) AS submission_count,
    RANK() OVER (ORDER BY COUNT(r.id) DESC) AS rank
FROM
    student_accounts sa
LEFT JOIN
    reviews r ON r.student_id = sa.id
WHERE
    sa.status = 'active'
GROUP BY
    sa.id, sa.full_name
ORDER BY
    submission_count DESC;
```

### 4.5 Display Rules

| Rule                                          | Implementation                                  |
| --------------------------------------------- | ------------------------------------------------ |
| Default view shows top 5                      | `SELECT * FROM leaderboard_view WHERE rank <= 5`  |
| Full view available on "View All"              | `SELECT * FROM leaderboard_view`                  |
| Never display review content                  | View only includes name + count + rank            |
| Students with 0 submissions appear at bottom   | `LEFT JOIN` ensures they are included              |
| Rankings update in real-time                   | View is recomputed on each query                   |

### 4.6 Privacy Constraints

- Leaderboard entries expose **only**: student name, submission count, rank.
- **Never exposed**: review text, ratings, trainer names, course details.
- Student IDs are UUIDs (not sequential) to prevent enumeration.

---

## 5. Trainer Performance Scoring Engine

### 5.1 Purpose

Compute a numerical performance score for each trainer/faculty member based on student feedback ratings, enabling HODs to assess teaching quality.

### 5.2 Scoring Formula

```
Trainer Performance Score = AVG(rating_value)
    WHERE rating_value FROM review_answers
    AND review is linked to trainer via feedback_form
```

### 5.3 Detailed Computation

```
                    Σ (all rating_value for trainer T)
Performance Score = ────────────────────────────────────
                    COUNT(all rating_value for trainer T)
```

| Variable              | Source                     | Description                           |
| --------------------- | -------------------------- | ------------------------------------- |
| `trainer_id`          | `trainers.id`              | The trainer being scored               |
| `feedback_forms`      | `feedback_forms` table     | Forms targeting this trainer           |
| `reviews`             | `reviews` table            | Submissions to those forms             |
| `review_answers`      | `review_answers` table     | Ratings within those submissions       |
| `rating_value`        | `review_answers.rating_value` | Individual rating (1-7 scale)       |
| `avg_rating`          | `AVG(rating_value)`        | Trainer's average score                |

### 5.4 Rating Scale

| Value | Label       | Color Code   | Interpretation           |
| ----- | ----------- | ------------ | ------------------------ |
| 1     | Very Poor   | 🔴 Red       | Needs immediate attention |
| 2     | Poor        | 🔴 Red       | Below expectations        |
| 3     | Below Avg   | 🟠 Orange    | Room for improvement      |
| 4     | Average     | 🟡 Yellow    | Meets minimum standard    |
| 5     | Good        | 🟢 Light Grn | Satisfactory performance  |
| 6     | Very Good   | 🟢 Green     | Above expectations        |
| 7     | Excellent   | 🔵 Blue      | Outstanding performance   |

### 5.5 SQL Implementation

```sql
CREATE OR REPLACE VIEW trainer_performance_view AS
SELECT
    t.id AS trainer_id,
    t.trainer_name,
    t.department,
    COUNT(DISTINCT r.id) AS total_reviews,
    COALESCE(ROUND(AVG(ra.rating_value)::numeric, 2), 0) AS avg_rating,
    COUNT(DISTINCT r.student_id) AS unique_reviewers,
    MIN(r.submitted_date) AS first_review_date,
    MAX(r.submitted_date) AS latest_review_date
FROM
    trainers t
LEFT JOIN
    feedback_forms ff ON ff.trainer_id = t.id
LEFT JOIN
    reviews r ON r.form_id = ff.id
LEFT JOIN
    review_answers ra ON ra.review_id = r.id AND ra.rating_value IS NOT NULL
WHERE
    t.active = true
GROUP BY
    t.id, t.trainer_name, t.department
ORDER BY
    avg_rating DESC;
```

### 5.6 Display Rules

| Rule                                          | Implementation                                  |
| --------------------------------------------- | ------------------------------------------------ |
| Sorted by average rating (highest first)       | `ORDER BY avg_rating DESC`                        |
| Show total number of reviews                   | `total_reviews` column                            |
| Show unique reviewer count                     | `unique_reviewers` column                         |
| Trainers with 0 reviews show score of 0        | `COALESCE(AVG(...), 0)`                           |
| HOD sees only their department                 | Filter by `department` in application/RLS          |
| Admin sees all departments                     | No filter applied                                  |

### 5.7 Minimum Review Threshold

To prevent unreliable scores from a single review:

- Display `avg_rating` only if `total_reviews >= 3`.
- If `total_reviews < 3`, display "Insufficient data" in the UI.
- The database still stores the computed value; the threshold is applied at the presentation layer.

---

## 6. Course Submission Rate Engine

### 6.1 Purpose

Track what percentage of enrolled students have submitted feedback for each course, allowing HODs to identify courses with low participation.

### 6.2 Scoring Formula

```
                          COUNT(DISTINCT students who submitted)
Submission Rate (%) = ──────────────────────────────────────────── × 100
                          COUNT(DISTINCT enrolled students)
```

### 6.3 SQL Implementation

```sql
CREATE OR REPLACE VIEW course_submission_view AS
SELECT
    c.id AS course_id,
    c.course_name,
    c.course_code,
    c.department,
    COUNT(DISTINCT sa.id) AS enrolled_students,
    COUNT(DISTINCT r.student_id) AS students_who_submitted,
    CASE
        WHEN COUNT(DISTINCT sa.id) > 0
        THEN ROUND(
            (COUNT(DISTINCT r.student_id)::numeric / COUNT(DISTINCT sa.id)) * 100,
            1
        )
        ELSE 0
    END AS submission_rate_pct
FROM
    courses c
LEFT JOIN
    student_accounts sa ON sa.course_id = c.id AND sa.status = 'active'
LEFT JOIN
    feedback_forms ff ON ff.course_id = c.id AND ff.status = 'active'
LEFT JOIN
    reviews r ON r.form_id = ff.id AND r.student_id = sa.id
WHERE
    c.active = true
GROUP BY
    c.id, c.course_name, c.course_code, c.department
ORDER BY
    c.course_name;
```

### 6.4 Display Rules

| Submission Rate | Color    | Label             | Icon     |
| --------------- | -------- | ----------------- | -------- |
| 0-25%           | 🔴 Red    | Critical          | ⚠️       |
| 26-50%          | 🟠 Orange | Low               | ↓        |
| 51-75%          | 🟡 Yellow | Moderate          | →        |
| 76-100%         | 🟢 Green  | Good / Complete   | ✓        |

---

## 7. Department Aggregate Scoring

### 7.1 Purpose

Roll up all scoring data to the department level for the admin overview dashboard.

### 7.2 Metrics Computed

| Metric                  | Formula                                                  |
| ----------------------- | -------------------------------------------------------- |
| Total Courses           | `COUNT(courses WHERE department = D)`                    |
| Total Trainers          | `COUNT(trainers WHERE department = D)`                   |
| Total Students          | `COUNT(student_accounts WHERE course.department = D)`    |
| Avg Trainer Rating      | `AVG(trainer_performance_view.avg_rating WHERE dept = D)` |
| Avg Submission Rate     | `AVG(course_submission_view.submission_rate_pct WHERE dept = D)` |
| Total Reviews           | `COUNT(reviews WHERE course.department = D)`              |

### 7.3 SQL Implementation

```sql
CREATE OR REPLACE VIEW department_overview_view AS
SELECT
    c.department,
    COUNT(DISTINCT c.id) AS course_count,
    COUNT(DISTINCT t.id) AS trainer_count,
    COUNT(DISTINCT sa.id) AS student_count,
    COUNT(DISTINCT r.id) AS review_count,
    COALESCE(ROUND(AVG(ra.rating_value)::numeric, 2), 0) AS avg_rating,
    CASE
        WHEN COUNT(DISTINCT sa.id) > 0
        THEN ROUND(
            (COUNT(DISTINCT CASE WHEN r.id IS NOT NULL THEN sa.id END)::numeric
            / COUNT(DISTINCT sa.id)) * 100, 1
        )
        ELSE 0
    END AS participation_rate_pct
FROM
    courses c
LEFT JOIN trainers t ON t.department = c.department
LEFT JOIN student_accounts sa ON sa.course_id = c.id AND sa.status = 'active'
LEFT JOIN feedback_forms ff ON ff.course_id = c.id
LEFT JOIN reviews r ON r.form_id = ff.id
LEFT JOIN review_answers ra ON ra.review_id = r.id AND ra.rating_value IS NOT NULL
WHERE
    c.active = true
GROUP BY
    c.department
ORDER BY
    c.department;
```

---

## 8. Comparison with Old Scoring System

### 8.1 Old System (TLFQ)

The old system computed analytics entirely in application code (`responseController.js`):

```javascript
// Old approach: N+1 queries in nested loops
for (const f of facultyList) {
    const tlfqs = await Tlfq.find({ faculty_id: f._id });
    const tlfqIds = tlfqs.map(t => t._id);
    const responses = await Response.find({ tlfq_id: { $in: tlfqIds } });
    const responseIds = responses.map(r => r._id);
    const answers = await Answer.find({ response_id: { $in: responseIds } });
    const sum = answers.reduce((acc, cur) => acc + cur.rating, 0);
    const count = answers.length;
    // ... compute average
}
```

**Problems:**

| Issue                    | Impact                                              |
| ------------------------ | --------------------------------------------------- |
| N+1 query pattern        | O(n×m) database calls; extremely slow for large datasets |
| No caching               | Every page load re-runs all queries                  |
| No leaderboard           | Feature did not exist                                |
| Application-level loops  | CPU-bound computation in Node.js; blocks event loop  |
| No pagination            | Returns all records; memory pressure                 |

### 8.2 New System (IFS v2.0)

| Improvement              | Implementation                                      |
| ------------------------ | --------------------------------------------------- |
| SQL Views                | Database computes aggregates; single query per metric |
| RANK() window function   | Efficient ranking without application sorting         |
| LEFT JOIN aggregation    | Single pass through all related data                  |
| Indexed foreign keys     | O(log n) lookups instead of O(n) scans                |
| Pagination               | `LIMIT`/`OFFSET` in all list queries                  |
| Real-time updates        | Views recompute automatically when data changes       |

---

## 9. Performance Benchmarks

### 9.1 Expected Query Performance

| Query                          | Old System (est.)    | New System (target) |
| ------------------------------ | -------------------- | -------------------- |
| Leaderboard (top 5)            | N/A (not implemented) | ≤ 50 ms             |
| Leaderboard (all students)     | N/A                  | ≤ 200 ms            |
| Trainer performance (1 dept)   | 2-5 sec              | ≤ 100 ms            |
| Trainer performance (all)      | 5-15 sec             | ≤ 200 ms            |
| Course submission rates        | 2-5 sec              | ≤ 100 ms            |
| Department overview            | 3-8 sec              | ≤ 150 ms            |
| Admin global stats             | 1-3 sec              | ≤ 100 ms            |

### 9.2 Optimization Strategies

| Strategy                          | Description                                       |
| --------------------------------- | ------------------------------------------------- |
| Materialized views (future)       | If views become slow, convert to materialized + refresh |
| Partial indexes                   | Index only `status = 'active'` rows                |
| Connection pooling                | Supabase PgBouncer handles pool management          |
| Query result caching              | Client-side caching with SWR/stale-while-revalidate |

---

## 10. Edge Cases & Business Rules

### 10.1 Leaderboard

| Edge Case                             | Handling                                         |
| ------------------------------------- | ------------------------------------------------ |
| Student with 0 submissions            | Appears in full list with count=0, rank=last     |
| Suspended student                     | Excluded from leaderboard (`status = 'active'`)  |
| Deleted student                       | Cascade deletes reviews; auto-removed from view   |
| Tied submission counts                | Same rank assigned (competition ranking)          |
| Student submits then form is closed   | Submission counts; form status doesn't affect score |

### 10.2 Trainer Performance

| Edge Case                             | Handling                                         |
| ------------------------------------- | ------------------------------------------------ |
| Trainer with no reviews               | Shows avg_rating = 0, total_reviews = 0           |
| Trainer with < 3 reviews              | UI shows "Insufficient data" (3-review threshold) |
| Only text reviews (no ratings)        | avg_rating = 0 (no rating_value to average)       |
| Inactive trainer                      | Excluded from view (`active = true`)              |
| Multiple forms for same trainer       | All ratings aggregated across forms               |

### 10.3 Submission Rate

| Edge Case                             | Handling                                         |
| ------------------------------------- | ------------------------------------------------ |
| Course with 0 enrolled students       | Rate = 0% (division guard)                       |
| Course with no active forms           | No reviews possible; rate = 0%                    |
| Student enrolled but account suspended| Excluded from enrolled count                      |
| Inactive course                       | Excluded from view (`active = true`)              |

---

## 11. Future Scoring Extensions

| Feature                        | Description                                         | Priority |
| ------------------------------ | --------------------------------------------------- | -------- |
| Weighted scoring               | Different weights for different question types       | P2       |
| Trend analysis                 | Track score changes over semesters                   | P2       |
| Sentiment scoring              | NLP-based analysis of review text                    | P3       |
| Peer comparison                | "Your trainer is in the top 10%" style insights      | P3       |
| Gamification badges            | Award badges for milestones (5, 10, 25 submissions)  | P2       |
| Materialized views             | Pre-compute scores for large datasets                | P2       |
| CSV/PDF export                 | Export analytics reports                              | P2       |
