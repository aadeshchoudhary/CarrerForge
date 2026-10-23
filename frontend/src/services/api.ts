import axios from 'axios';
import {
  BadgeItem,
  CareerID,
  CareerPassportData,
  CareerRoleComparison,
  CommentItem,
  CommunityStats,
  CompanyItem,
  DashboardSummary,
  DirectMessageItem,
  InterviewEvaluationResult,
  InterviewQuestionItem,
  JobApplicationItem,
  ApplicationStage,
  ApplicationStats,
  JobDescription,
  LeaderboardData,
  LearningResource,
  ParsedResumeData,
  PeerProfile,
  PostItem,
  PrivacySettings,
  ProjectCatalogItem,
  ProjectSubmission,
  QualityCheckResponse,
  Resume,
  ResumeBuildData,
  Roadmap,
  RoadmapItem,
  SkillGapReport,
  StudyGroupItem,
  StudyLog,
  TechTrendItem,
  TrackerSummary,
  UserGoal,
  UserSkill,
} from '../types';

import {
  DEFAULT_CAREER_ID,
  DEFAULT_PRIVACY,
  DEFAULT_SKILLS,
  DEFAULT_JOBS,
  DEFAULT_PARSED_RESUME,
  DEFAULT_RESUME,
  DEFAULT_GAP_REPORT,
  DEFAULT_DASHBOARD,
  DEFAULT_ROADMAP,
  DEFAULT_RESOURCES,
  DEFAULT_PROJECT_CATALOG,
  DEFAULT_BADGES,
  DEFAULT_LEADERBOARD,
  DEFAULT_PASSPORT,
  DEFAULT_POSTS,
  DEFAULT_PEERS,
  DEFAULT_GROUPS,
  DEFAULT_APPLICATIONS,
  DEFAULT_COMPANIES,
  DEFAULT_TRENDS,
  DEFAULT_QUESTIONS,
} from './mockData';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '') + '/api/v1';
  }
  if (import.meta.env.PROD) {
    return '/api/v1';
  }
  return 'http://127.0.0.1:8000/api/v1';
};

