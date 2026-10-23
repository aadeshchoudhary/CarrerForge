/**
 * Standalone Client-Side Mock Data Engine & Persistence.
 * Enables 100% offline & zero-database deployment for Vercel demo visitors.
 */
import {
  CareerID,
  CareerPassportData,
  CareerRoleComparison,
  CompanyItem,
  DashboardSummary,
  InterviewQuestionItem,
  JobApplicationItem,
  JobDescription,
  LeaderboardData,
  LearningResource,
  ParsedResumeData,
  PeerProfile,
  PostItem,
  PrivacySettings,
  ProjectCatalogItem,
  Resume,
  Roadmap,
  SkillGapReport,
  StudyGroupItem,
  TechTrendItem,
  UserSkill,
  BadgeItem,
} from '../types';

export const DEFAULT_CAREER_ID: CareerID = {
  id: 'cid-demo-aarav',
  user_id: 'usr-demo-aarav',
  handle: '@aarav_sharma',
  full_name: 'Aarav Sharma',
  headline: 'Final Year CSE | Full Stack Developer & Open Source Contributor',
  bio: 'Passionate about building scalable REST APIs and modern web applications with React, FastAPI, and PostgreSQL.',
  target_role: 'Full Stack Developer',
  xp_points: 740,
  current_level: 3,
  badges_count: 4,
  visibility: 'public',
  created_at: new Date().toISOString(),
};

export const DEFAULT_PRIVACY: PrivacySettings = {
  show_email: false,
  show_skills: true,
  show_resume: true,
  show_gap_scores: true,
  show_activity: true,
};

export const DEFAULT_SKILLS: UserSkill[] = [
  { id: 's1', name: 'Python', category: 'Programming Language', evidence_level: 'verified', years_experience: 3 },
  { id: 's2', name: 'FastAPI', category: 'Backend Framework', evidence_level: 'verified', years_experience: 2 },
  { id: 's3', name: 'React', category: 'Frontend', evidence_level: 'verified', years_experience: 2 },
  { id: 's4', name: 'PostgreSQL', category: 'Database', evidence_level: 'verified', years_experience: 2 },
  { id: 's5', name: 'Docker', category: 'DevOps / Cloud', evidence_level: 'assessed', years_experience: 1 },
  { id: 's6', name: 'Git', category: 'Tools', evidence_level: 'verified', years_experience: 3 },
  { id: 's7', name: 'Machine Learning', category: 'Data & AI', evidence_level: 'resume_mentioned', years_experience: 1 },
];

