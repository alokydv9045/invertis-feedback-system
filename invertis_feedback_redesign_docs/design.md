# UI Design Requirements

## Invertis Feedback System — v2.0 Redesign

---

## 1. Document Information

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Product**      | Invertis Feedback System (IFS)   |
| **Version**      | 2.0                              |
| **Purpose**      | Comprehensive list of all UI pages and their components to guide frontend development and UI design. |

---

## 2. Public / Unauthenticated Pages

These pages are accessible without logging in and form the entry point to the application.

### 2.1 Login Page
- **Purpose**: Entry point for all users (Students, HODs, Admins).
- **Key Components**:
  - Invertis University Logo (prominent).
  - Email input field.
  - Password input field.
  - "Login" primary button.
  - "Forgot Password?" link.
  - "New student? Register here" link.
- **Design Note**: Clean, formal, white/light-gray background with Invertis Blue/Orange accents.

### 2.2 Student Registration Page
- **Purpose**: Allows new students to create an account and verify their identity.
- **Key Components**:
  - Full Name input.
  - Email input.
  - Password & Confirm Password inputs.
  - Course selection dropdown (populated from DB).
  - Start Year & End Year selectors.
  - ID Card Photo upload zone (drag-and-drop or file select with image preview).
  - "Register" primary button.
  - "Already registered? Login" link.

### 2.3 Forgot Password Page
- **Purpose**: Allows users to initiate a password reset.
- **Key Components**:
  - Email input field.
  - "Send Reset Link" button.
  - "Back to Login" link.

---

## 3. Student Panel

Accessible only to users with the `student` role. Focuses on completing assigned feedback forms and viewing the leaderboard.

### 3.1 Student Dashboard
- **Purpose**: Main landing page showing pending tasks and overall progress.
- **Key Components**:
  - **Welcome Banner**: "Welcome, [Name]" with course and batch info.
  - **Progress Summary Widget**: Visual indicator of total assigned vs. completed feedback forms.
  - **Assigned Forms List**: Cards for each pending feedback form, showing Trainer Name, Subject, and a prominent "Submit Feedback" CTA.
  - **Completed Forms List**: Read-only view of forms already submitted (visually distinct from pending).
  - **Mini Leaderboard Widget**: Snapshot of the top 5 students to drive engagement.

### 3.2 Feedback Submission Page
- **Purpose**: The actual form where a student evaluates a specific trainer/subject.
- **Key Components**:
  - Header with Context: Course, Subject, and Trainer Name clearly displayed.
  - **Questions List**: Dynamic list of questions (rating scales or short text).
  - **Written Review Section**: A large text area for qualitative feedback (mandatory, min 10 chars).
  - "Submit Feedback" primary button.
  - "Cancel/Back" button.

### 3.3 Submission History Page
- **Purpose**: A log of all past feedback submitted by the student.
- **Key Components**:
  - List/Table of past submissions showing: Date, Time, Subject, Trainer.
  - Status badges indicating completion.

### 3.4 Full Leaderboard Page (Student View)
- **Purpose**: Gamification screen showing the top contributors.
- **Key Components**:
  - Ranked list of students based on submission count.
  - Shows Rank, Student Name, and Submission Count (NO review content is visible).
  - Highlight the logged-in student's current rank.

### 3.5 Student Profile Page
- **Purpose**: View and manage account details.
- **Key Components**:
  - ID Card image preview.
  - Read-only fields: Course, Batch Years, Email.
  - Editable field: Full Name.
  - "Change Password" section.

---

## 4. HOD (Head of Department) Panel

Accessible only to users with the `hod` role. Scoped strictly to data within their assigned department.

### 4.1 HOD Dashboard
- **Purpose**: High-level overview of department feedback health.
- **Key Components**:
  - **Summary Metric Cards**: Total Trainers, Active Forms, Total Responses, Department Average Rating.
  - **Top Trainers Widget**: Quick list of highest-rated trainers.
  - **Submission Rate Overview**: Mini-chart showing which courses have high/low participation.
  - **Recent Feedback Feed**: Scrolling list of the latest anonymized written reviews for department courses.

### 4.2 Form Management Page
- **Purpose**: Create, view, and manage feedback forms.
- **Key Components**:
  - List of all Active and Closed forms with quick stats (responses received).
  - "Publish New Form" button triggering a creation modal/page.
  - Form actions: Deactivate, View Details.

### 4.3 Create/Edit Form Modal (Form Builder)
- **Purpose**: Interface to define a new feedback form.
- **Key Components**:
  - Dropdowns for Course, Trainer, and Subject (filtered by department).
  - Dynamic question builder: Add "Rating" or "Text" questions.
  - "Publish" button.

### 4.4 HOD Analytics Page
- **Purpose**: Deep dive into department performance.
- **Key Components**:
  - **Trainer Performance Table/Chart**: Detailed breakdown of average ratings per trainer.
  - **Course Submission Rates**: Detailed view of enrolled vs. submitted counts per course to identify lagging participation.

### 4.5 Student Directory (Department Scoped)
- **Purpose**: Read-only view of students in the department.
- **Key Components**:
  - List/Table of students (Name, Email, Course, Batch).
  - Search functionality.

---

## 5. Admin Panel

Accessible only to users with the `admin` role. Unrestricted global access to manage all master data and view university-wide analytics.

### 5.1 Admin Dashboard
- **Purpose**: Global platform overview.
- **Key Components**:
  - **Global Stats Cards**: Total Students, Faculty, Courses, Departments, Forms, Responses.
  - **Global Completion Rate Gauge**: Visual indicator of overall platform engagement.
  - **Department Overview Table**: Quick comparison of engagement and ratings across different departments.

### 5.2 User Management Page
- **Purpose**: Master control over all accounts.
- **Key Components**:
  - **Tabs**: Students, HODs, Admins.
  - Search by name/email, Filter by department.
  - Actions: Delete user, Suspend user, Reset password.
  - "Create New HOD/Admin" button triggering a creation modal.

### 5.3 Global Form Management Page
- **Purpose**: Oversee all feedback forms across the university.
- **Key Components**:
  - Similar to HOD Form Management, but includes a "Department" column and filter.
  - Ability to delete forms globally.

### 5.4 Course Management Page
- **Purpose**: Manage the list of available courses.
- **Key Components**:
  - List of courses with Department assignment.
  - Add/Edit/Delete Course modal.

### 5.5 Trainer Management Page
- **Purpose**: Manage the roster of faculty members.
- **Key Components**:
  - List of trainers with Department assignment.
  - Add/Edit/Delete Trainer modal.

### 5.6 Global Analytics Page
- **Purpose**: University-wide reporting.
- **Key Components**:
  - Department-to-Department comparison charts.
  - Highest and lowest performing courses/trainers globally.
  - Export data functionality (future scope, but UI placeholder needed).

### 5.7 Full Leaderboard (Admin View)
- **Purpose**: View the complete student engagement ranking.
- **Key Components**:
  - Full paginated list of all students ranked by submission count.
  - Filters by Course and Department.

---

## 6. Shared / Global Components

Elements that persist across multiple views or roles.

### 6.1 Main Layout Shell
- **Top Navigation Bar**: University Logo, Page Title, User Profile Dropdown (with Logout).
- **Sidebar Navigation**: Role-specific navigation links. Responsive (collapses to a hamburger menu on mobile).

### 6.2 404 / Error Page
- **Purpose**: Graceful fallback for broken links or crashes.
- **Key Components**:
  - "Page Not Found" or "Something went wrong" message.
  - "Return to Dashboard" action button.
  - Branded consistently with the rest of the app.
