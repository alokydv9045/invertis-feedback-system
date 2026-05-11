# TLFQ Platform (Invertis Feedback System)

A comprehensive, role-based real-time feedback management system built to streamline the collection and analysis of student feedback on courses and trainers.

## 🌟 Key Features

The platform provides dedicated workflows and dashboards for three main user roles:

*   **Student Portal**
    *   Secure authentication and profile management.
    *   Dashboard displaying active, pending feedback forms.
    *   Dynamic feedback submission interface.
    *   Submission history tracking.

*   **HOD (Head of Department) Portal**
    *   Form Management: Create, publish, and close feedback forms for specific courses and trainers.
    *   Student Directory: Manage and view student cohorts.
    *   Real-time Analytics: Track submission metrics and aggregated feedback scores dynamically.

*   **Admin Portal**
    *   Global User Management: Oversee students, HODs, and other admins.
    *   Academic Setup: Manage courses, subjects, and trainers.
    *   System-wide Leaderboard & Global Analytics.

## 🛠 Tech Stack

**Frontend (Client)**
*   React 18
*   Vite
*   Tailwind CSS v4
*   React Router DOM v7
*   Framer Motion (Animations)
*   Recharts (Analytics Visualization)
*   Supabase JS Client

**Backend (API Server)**
*   Node.js
*   Express.js
*   Supabase JS Client (Service Role for admin operations)

**Database & Auth**
*   Supabase (PostgreSQL, GoTrue Auth, Row Level Security)

## 📂 Project Structure

This repository is organized as a monorepo containing both the frontend and the backend services.

```text
tlfq/
├── frontend/               # React/Vite Frontend App
│   ├── src/
│   │   ├── components/     # Reusable UI, Layout, and Guard components
│   │   ├── context/        # React Context (e.g., AuthContext)
│   │   ├── lib/            # Utilities (Supabase client, API helpers)
│   │   └── pages/          # Role-based page components (admin, auth, hod, student)
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express Backend API
│   ├── src/
│   │   ├── config/         # Server configuration
│   │   ├── routes/         # Express routes (auth, admin, forms, reviews, analytics)
│   │   └── index.js        # Server entry point
│   └── package.json
├── invertis_feedback_redesign_docs/ # Architecture and Design documentation
└── graphify-out/           # Generated project knowledge graph artifacts
```

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   A Supabase project (for database and authentication)

### 1. Environment Setup

You need to set up environment variables for both the frontend and the backend.

**Frontend (`frontend/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

**Backend (`server/.env`):**
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Installation

Install dependencies for both projects.

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../server
npm install
```

### 3. Running the Application

Start the development servers for both the frontend and backend.

```bash
# Terminal 1: Start the Backend Server
cd server
npm run dev
# Runs on http://localhost:5000

# Terminal 2: Start the Frontend App
cd frontend
npm run dev
# Runs on http://localhost:5173
```

## 🗺️ Core Workflows & Data Model

The core data flow revolves around the following entities in Supabase:
`profiles` → `feedback_forms` → `reviews` → `review_answers`

1.  **Authentication:** Users authenticate via Supabase Auth. Their role is determined by the `profiles` table, which dictates React Router navigation (via `AuthGuard`).
2.  **Feedback Cycle:**
    *   HODs create `feedback_forms` linked to specific `courses` and `trainers`.
    *   Students view active forms on their dashboard and submit `reviews` and `review_answers`.
    *   The frontend uses direct Supabase connections for real-time reads, while the Express backend provides secure endpoints for complex aggregations and admin operations.

## 📊 Graphify Knowledge Map

This project utilizes [Graphify](https://github.com/your-org/graphify) to generate interactive knowledge maps of the codebase. The `graphify-out` directory contains the latest analysis:
*   `graph.html`: Interactive visualization of the architecture, data flows, and routing.
*   `GRAPH_REPORT.md`: A summary of the extracted communities and relationships.
*   `graph.json`: Node-link data for integration with GraphRAG tools.
