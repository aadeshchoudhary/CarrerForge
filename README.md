# CareerForge AI — AI-Powered Career Development Platform
> **An All-in-One AI Career Companion, Learning, Professional Networking, and Opportunity Platform**  
> *College Capstone Project — All 5 Phases Fully Operational & Production Ready*

---

## 1. Project Overview

CareerForge AI is an intelligent career development platform designed for students, freshers, and job seekers. It connects resume analysis, learning roadmaps, applied project proof, verified credentials, peer networking, and interview readiness into an end-to-end feedback loop:

$$\text{Resume} \rightarrow \text{Skill Gap Found} \rightarrow \text{Learning Roadmap} \rightarrow \text{Project Evidence} \rightarrow \text{Career Passport} \rightarrow \text{Peer Community} \rightarrow \text{AI Interview Gym} \rightarrow \text{Job Placement}$$

---

## 2. Complete Features Across All 5 Modules

### MODULE 1: AI Resume & Skill Analysis
1. **AI Resume Parser (Module 1.1):** PDF & DOCX parser with section segmentation, confidence score, and warnings detection. Extracted skills tagged as `[resume_mentioned]`.
2. **Explainable AI Skill-Gap Analyzer (Module 1.2):** 75% essential / 25% preferred weighted matching with live arithmetic formula breakdown modal.
3. **AI Resume Builder (Module 1.3):** Multi-section form + 1-click editable `.docx` Word export via `python-docx`.
4. **Resume Optimization & Quality Auditor (Module 1.4):** Action-verb density check, quantifiable metrics scoring, and actionable suggested rewrites.

### MODULE 2: Career Discovery & Intelligence
5. **Career and Job Role Finder (Module 2.5):** Ranks candidate compatibility across tech paths with 1-click target role switching.
6. **Personalized Career Roadmap Generator (Module 2.7):** Multi-phase adaptive curriculum with interactive milestone checkboxes (+30 XP).

### MODULE 3: Learning & Skill Development
7. **Training Resource Hub (Module 3.11):** Bilingual (English / Hindi) tutorials, official docs, and project guides with 100% Free filter.
8. **Project-to-Proof System (Module 3.14):**
   - Curated benchmark projects with technical requirements checklists and rubrics.
   - GitHub code repository submission modal.
   - **Skill Promotion Engine:** Submitting verifiable code repositories promotes matched skills to the coveted **`[verified]`** badge.
   - Awards **+100 XP** and unlocks the **`Project Champion`** badge.
9. **Real-Time Preparation Tracker (Module 3.15):** Daily tasks, study hours logger (+15 XP), and streak counter. Strictly distinguishes `[Self-Reported]` tasks from `[Milestone-Verified]` proof.

### MODULE 4: Career ID, Profiles & Credentials
10. **Unique Career ID & Profile Matrix (Module 4.16):** `@handle` profile, granular privacy toggles, and evidence-badged skills matrix.
11. **Digital Career Passport (Module 4.17):**
    - Verifiable credential with official ID (e.g. `CF-PASS-AARAV-42F1`) and SHA-256 hash.
    - Categorizes Verified Code Proof vs Assessed Skills vs Resume-Mentioned Skills.
    - Interactive **QR Code Verification Modal** linking directly to the live authentication endpoint.
    - 1-Click "Copy Verification Link" and Print/PDF export.
12. **Master Badges, Quests & Real-Time Leaderboards (Module 4.18 & 4.19):**
    - 8 published core badges (*First Step*, *Resume Ready*, *Skill Builder*, *Project Champion*, *Goal Crusher*, *Consistency Star*, *Career Explorer*, *Quiz Master*).
    - Unlocked badges display timestamps and golden glowing seals.
    - Real-time global student leaderboard ranking peers by Weekly XP, Level, and Verified Projects count.

### MODULE 5: Professional Community & Career Connect
13. **Professional Community Feed (Module 5.20):**
    - Public feed with topic browsing pills (*Web Dev*, *AI & ML*, *Data Science*, *Internships*, *Projects*, *Interview Prep*).
    - Diverse post types: Milestones, Project Showcases, Technical Tips, Placement Questions, and Study Collaborations.
14. **Post Composer & Social Proof Attachments (Module 5.21):**
    - Attach verified GitHub repositories and live Career Passport links directly to public discussions.
    - Awards **+25 XP** for technical contributions.
15. **Post Interactions & Helpful Answers (Module 5.22):**
    - Optimistic like/unlike toggling with instant like count reaction.
    - Nested comment threads with author Career IDs and badge seals.
    - **Helpful Answer Recognition:** Students can mark solutions as "Helpful Answer", awarding **+10 XP** and reputation to the author.
16. **Career Connect & Peer Mentorship (Module 5.23):**
    - Searchable directory of student peers and mentors filtered by verified skills (React, FastAPI, Docker, PyTorch, SQL).
    - Connect request toggle (*Connected* / *Connect*).
