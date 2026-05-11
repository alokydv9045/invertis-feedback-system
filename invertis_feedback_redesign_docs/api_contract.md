# API Contract

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **API Style**    | Supabase Client SDK + Optional REST |
| **Auth Method**  | Supabase JWT (Bearer Token)      |
| **Last Updated** | 2026-05-10                        |

---

## 2. API Architecture

The system uses two API access patterns:

1. **Supabase Client SDK** (primary): Direct database access from the frontend via `@supabase/supabase-js`. Row-Level Security (RLS) enforces access control.
2. **Optional REST API** (Express): For operations requiring server-side logic (admin bulk ops, complex validation, upload orchestration).

### Base URLs

| Layer            | URL                                              |
| ---------------- | ------------------------------------------------ |
| Supabase         | `https://<project-ref>.supabase.co`               |
| Optional API     | `https://api.ifs.invertis.edu.in` or `localhost:5000` |

### Authentication Header

All requests include:

```
Authorization: Bearer <supabase_access_token>
```

---

## 3. Authentication Endpoints

### 3.1 `POST /auth/register-student`

Registers a new student account.

**Request:**

```json
{
    "email": "student@invertis.edu.in",
    "password": "securepassword123",
    "full_name": "Amit Sharma",
    "course_id": "uuid-of-course",
    "start_year": 2024,
    "end_year": 2028,
    "id_card_file": "<multipart file>"
}
```

**Flow:**

1. Call `supabase.auth.signUp({ email, password })`.
2. Upload ID card to `supabase.storage.from('id_card_images').upload(...)`.
3. Insert into `student_accounts` table.

**Success Response: `201 Created`**

```json
{
    "success": true,
    "message": "Registration successful. Please log in.",
    "data": {
        "user_id": "uuid",
        "email": "student@invertis.edu.in"
    }
}
```

**Error Responses:**

| Status | Body                                                          | Condition                     |
| ------ | ------------------------------------------------------------- | ----------------------------- |
| 400    | `{ "error": "All fields are required." }`                     | Missing required fields        |
| 400    | `{ "error": "End year must be after start year." }`           | Invalid year range             |
| 400    | `{ "error": "File must be JPEG or PNG, max 5 MB." }`         | Invalid file                   |
| 409    | `{ "error": "Email already registered." }`                    | Duplicate email                |
| 500    | `{ "error": "Registration failed. Please try again." }`      | Server error                   |

---

### 3.2 `POST /auth/login`

Logs in a user (student, HOD, or admin).

**Request:**

```json
{
    "email": "user@invertis.edu.in",
    "password": "password123"
}
```

**Flow:**

1. Call `supabase.auth.signInWithPassword({ email, password })`.
2. Determine role via `get_user_role(auth_user_id)` RPC.
3. Fetch profile from the appropriate role table.

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": {
        "session": {
            "access_token": "jwt-token",
            "refresh_token": "refresh-token",
            "expires_in": 86400
        },
        "user": {
            "id": "uuid",
            "email": "user@invertis.edu.in",
            "role": "student",
            "profile": {
                "id": "uuid",
                "full_name": "Amit Sharma",
                "course_id": "uuid",
                "start_year": 2024,
                "end_year": 2028
            }
        }
    }
}
```

**Error Responses:**

| Status | Body                                                      | Condition               |
| ------ | --------------------------------------------------------- | ----------------------- |
| 400    | `{ "error": "Email and password are required." }`         | Missing fields           |
| 401    | `{ "error": "Invalid email or password." }`               | Wrong credentials        |
| 403    | `{ "error": "Account suspended. Contact admin." }`        | Account suspended        |

---

### 3.3 `POST /auth/logout`

Logs out the current user.

**Flow:**

1. Call `supabase.auth.signOut()`.

**Success Response: `200 OK`**

```json
{
    "success": true,
    "message": "Logged out successfully."
}
```

---

### 3.4 `POST /auth/reset-password`

Sends a password reset email.

**Request:**

```json
{
    "email": "user@invertis.edu.in"
}
```

**Success Response: `200 OK`**

```json
{
    "success": true,
    "message": "Password reset email sent."
}
```

---

### 3.5 `GET /auth/me`

Returns the current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "email": "user@invertis.edu.in",
        "role": "student",
        "profile": {
            "id": "uuid",
            "full_name": "Amit Sharma",
            "course_id": "uuid",
            "start_year": 2024,
            "end_year": 2028,
            "id_card_image_url": "https://...",
            "status": "active"
        }
    }
}
```