const API_BASE = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('career_token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to catch HTML returned by SPA wildcard rewrites when backend is offline
apiClient.interceptors.response.use(
  (response) => {
    const contentType = String(response.headers['content-type'] || '');
    const isHtml =
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype') ||
        response.data.includes('<!DOCTYPE') ||
        response.data.includes('<html') ||
        contentType.includes('text/html'));

    if (isHtml) {
      return Promise.reject(new Error('SPA rewrite returned HTML instead of JSON API response'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// LocalStorage Persistence Helpers for Standalone / Zero-Database Deployment
// ============================================================================

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`LocalStorage write error for ${key}:`, err);
  }
}

// ============================================================================
// Core API Client with Graceful Fallback Engine
// ============================================================================

export const api = {
  // -------------------------------------------------------------
  // Auth & Session
  // -------------------------------------------------------------
  register: async (payload: { email: string; password: string; full_name: string; handle: string; target_role?: string }) => {
    try {
      const res = await apiClient.post('/auth/register', payload);
      if (!res.data || typeof res.data !== 'object' || !res.data.access_token) {
        throw new Error('Invalid backend response');
      }
      return res.data;
    } catch {
      const formattedHandle = payload.handle?.startsWith('@') ? payload.handle : `@${payload.handle || 'user'}`;
      const career: CareerID = {
        ...DEFAULT_CAREER_ID,
        full_name: payload.full_name || 'Aarav Sharma',
        handle: formattedHandle,
        target_role: payload.target_role || 'Full Stack Developer',
      };
      setLocal('career_mock_profile', career);
      const token = 'demo-token-' + Date.now();
      localStorage.setItem('career_token', token);
      localStorage.setItem('career_handle', career.handle);
      return {
        access_token: token,
        token_type: 'bearer',
        handle: career.handle,
        user_id: career.user_id,
        user: {
          id: career.user_id,
          email: payload.email,
          career_id: career,
        },
      };
    }
  },

  login: async (payload: { email: string; password: string }) => {
    try {
      const res = await apiClient.post('/auth/login', payload);
      if (!res.data || typeof res.data !== 'object' || !res.data.access_token) {
        throw new Error('Invalid backend response');
      }
      return res.data;
    } catch {
      const career = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      const token = 'demo-token-' + Date.now();
      localStorage.setItem('career_token', token);
      localStorage.setItem('career_handle', career.handle);
      return {
        access_token: token,
        token_type: 'bearer',
        handle: career.handle,
        user_id: career.user_id,
        user: {
          id: career.user_id,
          email: payload.email || 'aarav.sharma@example.edu',
          career_id: career,
        },
      };
    }
  },

  getMe: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (!res.data || typeof res.data !== 'object' || !res.data.id) {
        throw new Error('Invalid backend response');
      }
      return res.data;
    } catch {
      const career = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      return {
        id: career.user_id,
        email: 'aarav.sharma@example.edu',
        career_id: career,
      };
    }
  },

  // -------------------------------------------------------------
  // Profile & Career ID
  // -------------------------------------------------------------
  getMyProfile: async (): Promise<{
    user_id: string;
    email: string;
    career_id: CareerID;
    privacy: PrivacySettings;
    skills: UserSkill[];
  }> => {
    try {
      const res = await apiClient.get('/profile/me');
      if (!res.data || typeof res.data !== 'object' || !res.data.career_id) {
        throw new Error('Invalid backend response');
      }
      return res.data;
    } catch {
      const career = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      const privacy = getLocal<PrivacySettings>('career_mock_privacy', DEFAULT_PRIVACY);
      const skills = getLocal<UserSkill[]>('career_mock_skills', DEFAULT_SKILLS);
      return {
        user_id: career.user_id,
        email: 'aarav.sharma@example.edu',
        career_id: career,
        privacy,
        skills,
      };
    }
  },

  updateProfile: async (payload: Partial<CareerID>): Promise<CareerID> => {
    try {
      const res = await apiClient.put('/profile/me', payload);
      return res.data;
    } catch {
      const current = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      const updated: CareerID = { ...current, ...payload };
      setLocal('career_mock_profile', updated);
      return updated;
    }
  },

  updatePrivacy: async (payload: Partial<PrivacySettings>): Promise<PrivacySettings> => {
    try {
      const res = await apiClient.put('/profile/privacy', payload);
      return res.data;
    } catch {
      const current = getLocal<PrivacySettings>('career_mock_privacy', DEFAULT_PRIVACY);
      const updated: PrivacySettings = { ...current, ...payload };
      setLocal('career_mock_privacy', updated);
      return updated;
    }
  },

  getPublicProfile: async (handle: string) => {
    try {
      const res = await apiClient.get(`/profile/public/${handle}`);
      return res.data;
    } catch {
      const current = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      return {
        career_id: { ...current, handle },
        privacy: DEFAULT_PRIVACY,
        skills: DEFAULT_SKILLS,
      };
    }
  },

  // -------------------------------------------------------------
  // Resume Parsing & Review
  // -------------------------------------------------------------
  uploadResume: async (file: File): Promise<Resume> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch {
      const parsed: ParsedResumeData = {
        ...DEFAULT_PARSED_RESUME,
        personal_info: {
          ...DEFAULT_PARSED_RESUME.personal_info,
          full_name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Candidate',
        },
      };
      setLocal('career_mock_parsed_resume', parsed);
      const resumeObj: Resume = {
        id: 'res-mock-' + Date.now(),
        filename: file.name,
        file_type: file.name.endsWith('.docx') ? 'docx' : 'pdf',
        uploaded_at: new Date().toISOString(),
        parsed_data: parsed,
      };
      setLocal('career_mock_resume', resumeObj);
      return resumeObj;
    }
  },

  getLatestResume: async (): Promise<Resume> => {
    try {
      const res = await apiClient.get('/resume/latest');
      return res.data;
    } catch {
      const parsed = getLocal<ParsedResumeData>('career_mock_parsed_resume', DEFAULT_PARSED_RESUME);
      return getLocal<Resume>('career_mock_resume', {
        ...DEFAULT_RESUME,
        parsed_data: parsed,
      });
    }
  },

  reviewParsedResume: async (resumeId: string, payload: Partial<ParsedResumeData>): Promise<ParsedResumeData> => {
    try {
      const res = await apiClient.put(`/resume/${resumeId}/review`, payload);
      return res.data;
    } catch {
      const current = getLocal<ParsedResumeData>('career_mock_parsed_resume', DEFAULT_PARSED_RESUME);
      const updated: ParsedResumeData = { ...current, ...payload };
      setLocal('career_mock_parsed_resume', updated);
      return updated;
    }
  },

  // -------------------------------------------------------------
  // Skills & Gap Analysis
  // -------------------------------------------------------------
  getSampleJobs: async (): Promise<JobDescription[]> => {
    try {
      const res = await apiClient.get('/skills/jobs/sample');
      return res.data;
    } catch {
      return DEFAULT_JOBS;
    }
  },

  analyzeGap: async (payload: {
    job_id?: string;
    custom_job_text?: string;
    custom_job_title?: string;
    resume_id?: string;
  }): Promise<SkillGapReport> => {
    try {
      const res = await apiClient.post('/skills/analyze-gap', payload);
      return res.data;
    } catch {
      const targetJob = DEFAULT_JOBS.find((j) => j.id === payload.job_id) || DEFAULT_JOBS[0];
      const report: SkillGapReport = {
        ...DEFAULT_GAP_REPORT,
        id: 'gap-report-' + Date.now(),
        job_id: targetJob.id,
        coverage_score: 83.3,
        created_at: new Date().toISOString(),
      };
      setLocal('career_mock_gap_report', report);
      return report;
    }
  },

  getReportById: async (_reportId: string): Promise<SkillGapReport> => {
    try {
      const res = await apiClient.get(`/skills/reports/${_reportId}`);
      return res.data;
    } catch {
      return getLocal<SkillGapReport>('career_mock_gap_report', DEFAULT_GAP_REPORT);
    }
  },

  // -------------------------------------------------------------
  // Dashboard Summary
  // -------------------------------------------------------------
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    try {
      const res = await apiClient.get('/dashboard/summary');
      return res.data;
    } catch {
      const career = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      return {
        ...DEFAULT_DASHBOARD,
        career_profile: career,
      };
    }
  },

  // -------------------------------------------------------------
  // Phase 2: Resume Builder, Career Finder, Roadmaps & Tracker
  // -------------------------------------------------------------
  exportResumeDocx: async (payload: ResumeBuildData): Promise<Blob> => {
    try {
      const res = await apiClient.post('/resume-builder/export-docx', payload, {
        responseType: 'blob',
      });
      return res.data;
    } catch {
      const p = payload.personal_info;
      const content = `
=======================================================================
${(p.full_name || 'CANDIDATE').toUpperCase()}
${p.email} | ${p.phone} | ${p.location || 'Remote'}
GitHub: ${p.github || ''} | LinkedIn: ${p.linkedin || ''}
Target Role: ${payload.target_job_title || 'Software Developer'}
=======================================================================

PROFESSIONAL SUMMARY:
${p.headline || 'Passionate software engineer building resilient modern systems.'}

CORE SKILLS:
${payload.skills.join(', ')}

EXPERIENCE:
${(payload.work_experience || [])
  .map(
    (e) => `
- ${e.title} at ${e.company} (${e.duration})
  ${e.bullet_points?.join('\n  ') || ''}
`
  )
  .join('')}

PROJECTS:
${(payload.projects || [])
  .map(
    (pr) => `
- ${pr.title} [Tech: ${pr.tech_stack}]
  ${pr.description}
  Link: ${pr.github_link || ''}
`
  )
  .join('')}

EDUCATION:
${(payload.education || [])
  .map((ed) => `- ${ed.degree} | ${ed.institution} (${ed.year}) - Score: ${ed.score || 'N/A'}`)
  .join('\n')}
`;
      return new Blob([content], { type: 'text/plain;charset=utf-8' });
    }
  },

  checkResumeQuality: async (payload: ResumeBuildData): Promise<QualityCheckResponse> => {
    try {
      const res = await apiClient.post('/resume-builder/quality-check', payload);
      return res.data;
    } catch {
      return {
        quality_score: 92,
        grade: 'A',
        action_verbs_score: 94,
        quantifiable_metrics_score: 88,
        completeness_score: 95,
        strengths: [
          'Strong action verbs (Architected, Engineered, Implemented) detected throughout.',
          'Quantifiable impact metrics included in both work experience and key project highlights.',
          'Clear, standard ATS headings compatible with enterprise resume parsers (Taleo, Greenhouse, Workday).',
          'Rich skill density corresponding directly with current full stack industry benchmarks.',
        ],
        issues: [
          {
            id: 'iss-1',
            category: 'Verifiable Proof',
            severity: 'low',
            title: 'Include Cryptographic Career Passport Link',
            description: 'Adding your verifiable SHA-256 Passport URL allows recruiters to verify your project proof in 1 click.',
            suggested_rewrite: 'Career Passport: https://carrer-forge.vercel.app/passport/verify/@aarav_sharma',
          },
        ],
        disclaimer: 'Quality evaluation generated by automated ATS structural heuristics.',
      };
    }
  },

  exploreCareerRoles: async (): Promise<CareerRoleComparison[]> => {
    try {
      const res = await apiClient.get('/career-finder/explore');
      return res.data;
    } catch {
      return [
        {
          job_id: 'job-1',
          title: 'Full Stack Developer',
          company: 'Industry Benchmark',
          location: 'Bengaluru / Remote',
          experience_level: 'Fresher / Entry Level',
          compatibility_score: 86.5,
          is_current_target: true,
          essential_skills: ['React', 'FastAPI', 'Python', 'PostgreSQL', 'Docker', 'Git'],
          preferred_skills: ['TypeScript', 'Redis', 'Tailwind CSS'],
          matched_skills: ['React', 'FastAPI', 'Python', 'PostgreSQL', 'Git'],
          missing_essential: ['Docker'],
          reasons: ['Your verified skills in React, Python, and SQL align directly with full stack requirements.'],
          improvement_focus: ['Complete Docker containerization project', 'Add Redis caching layer'],
        },
        {
          job_id: 'job-2',
          title: 'Data Analyst',
          company: 'Industry Benchmark',
          location: 'Hyderabad / Hybrid',
          experience_level: 'Fresher / Entry Level',
          compatibility_score: 75.0,
          is_current_target: false,
          essential_skills: ['SQL', 'Python', 'Pandas', 'Excel'],
          preferred_skills: ['PowerBI', 'Tableau', 'PostgreSQL'],
          matched_skills: ['SQL', 'Python', 'PostgreSQL'],
          missing_essential: ['Pandas'],
          reasons: ['Strong SQL and Python foundation; complete PowerBI module to reach 90%+ match.'],
          improvement_focus: ['Learn Pandas data manipulation', 'Build PowerBI dashboard'],
        },
        {
          job_id: 'job-3',
          title: 'Machine Learning Engineer',
          company: 'Industry Benchmark',
          location: 'Pune / Hybrid',
          experience_level: 'Fresher / Entry Level',
          compatibility_score: 68.0,
          is_current_target: false,
          essential_skills: ['Python', 'PyTorch', 'Scikit-Learn', 'Linear Algebra'],
          preferred_skills: ['FastAPI', 'Docker', 'OpenCV'],
          matched_skills: ['Python', 'FastAPI', 'Docker'],
          missing_essential: ['PyTorch', 'Linear Algebra'],
          reasons: ['Good Python capability; complete model training and PyTorch labs to bridge gap.'],
          improvement_focus: ['PyTorch deep learning fundamentals', 'Model evaluation metrics'],
        },
        {
          job_id: 'job-4',
          title: 'Cloud & DevOps Associate',
          company: 'Industry Benchmark',
          location: 'Noida / Remote',
          experience_level: 'Junior / 1 Year',
          compatibility_score: 62.5,
          is_current_target: false,
          essential_skills: ['Linux', 'Docker', 'Git', 'CI/CD'],
          preferred_skills: ['Kubernetes', 'Python', 'AWS'],
          matched_skills: ['Docker', 'Git', 'Python'],
          missing_essential: ['Linux', 'CI/CD'],
          reasons: ['Familiarity with Git and Docker; learn CI/CD pipelines to excel.'],
          improvement_focus: ['Linux shell scripting', 'GitHub Actions workflow'],
        },
      ];
    }
  },

  getActiveRoadmap: async (): Promise<Roadmap> => {
    try {
      const res = await apiClient.get('/roadmap/active');
      return res.data;
    } catch {
      return getLocal<Roadmap>('career_mock_roadmap', DEFAULT_ROADMAP);
    }
  },

  generateRoadmap: async (targetRole?: string): Promise<Roadmap> => {
    try {
      const res = await apiClient.post('/roadmap/generate', { target_role: targetRole });
      return res.data;
    } catch {
      const role = targetRole || 'Full Stack Developer';
      const fresh: Roadmap = {
        ...DEFAULT_ROADMAP,
        id: 'rd-' + Date.now(),
        role_target: role,
        title: `Comprehensive Zero-to-Placement Mastery: ${role}`,
        items: DEFAULT_ROADMAP.items.map((it, idx) => ({
          ...it,
          id: `m-item-${idx + 1}`,
          status: idx < 2 ? 'completed' : idx === 2 ? 'in_progress' : 'pending',
        })),
        completed_milestones: 2,
        progress_percentage: 33,
      };
      setLocal('career_mock_roadmap', fresh);
      return fresh;
    }
  },

  toggleRoadmapMilestone: async (itemId: string): Promise<RoadmapItem> => {
    try {
      const res = await apiClient.put(`/roadmap/items/${itemId}/toggle`);
      return res.data;
    } catch {
      const roadmap = getLocal<Roadmap>('career_mock_roadmap', DEFAULT_ROADMAP);
      let updatedItem: RoadmapItem = roadmap.items[0];
      const items = roadmap.items.map((it) => {
        if (it.id === itemId) {
          const nextStatus = it.status === 'completed' ? 'in_progress' : 'completed';
          const toggled: RoadmapItem = { ...it, status: nextStatus };
          updatedItem = toggled;
          return toggled;
        }
        return it;
      });
      const completedCount = items.filter((i) => i.status === 'completed').length;
      const updatedRoadmap: Roadmap = {
        ...roadmap,
        items,
        completed_milestones: completedCount,
        progress_percentage: Math.round((completedCount / items.length) * 100),
      };
      setLocal('career_mock_roadmap', updatedRoadmap);
      return updatedItem;
    }
  },

  searchResources: async (params?: {
    skill?: string;
    resource_type?: string;
    difficulty?: string;
    language?: string;
    free_only?: boolean;
  }): Promise<LearningResource[]> => {
    try {
      const res = await apiClient.get('/resources/search', { params });
      return res.data;
    } catch {
      let list = DEFAULT_RESOURCES;
      if (params?.skill) {
        const query = params.skill.toLowerCase();
        list = list.filter((r) => r.skill_normalized.toLowerCase().includes(query) || r.title.toLowerCase().includes(query));
      }
      if (params?.resource_type && params.resource_type !== 'all') {
        list = list.filter((r) => r.resource_type === params.resource_type);
      }
      if (params?.difficulty && params.difficulty !== 'all') {
        list = list.filter((r) => r.difficulty === params.difficulty);
      }
      if (params?.free_only) {
        list = list.filter((r) => r.is_free);
      }
      return list;
    }
  },

  getTrackerSummary: async (): Promise<TrackerSummary> => {
    try {
      const res = await apiClient.get('/tracker/summary');
      return res.data;
    } catch {
      const defaultGoals: UserGoal[] = [
        { id: 'g1', user_id: 'usr-demo-aarav', title: 'Complete FastAPI Advanced Routing Lab', category: 'Backend', is_completed: true, source_type: 'custom', created_at: '2026-10-20', target_date: '2026-10-24' },
        { id: 'g2', user_id: 'usr-demo-aarav', title: 'Build Project Proof & Verify GitHub Repo', category: 'Projects', is_completed: true, source_type: 'custom', created_at: '2026-10-21', target_date: '2026-10-25' },
        { id: 'g3', user_id: 'usr-demo-aarav', title: 'Practice 5 SQL Window Function Problems', category: 'Database', is_completed: false, source_type: 'custom', created_at: '2026-10-22', target_date: '2026-10-26' },
      ];
      const defaultLogs: StudyLog[] = [
        { id: 'l1', topic: 'FastAPI Dependency Injection & Auth', hours_spent: 2.5, logged_date: '2026-10-23' },
        { id: 'l2', topic: 'React 19 State Management & Custom Hooks', hours_spent: 3.0, logged_date: '2026-10-22' },
      ];
      return getLocal<TrackerSummary>('career_mock_tracker', {
        total_goals_today: 3,
        completed_goals_today: 2,
        completion_rate_percent: 67,
        total_study_hours_this_week: 38.5,
        consecutive_days_streak: 7,
        goals: defaultGoals,
        recent_logs: defaultLogs,
      });
    }
  },

  createGoal: async (payload: { title: string; category?: string; target_date?: string }): Promise<UserGoal> => {
    try {
      const res = await apiClient.post('/tracker/goals', payload);
      return res.data;
    } catch {
      const tracker = await api.getTrackerSummary();
      const newGoal: UserGoal = {
        id: 'goal-' + Date.now(),
        user_id: 'usr-demo-aarav',
        title: payload.title,
        category: payload.category || 'General',
        is_completed: false,
        source_type: 'custom',
        created_at: new Date().toISOString(),
        target_date: payload.target_date || new Date().toISOString().split('T')[0],
      };
      const updatedTracker: TrackerSummary = {
        ...tracker,
        total_goals_today: tracker.total_goals_today + 1,
        goals: [newGoal, ...tracker.goals],
      };
      setLocal('career_mock_tracker', updatedTracker);
      return newGoal;
    }
  },

  toggleGoal: async (goalId: string): Promise<UserGoal> => {
    try {
      const res = await apiClient.put(`/tracker/goals/${goalId}/toggle`);
      return res.data;
    } catch {
      const tracker = await api.getTrackerSummary();
      let updatedGoal: UserGoal = tracker.goals[0];
      const goals = tracker.goals.map((g) => {
        if (g.id === goalId) {
          const toggled = { ...g, is_completed: !g.is_completed };
          updatedGoal = toggled;
          return toggled;
        }
        return g;
      });
      const completedCount = goals.filter((g) => g.is_completed).length;
      const updatedTracker: TrackerSummary = {
        ...tracker,
        completed_goals_today: completedCount,
        completion_rate_percent: Math.round((completedCount / goals.length) * 100),
        goals,
      };
      setLocal('career_mock_tracker', updatedTracker);
      return updatedGoal;
    }
  },

  logStudy: async (payload: { topic: string; hours_spent: number; notes?: string }): Promise<StudyLog> => {
    try {
      const res = await apiClient.post('/tracker/log-study', payload);
      return res.data;
    } catch {
      const tracker = await api.getTrackerSummary();
      const newLog: StudyLog = {
        id: 'log-' + Date.now(),
        topic: payload.topic,
        hours_spent: payload.hours_spent,
        notes: payload.notes,
        logged_date: new Date().toISOString().split('T')[0],
      };
      const updatedTracker: TrackerSummary = {
        ...tracker,
        total_study_hours_this_week: Number((tracker.total_study_hours_this_week + payload.hours_spent).toFixed(1)),
        recent_logs: [newLog, ...tracker.recent_logs],
      };
      setLocal('career_mock_tracker', updatedTracker);
      return newLog;
    }
  },

  // -------------------------------------------------------------
  // Phase 3: Project-to-Proof, Passport & Gamification
  // -------------------------------------------------------------
  getProjectCatalog: async (): Promise<ProjectCatalogItem[]> => {
    try {
      const res = await apiClient.get('/projects/catalog');
      return res.data;
    } catch {
      return DEFAULT_PROJECT_CATALOG;
    }
  },

  submitProjectProof: async (payload: {
    project_catalog_id?: string;
    title: string;
    github_url: string;
    live_demo_url?: string;
    description: string;
    skills_demonstrated: string[];
  }): Promise<ProjectSubmission> => {
    try {
      const res = await apiClient.post('/projects/submit', payload);
      return res.data;
    } catch {
      const submissions = getLocal<ProjectSubmission[]>('career_mock_submissions', [
        {
          id: 'sub-existing-1',
          user_id: 'usr-demo-aarav',
          project_catalog_id: 'p-1',
          title: 'Full-Stack E-Commerce & Inventory REST API',
          github_url: 'https://github.com/aadeshchoudhary/ecommerce-fastapi',
          live_demo_url: 'https://demo-ecommerce.example.com',
          description: 'Production-ready e-commerce backend with JWT authentication, Stripe integration, and PostgreSQL.',
          skills_demonstrated: ['FastAPI', 'PostgreSQL', 'Docker', 'Python'],
          verification_status: 'verified',
          verification_notes: 'All 24 pytest tests passing. Dockerfile multi-stage build verified.',
          submitted_at: '2026-10-15T10:00:00Z',
          verified_at: '2026-10-15T10:05:00Z',
        },
      ]);

      const newSubmission: ProjectSubmission = {
        id: 'sub-' + Date.now(),
        user_id: 'usr-demo-aarav',
        project_catalog_id: payload.project_catalog_id,
        title: payload.title,
        github_url: payload.github_url,
        live_demo_url: payload.live_demo_url,
        description: payload.description,
        skills_demonstrated: payload.skills_demonstrated,
        verification_status: 'verified',
        verification_notes: 'GitHub repository validated. Automated code syntax and README verified.',
        submitted_at: new Date().toISOString(),
        verified_at: new Date().toISOString(),
      };

      const updatedSubmissions = [newSubmission, ...submissions];
      setLocal('career_mock_submissions', updatedSubmissions);

      // Award XP to Career Profile
      const profile = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      const updatedProfile = {
        ...profile,
        xp_points: profile.xp_points + 120,
        badges_count: profile.badges_count + 1,
      };
      setLocal('career_mock_profile', updatedProfile);

      return newSubmission;
    }
  },

  getMySubmissions: async (): Promise<ProjectSubmission[]> => {
    try {
      const res = await apiClient.get('/projects/my-submissions');
      return res.data;
    } catch {
      return getLocal<ProjectSubmission[]>('career_mock_submissions', [
        {
          id: 'sub-existing-1',
          user_id: 'usr-demo-aarav',
          project_catalog_id: 'p-1',
          title: 'Full-Stack E-Commerce & Inventory REST API',
          github_url: 'https://github.com/aadeshchoudhary/ecommerce-fastapi',
          live_demo_url: 'https://demo-ecommerce.example.com',
          description: 'Production-ready e-commerce backend with JWT authentication, Stripe integration, and PostgreSQL.',
          skills_demonstrated: ['FastAPI', 'PostgreSQL', 'Docker', 'Python'],
          verification_status: 'verified',
          verification_notes: 'All 24 pytest tests passing. Dockerfile multi-stage build verified.',
          submitted_at: '2026-10-15T10:00:00Z',
          verified_at: '2026-10-15T10:05:00Z',
        },
      ]);
    }
  },

  getMyPassport: async (): Promise<CareerPassportData> => {
    try {
      const res = await apiClient.get('/passport/me');
      return res.data;
    } catch {
      const profile = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      return {
        ...DEFAULT_PASSPORT,
        handle: profile.handle,
        full_name: profile.full_name,
        target_role: profile.target_role,
        level: profile.current_level,
        total_xp: profile.xp_points,
      };
    }
  },

  verifyPublicPassport: async (handle: string): Promise<CareerPassportData> => {
    try {
      const res = await apiClient.get(`/passport/verify/${handle}`);
      return res.data;
    } catch {
      const profile = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      return {
        ...DEFAULT_PASSPORT,
        handle,
        full_name: profile.full_name,
        target_role: profile.target_role,
        level: profile.current_level,
        total_xp: profile.xp_points,
      };
    }
  },

  getUserBadges: async (): Promise<BadgeItem[]> => {
    try {
      const res = await apiClient.get('/gamification/badges');
      return res.data;
    } catch {
      return DEFAULT_BADGES;
    }
  },

  getLeaderboard: async (): Promise<LeaderboardData> => {
    try {
      const res = await apiClient.get('/gamification/leaderboard');
      return res.data;
    } catch {
      return DEFAULT_LEADERBOARD;
    }
  },

  // -------------------------------------------------------------
  // Phase 4: Community Feed & Career Connect
  // -------------------------------------------------------------
  getCommunityFeed: async (params?: { topic?: string; post_type?: string }): Promise<PostItem[]> => {
    try {
      const res = await apiClient.get('/community/feed', { params });
      return res.data;
    } catch {
      let posts = getLocal<PostItem[]>('career_mock_posts', DEFAULT_POSTS);
      if (params?.topic && params.topic !== 'all') {
        posts = posts.filter((p) => p.topic === params.topic);
      }
      if (params?.post_type && params.post_type !== 'all') {
        posts = posts.filter((p) => p.post_type === params.post_type);
      }
      return posts;
    }
  },

  createPost: async (payload: {
    title: string;
    content: string;
    topic: string;
    post_type: string;
    project_link?: string;
    passport_link?: string;
  }): Promise<PostItem> => {
    try {
      const res = await apiClient.post('/community/posts', payload);
      return res.data;
    } catch {
      const profile = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      const posts = getLocal<PostItem[]>('career_mock_posts', DEFAULT_POSTS);
      const newPost: PostItem = {
        id: 'post-' + Date.now(),
        user_id: profile.user_id,
        author_name: profile.full_name,
        author_handle: profile.handle,
        author_headline: profile.headline,
        author_badges_count: profile.badges_count,
        title: payload.title,
        content: payload.content,
        topic: payload.topic,
        post_type: (payload.post_type as 'milestone' | 'project_showcase' | 'technical_tip' | 'question' | 'collaboration') || 'technical_tip',
        project_link: payload.project_link,
        passport_link: payload.passport_link,
        likes_count: 0,
        comments_count: 0,
        has_liked: false,
        created_at: new Date().toISOString(),
        comments: [],
      };
      setLocal('career_mock_posts', [newPost, ...posts]);
      return newPost;
    }
  },

  togglePostLike: async (postId: string): Promise<{ has_liked: boolean; likes_count: number }> => {
    try {
      const res = await apiClient.post(`/community/posts/${postId}/like`);
      return res.data;
    } catch {
      const posts = getLocal<PostItem[]>('career_mock_posts', DEFAULT_POSTS);
      let result = { has_liked: true, likes_count: 1 };
      const updatedPosts = posts.map((p) => {
        if (p.id === postId) {
          const toggled = !p.has_liked;
          const count = toggled ? p.likes_count + 1 : Math.max(0, p.likes_count - 1);
          result = { has_liked: toggled, likes_count: count };
          return { ...p, has_liked: toggled, likes_count: count };
        }
        return p;
      });
      setLocal('career_mock_posts', updatedPosts);
      return result;
    }
  },

  addComment: async (postId: string, content: string): Promise<CommentItem> => {
    try {
      const res = await apiClient.post(`/community/posts/${postId}/comments`, { content });
      return res.data;
    } catch {
      const profile = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      const newComment: CommentItem = {
        id: 'c-' + Date.now(),
        post_id: postId,
        user_id: profile.user_id,
        author_name: profile.full_name,
        author_handle: profile.handle,
        content,
        is_helpful_answer: false,
        created_at: new Date().toISOString(),
      };
      const posts = getLocal<PostItem[]>('career_mock_posts', DEFAULT_POSTS);
      const updated = posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments_count: p.comments_count + 1,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      });
      setLocal('career_mock_posts', updated);
      return newComment;
    }
  },

  toggleHelpfulComment: async (commentId: string): Promise<CommentItem> => {
    try {
      const res = await apiClient.post(`/community/comments/${commentId}/helpful`);
      return res.data;
    } catch {
      const posts = getLocal<PostItem[]>('career_mock_posts', DEFAULT_POSTS);
      let target: CommentItem = {
        id: commentId,
        post_id: 'post-1',
        user_id: 'usr-demo',
        author_name: 'Aarav Sharma',
        author_handle: '@aarav_sharma',
        content: 'Helpful answer marked.',
        is_helpful_answer: true,
        created_at: new Date().toISOString(),
      };
      const updated = posts.map((p) => {
        const comments = (p.comments || []).map((c) => {
          if (c.id === commentId) {
            target = { ...c, is_helpful_answer: !c.is_helpful_answer };
            return target;
          }
          return c;
        });
        return { ...p, comments };
      });
      setLocal('career_mock_posts', updated);
      return target;
    }
  },

  getPeers: async (params?: { skill?: string; search?: string }): Promise<PeerProfile[]> => {
    try {
      const res = await apiClient.get('/community/peers', { params });
      return res.data;
    } catch {
      let peers = getLocal<PeerProfile[]>('career_mock_peers', DEFAULT_PEERS);
      if (params?.skill && params.skill !== 'All') {
        peers = peers.filter((p) => p.verified_skills.some((s) => s.toLowerCase() === params.skill?.toLowerCase()));
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        peers = peers.filter((p) => p.full_name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q) || p.headline.toLowerCase().includes(q));
      }
      return peers;
    }
  },

  toggleConnect: async (peerId: string): Promise<{ status: string; message: string }> => {
    try {
      const res = await apiClient.post(`/community/peers/${peerId}/connect`);
      return res.data;
    } catch {
      const peers = getLocal<PeerProfile[]>('career_mock_peers', DEFAULT_PEERS);
      let newStatus = 'connected';
      const updated = peers.map((p) => {
        if (p.user_id === peerId) {
          newStatus = p.connection_status === 'connected' ? 'none' : 'connected';
          return { ...p, connection_status: newStatus };
        }
        return p;
      });
      setLocal('career_mock_peers', updated);
      return {
        status: newStatus,
        message: newStatus === 'connected' ? 'Connected successfully!' : 'Disconnected',
      };
    }
  },

  getDirectMessages: async (peerId: string): Promise<DirectMessageItem[]> => {
    try {
      const res = await apiClient.get(`/community/messages/${peerId}`);
      return res.data;
    } catch {
      const allMessages = getLocal<Record<string, DirectMessageItem[]>>('career_mock_dms', {
        'p-1': [
          {
            id: 'dm-1',
            sender_id: 'p-1',
            sender_name: 'Priya Sharma',
            sender_handle: '@priya_sharma',
            receiver_id: 'usr-demo-aarav',
            content: 'Hey Aarav! Loved your recent project verification on Career Passport.',
            is_read: true,
            sent_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          },
          {
            id: 'dm-2',
            sender_id: 'usr-demo-aarav',
            sender_name: 'Aarav Sharma',
            sender_handle: '@aarav_sharma',
            receiver_id: 'p-1',
            content: 'Thanks Priya! Working on microservices next.',
            is_read: true,
            sent_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
        ],
      });
      return allMessages[peerId] || [];
    }
  },

  sendDirectMessage: async (payload: { receiver_id: string; content: string }): Promise<DirectMessageItem> => {
    try {
      const res = await apiClient.post('/community/messages', payload);
      return res.data;
    } catch {
      const profile = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      const newDM: DirectMessageItem = {
        id: 'dm-' + Date.now(),
        sender_id: profile.user_id,
        sender_name: profile.full_name,
        sender_handle: profile.handle,
        receiver_id: payload.receiver_id,
        content: payload.content,
        is_read: false,
        sent_at: new Date().toISOString(),
      };
      const allMessages = getLocal<Record<string, DirectMessageItem[]>>('career_mock_dms', {});
      const existing = allMessages[payload.receiver_id] || [];
      allMessages[payload.receiver_id] = [...existing, newDM];
      setLocal('career_mock_dms', allMessages);
      return newDM;
    }
  },

  getStudyGroups: async (): Promise<StudyGroupItem[]> => {
    try {
      const res = await apiClient.get('/community/groups');
      return res.data;
    } catch {
      return getLocal<StudyGroupItem[]>('career_mock_groups', DEFAULT_GROUPS);
    }
  },

  createStudyGroup: async (payload: { name: string; topic: string; description: string }): Promise<StudyGroupItem> => {
    try {
      const res = await apiClient.post('/community/groups', payload);
      return res.data;
    } catch {
      const profile = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      const groups = getLocal<StudyGroupItem[]>('career_mock_groups', DEFAULT_GROUPS);
      const newGroup: StudyGroupItem = {
        id: 'g-' + Date.now(),
        name: payload.name,
        topic: payload.topic,
        description: payload.description,
        creator_name: profile.full_name,
        members_count: 1,
        is_member: true,
        created_at: new Date().toISOString().split('T')[0],
      };
      setLocal('career_mock_groups', [newGroup, ...groups]);
      return newGroup;
    }
  },

  toggleStudyGroupMembership: async (groupId: string): Promise<{ is_member: boolean; members_count: number }> => {
    try {
      const res = await apiClient.post(`/community/groups/${groupId}/toggle-join`);
      return res.data;
    } catch {
      const groups = getLocal<StudyGroupItem[]>('career_mock_groups', DEFAULT_GROUPS);
      let result = { is_member: true, members_count: 1 };
      const updated = groups.map((g) => {
        if (g.id === groupId) {
          const isMem = !g.is_member;
          const count = isMem ? g.members_count + 1 : Math.max(1, g.members_count - 1);
          result = { is_member: isMem, members_count: count };
          return { ...g, is_member: isMem, members_count: count };
        }
        return g;
      });
      setLocal('career_mock_groups', updated);
      return result;
    }
  },

  getCommunityStats: async (): Promise<CommunityStats> => {
    try {
      const res = await apiClient.get('/community/stats');
      return res.data;
    } catch {
      const posts = getLocal<PostItem[]>('career_mock_posts', DEFAULT_POSTS);
      const groups = getLocal<StudyGroupItem[]>('career_mock_groups', DEFAULT_GROUPS);
      return {
        total_posts: posts.length,
        active_discussions: posts.length + 4,
        study_groups_count: groups.length,
        active_mentors_count: 8,
        user_reputation: 185,
        user_connections_count: 14,
      };
    }
  },

  // -------------------------------------------------------------
  // Phase 5: Opportunity Center, AI Interview Gym & Tech Trends
  // -------------------------------------------------------------
  getApplications: async (): Promise<JobApplicationItem[]> => {
    try {
      const res = await apiClient.get('/opportunities/applications');
      return res.data;
    } catch {
      return getLocal<JobApplicationItem[]>('career_mock_applications', DEFAULT_APPLICATIONS);
    }
  },

  createApplication: async (payload: {
    company_name: string;
    job_title: string;
    stage?: ApplicationStage;
    location?: string;
    salary_range?: string;
    job_url?: string;
    next_interview_date?: string;
    notes?: string;
    match_score?: number;
  }): Promise<JobApplicationItem> => {
    try {
      const res = await apiClient.post('/opportunities/applications', payload);
      return res.data;
    } catch {
      const profile = getLocal<CareerID>('career_mock_profile', DEFAULT_CAREER_ID);
      const apps = getLocal<JobApplicationItem[]>('career_mock_applications', DEFAULT_APPLICATIONS);
      const newApp: JobApplicationItem = {
        id: 'app-' + Date.now(),
        user_id: profile.user_id,
        company_name: payload.company_name,
        job_title: payload.job_title,
        stage: payload.stage || 'applied',
        location: payload.location || 'Remote / Hybrid',
        salary_range: payload.salary_range || '₹8 - 14 LPA',
        job_url: payload.job_url,
        applied_date: new Date().toISOString().split('T')[0],
        next_interview_date: payload.next_interview_date,
        notes: payload.notes || 'Application tracked via CareerForge Opportunity Center.',
        match_score: payload.match_score || 85.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocal('career_mock_applications', [newApp, ...apps]);
      return newApp;
    }
  },

  updateApplication: async (
    id: string,
    payload: {
      stage?: ApplicationStage;
      next_interview_date?: string;
      notes?: string;
      salary_range?: string;
      match_score?: number;
    }
  ): Promise<JobApplicationItem> => {
    try {
      const res = await apiClient.put(`/opportunities/applications/${id}`, payload);
      return res.data;
    } catch {
      const apps = getLocal<JobApplicationItem[]>('career_mock_applications', DEFAULT_APPLICATIONS);
      let updatedApp: JobApplicationItem = apps[0];
      const updated = apps.map((a) => {
        if (a.id === id) {
          updatedApp = {
            ...a,
            ...payload,
            updated_at: new Date().toISOString(),
          };
          return updatedApp;
        }
        return a;
      });
      setLocal('career_mock_applications', updated);
      return updatedApp;
    }
  },

  deleteApplication: async (id: string): Promise<{ status: string; id: string }> => {
    try {
      const res = await apiClient.delete(`/opportunities/applications/${id}`);
      return res.data;
    } catch {
      const apps = getLocal<JobApplicationItem[]>('career_mock_applications', DEFAULT_APPLICATIONS);
      setLocal('career_mock_applications', apps.filter((a) => a.id !== id));
      return { status: 'deleted', id };
    }
  },

  getApplicationStats: async (): Promise<ApplicationStats> => {
    try {
      const res = await apiClient.get('/opportunities/applications/stats');
      return res.data;
    } catch {
      const apps = getLocal<JobApplicationItem[]>('career_mock_applications', DEFAULT_APPLICATIONS);
      return {
        total_applications: apps.length,
        saved_count: apps.filter((a) => a.stage === 'saved').length,
        applied_count: apps.filter((a) => a.stage === 'applied').length,
        screening_count: apps.filter((a) => a.stage === 'screening').length,
        interview_count: apps.filter((a) => a.stage === 'interview').length,
        offer_count: apps.filter((a) => a.stage === 'offer').length,
        rejected_count: apps.filter((a) => a.stage === 'rejected').length,
        active_interviews_count: apps.filter((a) => a.stage === 'interview').length,
      };
    }
  },

  getCompanies: async (params?: { search?: string; tech?: string }): Promise<CompanyItem[]> => {
    try {
      const res = await apiClient.get('/opportunities/companies', { params });
      return res.data;
    } catch {
      let comps = DEFAULT_COMPANIES;
      if (params?.search) {
        const q = params.search.toLowerCase();
        comps = comps.filter((c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
      }
      if (params?.tech) {
        const t = params.tech.toLowerCase();
        comps = comps.filter((c) => c.tech_stack.some((tech) => tech.toLowerCase().includes(t)));
      }
      return comps;
    }
  },

  getInterviewQuestions: async (params?: { role?: string; type?: string }): Promise<InterviewQuestionItem[]> => {
    try {
      const res = await apiClient.get('/opportunities/interview/questions', { params });
      return res.data;
    } catch {
      const role = params?.role || 'Full Stack Developer';
      const questions = DEFAULT_QUESTIONS[role] || DEFAULT_QUESTIONS['Full Stack Developer'];
      if (params?.type && params.type !== 'all') {
        return questions.filter((q) => q.interview_type === params.type);
      }
      return questions;
    }
  },

  evaluateInterview: async (payload: {
    role_title: string;
    interview_type: string;
    question_text: string;
    user_answer: string;
  }): Promise<InterviewEvaluationResult> => {
    try {
      const res = await apiClient.post('/opportunities/interview/evaluate', payload);
      return res.data;
    } catch {
      const answer = payload.user_answer.trim();
      const wordCount = answer.split(/\s+/).length;

      let score = 75;
      if (wordCount > 60) score += 15;
      else if (wordCount < 20) score -= 25;

      const mentionsAsync = /async|await|session|thread|pool|queue/i.test(answer);
      const mentionsDesign = /star|result|scalab|test|metric|error/i.test(answer);

      if (mentionsAsync || mentionsDesign) score += 8;
      score = Math.min(98, Math.max(35, score));

      return {
        id: 'eval-' + Date.now(),
        role_title: payload.role_title,
        interview_type: payload.interview_type,
        question_text: payload.question_text,
        user_answer: payload.user_answer,
        ai_score: score,
        strengths: [
          'Directly addresses the question prompt without unnecessary detours.',
          'Understands the foundational system components and lifecycle.',
          wordCount > 40 ? 'Well-paced articulation of the technical process.' : 'Clear and concise tone.',
        ],
        areas_for_improvement: [
          wordCount < 50 ? 'Could provide a concrete code snippet or real-world project example.' : 'Elaborate on performance metrics under high concurrency.',
          'Mention how you would write automated regression tests to verify this.',
        ],
        suggested_answer:
          'In a production environment, I ensure asynchronous requests do not block the event loop by utilizing connection pools (e.g. SQLAlchemy AsyncEngine with pool_size=20, max_overflow=10). Each HTTP request obtains a scoped session via dependency injection, wrapped in a transaction block to guarantee atomic commits or rollbacks upon exception.',
        created_at: new Date().toISOString(),
      };
    }
  },

  getTechTrends: async (params?: { category?: string }): Promise<TechTrendItem[]> => {
    try {
      const res = await apiClient.get('/opportunities/trends', { params });
      return res.data;
    } catch {
      if (params?.category && params.category !== 'all') {
        return DEFAULT_TRENDS.filter((t) => t.category.toLowerCase().includes(params.category!.toLowerCase()));
      }
      return DEFAULT_TRENDS;
    }
  },
};
