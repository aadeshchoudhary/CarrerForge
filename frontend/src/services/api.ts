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
  UserSkill
} from '../types';

const getApiBaseUrl = (): string => {
  // If an explicit API URL is set in environment (e.g. Render, Railway, or Vercel Env)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '') + '/api/v1';
  }
  // When running on production (e.g. Vercel same-domain deployment)
  if (import.meta.env.PROD) {
    return '/api/v1';
  }
  // Local development fallback
  return 'http://127.0.0.1:8000/api/v1';
};

const API_BASE = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE,
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('career_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  register: async (payload: { email: string; password: string; full_name: string; handle: string; target_role?: string }) => {
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  },
  login: async (payload: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', payload);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Profile & Career ID
  getMyProfile: async (): Promise<{
    user_id: string;
    email: string;
    career_id: CareerID;
    privacy: PrivacySettings;
    skills: UserSkill[];
  }> => {
    const res = await apiClient.get('/profile/me');
    return res.data;
  },
  updateProfile: async (payload: Partial<CareerID>): Promise<CareerID> => {
    const res = await apiClient.put('/profile/me', payload);
    return res.data;
  },
  updatePrivacy: async (payload: Partial<PrivacySettings>): Promise<PrivacySettings> => {
    const res = await apiClient.put('/profile/privacy', payload);
    return res.data;
  },
  getPublicProfile: async (handle: string) => {
    const res = await apiClient.get(`/profile/public/${handle}`);
    return res.data;
  },

  // Resume
  uploadResume: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getLatestResume: async (): Promise<Resume> => {
    const res = await apiClient.get('/resume/latest');
    return res.data;
  },
  reviewParsedResume: async (resumeId: string, payload: Partial<ParsedResumeData>): Promise<ParsedResumeData> => {
    const res = await apiClient.put(`/resume/${resumeId}/review`, payload);
    return res.data;
  },

  // Skills & Gap Analysis
  getSampleJobs: async (): Promise<JobDescription[]> => {
    const res = await apiClient.get('/skills/jobs/sample');
    return res.data;
  },
  analyzeGap: async (payload: {
    job_id?: string;
    custom_job_text?: string;
    custom_job_title?: string;
    resume_id?: string;
  }): Promise<SkillGapReport> => {
    const res = await apiClient.post('/skills/analyze-gap', payload);
    return res.data;
  },
  getReportById: async (reportId: string): Promise<SkillGapReport> => {
    const res = await apiClient.get(`/skills/reports/${reportId}`);
    return res.data;
  },

  // Dashboard Summary
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get('/dashboard/summary');
    return res.data;
  },

  // Phase 2 Methods
  exportResumeDocx: async (payload: ResumeBuildData): Promise<Blob> => {
    const res = await apiClient.post('/resume-builder/export-docx', payload, {
      responseType: 'blob',
    });
    return res.data;
  },
  checkResumeQuality: async (payload: ResumeBuildData): Promise<QualityCheckResponse> => {
    const res = await apiClient.post('/resume-builder/quality-check', payload);
    return res.data;
  },
  exploreCareerRoles: async (): Promise<CareerRoleComparison[]> => {
    const res = await apiClient.get('/career-finder/explore');
    return res.data;
  },
  getActiveRoadmap: async (): Promise<Roadmap> => {
    const res = await apiClient.get('/roadmap/active');
    return res.data;
  },
  generateRoadmap: async (targetRole?: string): Promise<Roadmap> => {
    const res = await apiClient.post('/roadmap/generate', { target_role: targetRole });
    return res.data;
  },
  toggleRoadmapMilestone: async (itemId: string): Promise<RoadmapItem> => {
    const res = await apiClient.put(`/roadmap/items/${itemId}/toggle`);
    return res.data;
  },
  searchResources: async (params?: {
    skill?: string;
    resource_type?: string;
    difficulty?: string;
    language?: string;
    free_only?: boolean;
  }): Promise<LearningResource[]> => {
    const res = await apiClient.get('/resources/search', { params });
    return res.data;
  },
  getTrackerSummary: async (): Promise<TrackerSummary> => {
    const res = await apiClient.get('/tracker/summary');
    return res.data;
  },
  createGoal: async (payload: { title: string; category?: string; target_date?: string }): Promise<UserGoal> => {
    const res = await apiClient.post('/tracker/goals', payload);
    return res.data;
  },
  toggleGoal: async (goalId: string): Promise<UserGoal> => {
    const res = await apiClient.put(`/tracker/goals/${goalId}/toggle`);
    return res.data;
  },
  logStudy: async (payload: { topic: string; hours_spent: number; notes?: string }): Promise<StudyLog> => {
    const res = await apiClient.post('/tracker/log-study', payload);
    return res.data;
  },

  // -------------------------------------------------------------
  // Phase 3 API Methods
  // -------------------------------------------------------------

  // Project-to-Proof
  getProjectCatalog: async (): Promise<ProjectCatalogItem[]> => {
    const res = await apiClient.get('/projects/catalog');
    return res.data;
  },
  submitProjectProof: async (payload: {
    project_catalog_id?: string;
    title: string;
    github_url: string;
    live_demo_url?: string;
    description: string;
    skills_demonstrated: string[];
  }): Promise<ProjectSubmission> => {
    const res = await apiClient.post('/projects/submit', payload);
    return res.data;
  },
  getMySubmissions: async (): Promise<ProjectSubmission[]> => {
    const res = await apiClient.get('/projects/my-submissions');
    return res.data;
  },

  // Career Passport
  getMyPassport: async (): Promise<CareerPassportData> => {
    const res = await apiClient.get('/passport/me');
    return res.data;
  },
  verifyPublicPassport: async (handle: string): Promise<CareerPassportData> => {
    const res = await apiClient.get(`/passport/verify/${handle}`);
    return res.data;
  },

  // Gamification & Badges
  getUserBadges: async (): Promise<BadgeItem[]> => {
    const res = await apiClient.get('/gamification/badges');
    return res.data;
  },
  getLeaderboard: async (): Promise<LeaderboardData> => {
    const res = await apiClient.get('/gamification/leaderboard');
    return res.data;
  },

  // -------------------------------------------------------------
  // Phase 4 API Methods (Community, Feed & Career Connect)
  // -------------------------------------------------------------
  getCommunityFeed: async (params?: { topic?: string; post_type?: string }): Promise<PostItem[]> => {
    const res = await apiClient.get('/community/feed', { params });
    return res.data;
  },
  createPost: async (payload: {
    title: string;
    content: string;
    topic: string;
    post_type: string;
    project_link?: string;
    passport_link?: string;
  }): Promise<PostItem> => {
    const res = await apiClient.post('/community/posts', payload);
    return res.data;
  },
  togglePostLike: async (postId: string): Promise<{ has_liked: boolean; likes_count: number }> => {
    const res = await apiClient.post(`/community/posts/${postId}/like`);
    return res.data;
  },
  addComment: async (postId: string, content: string): Promise<CommentItem> => {
    const res = await apiClient.post(`/community/posts/${postId}/comments`, { content });
    return res.data;
  },
  toggleHelpfulComment: async (commentId: string): Promise<CommentItem> => {
    const res = await apiClient.post(`/community/comments/${commentId}/helpful`);
    return res.data;
  },
  getPeers: async (params?: { skill?: string; search?: string }): Promise<PeerProfile[]> => {
    const res = await apiClient.get('/community/peers', { params });
    return res.data;
  },
  toggleConnect: async (peerId: string): Promise<{ status: string; message: string }> => {
    const res = await apiClient.post(`/community/peers/${peerId}/connect`);
    return res.data;
  },
  getDirectMessages: async (peerId: string): Promise<DirectMessageItem[]> => {
    const res = await apiClient.get(`/community/messages/${peerId}`);
    return res.data;
  },
  sendDirectMessage: async (payload: { receiver_id: string; content: string }): Promise<DirectMessageItem> => {
    const res = await apiClient.post('/community/messages', payload);
    return res.data;
  },
  getStudyGroups: async (): Promise<StudyGroupItem[]> => {
    const res = await apiClient.get('/community/groups');
    return res.data;
  },
  createStudyGroup: async (payload: { name: string; topic: string; description: string }): Promise<StudyGroupItem> => {
    const res = await apiClient.post('/community/groups', payload);
    return res.data;
  },
  toggleStudyGroupMembership: async (groupId: string): Promise<{ is_member: boolean; members_count: number }> => {
    const res = await apiClient.post(`/community/groups/${groupId}/toggle-join`);
    return res.data;
  },
  getCommunityStats: async (): Promise<CommunityStats> => {
    const res = await apiClient.get('/community/stats');
    return res.data;
  },

  // -------------------------------------------------------------
  // Phase 5 API Methods (Opportunity Center, Company Explorer, AI Interview Gym & Trends)
  // -------------------------------------------------------------
  getApplications: async (): Promise<JobApplicationItem[]> => {
    const res = await apiClient.get('/opportunities/applications');
    return res.data;
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
    const res = await apiClient.post('/opportunities/applications', payload);
    return res.data;
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
    const res = await apiClient.put(`/opportunities/applications/${id}`, payload);
    return res.data;
  },
  deleteApplication: async (id: string): Promise<{ status: string; id: string }> => {
    const res = await apiClient.delete(`/opportunities/applications/${id}`);
    return res.data;
  },
  getApplicationStats: async (): Promise<ApplicationStats> => {
    const res = await apiClient.get('/opportunities/applications/stats');
    return res.data;
  },
  getCompanies: async (params?: { search?: string; tech?: string }): Promise<CompanyItem[]> => {
    const res = await apiClient.get('/opportunities/companies', { params });
    return res.data;
  },
  getInterviewQuestions: async (params?: { role?: string; type?: string }): Promise<InterviewQuestionItem[]> => {
    const res = await apiClient.get('/opportunities/interview/questions', { params });
    return res.data;
  },
  evaluateInterview: async (payload: {
    role_title: string;
    interview_type: string;
    question_text: string;
    user_answer: string;
  }): Promise<InterviewEvaluationResult> => {
    const res = await apiClient.post('/opportunities/interview/evaluate', payload);
    return res.data;
  },
  getTechTrends: async (params?: { category?: string }): Promise<TechTrendItem[]> => {
    const res = await apiClient.get('/opportunities/trends', { params });
    return res.data;
  },
};