---

## 4. Course Endpoints

### 4.1 `GET /courses`

Returns list of courses. Scoped by role.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Param       | Type    | Required | Description                    |
| ----------- | ------- | -------- | ------------------------------ |
| department  | string  | No       | Filter by department            |
| active      | boolean | No       | Filter by active status         |

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "course_name": "Data Structures",
            "course_code": "CS101",
            "department": "Computer Science & Engineering",
            "active": true
        }
    ]
}
```

---

### 4.2 `POST /courses` (Admin only)

Creates a new course.

**Request:**

```json
{
    "course_name": "Machine Learning",
    "course_code": "CS401",
    "department": "Computer Science & Engineering"
}
```

**Success Response: `201 Created`**

```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "course_name": "Machine Learning",
        "course_code": "CS401",
        "department": "Computer Science & Engineering",
        "active": true
    }
}
```

**Error Responses:**

| Status | Body                                                   | Condition               |
| ------ | ------------------------------------------------------ | ----------------------- |
| 400    | `{ "error": "Name, code, and department required." }`  | Missing fields           |
| 409    | `{ "error": "Course code already exists." }`           | Duplicate code           |
| 403    | `{ "error": "Unauthorized." }`                         | Non-admin user           |

---

### 4.3 `DELETE /courses/:id` (Admin only)

Deletes a course.

**Success Response: `200 OK`**

```json
{
    "success": true,
    "message": "Course deleted successfully."
}
```

| Status | Body                                                   | Condition               |
| ------ | ------------------------------------------------------ | ----------------------- |
| 400    | `{ "error": "Cannot delete: active forms exist." }`    | Referential integrity    |
| 404    | `{ "error": "Course not found." }`                     | Invalid ID               |

---

## 5. Trainer Endpoints

### 5.1 `GET /trainers`

Returns trainers. HOD sees own department; Admin sees all.

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "trainer_name": "Dr. Alan Turing",
            "department": "Computer Science & Engineering",
            "active": true
        }
    ]
}
```

---

### 5.2 `POST /trainers` (Admin only)

Creates a new trainer.

**Request:**

```json
{
    "trainer_name": "Dr. New Faculty",
    "department": "Computer Science & Engineering"
}
```

**Success Response: `201 Created`**

---

### 5.3 `DELETE /trainers/:id` (Admin only)

Deletes a trainer.

**Success Response: `200 OK`**

---

## 6. Feedback Form Endpoints

### 6.1 `GET /forms/assigned`

Returns active forms assigned to the logged-in student (based on course enrollment).

**Headers:** `Authorization: Bearer <token>` (Student only)

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": [
        {
            "form_id": "uuid",
            "title": "End Semester Feedback - Data Structures (CS101)",
            "subject_name": "Data Structures",
            "trainer_name": "Dr. Alan Turing",
            "course_name": "Data Structures",
            "published_at": "2026-04-01T10:00:00Z",
            "is_completed": false
        },
        {
            "form_id": "uuid",
            "title": "Mid Semester Feedback - Operating Systems (CS202)",
            "subject_name": "Operating Systems",
            "trainer_name": "Dr. Grace Hopper",
            "course_name": "Operating Systems",
            "published_at": "2026-03-15T09:00:00Z",
            "is_completed": true
        }
    ]
}
```

---

### 6.2 `GET /forms/:formId`

Returns a specific form with its questions.

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "title": "End Semester Feedback - Data Structures (CS101)",
        "subject_name": "Data Structures",
        "trainer_name": "Dr. Alan Turing",
        "course_name": "Data Structures",
        "status": "active",
        "published_at": "2026-04-01T10:00:00Z",
        "questions": [
            {
                "id": "uuid",
                "question_text": "How would you rate the teaching quality?",
                "question_type": "rating",
                "sort_order": 1
            },
            {
                "id": "uuid",
                "question_text": "What could be improved?",
                "question_type": "text",
                "sort_order": 2
            }
        ]
    }
}
```

---

### 6.3 `POST /forms` (HOD / Admin)

Publishes a new feedback form.

**Request:**

```json
{
    "course_id": "uuid",
    "trainer_id": "uuid",
    "subject_name": "Data Structures",
    "title": "End Semester Feedback - Data Structures (CS101)",
    "questions": [
        {
            "question_text": "How would you rate the teaching quality?",
            "question_type": "rating",
            "sort_order": 1
        },
        {
            "question_text": "What could be improved?",
            "question_type": "text",
            "sort_order": 2
        }
    ]
}
```

