export interface CareerID {
  id: string;
  user_id: string;
  handle: string;
  full_name: string;
  headline: string;
  bio: string;
  target_role: string;
  xp_points: number;
  current_level: number;
  badges_count: number;
  visibility: 'public' | 'private';
  created_at: string;
}

export interface UserSkill {
  id: string;
  name: string;
  category: string;
  evidence_level: 'resume_mentioned' | 'self_reported' | 'assessed' | 'verified';
  years_experience?: number;
}

export interface ParsedResumeData {
  id: string;
  resume_id: string;
  personal_info: {
    full_name?: string;
    email?: string;
    phone?: string;
    github?: string;
    linkedin?: string;
    location?: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    score?: string;
  }>;
  work_experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    title: string;
    tech_stack: string;
    description: string;
    link?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  extracted_skills: string[];
  extraction_confidence: number;
  extraction_warnings: string[];
  updated_at: string;
}

export interface Resume {
  id: string;
  filename: string;
  file_type: string;
  uploaded_at: string;
  parsed_data?: ParsedResumeData;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  source_url?: string;
  description_text: string;
  essential_skills: string[];
  preferred_skills: string[];
  experience_level: string;
}

export interface FormulaBreakdown {
  formula: string;
  essential_weight_percent: number;
  preferred_weight_percent: number;
  total_essential: number;
  matched_essential_count: number;
  essential_ratio: number;
  total_preferred: number;
  matched_preferred_count: number;
  preferred_ratio: number;
  calculated_score: number;
  interpretation: string;
}

export interface SkillGapReport {
  id: string;
  user_id: string;
  job_id: string;
  resume_id?: string;
  coverage_score: number;
  matched_skills: string[];
  missing_essential: string[];
  missing_preferred: string[];
  needs_evidence: string[];
  formula_breakdown: FormulaBreakdown;
  improvement_advice?: string;
  disclaimer: string;
  created_at: string;
}

export interface ReadinessBreakdown {
  technical_score: number;
  project_score: number;
  resume_score: number;
  interview_score: number;
  overall_score: number;
  summary_text: string;
}

export interface CareerQuestItem {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  progress: number;
  total: number;
  is_completed: boolean;
}

export interface DashboardSummary {
  career_profile: CareerID;
  readiness: ReadinessBreakdown;
  latest_gap_report?: SkillGapReport | null;
  next_best_action: {
    title: string;
    subtitle: string;
    cta_label: string;
    cta_link: string;
    type: string;
  };
  active_quests: CareerQuestItem[];
  recent_skills: Array<{
    name: string;
    category: string;
    evidence_level: string;
  }>;
}

export interface PrivacySettings {
  show_email: boolean;
  show_skills: boolean;
  show_resume: boolean;
  show_gap_scores: boolean;
  show_activity: boolean;
}

export interface ResumeBuildData {
  personal_info: {
    full_name: string;
    email: string;
    phone: string;
    location?: string;
    headline?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    score?: string;
  }>;
  work_experience: Array<{
    title: string;
    company: string;
    duration: string;
    location?: string;
    bullet_points: string[];
  }>;
  projects: Array<{
    title: string;
    tech_stack: string;
    description: string;
    github_link?: string;
    live_link?: string;
  }>;
  skills: string[];
  certifications?: string[];
  target_job_title?: string;
}

export interface QualityIssue {
  id: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  target_text?: string;
  suggested_rewrite?: string;
}

export interface QualityCheckResponse {
  quality_score: number;
  grade: string;
  action_verbs_score: number;
  quantifiable_metrics_score: number;
  completeness_score: number;
  issues: QualityIssue[];
  strengths: string[];
  disclaimer: string;
}

export interface CareerRoleComparison {
  job_id: string;
  title: string;
  company: string;
  location: string;
  experience_level: string;
  compatibility_score: number;
  is_current_target: boolean;
  essential_skills: string[];
  preferred_skills: string[];
  matched_skills: string[];
  missing_essential: string[];
  reasons: string[];
  improvement_focus: string[];
}

export interface RoadmapItem {
  id: string;
  phase_title: string;
  title: string;
  description: string;
  skills_targeted: string[];
  resource_recommendations: Array<{
    title: string;
    type: string;
    url: string;
  }>;
  is_project_milestone: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  order_index: number;
  completed_at?: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  role_target: string;
  title: string;
  description?: string;
  total_milestones: number;
  completed_milestones: number;
  progress_percentage: number;
  items: RoadmapItem[];
  created_at: string;
}

export interface LearningResource {
  id: string;
  title: string;
  skill_normalized: string;
  resource_type: string;
  provider: string;
  url: string;
  difficulty: string;
  estimated_hours: number;
  is_free: boolean;
  language: string;
  description?: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  category: string;
  target_date?: string;
  is_completed: boolean;
  source_type: string;
  created_at: string;
  completed_at?: string;
}

export interface StudyLog {
  id: string;
  topic: string;
  hours_spent: number;
  notes?: string;
  logged_date: string;
}