17. **Direct Messaging & Study Circles (Module 5.24 & 5.25):**
    - 1-on-1 direct messaging modal with conversation history and timestamping.
    - Collaborative Study Groups catalog with 1-click Join/Leave and founding workflow (+30 XP).
    - **Explainable Reputation Formula:** Base 50 + (Likes × 2) + (Helpful Answers × 10) + (Verified Skills × 15) + (Connections × 5).

### MODULE 6: Opportunity Intelligence & AI Interview Gym (Phase 5)
18. **Opportunity Command Center & Kanban Board (Module 6.26):**
    - 6 Kanban pipeline stages: *Saved / Wishlist*, *Applied*, *Screening / Assessment*, *Technical Interview*, *Offer Extended*, and *Archived*.
    - Pipeline analytics: Total Active Applications, Screening, Interviews, Offers, Conversion Rate.
    - 1-Click stage progression and drag-free advancement with milestone XP awards (+35 XP for interview, +100 XP for offer).
19. **Company Explorer & Insider Guidance (Module 6.8 & 6.9):**
    - Tech stack breakdowns for tech giants and high-growth companies.
    - Hiring status badges (*Actively Hiring*, *Campus Drives Open*, *Remote Friendly*).
    - Insider interview rounds walkthrough and concrete preparation tips.
    - 1-Click "Track Application" directly into your personal Kanban pipeline.
20. **Interactive AI Interview Gym (Module 6.10 & 6.27):**
    - Role-specific interview simulation for *Full Stack Developer*, *Data Analyst*, *Machine Learning Engineer*, and *Cloud DevOps Associate*.
    - 3 simulation modes: *Technical Deep-Dive*, *Behavioral (STAR Method)*, and *System Design*.
    - Real-time architectural hints for candidates.
    - **Explainable AI Rubric Scoring (0 to 10)** evaluating technical vocabulary, structural clarity, and edge-case handling.
    - Itemized **Demonstrated Strengths**, **Areas to Elevate**, and **Curated Benchmark Model Answer**.
    - Awards **+20 XP** per completed interview session.
21. **Technology Trends & Market Intelligence (Module 6.12 & 6.28):**
    - Real-time technology demand index with YoY growth figures (e.g. FastAPI +42%, PyTorch +58%).
    - Average salary benchmarks (INR LPA) and active campus opening counts.
    - Frequently paired skills pills linked directly to the Training Resource Hub.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite.
- **Backend:** Python 3.11, FastAPI, SQLAlchemy ORM, SQLite (local zero-config) / PostgreSQL ready.
- **Security:** Native bcrypt password hashing (12 rounds) + PyJWT authorization.
- **Document & Code Processing:** `pdfplumber` (PDF layout text extraction) and `python-docx` (Word generation and export).

---

## 4. How to Run the Project (Step-by-Step)

### Option A: 1-Click Launch (Windows)
```powershell
cd "C:\Users\Aadesh Choudhary\.gemini\antigravity\scratch\career-platform"
.\start_all.bat
```

### Option B: Manual Command-Line Launch

#### Terminal 1 — Start Backend:
```powershell
cd "C:\Users\Aadesh Choudhary\.gemini\antigravity\scratch\career-platform\backend"
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Swagger UI Interactive API: **http://127.0.0.1:8000/docs**

#### Terminal 2 — Start Frontend:
```powershell
cd "C:\Users\Aadesh Choudhary\.gemini\antigravity\scratch\career-platform\frontend"
npm run dev
```
- Web Application UI: **http://127.0.0.1:5173**

---

## 5. Automated Test Suite

To run all 24 unit, service, and integration tests covering all 5 phases:
```powershell
cd "C:\Users\Aadesh Choudhary\.gemini\antigravity\scratch\career-platform\backend"
.\venv\Scripts\python.exe -m pytest -v
```
*(All 24 tests execute with 100% pass rate).*

---

## 6. Phased Implementation Roadmap (100% Completed)

- [x] **Phase 1 (Complete):** Auth, Career ID Profile, App Shell, Dashboard UI with live widgets, Document Resume Parser (PDF/DOCX), and Weighted Explainable Skill-Gap Analyzer.
- [x] **Phase 2 (Complete):** AI Resume Builder (DOCX exporter), Application Quality Checker, Career Role Finder, Dynamic Career Roadmap Generator, Training Resource Hub, and Preparation Tracker.
- [x] **Phase 3 (Complete):** Career Passport with QR code verification, Project-to-Proof GitHub repository verifier, 8 Core Published Badges, and Real-Time Leaderboards.
- [x] **Phase 4 (Complete):** Professional Community Feed, Public Posts, Post Interactions (Likes/Comments), Career Connect (Peer Mentorship & messaging), Study Groups, and Community Reputation (Features 20-25).
- [x] **Phase 5 (Complete):** Opportunity Command Center (Kanban application tracker), Company Explorer, AI Interview Gym (Mock technical & behavioral simulations), and Technology Trends (Features 6, 8, 9, 10, 12, 13, 26, 27, 28).