**Success Response: `201 Created`**

```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "title": "End Semester Feedback - Data Structures (CS101)",
        "status": "active",
        "published_at": "2026-05-10T10:00:00Z",
        "question_count": 2
    }
}
```

**Error Responses:**

| Status | Body                                                                | Condition               |
| ------ | ------------------------------------------------------------------- | ----------------------- |
| 400    | `{ "error": "Course, trainer, subject, title required." }`          | Missing fields           |
| 400    | `{ "error": "At least one question is required." }`                 | No questions             |
| 403    | `{ "error": "Unauthorized." }`                                      | Student user             |

---

### 6.4 `PATCH /forms/:formId/status` (HOD / Admin)

Activates or deactivates a form.

**Request:**

```json
{
    "status": "closed"
}
```

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "status": "closed",
        "closed_at": "2026-05-10T15:00:00Z"
    }
}
```

---

### 6.5 `GET /forms` (HOD / Admin)

Lists all forms. HOD sees own department; Admin sees all.

**Query Parameters:**

| Param   | Type   | Required | Description                    |
| ------- | ------ | -------- | ------------------------------ |
| status  | string | No       | Filter: 'active' or 'closed'   |
| page    | number | No       | Page number (default 1)         |
| limit   | number | No       | Items per page (default 20)     |

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": [ "..." ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 45,
        "total_pages": 3
    }
}
```

---

## 7. Review Endpoints

### 7.1 `POST /reviews` (Student only)

Submits a review for a feedback form.

**Request:**

```json
{
    "form_id": "uuid",
    "review_text": "The teaching was excellent. Dr. Turing explains complex concepts very clearly.",
    "answers": [
        {
            "question_id": "uuid",
            "rating_value": 6
        },
        {
            "question_id": "uuid",
            "answer_text": "More practical lab sessions would help."
        }
    ]
}
```

**Flow:**

1. Validate `form_id` is active and assigned to the student's course.
2. Check no existing review for this student + form.
3. Insert `reviews` row with auto date/time.
4. Insert `review_answers` rows.

**Success Response: `201 Created`**

```json
{
    "success": true,
    "message": "Thank you! Your feedback has been recorded.",
    "data": {
        "review_id": "uuid",
        "submitted_date": "2026-05-10",
        "submitted_time": "15:30:00"
    }
}
```

**Error Responses:**

| Status | Body                                                              | Condition               |
| ------ | ----------------------------------------------------------------- | ----------------------- |
| 400    | `{ "error": "Review text must be at least 10 characters." }`     | Short review             |
| 400    | `{ "error": "form_id and review_text are required." }`           | Missing fields           |
| 409    | `{ "error": "You have already submitted feedback for this form."}` | Duplicate submission   |
| 403    | `{ "error": "This form is not assigned to your course." }`       | Unauthorized form        |
| 404    | `{ "error": "Form not found or no longer active." }`             | Invalid/closed form      |

---

### 7.2 `GET /reviews/history` (Student only)

Returns the student's submission history.

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": [
        {
            "review_id": "uuid",
            "form_title": "End Semester Feedback - Data Structures (CS101)",
            "trainer_name": "Dr. Alan Turing",
            "subject_name": "Data Structures",
            "submitted_date": "2026-05-10",
            "submitted_time": "15:30:00"
        }
    ]
}
```

---

## 8. Analytics Endpoints

### 8.1 `GET /analytics/trainer-performance` (HOD / Admin)

Returns trainer performance metrics.

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": [
        {
            "trainer_id": "uuid",
            "trainer_name": "Dr. Alan Turing",
            "department": "Computer Science & Engineering",
            "total_reviews": 45,
            "avg_rating": 6.23,
            "unique_reviewers": 38
        }
    ]
}
```

---

### 8.2 `GET /analytics/submission-rates` (HOD / Admin)

Returns course-level submission rates.

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": [
        {
            "course_id": "uuid",
            "course_name": "Data Structures",
            "course_code": "CS101",
            "department": "Computer Science & Engineering",
            "enrolled_students": 50,
            "students_who_submitted": 38,
            "submission_rate_pct": 76.0
        }
    ]
}
```

---

### 8.3 `GET /analytics/leaderboard`

Returns the student leaderboard.

**Query Parameters:**

| Param | Type   | Required | Description                   |
| ----- | ------ | -------- | ----------------------------- |
| limit | number | No       | Number of entries (default 5)  |

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": [
        {
            "student_id": "uuid",
            "full_name": "Amit Sharma",
            "submission_count": 12,
            "rank": 1
        },
        {
            "student_id": "uuid",
            "full_name": "Sneha Verma",
            "submission_count": 10,
            "rank": 2
        }
    ]
}
```

