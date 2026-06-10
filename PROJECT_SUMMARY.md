# SyllabiX Project Summary & Workflow Guide

This document provides a comprehensive overview of the **SyllabiX** platform workflows for developers onboarding onto the project. It outlines the sequence of operations from initial authentication to final PDF document export.

---

## Complete Site Workflow

SyllabiX is structured as a client-server web application. The core workflow from user entry to PDF export is as follows:

```text
[1. User Login] ──► [2. Select Workspace] ──► [3. Generate Material]
                                                    │
                                                    ▼
[6. Export PDF] ◄── [5. Confirm Download] ◄── [4. Persist to DB]
```

### 1. Authentication Workflow
1. The user launches the app and is greeted by `/login`.
2. Users can log in using local credentials (email/password hashed using Bcrypt) or authenticate via Google Sign-In using the Firebase SDK.
3. The Flask API validates credentials, registers new Google users automatically, and signs a stateless JWT token.
4. The React client saves the token and loads the home route `/dashboard`.

### 2. Workspace Selector
- After logging in, the user is navigated to the Workspace Selector (`/generate`).
- The user selects either the **Faculty Workspace** or the **Student Workspace**, setting the `currentRole` in the Zustand state store.

### 3. Faculty Workflow (Curriculum Design)
1. **Design Input**: The educator inputs parameters (e.g. Course: *Data Science*, Level: *Bachelor*, Semesters: *4*, Workload: *15 hours/week*, Focus: *Artificial Intelligence*).
2. **Generation**: Clicking **Generate** triggers the core store's `generateCurriculum` handler.
3. **Quality Verification**: The output curriculum is displayed alongside a programmatic **Quality Scoreboard** analyzing structural logical progressions and identifying industry skill gaps.
4. **Assessment Setup**: The educator navigates to the Quiz Generator, specifies count and difficulty, and builds custom exams.
5. **PDF Export**: The educator clicks **Export PDF** to trigger the jsPDF generator.

### 4. Student Workflow (Study Tracker & AI Tutor)
1. **Select Pathway**: The student loads their active study blueprint.
2. **Study Planner**: Configures a personalized 30/60/90 days study planner, generating checklist cards.
3. **Practice & Assessments**: The student launches interactive check-in quizzes. For MCQs, the UI validates choices immediately. For open-ended questions, the student inputs text, which is evaluated against expected keywords and concepts by the Groq API.
4. **AI PDF Tutor (DocMentor)**: The student uploads lecture notes or research papers. They chat with the document, which parses text page-by-page using `pdf.js` and retrieves contexts using a local TF-IDF semantic RAG pipeline.

### 5. AI System Workflow
- **IBM Granite LLM**: Formulates formal structured syllabus outlines, weekly objectives, and textbook recommendations.
- **Groq Llama 3 LLM**: Drives low-latency operations (Quiz generation, Student open-ended grading rubrics, and the DocMentor PDF search tutor).
- **Fallback Engine**: Local programmatic generation algorithms in `utils.js` act as full fallbacks if API limits are reached.

### 6. Database Workflow
- All activities are written to the local SQLite database (`curriculum_ai.db`).
- The backend app context automatically handles connection open/close routines.
- Mapped history records permit fast reloads, and status updates track client-side exports.

### 7. PDF Compiler Workflow
1. Exporters in [pdfGenerator.js](file:///c:/Users/daksh/curriculum-ai/src/lib/pdfGenerator.js) compile data arrays.
2. The `DocumentCursor` instance builds standard A4 pages.
3. Vertically-stacked metadata labels and values are drawn on cover sheets.
4. Active, blue clickable URL links are embedded using `doc.textWithLink`.
5. The generator returns the jsPDF instance.
6. The client mounts the confirmation modal `<PDFExportModal />`, and clicking **Download** calls `doc.save()` to download the PDF document.
