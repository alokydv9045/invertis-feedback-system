# 📘 Invertis Feedback System — User Manual

> **Version:** 2.0 &nbsp;|&nbsp; **University:** Invertis University, Lucknow &nbsp;|&nbsp; **System:** Teaching-Learning Feedback System (TLFQ)

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [How to Access the System](#2-how-to-access-the-system)
3. [Role Guide — Super Admin](#3-role-guide--super-admin)
4. [Role Guide — Coordinator](#4-role-guide--coordinator)
5. [Role Guide — HOD](#5-role-guide--hod)
6. [Role Guide — Student](#6-role-guide--student)
7. [Login Credentials (Demo/Test)](#7-login-credentials-demotest)
8. [Troubleshooting](#8-troubleshooting)
9. [FAQ](#9-faq)

---

## 1. System Overview

The **Invertis Feedback System (TLFQ)** is a university-wide digital platform for collecting structured, anonymous student feedback on faculty performance — department-wise, section-wise, and semester-wise.

### How It Works

```
Super Admin
  └── Creates Departments, Coordinators, and HODs

Coordinator
  └── Creates Sections (e.g., BCS-3A, BTAI-5B)
  └── Adds Faculty and assigns them to Sections
  └── Pre-registers Students with a Student ID
  └── Manages Courses per Department

HOD (Head of Department)
  └── Creates Evaluation Forms (TLFQ) for each Section + Faculty
  └── Sets submission deadlines
  └── Opens or Closes the Department Portal
  └── Views department analytics

Student
  └── Logs in with Student ID (first time) → sets email + password
  └── Views evaluation forms assigned to their section
  └── Submits anonymous feedback for each faculty
```

---

## 2. How to Access the System

### URL
- **Frontend:** `http://localhost:5173` (development) or your deployed URL
- **API Backend:** `http://localhost:5000`

### Single Login Page
All users — Super Admin, Coordinator, HOD, and Students — log in from the **same login page** at `/login`.

The system automatically detects your role based on what you enter:
- **Staff (Admin/HOD/Coordinator):** Enter your email address
- **Students:** Enter your Student ID (e.g., `BCS2025_01`)

---

## 3. Role Guide — Super Admin

**Who:** The top-level university system administrator.

### What You Can Do
- Create and manage **Departments**
- Create **HOD accounts** (assign each HOD to a department)
- Create **Coordinator accounts** (university-wide, no department restriction)
- View and delete any staff user

### How to Login
1. Go to the login page
2. Enter your **email address** → click Continue
3. Enter your **password** → click Sign In
4. You will land on the **Super Admin Panel**

### Step-by-Step: Creating an HOD
1. Open **User Management** tab in Super Admin Panel
2. Click **"Create HOD"**
3. Fill in: Name, Email, Password, and select the Department
4. Click **Save** — the HOD can now log in immediately

### Step-by-Step: Creating a Coordinator
1. Open **User Management** tab
2. Click **"Create Coordinator"**
3. Fill in: Name, Email, Password
4. Click **Save** — the Coordinator has university-wide access

---

## 4. Role Guide — Coordinator

**Who:** University-level staff who manages the academic infrastructure (no department boundary).

### What You Can Do
- **Departments Tab:** View all departments (created by Super Admin)
- **Sections Tab:** Create sections (e.g., `BCS-3A` → Semester 3, Section A, BCS department)
- **Courses Tab:** Add courses to departments (name + course code)
- **Faculty Tab:** Add faculty members to departments
- **Assignments Tab:** Assign a faculty member to a specific Section + Course
- **Students Tab:** Pre-register students with a Student ID (they activate their own account)

### How to Login
1. Go to the login page
2. Enter your **email** → Continue → **password** → Sign In
3. You will land on the **Coordinator Panel**

### Step-by-Step: Adding a Student

> Students **do not** self-register. The Coordinator pre-creates their account with just a Student ID.

1. Open **Students** tab in Coordinator Panel
2. Click **"Add Student"**
3. Enter:
   - **Name:** Student's full name
   - **Student ID:** e.g., `BCS2025_15` (format: DEPT + YEAR + _ + number)
   - **Department:** Select from dropdown
   - **Section:** Select the section they belong to
   - **Semester:** Current semester number
4. Click **Save**
5. The student's status will be **Pending** until they activate their account

### Student ID Format
```
BCS2025_01    →  BCS dept, batch 2025, student #01
BTAI2025_12   →  BTAI dept, batch 2025, student #12
BTME2026_03   →  BTME dept, batch 2026, student #03
```

---

## 5. Role Guide — HOD

**Who:** Head of Department — manages feedback cycles for their own department only.

### What You Can Do
- **Create Evaluation Forms (TLFQ):** Assign a form to a specific Section + Faculty + Course
- **Set Deadlines:** Choose when a form closes automatically
- **Open / Close Portal:** Toggle the department portal (when closed, no student can submit)
- **Toggle individual forms:** Open or close specific forms
- **View Analytics:** See department-level faculty ratings and response trends

### How to Login
1. Go to the login page
2. Enter your **email** → Continue → **password** → Sign In
3. You will land on the **HOD Dashboard**

### Step-by-Step: Creating an Evaluation Form

1. Open **HOD Panel** → click **"Create Form"** tab
2. Select a **Section** (e.g., BCS-3A)
3. The system will show all **Faculty + Course** assignments for that section
4. Select the Faculty + Course combination
5. Enter a **Title** for the form (e.g., "BCS-3A — DBMS Mid-Semester Feedback")
6. Set the **Closing Date** (deadline for student submissions)
7. Click **Create Form**
8. The form is created in **active** state — students can submit immediately

### Step-by-Step: Closing a Form Early
1. Go to **Manage Forms** tab
2. Find the form you want to close
3. Click the **toggle button** (🟢 Open → 🔴 Closed)
4. Students can no longer submit responses to that form

### Step-by-Step: Closing the Department Portal
> This instantly stops ALL feedback submissions across your department.

1. Go to your **HOD Dashboard**
2. Find the **Portal Status** card
3. Click **"Close Portal"**
4. All forms remain visible to students but submissions are blocked

---

## 6. Role Guide — Student

**Who:** Enrolled students who submit anonymous feedback for their section's faculty.

### First-Time Login (Account Activation)

> You must have received a **Student ID** from your Coordinator before proceeding.

1. Go to the login page
2. Enter your **Student ID** (e.g., `BCS2025_01`) → click **Continue**
3. The system detects your account is **Pending**
4. You will be prompted to:
   - Enter your **Email Address**
   - Create a **Password** (minimum 8 characters)
   - Confirm your password
5. Click **Activate Account & Login**
6. You are now logged in — you will not need to do this again

### Returning Login (After Activation)

1. Go to the login page
2. Enter your **Student ID** → click **Continue**
3. Enter your **Password** → click **Sign In**

> **Alternative:** You can also log in with your **email** that you set during activation.

### Submitting Feedback

1. After login, you'll see your **Dashboard** with all active evaluation forms
2. Each card shows a course and faculty member assigned to your section
3. Click **"Start Evaluation"** on any pending form
4. Answer all questions using the 1–7 rating scale:
   - `1` = Strongly Disagree
   - `4` = Neutral
   - `7` = Strongly Agree
5. Optionally, type an anonymous comment in the text box
6. Click **Submit Evaluation**
7. The form is now marked as completed — you cannot edit it

### Important Notes for Students
- ✅ Your identity is **never stored** with your responses — all feedback is anonymous
- ✅ You can only see forms for **your section** — not other sections or departments
- ✅ Forms disappear after their **deadline** has passed
- ✅ Each form can only be submitted **once** — there is no editing after submission
- ✅ Feedback drafts are **auto-saved** while you're filling a form

---

## 7. Login Credentials (Demo/Test)

> ⚠️ These are **demo credentials** for testing only. Change all passwords before production use.

### Staff Accounts

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `admin@invertis.edu.in` | `Admin@2025` |
| **Coordinator** | `coordinator@invertis.edu.in` | `Coord@2025` |
| **HOD — B.Tech AI** | `hod.btai@invertis.edu.in` | `Hod@2025` |
| **HOD — B.Tech CS** | `hod.bcs@invertis.edu.in` | `Hod@2025` |
| **HOD — Electronics** | `hod.btec@invertis.edu.in` | `Hod@2025` |
| **HOD — Mechanical** | `hod.btme@invertis.edu.in` | `Hod@2025` |
| **HOD — Civil** | `hod.btce@invertis.edu.in` | `Hod@2025` |

### Student Accounts

| Student ID | Email | Password | Department | Section | Status |
|-----------|-------|----------|-----------|---------|--------|
| `BTAI2025_01` | `btai2025.01@iu.edu.in` | `Student@2025` | B.Tech AI | BTAI-3A, Sem 3 | ✅ Active |
| `BCS2025_01` | `bcs2025.01@iu.edu.in` | `Student@2025` | B.Tech CS | BCS-3A, Sem 3 | ✅ Active |
| `BTEC2025_01` | `btec2025.01@iu.edu.in` | `Student@2025` | Electronics | BTEC-3A, Sem 3 | ✅ Active |
| `BTAI2025_02` | _(not set)_ | — | B.Tech AI | BTAI-3A, Sem 3 | ⏳ Pending |
| `BCS2025_02` | _(not set)_ | — | B.Tech CS | BCS-3A, Sem 3 | ⏳ Pending |
| `BTME2025_01` | `btme2025.01@iu.edu.in` | `Student@2025` | Mechanical | BTME-3A, Sem 3 | ✅ Active |

> **To test Student Registration:** Enter `BTAI2025_02` on the login page → you'll be prompted to set email + password.

---

## 8. Troubleshooting

### "Student ID not found"
- Double-check the ID with your department coordinator
- Make sure you're entering it correctly (e.g., `BCS2025_01` not `bcs2025-01`)
- The ID is **case-insensitive** — `bcs2025_01` and `BCS2025_01` both work

### "Incorrect password"
- Staff: Use the email you were given when your account was created
- Students: Use the password you set during your first login
- Contact your Coordinator if you've forgotten your password — they can reset it

### "No forms available"
- The HOD may not have created forms for your section yet
- The department portal may be closed by the HOD
- All forms for your section may have reached their deadline

### "Portal is closed"
- The HOD has temporarily disabled submissions for your department
- Wait for the HOD to reopen the portal, or contact them directly

### Cannot access Admin/HOD panel
- You are logged in as the wrong role
- Log out and log in again with the correct email

### Server won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000
# If something is using it, stop it or change PORT in .env

# Check MongoDB connection
# Make sure MONGO_URI in .env is correct
```

---

## 9. FAQ

**Q: Can a student see another student's responses?**
No. All responses are anonymous. Neither students, HODs, nor Coordinators can link a response back to a specific student.

**Q: Can I submit feedback more than once for the same faculty?**
No. Each form can only be submitted once per student. After submission, the form is locked.

**Q: Can an HOD see which student submitted what comment?**
No. Comments are stored without any student identifier. They are shown only in aggregate in analytics.

**Q: What happens when a form's deadline passes?**
The form is automatically hidden from students' dashboards. No new submissions are accepted.

**Q: Can a student change their email or password after activation?**
Contact your Coordinator — they can reset your account from the Coordinator Panel.

**Q: Can the Coordinator create forms?**
No. Only HODs can create, manage, and publish evaluation forms. The Coordinator manages the infrastructure (sections, faculty, students).

**Q: Can one faculty be assigned to multiple sections?**
Yes. A faculty member can be assigned to as many sections as needed, and separate TLFQ forms are created per section.

**Q: What does the Leaderboard show?**
The Leaderboard shows an **anonymized ranking** of faculty based on average feedback ratings. No personally identifying information is shown by default.

---

## 📞 Support

For system issues, contact the university IT department or the Academic Coordinator at:
`coordinator@invertis.edu.in`

---

*Invertis University, Lucknow · TLFQ System v2.0 · © 2025*