---

### 8.4 `GET /analytics/admin-stats` (Admin only)

Returns global platform statistics.

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": {
        "total_students": 250,
        "total_trainers": 18,
        "total_courses": 12,
        "total_forms": 24,
        "total_reviews": 892,
        "completion_rate_pct": 72
    }
}
```

---

### 8.5 `GET /analytics/recent-feedback` (HOD / Admin)

Returns recent anonymous feedback comments.

**Query Parameters:**

| Param | Type   | Required | Description                    |
| ----- | ------ | -------- | ------------------------------ |
| limit | number | No       | Number of entries (default 20)  |

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": [
        {
            "review_text": "Very satisfied with the teaching methodology.",
            "trainer_name": "Dr. Alan Turing",
            "course_name": "Data Structures",
            "submitted_date": "2026-05-10",
            "submitted_time": "14:30:00"
        }
    ]
}
```

---

## 9. User Management Endpoints (Admin only)

### 9.1 `GET /users`

Lists all users with role filtering.

**Query Parameters:**

| Param      | Type   | Required | Description                           |
| ---------- | ------ | -------- | ------------------------------------- |
| role       | string | No       | Filter: 'student', 'hod', 'admin'     |
| department | string | No       | Filter by department                    |
| search     | string | No       | Search by name or email                 |
| page       | number | No       | Page number (default 1)                 |
| limit      | number | No       | Items per page (default 20)             |

**Success Response: `200 OK`**

```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "auth_user_id": "uuid",
            "full_name": "Amit Sharma",
            "email": "student@invertis.edu.in",
            "role": "student",
            "department": "Computer Science & Engineering",
            "status": "active",
            "created_at": "2026-04-01T10:00:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 250,
        "total_pages": 13
    }
}
```

---

### 9.2 `POST /users` (Admin only)

Creates a new HOD or Admin account.

**Request:**

```json
{
    "email": "hod.new@invertis.edu.in",
    "password": "temppassword123",
    "full_name": "Dr. New HOD",
    "role": "hod",
    "department": "Computer Science & Engineering"
}
```

**Success Response: `201 Created`**

```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "email": "hod.new@invertis.edu.in",
        "role": "hod",
        "full_name": "Dr. New HOD"
    }
}
```

---

### 9.3 `DELETE /users/:id` (Admin only)

Deletes a user account and cascades.

**Success Response: `200 OK`**

```json
{
    "success": true,
    "message": "User and related data deleted successfully."
}
```

| Status | Body                                                     | Condition                     |
| ------ | -------------------------------------------------------- | ----------------------------- |
| 400    | `{ "error": "Cannot delete your own account." }`         | Self-deletion attempt          |
| 404    | `{ "error": "User not found." }`                         | Invalid ID                     |

---

## 10. Error Response Format

All errors follow a consistent format:

```json
{
    "success": false,
    "error": "Human-readable error message.",
    "code": "ERROR_CODE",
    "details": {}
}
```

### Standard Error Codes

| Code                    | HTTP Status | Description                          |
| ----------------------- | ----------- | ------------------------------------ |
| `VALIDATION_ERROR`      | 400         | Invalid input data                    |
| `AUTHENTICATION_ERROR`  | 401         | Missing or invalid token              |
| `AUTHORIZATION_ERROR`   | 403         | Insufficient permissions              |
| `NOT_FOUND`             | 404         | Resource not found                    |
| `CONFLICT`              | 409         | Duplicate resource                    |
| `INTERNAL_ERROR`        | 500         | Server-side failure                   |

---

## 11. Rate Limiting

| Endpoint Category   | Limit                    |
| ------------------- | ------------------------ |
| Auth (login/register)| 10 requests / minute     |
| Read endpoints       | 100 requests / minute    |
| Write endpoints      | 30 requests / minute     |
| File uploads         | 5 requests / minute      |

---

## 12. API Versioning

For the optional REST API layer:

- Base path: `/api/v1/...`
- Version is embedded in the URL path.
- Supabase SDK calls are not versioned (managed by Supabase).
