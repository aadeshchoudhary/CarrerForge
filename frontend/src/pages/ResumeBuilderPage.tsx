import React, { useState } from 'react';
import { api } from '../services/api';
import { ResumeBuildData, QualityCheckResponse } from '../types';
import {
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ShieldCheck,
  Award,
  Loader2,
  Wand2,
  HelpCircle
} from 'lucide-react';

const INITIAL_RESUME_DATA: ResumeBuildData = {
  personal_info: {
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    phone: '+91 98765 43210',
    location: 'Bengaluru, India',
    headline: 'Full Stack Web Developer & Software Engineer',
    github: 'github.com/aarav-sharma',
    linkedin: 'linkedin.com/in/aarav-sharma',
    portfolio: 'aarav.dev'
  },
  education: [
    {
      degree: 'Bachelor of Technology in Computer Science',
      institution: 'National Institute of Technology',
      year: '2020 - 2024',
      score: 'CGPA: 8.7/10.0'
    }
  ],
  work_experience: [
    {
      title: 'Software Developer Intern',
      company: 'TechInnovate Solutions',
      duration: '6 Months (Jan 2024 - June 2024)',
      location: 'Bengaluru',
      bullet_points: [
        'Engineered responsive user interfaces in React and TypeScript, accelerating page load speeds by 32%.',
        'Implemented secure RESTful API endpoints using FastAPI and PostgreSQL with JWT authentication.',
        'Collaborated in an agile scrum team using Git for continuous version control and pull request reviews.'
      ]
    }
  ],
  projects: [
    {
      title: 'AI-Powered Career Platform',
      tech_stack: 'React, TypeScript, FastAPI, PostgreSQL',
      description: 'Engineered an end-to-end career companion platform featuring automated resume parsing and explainable skill gap scoring.',
      github_link: 'https://github.com/aarav-sharma/career-platform'
    },
    {
      title: 'Real-Time Task & Collaboration Board',
      tech_stack: 'React, Node.js, WebSockets, Tailwind CSS',
      description: 'Built a multi-tenant Kanban board with live updates across 500+ active sessions with sub-50ms latency.',
      github_link: 'https://github.com/aarav-sharma/task-board'
    }
  ],
  skills: [
    'Python', 'FastAPI', 'React', 'TypeScript', 'JavaScript',
    'PostgreSQL', 'SQL', 'Docker', 'Git', 'Tailwind CSS', 'RESTful APIs'
  ],
  certifications: [
    'Python for Web Development & Automation (Online Certification)',
    'PostgreSQL Advanced Database Querying'
  ],
  target_job_title: 'Junior Full Stack Developer'
};

