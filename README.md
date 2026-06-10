# SyllabiX – AI-Powered Curriculum & Learning Intelligence Platform

SyllabiX is a premium, enterprise-grade educational technology application designed for academic institutions, syllabus designers, corporate training leads, and self-directed students. The platform leverages Large Language Models (LLMs) to automatically construct structured, outcome-aligned academic handbook PDFs, generate customizable study roadmaps, curate recommended resource recommendations, compile practice exams, and host an in-app semantic PDF tutor.

---

## Table of Contents
1. [Platform Overview & Problem Statement](#platform-overview--problem-statement)
2. [Technical Architecture Summary](#technical-architecture-summary)
3. [Database Architecture](#database-architecture)
4. [Complete AI Architecture](#complete-ai-architecture)
5. [Logical Agent Architecture](#logical-agent-architecture)
6. [System Workflows](#system-workflows)
7. [Security Architecture](#security-architecture)
8. [Folder Structure & Key File Directory](#folder-structure--key-file-directory)
9. [Feature-to-File Mapping Table](#feature-to-file-mapping-table)
10. [User Analytics & Gamification Metrics](#user-analytics--gamification-metrics)
11. [External Service Integrations](#external-service-integrations)
12. [Installation & Local Setup](#installation--local-setup)
13. [Future Enhancements](#future-enhancements)

---

## Platform Overview & Problem Statement

### The Problem
Constructing high-quality, outcome-based academic courses or career-focused learning roadmaps is historically a complex, administrative bottleneck. Faculty and instructional designers must manually:
- Formulate course frameworks matching cognitive domains (such as Bloom's Taxonomy).
- Map sequential topic progressions without duplicates or gaps.
- Collate textbooks, official document guides, repository starter templates, and video lectures.
- Draft technical assessments with proper evaluation criteria.
- Design publication-grade PDF handbooks and distribution sheets.

This manual lifecycle requires weeks of drafting, leading to slow program launches and outdated curriculum pathways.

### The SyllabiX Solution
SyllabiX automates the entire instructional design lifecycle:
1. **Dynamic LLM Compilation**: Combines IBM Granite (curriculum structuring) and Groq Llama 3 (real-time assessments & RAG tutor).
2. **Accreditation Scoreboards**: Automatically audits generated syllabi for tech coverage, comprehensiveness, and industry skill gaps.
3. **Gamified Student Workspace**: Transforms flat outlines into interactive check-in blueprints, 30/60/90-day study planners, diagnostic tests, and badge reward tracks.
4. **SyllabiX Copilot**: A dedicated chatbot overlay assisting users with platform guides, feature troubleshooting, and workspace navigation.

---

## Technical Architecture Summary

SyllabiX partitions responsibilities between a modular, responsive React client and a stateless Python Flask microservice database API:

| Layer | Technology Stack |
| :--- | :--- |
| **Frontend Stack** | React 19 (Vite), Tailwind CSS, Framer Motion, Lucide Icons |
| **State Management** | Zustand (Reactive Client Cache stores) |
| **Backend Stack** | Python Flask, Flask-CORS, Flask-JWT-Extended, Bcrypt |
| **Database Layer** | SQLite3 (`curriculum_ai.db` - local persistent db) |
| **Authentication** | Local credentials (JWT) + Google OAuth via Firebase Client SDK |
| **AI Models Layer** | IBM Granite (Outlines) + Groq Llama 3.3 70B (Quizzes, DocMentor, Copilot) |
| **Export Compiler** | jsPDF (A4 margins, running headers, stacked cover grids) |
| **Chatbot Assistant** | SyllabiX Copilot (FAB bottom-left chat overlay) |

### Global Architecture Diagram
```text
┌────────────────────────────────────────────────────────┐
│                      FRONTEND CLIENT                   │
│  React 19 SPA (Zustand Stores) ◄──► SyllabiX Copilot   │
└───────────┬───────────────────┬───────────────┬────────┘
            │                   │               │
      (HTTP Requests)     (Google Signin) (Chat Queries)
            ▼                   ▼               ▼
┌───────────────────────┐ ┌───────────┐ ┌───────────────┐
│      FLASK API        │ │ FIREBASE  │ │   GROQ API    │
│  JWT Auth, SQLite DB  │ │ CLIENT SDK│ │ Llama-3.3-70B │
└───────────┬───────────┘ └───────────┘ └───────────────┘
            ▼
┌───────────────────────┐
│       SQLITE3         │
│  curriculum_ai.db     │
└───────────────────────┘
```

---

## Database Architecture

SyllabiX uses a local **SQLite** database (`curriculum_ai.db`) for persistent server data, combined with **Firebase Authentication** for external Google credentials. 

* **Firebase Firestore** and **Firebase Storage** are **NOT** used for data tables or binary uploads in this implementation.
* Profile pictures are uploaded locally as data-URLs or referenced dynamically via the Google Profile photo URL returning from Firebase Client Auth.

### SQL Schema Specifications

#### 1. `users` Table
Stores user account settings, hashed passwords, credentials, and profile metadata.
- `id` (INTEGER, Primary Key): Unique user ID.
- `name` (TEXT, Not Null): Full name.
- `email` (TEXT, Not Null, Unique): Account email address.
- `password` (TEXT, Not Null): Bcrypt-hashed password (empty for Google OAuth signups).
- `provider` (TEXT, Default 'local'): Authentication provider (`'local'` or `'google'`).
- `firebase_uid` (TEXT, Null): Unique user ID returned from Firebase Google Auth.
- `photo_url` (TEXT, Null): Avatar image path or Google profile URL.
- `phone` (TEXT, Null): 10-digit number.
- `institution` (TEXT, Null) | `role` (TEXT, Null) | `bio` (TEXT, Null)
- `country` (TEXT, Null) | `timezone` (TEXT, Null)
- `reset_token` (TEXT, Null): Token used for password reset flows.

#### 2. `history_records` Table
Stores generated curriculum handbook records linked to the user account.
- `id` (INTEGER, Primary Key): Unique record ID.
- `user_id` (INTEGER, Foreign Key referencing `users(id)`): Owner account.
- `role` (TEXT, Not Null): Active workspace role (`'faculty'` or `'student'`).
- `program_name` (TEXT, Not Null): Course title (e.g., BS in Data Science).
- `domain` (TEXT, Not Null) | `industry_focus` (TEXT, Not Null) | `education_level` (TEXT, Not Null)
- `semester_count` (INTEGER, Not Null) | `date_generated` (TEXT, Not Null)
- `pdf_export_status` (INTEGER) & `json_export_status` (INTEGER): Binary flags.
- `curriculum_data` (TEXT, Not Null): Serialized JSON string containing the complete syllabus object.

---

## Complete AI Architecture

SyllabiX orchestrates two distinct AI models to manage curriculum planning and student self-testing.

```text
                  [SyllabiX AI Orchestrator]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [IBM Granite Engine]             [Groq Llama 3 Engine]
  - Curriculum Outlines            - Student Quizzes (Practice)
  - Core Objectives                - Answer Evaluations (RAG)
  - Unit Outcomes Mapped           - SyllabiX Copilot Chatbot
```

### 1. IBM Granite LLM (Curriculum Engine)
* **Purpose**: Compiles structural academic program frameworks, semesters, and units.
* **Input**: User parameters (Domain Name, Study Workload, Target Industry Focus, Duration).
* **Output**: JSON payload outlining sequential semester matrices, outcomes, weekly tasks, and textbooks.
* **Why Used**: Granite is heavily pre-trained on structured enterprise and academic handbooks, making it highly compliant with complex nested schemas.
* **Fallback**: The platform features a local generation engine in `src/lib/utils.js` that compiles progressive academic topics (e.g. Linear Algebra -> CNNs -> Edge AI) if API limits are reached.

### 2. Groq Llama 3 LLM (llama-3.3-70b-versatile)
* **Purpose**: Executes real-time interactive tasks (Quiz generation, descriptive grading, DocMentor semantic answers, and Copilot platform guide).
* **Input/Output Configurations**:
  - **Quizzes**: Input: cached curriculum | Output: JSON array of MCQs, scenario-based items, and technical keyword criteria.
  - **Grading**: Input: student written answer + technical keywords | Output: similarity score, feedback comments, and list of missing terms.
  - **DocMentor**: Input: user uploaded PDF text stream + search query | Output: formatted markdown response with page references.
  - **Copilot**: Input: user platform query | Output: platform guide answer (strictly scoped).
* **Why Used**: Groq LPUs provide ultra-low latency outputs under 2 seconds, ensuring interactive feedback stays highly responsive.

---

## Logical Agent Architecture

SyllabiX organizes operations into seven logical AI agents:

1. **Curriculum Agent**:
   - *Responsibilities*: Scopes domain topics, structures weekly workloads, and maps credits.
   - *Model*: IBM Granite / Fallback Engine.
   - *Outputs*: Complete academic blueprints.
2. **Quiz Agent**:
   - *Responsibilities*: Generates MCQs, scenario-based questions, and technical key terms.
   - *Model*: Groq Llama 3.3.
   - *Outputs*: Diagnostic quiz lists.
3. **Evaluation Agent**:
   - *Responsibilities*: Assesses open-ended student answers, scores depth, and outlines missing concepts.
   - *Model*: Groq Llama 3.3.
   - *Outputs*: Constructive grading feedback.
4. **Resource Agent**:
   - *Responsibilities*: Maps official developer documentation, research repositories, textbooks, and GitHub projects.
   - *Model*: Local recommendation engine.
   - *Outputs*: Unit study resource maps.
5. **Study Planner Agent**:
   - *Responsibilities*: Formulates day-by-day task lists and checkpoints based on duration filters.
   - *Model*: Local scheduler.
   - *Outputs*: Study calendar checklists.
6. **DocMentor Agent**:
   - *Responsibilities*: Performs local semantic RAG search on uploaded student PDF notes and text blocks.
   - *Model*: Groq Llama 3.3.
   - *Outputs*: Markdown answers with page citations.
7. **Support Assistant Agent (SyllabiX Copilot)**:
   - *Responsibilities*: Floating chatbot overlay answering platform guides, configurations, and workflows.
   - *Model*: Groq Llama 3.3.
   - *Outputs*: Help responses or the scoped rejection string.

---

## System Workflows

### Faculty Workflow (Curriculum & Quiz Creation)
```text
Educator Input Form ──► Core Store ──► AI/Fallback Engine ──► Persist History
                                                                    │
┌─────────────────────────── Exports Manager ◄──────────────────────┘
│
├──► Download PDF Handbook
└──► Download JSON Backup
```

### Student Workflow (Study Planner & Assessments)
```text
Load Study Blueprint ──► Generate 30/60/90 Days Planner ──► Daily Checklists
                                                                   │
┌─────────────────────────── Practice Quizzes ◄────────────────────┘
│
├──► Answer MCQ Questions (Instant validation)
└──► Answer Short/Descriptive Questions ──► Groq Evaluator ──► Unlock Badges
```

### AI PDF Tutor (DocMentor Workflow)
```text
Upload Student PDF Notes (Max 50MB) ──► PDF.js Worker text extraction
                                                  │
                                                  ▼
Query Document Input ◄── Local TF-IDF search indexing & RAG extraction
      │
      ▼
Groq API Call ──► Formatted Markdown Output with Page References
```

### SyllabiX Copilot Workflow
```text
Click FAB (bottom-left) ──► Enter Platform Question
                                    │
                         [Heuristic Scope Check]
                                    │
             ┌──────────────────────┴──────────────────────┐
             ▼ (Is platform-relevant)                      ▼ (Out of scope)
     Send to Groq API                              Return Copilot Rejection:
  - System prompt scoping                          "I am SyllabiX Copilot. I can
  - Llama-3.3-70b-versatile                        assist only with platform features,
             │                                     curriculum generation..."
             ▼
   Format Markdown Response
```

---

## Security Architecture

SyllabiX implements layered defenses to safeguard authentication, state boundaries, and API keys:

1. **Authentication Gates**: Google OAuth credentials are encrypted via the Firebase Authentication client-side SDK. The backend verifies the Firebase token and exchanges it for a local stateless JWT.
2. **Stateless Session Guarding**: User sessions use JWT tokens (`access_token` and `refresh_token` stored in `localStorage`). The Flask backend checks JWT tokens on protected history and profile APIs.
3. **Route Security**: The React client wraps layout routes in a `ProtectedRoute.jsx` component that redirects unauthorized accesses to `/login`.
4. **Environment Isolation**: API endpoints and Groq keys are configured in local `.env` files. Fallback keys are restricted to sandbox environments.
5. **Form Sanitization**: Phone numbers are checked using digit lengths filters (`isdigit()`, length 10) before committing profiles.

---

## Folder Structure & Key File Directory

```text
curriculum-ai/
├── backend/
│   ├── app.py                 # Flask server, JWT auth configurations, and SQLite database migrations.
│   └── requirements.txt       # Backend dependencies (flask, flask-jwt-extended, bcrypt, etc.).
├── src/
│   ├── components/
│   │   ├── SyllabiXCopilot.jsx# The floating AI assistant chat overlay.
│   │   ├── PDFExportModal.jsx # Confirmation dialog for PDF booklet downloads.
│   │   ├── NavigationHeader.jsx # Sticky sub-navigation back & home actions.
│   │   ├── DocMentor.jsx      # Semantic PDF tutor interface.
│   │   ├── Layout.jsx         # Global page template shell.
│   │   └── ProtectedRoute.jsx # Enforces active JWT sessions.
│   ├── pages/
│   │   ├── FacultyDashboard.jsx # Custom curriculum generator, scoreboards, and exam builders.
│   │   ├── StudentDashboard.jsx # Planners, gamified check-in tracking, and quizzes.
│   │   └── Profile.jsx        # Profile details editing and local JSON backup tools.
│   ├── lib/
│   │   ├── pdfGenerator.js    # Layout definitions, stacked metadata, and jsPDF compiler.
│   │   ├── quizGroqService.ts # Groq quiz generators and open-ended grading.
│   │   └── utils.js           # Fallback curriculum builder and progression topics.
│   ├── store/
│   │   └── index.js           # Main Zustand state manager.
│   └── App.jsx                # React route mappings.
```

---

## Feature-to-File Mapping Table

| Feature | Primary React Components / Pages | Helper Libraries / APIs |
| :--- | :--- | :--- |
| **Curriculum Builder** | `FacultyDashboard.jsx`, `Generate.jsx` | `utils.js` (generateCurriculum) |
| **Quiz Generator** | `FacultyDashboard.jsx` | `quizGroqService.ts` |
| **Study Planner** | `StudentDashboard.jsx` (Planner Tab) | `utils.js` (progress tracking) |
| **DocMentor (PDF Tutor)**| `DocMentor.jsx` | `docMentorService.js`, `pdf.js` worker |
| **SyllabiX Copilot** | `SyllabiXCopilot.jsx` | `App.jsx`, Groq API |
| **Academic PDF Export** | `PDFExportModal.jsx` | `pdfGenerator.js` (jsPDF compilation) |
| **Authentication System**| `Login.jsx`, `Signup.jsx` | `authStore.js`, `firebase.js`, `app.py` |
| **Profile & Backups** | `Profile.jsx` | `api.js` (updateProfile) |
| **Platform History** | `History.jsx` | `api.js` (getHistory), `app.py` |

---

## User Analytics & Gamification Metrics

Student performance is evaluated using gamified statistics stored in `localStorage` under `student_stats_{userId}`:

1. **Study Streak**:
   - Calculated daily comparing the active date string (`YYYY-MM-DD`) with the cached `lastActivityDate`.
   - If `lastActivityDate` is empty, streak starts at `1`.
   - If the date diff is exactly `1` day, streak increments.
   - If the date diff exceeds `1` day, streak resets to `1` (or `0` on launch).
2. **Quiz Scores**:
   - Tracked using `totalScore` (accumulated points) and `totalQuestions`. Average score percentage is computed dynamically.
3. **Unlocked Badges**:
   - `explorer`: Created your first customized study blueprint.
   - `firstQuiz`: Completed your first practice quiz.
   - `highscore`: Scored `80%` or higher on a topic quiz.
   - `planner`: Configured a custom study planner path.
   - `streak`: Maintained an active study streak > 0.
4. **Progress Percentage**:
   - Recalculated based on completed daily tasks inside the study planner and answered diagnostic checks.

---

## External Service Integrations

- **Firebase Auth**: Used exclusively on the client for secure Google Sign-in.
- **Groq Cloud API**: Low-latency inference provider using the `llama-3.3-70b-versatile` model.
- **jsPDF**: Generates outcomes-driven PDF booklets directly in the client.
- **PDF.js (Mozilla)**: Extracted via CDN scripts for text scanning inside DocMentor notes.
- **Framer Motion**: Controls dashboard page fades, accordion slides, and modal popups.

---

## Installation & Local Setup

### Prerequisites
- Install **Node.js (v18+)**
- Install **Python (v3.8+)**

### 1. Launch Backend API
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*The Flask backend server will launch on http://127.0.0.1:5000*

### 2. Launch Client
```bash
# Return to root directory
npm install
npm run dev
```
*The React client will launch on http://localhost:5174/*

---

## Future Enhancements

1. **Vector Database Integrations**: Support scalable cloud-based search indices (Pinecone or ChromaDB) for DocMentor, enabling massive book QA library tracking.
2. **Canvas LMS sync**: Introduce automated integrations exporting syllabi directly into learning management platforms.
3. **Adaptive Quiz Spacing**: Schedule diagnostic assessments dynamically based on student average score histories and mastery targets.#   S y l l a b i X  
 