export interface TrackerSummary {
  total_goals_today: number;
  completed_goals_today: number;
  completion_rate_percent: number;
  total_study_hours_this_week: number;
  consecutive_days_streak: number;
  goals: UserGoal[];
  recent_logs: StudyLog[];
}

// -------------------------------------------------------------
// Phase 3 Type Definitions
// -------------------------------------------------------------

export interface ProjectCatalogItem {
  id: string;
  title: string;
  role_category: string;
  difficulty: string;
  objective: string;
  requirements_checklist: string[];
  skills_targeted: string[];
  estimated_hours: number;
  rubric_guidelines?: string;
}

export interface ProjectSubmission {
  id: string;
  user_id: string;
  project_catalog_id?: string;
  title: string;
  github_url: string;
  live_demo_url?: string;
  description: string;
  skills_demonstrated: string[];
  verification_status: string;
  verification_notes?: string;
  submitted_at: string;
  verified_at?: string;
}

export interface PassportSkill {
  name: string;
  category: string;
  evidence_level: string;
}

export interface PassportProject {
  title: string;
  github_url: string;
  live_demo_url?: string;
  skills_demonstrated: string[];
  verification_status: string;
}

export interface PassportBadge {
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  awarded_at: string;
}

export interface CareerPassportData {
  passport_id: string;
  handle: string;
  full_name: string;
  headline: string;
  target_role: string;
  level: number;
  total_xp: number;
  verified_projects_count: number;
  verified_skills: PassportSkill[];
  assessed_skills: PassportSkill[];
  resume_mentioned_skills: PassportSkill[];
  verified_projects: PassportProject[];
  earned_badges: PassportBadge[];
  verification_hash: string;
  verification_url: string;
  generated_at: string;
  disclaimer: string;
}

export interface BadgeItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon_name: string;
  xp_reward: number;
  criteria_rule: string;
  is_unlocked: boolean;
  awarded_at?: string;
}

export interface LeaderboardUser {
  rank: number;
  handle: string;
  full_name: string;
  target_role: string;
  level: number;
  weekly_xp: number;
  total_xp: number;
  verified_projects_count: number;
  badges_count: number;
  is_current_user: boolean;
}

export interface LeaderboardData {
  current_user_rank: number;
  rankings: LeaderboardUser[];
  total_participants: number;
  disclaimer: string;
}

// Phase 4: Community, Feed & Career Connect Types
export interface CommentItem {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  author_handle: string;
  content: string;
  is_helpful_answer: boolean;
  created_at: string;
}

export interface PostItem {
  id: string;
  user_id: string;
  author_name: string;
  author_handle: string;
  author_headline?: string;
  author_badges_count: number;
  title: string;
  content: string;
  topic: string;
  post_type: 'milestone' | 'project_showcase' | 'technical_tip' | 'question' | 'collaboration';
  project_link?: string;
  passport_link?: string;
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
  created_at: string;
  comments: CommentItem[];
}

export interface PeerProfile {
  user_id: string;
  handle: string;
  full_name: string;
  headline: string;
  target_role: string;
  reputation_score: number;
  badges_count: number;
  verified_skills: string[];
  connection_status: 'none' | 'pending' | 'connected';
  bio?: string;
}

export interface DirectMessageItem {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_handle: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  sent_at: string;
}

export interface StudyGroupItem {
  id: string;
  name: string;
  topic: string;
  description: string;
  creator_name: string;
  members_count: number;
  is_member: boolean;
  created_at: string;
}

export interface CommunityStats {
  total_posts: number;
  active_discussions: number;
  study_groups_count: number;
  active_mentors_count: number;
  user_reputation: number;
  user_connections_count: number;
}

// Phase 5: Opportunity Command Center, Company Explorer, AI Interview Gym & Tech Trends
export type ApplicationStage = 'saved' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

export interface JobApplicationItem {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  stage: ApplicationStage;
  location?: string;
  salary_range?: string;
  job_url?: string;
  applied_date: string;
  next_interview_date?: string;
  notes?: string;
  match_score: number;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStats {
  total_applications: number;
  saved_count: number;
  applied_count: number;
  screening_count: number;
  interview_count: number;
  offer_count: number;
  rejected_count: number;
  active_interviews_count: number;
}

export interface CompanyItem {
  id: string;
  name: string;
  industry: string;
  location: string;
  website?: string;
  description: string;
  tech_stack: string[];
  hiring_status: string;
  typical_interview_rounds?: string;
  interview_tips?: string;
}

export interface InterviewQuestionItem {
  role_title: string;
  interview_type: string;
  question_text: string;
  hints: string[];
}

export interface InterviewEvaluationResult {
  id: string;
  role_title: string;
  interview_type: string;
  question_text: string;
  user_answer: string;
  ai_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  suggested_answer: string;
  created_at: string;
}

export interface TechTrendItem {
  id: string;
  name: string;
  category: string;
  demand_growth: string;
  market_adoption: string;
  avg_salary_inr: string;
  open_roles_count: number;
  top_pairing_skills: string[];
  description: string;
}