export const DEFAULT_JOBS: JobDescription[] = [
  {
    id: 'job-1',
    title: 'Full Stack Developer (FastAPI + React)',
    company: 'TechNova Solutions',
    location: 'Bengaluru / Remote',
    source_url: 'https://careers.technova.example.com/fs-dev',
    experience_level: 'Fresher / 0-2 Years',
    description_text: 'Seeking an enthusiastic Full Stack Developer skilled in Python, FastAPI, React, PostgreSQL, and Docker containerization.',
    essential_skills: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Git'],
    preferred_skills: ['Docker', 'Redis', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: 'job-2',
    title: 'Junior Data Analyst',
    company: 'Apex Analytics Corp',
    location: 'Hyderabad / Hybrid',
    source_url: 'https://apexanalytics.example.com/careers',
    experience_level: 'Fresher / Entry Level',
    description_text: 'Analyze business performance datasets using SQL, Python, Pandas, and modern dashboard tools.',
    essential_skills: ['SQL', 'Python', 'Pandas', 'Excel'],
    preferred_skills: ['PowerBI', 'Tableau', 'PostgreSQL', 'Statistics'],
  },
  {
    id: 'job-3',
    title: 'AI / Machine Learning Engineer Trainee',
    company: 'DeepVision AI Labs',
    location: 'Pune / Hybrid',
    source_url: 'https://deepvision.example.com/jobs',
    experience_level: 'Fresher / Intern',
    description_text: 'Join our computer vision and generative AI lab building PyTorch pipelines and deploying on FastAPI.',
    essential_skills: ['Python', 'Machine Learning', 'Linear Algebra', 'PyTorch'],
    preferred_skills: ['Docker', 'FastAPI', 'Scikit-Learn', 'OpenCV'],
  },
  {
    id: 'job-4',
    title: 'Cloud & DevOps Associate',
    company: 'CloudScale Systems',
    location: 'Noida / Remote',
    source_url: 'https://cloudscale.example.com/devops',
    experience_level: 'Junior / 1 Year',
    description_text: 'Maintain automated CI/CD pipelines, configure Docker containers, and monitor Kubernetes clusters.',
    essential_skills: ['Linux', 'Docker', 'Git', 'CI/CD'],
    preferred_skills: ['Kubernetes', 'Python', 'AWS', 'Terraform'],
  },
];

export const DEFAULT_PARSED_RESUME: ParsedResumeData = {
  id: 'parsed-demo',
  resume_id: 'res-demo-aarav',
  personal_info: {
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.edu',
    phone: '+91 98765 43210',
    github: 'https://github.com/aadeshchoudhary',
    linkedin: 'https://linkedin.com/in/aarav-sharma-tech',
    location: 'Bengaluru, Karnataka, India',
  },
  education: [
    {
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'National Institute of Technology',
      year: '2022 - 2026',
      score: '8.8 CGPA',
    },
  ],
  work_experience: [
    {
      title: 'Full Stack Engineering Intern',
      company: 'InnovateX Labs',
      duration: 'May 2025 - July 2025',
      description: 'Engineered high-throughput REST endpoints using FastAPI and PostgreSQL. Implemented JWT authentication and optimized response latency by 35%.',
    },
  ],
  projects: [
    {
      title: 'Full-Stack E-Commerce & Inventory Management Platform',
      tech_stack: 'React, FastAPI, PostgreSQL, Docker, Tailwind CSS',
      description: 'Production-ready shopping architecture featuring role-based access control, Stripe payment checkout, and Dockerized microservices.',
      link: 'https://github.com/aadeshchoudhary/ecommerce-fastapi',
    },
    {
      title: 'AI Resume Analyzer & Job Skill Gap Engine',
      tech_stack: 'Python, FastAPI, Scikit-Learn, React, Vite',
      description: 'NLP document parser calculating Jaccard and cosine similarity between candidate skills and job descriptions.',
      link: 'https://github.com/aadeshchoudhary/careerforge-ai',
    },
  ],
  certifications: [
    {
      name: 'Meta Certified Full-Stack Developer',
      issuer: 'Coursera / Meta',
      year: '2025',
    },
  ],
  extracted_skills: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker', 'Git', 'SQL', 'TypeScript'],
  extraction_confidence: 96.0,
  extraction_warnings: [],
  updated_at: new Date().toISOString(),
};

export const DEFAULT_RESUME: Resume = {
  id: 'res-demo-aarav',
  filename: 'Aarav_Sharma_Resume.pdf',
  file_type: 'pdf',
  uploaded_at: new Date().toISOString(),
  parsed_data: DEFAULT_PARSED_RESUME,
};

export const DEFAULT_GAP_REPORT: SkillGapReport = {
  id: 'gap-demo-1',
  user_id: 'usr-demo-aarav',
  job_id: 'job-1',
  coverage_score: 83.3,
  matched_skills: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Git', 'Docker'],
  missing_essential: [],
  missing_preferred: ['Redis', 'TypeScript'],
  needs_evidence: ['Docker'],
  formula_breakdown: {
    formula: 'Score = (Matched Essential / Total Essential * 70%) + (Matched Preferred / Total Preferred * 30%)',
    essential_weight_percent: 70,
    preferred_weight_percent: 30,
    total_essential: 5,
    matched_essential_count: 5,
    essential_ratio: 1.0,
    total_preferred: 4,
    matched_preferred_count: 2,
    preferred_ratio: 0.5,
    calculated_score: 85.0,
    interpretation: 'Strong Match — You meet 100% of essential requirements for Full Stack Developer.',
  },
  improvement_advice: 'To reach 95%+ match, add a Redis caching layer to your FastAPI project and migrate one React component to TypeScript.',
  disclaimer: 'This automated gap score evaluates stated project and resume evidence against market job descriptions.',
  created_at: new Date().toISOString(),
};

export const DEFAULT_DASHBOARD: DashboardSummary = {
  career_profile: DEFAULT_CAREER_ID,
  readiness: {
    technical_score: 88,
    project_score: 92,
    resume_score: 90,
    interview_score: 82,
    overall_score: 88,
    summary_text: 'Campus Placement Ready — Top 5% among peer engineering cohort.',
  },
  latest_gap_report: DEFAULT_GAP_REPORT,
  next_best_action: {
    title: 'Complete System Design Interview Simulation',
    subtitle: 'Practice real-time microservices design questions to boost your Interview Readiness.',
    cta_label: 'Start Interview Gym',
    cta_link: '/interview-gym',
    type: 'interview',
  },
  active_quests: [
    { id: 'q1', title: 'Verify First GitHub Project Proof', description: 'Submit repository link for automated verification', xp_reward: 120, progress: 1, total: 1, is_completed: true },
    { id: 'q2', title: 'Complete Skill Gap Analysis', description: 'Analyze resume against target Full Stack role', xp_reward: 50, progress: 1, total: 1, is_completed: true },
    { id: 'q3', title: 'Export ATS Compliant Resume', description: 'Build and download ATS optimized resume', xp_reward: 25, progress: 1, total: 1, is_completed: true },
    { id: 'q4', title: 'Score 80%+ in Interview Gym', description: 'Practice technical questions with AI evaluation', xp_reward: 75, progress: 0, total: 1, is_completed: false },
  ],
  recent_skills: [
    { name: 'FastAPI', category: 'Backend', evidence_level: 'verified' },
    { name: 'React', category: 'Frontend', evidence_level: 'verified' },
    { name: 'PostgreSQL', category: 'Database', evidence_level: 'verified' },
    { name: 'Docker', category: 'DevOps', evidence_level: 'assessed' },
  ],
};

export const DEFAULT_ROADMAP: Roadmap = {
  id: 'rd-demo-fs',
  user_id: 'usr-demo-aarav',
  role_target: 'Full Stack Developer',
  title: 'Comprehensive Zero-to-Placement Mastery: Full Stack Developer',
  description: 'Structured 4-phase learning and portfolio building pathway tailored for campus placements and off-campus tech drives.',
  total_milestones: 6,
  completed_milestones: 4,
  progress_percentage: 67,
  items: [
    {
      id: 'm-1',
      phase_title: 'Phase 1: Foundational Programming & Algorithms',
      title: 'Python Core & Advanced Async Concepts',
      description: 'Master list comprehensions, generators, async/await event loop, and type hints in Python 3.12.',
      skills_targeted: ['Python', 'OOP'],
      resource_recommendations: [{ title: 'Official Python Asyncio Docs', type: 'Documentation', url: 'https://docs.python.org/3/library/asyncio.html' }],
      is_project_milestone: false,
      status: 'completed',
      order_index: 1,
      completed_at: '2026-09-10',
    },
    {
      id: 'm-2',
      phase_title: 'Phase 1: Foundational Programming & Algorithms',
      title: 'Relational Database Schema Design & SQL Queries',
      description: 'Design normalized 3NF schemas, foreign keys, compound indexes, and write complex JOIN queries.',
      skills_targeted: ['SQL', 'PostgreSQL'],
      resource_recommendations: [{ title: 'PostgreSQL Tutorial', type: 'Course', url: 'https://www.postgresqltutorial.com' }],
      is_project_milestone: false,
      status: 'completed',
      order_index: 2,
      completed_at: '2026-09-18',
    },
    {
      id: 'm-3',
      phase_title: 'Phase 2: Backend REST Architecture',
      title: 'FastAPI Production Microservices & Auth',
      description: 'Build REST APIs with dependency injection, Pydantic v2 validation, JWT authentication, and pytest test suites.',
      skills_targeted: ['FastAPI', 'REST APIs'],
      resource_recommendations: [{ title: 'FastAPI Official Tutorial', type: 'Documentation', url: 'https://fastapi.tiangolo.com/tutorial' }],
      is_project_milestone: true,
      status: 'completed',
      order_index: 3,
      completed_at: '2026-09-28',
    },
    {
      id: 'm-4',
      phase_title: 'Phase 2: Modern Frontend Engineering',
      title: 'React 19, TypeScript & Tailwind CSS',
      description: 'Build responsive SPAs with state management, custom hooks, Lucide icons, and zero layout shift.',
      skills_targeted: ['React', 'TypeScript', 'Tailwind CSS'],
      resource_recommendations: [{ title: 'React.dev Official Documentation', type: 'Documentation', url: 'https://react.dev' }],
      is_project_milestone: true,
      status: 'completed',
      order_index: 4,
      completed_at: '2026-10-10',
    },
    {
      id: 'm-5',
      phase_title: 'Phase 3: Containerization & Cloud Deployment',
      title: 'Docker Multi-Stage Builds & CI/CD Pipelines',
      description: 'Write production Dockerfiles, docker-compose orchestration, and GitHub Actions automated testing.',
      skills_targeted: ['Docker', 'Git', 'CI/CD'],
      resource_recommendations: [{ title: 'Docker Getting Started Guide', type: 'Course', url: 'https://docs.docker.com/get-started' }],
      is_project_milestone: false,
      status: 'in_progress',
      order_index: 5,
    },
    {
      id: 'm-6',
      phase_title: 'Phase 4: Interview & Placement Mastery',
      title: 'High-Concurrency System Design & Mock Interviews',
      description: 'Master rate limiting, Redis caching, database indexing tradeoffs, and STAR behavioral answers.',
      skills_targeted: ['System Design', 'Interviewing'],
      resource_recommendations: [{ title: 'System Design Primer', type: 'GitHub Guide', url: 'https://github.com/donnemartin/system-design-primer' }],
      is_project_milestone: false,
      status: 'pending',
      order_index: 6,
    },
  ],
  created_at: '2026-09-01',
};

export const DEFAULT_RESOURCES: LearningResource[] = [
  {
    id: 'res-1',
    title: 'FastAPI Full Course 2026 — Zero to Production',
    skill_normalized: 'fastapi',
    resource_type: 'video_course',
    provider: 'FreeCodeCamp',
    url: 'https://www.youtube.com',
    difficulty: 'beginner',
    estimated_hours: 6,
    is_free: true,
    language: 'English',
    description: 'Complete hands-on masterclass covering FastAPI dependency injection, OAuth2 tokens, and SQLAlchemy 2.0.',
  },
  {
    id: 'res-2',
    title: 'Modern React with TypeScript Handbook',
    skill_normalized: 'react',
    resource_type: 'interactive_tutorial',
    provider: 'React.dev',
    url: 'https://react.dev/learn',
    difficulty: 'intermediate',
    estimated_hours: 12,
    is_free: true,
    language: 'English',
    description: 'Learn component architecture, React 19 actions, optimistic UI updates, and type-safe props.',
  },
  {
    id: 'res-3',
    title: 'PostgreSQL Query Optimization & Indexing Deep Dive',
    skill_normalized: 'postgresql',
    resource_type: 'article_guide',
    provider: 'UseTheIndexLuke',
    url: 'https://use-the-index-luke.com',
    difficulty: 'advanced',
    estimated_hours: 4,
    is_free: true,
    language: 'English',
    description: 'Master EXPLAIN ANALYZE, B-Tree index internals, and query planner optimization strategies.',
  },
  {
    id: 'res-4',
    title: 'Docker & Containerization for Python Developers',
    skill_normalized: 'docker',
    resource_type: 'video_course',
    provider: 'TechWorld with Nana',
    url: 'https://www.youtube.com',
    difficulty: 'beginner',
    estimated_hours: 5,
    is_free: true,
    language: 'English',
    description: 'Learn container fundamentals, multi-stage builds, port forwarding, and docker-compose orchestration.',
  },
];

export const DEFAULT_PROJECT_CATALOG: ProjectCatalogItem[] = [
  {
    id: 'p-1',
    title: 'Full-Stack E-Commerce & Inventory REST API',
    role_category: 'Software Engineering',
    difficulty: 'Intermediate',
    objective: 'Build an enterprise-grade REST API backend with FastAPI, PostgreSQL, JWT authentication, and Stripe payment webhooks.',
    requirements_checklist: [
      'FastAPI ASGI app with structured API routers and Pydantic validation',
      'SQLAlchemy 2.0 models with migrations and foreign key constraints',
      'JWT token creation and password hashing with bcrypt',
      'Automated unit tests with pytest achieving >= 80% coverage',
      'Dockerfile with multi-stage build and non-root execution',
    ],
    skills_targeted: ['FastAPI', 'PostgreSQL', 'Docker', 'Python'],
    estimated_hours: 24,
    rubric_guidelines: 'Evaluates architectural modularity, database indexing, and unit test completeness.',
  },
  {
    id: 'p-2',
    title: 'Real-Time Campus Discussion & Query Forum',
    role_category: 'Full Stack Development',
    difficulty: 'Intermediate',
    objective: 'Create a responsive collaborative student forum with threaded replies, helpful answer badges, and live markdown preview.',
    requirements_checklist: [
      'React frontend with Tailwind CSS and responsive layout',
      'FastAPI backend with upvoting and accepted answer toggle',
      'PostgreSQL full-text search across titles and descriptions',
    ],
    skills_targeted: ['React', 'FastAPI', 'SQL', 'Git'],
    estimated_hours: 18,
    rubric_guidelines: 'Evaluates state management, responsive UI design, and API query efficiency.',
  },
];

export const DEFAULT_BADGES: BadgeItem[] = [
  { id: 'b1', slug: 'verified-architect', name: 'Verified Architect', description: 'Awarded for completing and verifying a full-stack system project on GitHub.', category: 'Projects', icon_name: 'ShieldCheck', xp_reward: 120, criteria_rule: 'Verify at least 1 backend/full-stack project proof', is_unlocked: true, awarded_at: '2026-10-15' },
  { id: 'b2', slug: 'gap-analyst', name: 'Gap Explorer', description: 'Analyzed skill fit against industry job descriptions using our AI matcher.', category: 'Skills', icon_name: 'Target', xp_reward: 50, criteria_rule: 'Run 1 skill gap report', is_unlocked: true, awarded_at: '2026-10-12' },
  { id: 'b3', slug: 'ats-master', name: 'ATS Ready', description: 'Created an ATS-compliant, recruiter-ready resume scoring above 85.', category: 'Career', icon_name: 'FileCheck', xp_reward: 40, criteria_rule: 'Achieve quality score >= 85 in Resume Builder', is_unlocked: true, awarded_at: '2026-10-18' },
  { id: 'b4', slug: 'streak-champion', name: 'Streak 7-Day', description: 'Logged daily preparation and study goals for 7 consecutive days.', category: 'Consistency', icon_name: 'Flame', xp_reward: 60, criteria_rule: 'Maintain 7-day study streak', is_unlocked: true, awarded_at: '2026-10-22' },
  { id: 'b5', slug: 'interview-ace', name: 'Interview Ace', description: 'Completed 3 AI interview simulations scoring over 80%.', category: 'Interviews', icon_name: 'Award', xp_reward: 80, criteria_rule: 'Score >= 80% on 3 interview questions', is_unlocked: false },
  { id: 'b6', slug: 'community-pillar', name: 'Community Mentor', description: 'Contributed 3 answers marked as helpful by engineering peers.', category: 'Community', icon_name: 'Users', xp_reward: 100, criteria_rule: 'Receive 3 helpful answer badges', is_unlocked: false },
];

export const DEFAULT_LEADERBOARD: LeaderboardData = {
  current_user_rank: 4,
  total_participants: 128,
  disclaimer: 'Rankings are updated dynamically based on verified project proof, study consistency, and peer contributions.',
  rankings: [
    { rank: 1, handle: '@priya_sharma', full_name: 'Priya Sharma', target_role: 'Full Stack Developer', level: 4, weekly_xp: 320, total_xp: 1120, verified_projects_count: 3, badges_count: 6, is_current_user: false },
    { rank: 2, handle: '@rohit_verma', full_name: 'Rohit Verma', target_role: 'Machine Learning Engineer', level: 4, weekly_xp: 290, total_xp: 980, verified_projects_count: 2, badges_count: 5, is_current_user: false },
    { rank: 3, handle: '@ananya_data', full_name: 'Ananya Iyer', target_role: 'Data Analyst', level: 3, weekly_xp: 240, total_xp: 810, verified_projects_count: 2, badges_count: 4, is_current_user: false },
    { rank: 4, handle: '@aarav_sharma', full_name: 'Aarav Sharma', target_role: 'Full Stack Developer', level: 3, weekly_xp: 210, total_xp: 740, verified_projects_count: 2, badges_count: 4, is_current_user: true },
    { rank: 5, handle: '@aarav_cloud', full_name: 'Aarav Patel', target_role: 'Cloud & DevOps Associate', level: 2, weekly_xp: 180, total_xp: 620, verified_projects_count: 1, badges_count: 3, is_current_user: false },
  ],
};

export const DEFAULT_PASSPORT: CareerPassportData = {
  passport_id: 'pass-demo-aarav-2026',
  handle: '@aarav_sharma',
  full_name: 'Aarav Sharma',
  headline: 'Final Year CSE | Full Stack Developer & Open Source Contributor',
  target_role: 'Full Stack Developer',
  level: 3,
  total_xp: 740,
  verified_projects_count: 2,
  verified_skills: [
    { name: 'Python', category: 'Language', evidence_level: 'verified' },
    { name: 'FastAPI', category: 'Backend', evidence_level: 'verified' },
    { name: 'React', category: 'Frontend', evidence_level: 'verified' },
    { name: 'PostgreSQL', category: 'Database', evidence_level: 'verified' },
  ],
  assessed_skills: [
    { name: 'Docker', category: 'DevOps', evidence_level: 'assessed' },
  ],
  resume_mentioned_skills: [
    { name: 'Machine Learning', category: 'AI', evidence_level: 'resume_mentioned' },
    { name: 'Tailwind CSS', category: 'Frontend', evidence_level: 'resume_mentioned' },
  ],
  verified_projects: [
    {
      title: 'Full-Stack E-Commerce & Inventory REST API',
      github_url: 'https://github.com/aadeshchoudhary/ecommerce-fastapi',
      live_demo_url: 'https://demo-ecommerce.example.com',
      skills_demonstrated: ['FastAPI', 'PostgreSQL', 'Docker', 'Python'],
      verification_status: 'verified',
    },
    {
      title: 'AI Resume Analyzer & Job Skill Gap Engine',
      github_url: 'https://github.com/aadeshchoudhary/careerforge-ai',
      skills_demonstrated: ['Python', 'FastAPI', 'React', 'Vite'],
      verification_status: 'verified',
    },
  ],
  earned_badges: [
    { name: 'Verified Architect', slug: 'verified-architect', description: 'Verified full-stack system project', icon_name: 'ShieldCheck', awarded_at: '2026-10-15' },
    { name: 'Gap Explorer', slug: 'gap-analyst', description: 'Analyzed skill gap against job market', icon_name: 'Target', awarded_at: '2026-10-12' },
    { name: 'ATS Ready', slug: 'ats-master', description: 'Resume scored >= 85 ATS readiness', icon_name: 'FileCheck', awarded_at: '2026-10-18' },
    { name: 'Streak 7-Day', slug: 'streak-champion', description: 'Maintained 7-day learning streak', icon_name: 'Flame', awarded_at: '2026-10-22' },
  ],
  verification_hash: '3f7a9e8b1c4d2e0f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
  verification_url: 'https://carrer-forge.vercel.app/passport/verify/@aarav_sharma',
  generated_at: new Date().toISOString(),
  disclaimer: 'This verifiable Career Passport is cryptographically hashed with SHA-256 for tampering protection.',
};

export const DEFAULT_POSTS: PostItem[] = [
  {
    id: 'post-1',
    user_id: 'usr-priya',
    author_name: 'Priya Sharma',
    author_handle: '@priya_sharma',
    author_headline: 'Final Year CSE | Full Stack Developer & Peer Mentor',
    author_badges_count: 5,
    title: 'How I passed the TechNova SDE-1 Technical Round with FastAPI & PostgreSQL',
    content: 'Just wrapped up my technical round! They focused heavily on database indexes, connection pool sizing in SQLAlchemy, and writing clean async endpoints. Highly recommend practicing the Interview Gym questions here on CareerForge!',
    topic: 'Interview Experience',
    post_type: 'technical_tip',
    likes_count: 18,
    comments_count: 3,
    has_liked: false,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    comments: [
      { id: 'c1', post_id: 'post-1', user_id: 'usr-demo-aarav', author_name: 'Aarav Sharma', author_handle: '@aarav_sharma', content: 'Awesome tips Priya! Did they ask about connection pool max_overflow?', is_helpful_answer: false, created_at: new Date(Date.now() - 3600000 * 10).toISOString() },
      { id: 'c2', post_id: 'post-1', user_id: 'usr-priya', author_name: 'Priya Sharma', author_handle: '@priya_sharma', content: 'Yes! They asked what happens when max_overflow is reached and how timeout behaves.', is_helpful_answer: true, created_at: new Date(Date.now() - 3600000 * 8).toISOString() },
    ],
  },
  {
    id: 'post-2',
    user_id: 'usr-demo-aarav',
    author_name: 'Aarav Sharma',
    author_handle: '@aarav_sharma',
    author_headline: 'Final Year CSE | Full Stack Developer',
    author_badges_count: 4,
    title: 'Verified Project Proof: Full-Stack E-Commerce REST API with Docker & Stripe',
    content: 'Happy to share that my project passed automated verification on CareerForge! Includes multi-stage Docker build, JWT security, and 24 passing pytest unit tests.',
    topic: 'Project Showcase',
    post_type: 'project_showcase',
    project_link: 'https://github.com/aadeshchoudhary/ecommerce-fastapi',
    passport_link: 'https://carrer-forge.vercel.app/passport/verify/@aarav_sharma',
    likes_count: 24,
    comments_count: 1,
    has_liked: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    comments: [
      { id: 'c3', post_id: 'post-2', user_id: 'usr-rohit', author_name: 'Rohit Verma', author_handle: '@rohit_verma', content: 'Super clean architecture Aarav! The Docker configuration is rock solid.', is_helpful_answer: true, created_at: new Date(Date.now() - 3600000 * 22).toISOString() },
    ],
  },
  {
    id: 'post-3',
    user_id: 'usr-aarav-cloud',
    author_name: 'Aarav Patel',
    author_handle: '@aarav_cloud',
    author_headline: 'DevOps & Cloud Associate | Docker & Kubernetes',
    author_badges_count: 3,
    title: 'Top 3 Dockerfile optimizations to reduce image size by 70%',
    content: '1. Use alpine or slim base images\n2. Combine RUN commands into single layers\n3. Use multi-stage builds so compiler toolchains are excluded from the final production container.',
    topic: 'DevOps & Cloud',
    post_type: 'technical_tip',
    likes_count: 31,
    comments_count: 2,
    has_liked: false,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    comments: [],
  },
];

export const DEFAULT_PEERS: PeerProfile[] = [
  { user_id: 'p-1', handle: '@priya_sharma', full_name: 'Priya Sharma', headline: 'Final Year CSE | Full-Stack Developer & Mentor', target_role: 'Full Stack Developer', reputation_score: 185, badges_count: 5, verified_skills: ['React', 'FastAPI', 'Python', 'SQL'], connection_status: 'connected', bio: 'Building microservices and mentoring juniors.' },
  { user_id: 'p-2', handle: '@rohit_verma', full_name: 'Rohit Verma', headline: 'AI & ML Enthusiast | Working on NLP & PyTorch', target_role: 'Machine Learning Engineer', reputation_score: 148, badges_count: 4, verified_skills: ['Python', 'Machine Learning', 'PyTorch', 'Git'], connection_status: 'none', bio: 'Transformer architectures and model optimization.' },
  { user_id: 'p-3', handle: '@aarav_cloud', full_name: 'Aarav Patel', headline: 'DevOps & Cloud Associate | Docker, Kubernetes & CI/CD', target_role: 'Cloud & DevOps Associate', reputation_score: 135, badges_count: 3, verified_skills: ['Docker', 'Git', 'Linux'], connection_status: 'none', bio: 'Automating build pipelines and cloud infrastructure.' },
  { user_id: 'p-4', handle: '@ananya_data', full_name: 'Ananya Iyer', headline: 'Data Analyst | SQL, Pandas & PowerBI Specialist', target_role: 'Data Analyst', reputation_score: 125, badges_count: 3, verified_skills: ['SQL', 'Python', 'Pandas'], connection_status: 'connected', bio: 'Visualizing campus metrics and customer behavior.' },
];

export const DEFAULT_GROUPS: StudyGroupItem[] = [
  { id: 'g-1', name: 'Full Stack MERN & FastAPI Peer Circle', topic: 'Web Dev', description: 'Weekly code reviews, GitHub collaboration, and API design critiques.', creator_name: 'Priya Sharma', members_count: 14, is_member: true, created_at: '2026-09-01' },
  { id: 'g-2', name: 'LeetCode & System Design Sprint', topic: 'Interview Prep', description: 'Daily problem solving in Graphs, Dynamic Programming, and OOP design.', creator_name: 'Priya Sharma', members_count: 22, is_member: false, created_at: '2026-09-05' },
  { id: 'g-3', name: 'AI / PyTorch Capstone Builders', topic: 'AI & ML', description: 'Working on dataset curation, model fine-tuning, and FastAPI deployments.', creator_name: 'Rohit Verma', members_count: 9, is_member: false, created_at: '2026-09-10' },
  { id: 'g-4', name: 'DevOps & Cloud Infrastructure Enthusiasts', topic: 'Web Dev', description: 'Hands-on Docker, Kubernetes, CI/CD, and AWS free-tier discussions.', creator_name: 'Aarav Patel', members_count: 8, is_member: true, created_at: '2026-09-15' },
];

export const DEFAULT_APPLICATIONS: JobApplicationItem[] = [
  { id: 'app-1', user_id: 'usr-demo-aarav', company_name: 'TechNova Solutions', job_title: 'Junior Full Stack Developer', stage: 'interview', location: 'Remote / Bengaluru', salary_range: '₹8 - 12 LPA', job_url: 'https://careers.technova.example.com', applied_date: '2026-10-10', next_interview_date: '2026-10-28T14:00:00Z', notes: 'Technical Round 1 scheduled: System Design & Microservices.', match_score: 83.3, created_at: '2026-10-10', updated_at: '2026-10-22' },
  { id: 'app-2', user_id: 'usr-demo-aarav', company_name: 'DeepVision AI Labs', job_title: 'AI/ML Engineering Intern', stage: 'screening', location: 'Pune / Hybrid', salary_range: '₹35,000 / mo', job_url: 'https://deepvision.example.com', applied_date: '2026-10-14', notes: 'Completed online assessment (Python & Linear Algebra).', match_score: 78.0, created_at: '2026-10-14', updated_at: '2026-10-19' },
  { id: 'app-3', user_id: 'usr-demo-aarav', company_name: 'Apex Analytics Corp', job_title: 'Associate Data Engineer', stage: 'applied', location: 'Hyderabad / Hybrid', salary_range: '₹7 - 10 LPA', job_url: 'https://apexanalytics.example.com', applied_date: '2026-10-18', notes: 'Submitted resume via campus placement portal.', match_score: 80.0, created_at: '2026-10-18', updated_at: '2026-10-18' },
  { id: 'app-4', user_id: 'usr-demo-aarav', company_name: 'CloudScale Systems', job_title: 'Junior Cloud Developer', stage: 'saved', location: 'Noida / Remote', salary_range: '₹9 - 14 LPA', job_url: 'https://cloudscale.example.com', applied_date: '2026-10-20', notes: 'Wishlist: Need to review Kubernetes basics before applying.', match_score: 75.0, created_at: '2026-10-20', updated_at: '2026-10-20' },
  { id: 'app-5', user_id: 'usr-demo-aarav', company_name: 'InnovateX Labs', job_title: 'SDE-1 Graduate Trainee', stage: 'offer', location: 'Bengaluru', salary_range: '₹10 LPA', job_url: 'https://innovatex.example.com', applied_date: '2026-09-15', notes: 'Offer letter received! Reviewing benefits and joining date.', match_score: 91.0, created_at: '2026-09-15', updated_at: '2026-10-21' },
];

export const DEFAULT_COMPANIES: CompanyItem[] = [
  { id: 'c-1', name: 'TechNova Solutions', industry: 'Enterprise SaaS & Cloud Infrastructure', location: 'Bengaluru / Remote', website: 'https://technova.example.com', description: 'Leading cloud workflow automation company modernizing enterprise supply chain logistics across APAC.', tech_stack: ['FastAPI', 'React', 'Python', 'PostgreSQL', 'Docker', 'Redis'], hiring_status: 'Actively Hiring (Freshers & SDE-1)', typical_interview_rounds: 'Round 1: Online Assessment (DSA & SQL) -> Round 2: Technical Project Review -> Round 3: Low-Level System Design -> Round 4: Cultural Fit', interview_tips: 'Be prepared to explain database index strategies (B-Tree vs Hash) and asynchronous request handling in FastAPI.' },
  { id: 'c-2', name: 'DeepVision AI Labs', industry: 'Applied Artificial Intelligence & Computer Vision', location: 'Pune / Hybrid', website: 'https://deepvision.example.com', description: 'Pioneering computer vision models for automated medical diagnostics and autonomous drone inspection.', tech_stack: ['Python', 'PyTorch', 'OpenCV', 'Docker', 'FastAPI', 'Scikit-Learn'], hiring_status: 'Campus Drives Open (AI/ML Interns)', typical_interview_rounds: 'Round 1: Machine Learning Fundamentals & Linear Algebra -> Round 2: PyTorch Model Coding -> Round 3: Research Project Walkthrough', interview_tips: 'Showcase your GitHub project proofs! Interviewers verify if you wrote clean modular code and evaluated validation loss properly.' },
  { id: 'c-3', name: 'Apex Analytics Corp', industry: 'Financial Technology & Big Data Analytics', location: 'Hyderabad / Hybrid', website: 'https://apexanalytics.example.com', description: 'Building next-generation fraud detection and algorithmic credit assessment for neo-banking institutions.', tech_stack: ['SQL', 'Python', 'Pandas', 'PostgreSQL', 'Tableau', 'Machine Learning'], hiring_status: 'Actively Hiring (Data Analysts)', typical_interview_rounds: 'Round 1: Complex SQL Queries (Window functions, CTEs) -> Round 2: Pandas Data Cleaning Practical -> Round 3: Executive Dashboard Case Study', interview_tips: 'Practice window functions (ROW_NUMBER(), RANK(), LEAD/LAG) and explain data anomaly handling.' },
  { id: 'c-4', name: 'CloudScale Systems', industry: 'Cloud Reliability & DevOps Engineering', location: 'Noida / Remote', website: 'https://cloudscale.example.com', description: 'Multi-cloud infrastructure management automating Kubernetes deployments for global e-commerce companies.', tech_stack: ['Docker', 'Kubernetes', 'Linux', 'Git', 'Python', 'AWS'], hiring_status: 'Remote Friendly (DevOps Associates)', typical_interview_rounds: 'Round 1: Linux CLI & Shell Scripting -> Round 2: Docker Multi-Stage Builds & Networking -> Round 3: Incident Post-Mortem Scenario', interview_tips: 'Understand container layering, non-root user execution in Docker, and Kubernetes deployment strategies.' },
];

export const DEFAULT_TRENDS: TechTrendItem[] = [
  { id: 't-1', name: 'FastAPI', category: 'Framework', demand_growth: '+42% YoY', market_adoption: 'Explosive Growth', avg_salary_inr: '₹8 - 18 LPA', open_roles_count: 1850, top_pairing_skills: ['Python', 'Docker', 'PostgreSQL', 'React'], description: 'Modern, high-performance web framework for building REST APIs with Python using standard type hints and async/await.' },
  { id: 't-2', name: 'React 19', category: 'Framework', demand_growth: '+28% YoY', market_adoption: 'High', avg_salary_inr: '₹7 - 16 LPA', open_roles_count: 3400, top_pairing_skills: ['TypeScript', 'Tailwind CSS', 'Next.js', 'Redux'], description: 'The dominant UI framework for building reactive single-page applications and component architectures globally.' },
  { id: 't-3', name: 'Docker & Containers', category: 'Cloud/DevOps', demand_growth: '+35% YoY', market_adoption: 'Universal Standard', avg_salary_inr: '₹9 - 20 LPA', open_roles_count: 2750, top_pairing_skills: ['Kubernetes', 'Linux', 'CI/CD', 'Python'], description: 'Essential infrastructure prerequisite for modern microservices packaging, reproducible testing, and cloud deployments.' },
  { id: 't-4', name: 'PyTorch', category: 'AI/ML', demand_growth: '+58% YoY', market_adoption: 'High (Academic & Industry Leader)', avg_salary_inr: '₹10 - 24 LPA', open_roles_count: 1620, top_pairing_skills: ['Python', 'Hugging Face', 'OpenCV', 'FastAPI'], description: 'Leading deep learning framework for training large language models, vision transformers, and generative AI systems.' },
  { id: 't-5', name: 'PostgreSQL', category: 'Database', demand_growth: '+31% YoY', market_adoption: 'Universal Standard', avg_salary_inr: '₹8 - 18 LPA', open_roles_count: 2900, top_pairing_skills: ['SQL', 'Python', 'SQLAlchemy', 'Redis'], description: 'Powerful open-source object-relational database system with advanced JSON support, indexing, and transactional integrity.' },
  { id: 't-6', name: 'TypeScript', category: 'Language', demand_growth: '+39% YoY', market_adoption: 'High', avg_salary_inr: '₹8 - 17 LPA', open_roles_count: 3100, top_pairing_skills: ['React', 'Node.js', 'Next.js', 'GraphQL'], description: 'Typed superset of JavaScript that catches errors early in development and provides robust code refactoring.' },
];

export const DEFAULT_QUESTIONS: Record<string, InterviewQuestionItem[]> = {
  'Full Stack Developer': [
    { role_title: 'Full Stack Developer', interview_type: 'technical', question_text: 'Explain how you handle asynchronous database calls in a FastAPI backend connected to PostgreSQL, and what steps you take to prevent connection pool exhaustion under high traffic.', hints: ['Mention async/await with AsyncSession', 'Explain connection pool size and max overflow parameters', 'Discuss database transaction commits/rollbacks and timeouts'] },
    { role_title: 'Full Stack Developer', interview_type: 'behavioral', question_text: 'Describe a difficult bug you encountered in a team project right before a deadline. How did you diagnose the root cause and ensure on-time delivery without introducing regressions?', hints: ['Use the STAR method: Situation, Task, Action, Result', 'Highlight systematic debugging tools (logs, git bisect, network inspector)', 'Quantify the outcome'] },
    { role_title: 'Full Stack Developer', interview_type: 'system_design', question_text: 'How would you design a scalable notification service that sends email alerts and in-app updates to 50,000 active students without blocking web server requests?', hints: ['Propose an asynchronous message queue (e.g. Redis + Celery/RabbitMQ)', 'Separate worker processes from API servers', 'Discuss idempotency and retry strategies for failed deliveries'] },
  ],
  'Data Analyst': [
    { role_title: 'Data Analyst', interview_type: 'technical', question_text: 'Walk me through how you would use SQL Window Functions to calculate a 7-day moving average of daily active users, and explain when you would choose CTEs over subqueries.', hints: ['Use AVG(count) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)', 'Explain CTE readability and maintainability', 'Discuss query plan caching'] },
    { role_title: 'Data Analyst', interview_type: 'behavioral', question_text: 'Tell me about a time when business stakeholders questioned the accuracy of your metrics or dashboard. How did you validate your numbers and communicate findings effectively?', hints: ['Use STAR format', 'Describe data reconciliation against source tables', 'Highlight creating clear documentation'] },
  ],
  'Machine Learning Engineer': [
    { role_title: 'Machine Learning Engineer', interview_type: 'technical', question_text: 'Your classification model achieves 98% accuracy on training data but only 64% on the validation set. Walk me through your step-by-step diagnostic process and concrete mitigation strategies.', hints: ['Diagnose high variance / overfitting', 'Propose data augmentation, regularization (L1/L2, Dropout), early stopping', 'Analyze data leakage or train-test distribution skew'] },
  ],
  'Cloud & DevOps Associate': [
    { role_title: 'Cloud & DevOps Associate', interview_type: 'technical', question_text: 'Explain why multi-stage Docker builds are critical for production deployments, and outline 3 security best practices you enforce in Dockerfiles.', hints: ['Separation of build environment from runtime container', 'Running containers as non-root users', 'Scanning images for vulnerabilities'] },
  ],
};
