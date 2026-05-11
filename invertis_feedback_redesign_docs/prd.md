# Product Requirements Document

## 1. Product name

Invertis Feedback System

## 2. Purpose

A university-branded feedback platform for collecting student reviews about subjects and trainers, allowing HODs to publish course-specific feedback forms and allowing admins to manage the entire ecosystem.

## 3. Business goals

- Improve feedback collection quality
- Make trainer performance visible to HODs
- Give students a clean, trusted feedback flow
- Help admins control users and published forms
- Match the platform visually to the official Invertis University website
- Encourage participation through a leaderboard

## 4. Product goals

- Fast feedback submission
- Mobile-friendly access
- Role-based dashboards
- Accurate storage of user and review data in Supabase
- Simple administration
- Reliable reporting

## 5. User personas

### Student
Needs to register, submit reviews, and see personal progress.

### HOD
Needs to publish forms and monitor trainer performance for assigned courses.

### Admin
Needs to control all accounts, manage access, and oversee all forms and reports.

## 6. Core user stories

### Student
- As a student, I want to register with my name, course, years, and ID card photo so that my account is verified.
- As a student, I want to log in and see only the feedback forms relevant to me.
- As a student, I want to submit a written review for a subject and trainer.
- As a student, I want my review time and date saved automatically.
- As a student, I want to see a leaderboard of top contributors.

### HOD
- As a HOD, I want a pre-defined account so I can log in securely.
- As a HOD, I want to publish a feedback form for a specific course and trainer.
- As a HOD, I want to define the questions in the form.
- As a HOD, I want to see trainer performance summaries.

### Admin
- As an admin, I want to manage student and HOD accounts.
- As an admin, I want to publish or deactivate forms.
- As an admin, I want to remove access when required.
- As an admin, I want to view all analytics and leaderboard data.

## 7. Functional requirements

### Authentication
- Support separate access for student, HOD, and admin
- Use Supabase Auth or equivalent secure login handling
- Protect routes based on role

### Registration
- Student registration must collect:
  - full name
  - course from dropdown
  - year of starting
  - year of ending
  - ID card photo
- Registration data must be stored in Supabase

### Feedback form publishing
- HOD and admin can create a form for:
  - course
  - trainer
  - subject
  - question set
- Forms can be activated or deactivated

### Review submission
- Store:
  - review text
  - date
  - time
  - subject
  - course
  - trainer
  - student reference
- Reviews must be tied to the correct published form

### Leaderboard
- Show top 5 students who submitted the most feedback forms
- Provide a full list of all students if requested
- Update rankings as submissions change

### Administration
- Admin can:
  - remove HOD accounts
  - remove student accounts
  - manage forms
  - view global reports
  - manage course and trainer records

### Analytics
- HOD can view:
  - trainer performance
  - response counts
  - average ratings if ratings are used
  - recent review summaries

## 8. Non-functional requirements

### Responsiveness
- Must work on mobile and desktop
- Sidebar should collapse on small screens
- Forms must be touch-friendly

### Performance
- Fast load times
- Minimal queries for leaderboard and analytics
- Efficient image upload handling

### Security
- Row-level security for Supabase tables
- Secure storage of ID card images
- No direct exposure of private review data
- Role-based access control for all sensitive screens

### Reliability
- Stable login and session persistence
- Clear error handling for uploads and form submissions

### Maintainability
- Tables should be separated by responsibility
- Business rules should be easy to extend

## 9. UX requirements

- The platform should feel like an official Invertis University product.
- Use the college logo prominently.
- Use the university blue and orange identity.
- Keep the interface formal and institutional, not playful.
- Make key actions obvious: login, register, publish form, submit review.
- Display leaderboard and analytics in a clean, readable format.

## 10. Out of scope for this release

- AI-generated feedback analysis
- Social features
- Public commenting
- Complex approval workflows
- Payment systems
- Multi-campus segregation unless required later

## 11. Acceptance criteria

The product is ready when:

- student registration stores profile + ID card in Supabase
- HOD accounts are pre-defined and can log in
- HOD can publish a form for a course/trainer
- students can submit written reviews with subject and timestamp
- admin can remove accounts
- leaderboard shows top submitters
- the UI matches the university brand on phone and desktop

## 12. Priority order

1. Supabase schema and auth
2. student registration
3. HOD/admin login
4. feedback publishing
5. review submission
6. analytics
7. leaderboard
8. mobile polish and branding