export const ResumeBuilderPage: React.FC = () => {
  const [formData, setFormData] = useState<ResumeBuildData>(INITIAL_RESUME_DATA);
  const [activeTab, setActiveTab] = useState<'editor' | 'quality'>('editor');
  const [qualityReport, setQualityReport] = useState<QualityCheckResponse | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [auditing, setAuditing] = useState<boolean>(false);
  const [newSkill, setNewSkill] = useState<string>('');

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      const blob = await api.exportResumeDocx(formData);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.personal_info.full_name.replace(/\s+/g, '_')}_Resume.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export DOCX resume:', err);
      alert('Error generating Word document. Please ensure all required fields are filled.');
    } finally {
      setExporting(false);
    }
  };

  const handleRunQualityAudit = async () => {
    setAuditing(true);
    try {
      const report = await api.checkResumeQuality(formData);
      setQualityReport(report);
      setActiveTab('quality');
    } catch (err) {
      console.error('Failed to audit resume quality:', err);
    } finally {
      setAuditing(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove)
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
              Module 1.3 & 1.4 • Document Engineering
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            AI Resume Builder & Quality Auditor
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Craft a polished, ATS-compliant Word (.docx) resume with heuristic action-verb checking and metric optimizations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunQualityAudit}
            disabled={auditing}
            className="px-4 py-2.5 rounded-xl border border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold text-xs hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-all flex items-center gap-2"
          >
            {auditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-brand-500" />}
            <span>Audit Resume Quality</span>
          </button>

          <button
            onClick={handleExportDocx}
            disabled={exporting}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs md:text-sm shadow-md transition-all flex items-center gap-2"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Download Editable DOCX</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'editor'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Resume Sections Editor
        </button>
        <button
          onClick={() => {
            if (!qualityReport) handleRunQualityAudit();
            else setActiveTab('quality');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'quality'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Quality & ATS Checker</span>
          {qualityReport && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/20 text-white">
              {qualityReport.quality_score}%
            </span>
          )}
        </button>
      </div>

      {activeTab === 'editor' ? (
        <div className="space-y-6">
          {/* 1. Personal Information */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              1. Personal & Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.personal_info.full_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal_info: { ...formData.personal_info, full_name: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.personal_info.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal_info: { ...formData.personal_info, email: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.personal_info.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal_info: { ...formData.personal_info, phone: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.personal_info.location || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal_info: { ...formData.personal_info, location: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={formData.personal_info.github || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal_info: { ...formData.personal_info, github: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={formData.personal_info.linkedin || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal_info: { ...formData.personal_info, linkedin: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Technical Skills */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              2. Technical Skills
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new skill (e.g. Docker, PyTorch, GraphQL)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-500 text-xs"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 3. Demonstrated Projects */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                3. Demonstrated Projects ({formData.projects.length})
              </h3>
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    projects: [
                      ...formData.projects,
                      {
                        title: 'New Capstone Project',
                        tech_stack: 'Python, SQL',
                        description: 'Engineered an end-to-end application with clear documentation and tests.'
                      }
                    ]
                  })
                }
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const next = [...formData.projects];
                        next[idx].title = e.target.value;
                        setFormData({ ...formData, projects: next });
                      }}
                      className="font-bold text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 pb-1 flex-1 focus:outline-none focus:border-brand-500 text-slate-900 dark:text-slate-100"
                    />
                    <button
                      onClick={() => {
                        const next = formData.projects.filter((_, pIdx) => pIdx !== idx);
                        setFormData({ ...formData, projects: next });
                      }}
                      className="text-slate-400 hover:text-rose-500 text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Tech stack (e.g. React, FastAPI, PostgreSQL)"
                    value={proj.tech_stack}
                    onChange={(e) => {
                      const next = [...formData.projects];
                      next[idx].tech_stack = e.target.value;
                      setFormData({ ...formData, projects: next });
                    }}
                    className="w-full text-xs font-mono text-purple-600 dark:text-purple-400 bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 focus:outline-none"
                  />

                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const next = [...formData.projects];
                      next[idx].description = e.target.value;
                      setFormData({ ...formData, projects: next });
                    }}
                    className="w-full text-xs text-slate-600 dark:text-slate-300 bg-transparent resize-none focus:outline-none border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Quality Check & Optimization Audit View */
        <div className="space-y-6">
          {qualityReport && (
            <>
              {/* Score Summary Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex flex-col items-center justify-center font-mono shadow-md shrink-0">
                    <span className="text-2xl font-black">{qualityReport.quality_score}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Quality</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300">
                        Grade: {qualityReport.grade}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Resume Optimization Audit Results
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                      {qualityReport.disclaimer}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExportDocx}
                  disabled={exporting}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Optimized DOCX</span>
                </button>
              </div>

              {/* Sub-Score Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 font-medium">Action-Verb Density</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                      {qualityReport.action_verbs_score}%
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">Decisive ownership</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 font-medium">Quantifiable Metrics</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                      {qualityReport.quantifiable_metrics_score}%
                    </span>
                    <span className="text-[11px] text-amber-600 font-semibold">Numbers & scale</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 font-medium">Section Completeness</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                      {qualityReport.completeness_score}%
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">All sections present</span>
                  </div>
                </div>
              </div>

              {/* Actionable Issues & Rewrites */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Recommended Content & Phrasing Refinements ({qualityReport.issues.length})
                </h3>

                {qualityReport.issues.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-medium">No critical issues detected. Your resume wording is strong!</p>
                ) : (
                  <div className="space-y-3">
                    {qualityReport.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            {issue.title}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 uppercase font-semibold">
                            {issue.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{issue.description}</p>
                        {issue.suggested_rewrite && (
                          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                            <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                              Suggested Actionable Rewrite:
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 italic">
                              "{issue.suggested_rewrite}"
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
