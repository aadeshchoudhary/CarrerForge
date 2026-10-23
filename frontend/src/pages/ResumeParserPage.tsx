import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Resume, ParsedResumeData } from '../types';
import {
  FileUp,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Loader2,
  Save,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ResumeParserPage: React.FC = () => {
  const [resume, setResume] = useState<Resume | null>(null);
  const [parsed, setParsed] = useState<ParsedResumeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load latest resume on mount
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await api.getLatestResume();
        setResume(data);
        if (data.parsed_data) {
          setParsed(data.parsed_data);
        }
      } catch (err) {
        // No resume yet, clean empty state
      }
    };
    fetchLatest();
  }, []);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.uploadResume(file);
      setResume(res);
      if (res.parsed_data) {
        setParsed(res.parsed_data);
      }
      setSuccessMsg('Resume parsed successfully! Extracted skills tagged as [resume_mentioned].');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to upload and parse resume document.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch sample docx from public folder and pass as File
      const response = await fetch('/sample_resumes/Aarav_Sharma_FullStack_Resume.docx');
      const blob = await response.blob();
      const file = new File([blob], 'Aarav_Sharma_FullStack_Resume.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      await handleFileUpload(file);
    } catch (err) {
      setError('Could not load sample resume. Try uploading a custom PDF/DOCX file.');
      setLoading(false);
    }
  };

  const handleSaveReview = async () => {
    if (!resume || !parsed) return;
    setSaving(true);
    try {
      const updated = await api.reviewParsedResume(resume.id, parsed);
      setParsed(updated);
      setSuccessMsg('Parsed profile corrections saved successfully.');
    } catch (err: any) {
      setError('Failed to update parsed profile.');
    } finally {
      setSaving(false);
    }
  };

  const confidenceScore = parsed ? Math.round(parsed.extraction_confidence * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
              Module 1.1 • Natural Language Processing
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            AI Resume Parser & Profile Extractor
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Upload PDF or DOCX resumes. Converts unstructured documents into an editable profile with confidence tracking.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-brand-300 dark:border-brand-700 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold text-xs md:text-sm hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-all flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Load Sample Full-Stack Resume</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 transition-all text-center">
        <input
          type="file"
          id="resume-file-input"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files[0]) {
              handleFileUpload(files[0]);
            }
          }}
        />
        <label
          htmlFor="resume-file-input"
          className="cursor-pointer flex flex-col items-center justify-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <FileUp className="w-7 h-7" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {loading ? 'Analyzing document structure & parsing sections...' : 'Click to upload or drag & drop your resume'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, DOCX (Max 10MB) • Handles multi-column layouts & tables
            </p>
          </div>
        </label>
      </div>

      {/* Split Review Workspace */}
      {parsed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quality & Extraction Metadata */}
          <div className="space-y-6 lg:col-span-1">
            {/* Extraction Confidence Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-500" />
                Extraction Confidence
              </h3>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {confidenceScore}%
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  confidenceScore >= 80
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-300'
                }`}>
                  {confidenceScore >= 80 ? 'High Accuracy' : 'Review Suggested'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Evaluated based on contact detection, section headers, education keywords, and skill density.
              </p>
            </div>

            {/* Incomplete or Uncertain Section Warnings */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Section Warnings & Flags ({parsed.extraction_warnings.length})
              </h3>
              {parsed.extraction_warnings.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All core sections extracted with high certainty.</span>
                </div>
              ) : (
                <ul className="space-y-2">
                  {parsed.extraction_warnings.map((w, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Extracted Skills List */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-brand-500" />
                  Extracted Skills ({parsed.extracted_skills.length})
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200">
                  resume_mentioned
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1">
                {parsed.extracted_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Editable Profile Sections */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Extracted Profile Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review and correct extracted details before saving to your Career ID profile
                  </p>
                </div>
                <button
                  onClick={handleSaveReview}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : 'Save Profile Updates'}</span>
                </button>
              </div>

              {/* 1. Personal Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-500" />
                  Personal & Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={parsed.personal_info.full_name || ''}
                      onChange={(e) =>
                        setParsed({
                          ...parsed,
                          personal_info: { ...parsed.personal_info, full_name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={parsed.personal_info.email || ''}
                      onChange={(e) =>
                        setParsed({
                          ...parsed,
                          personal_info: { ...parsed.personal_info, email: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={parsed.personal_info.phone || ''}
                      onChange={(e) =>
                        setParsed({
                          ...parsed,
                          personal_info: { ...parsed.personal_info, phone: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">GitHub Profile</label>
                    <input
                      type="text"
                      value={parsed.personal_info.github || ''}
                      onChange={(e) =>
                        setParsed({
                          ...parsed,
                          personal_info: { ...parsed.personal_info, github: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Education Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  Education & Qualifications
                </h4>
                {parsed.education.map((edu, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const nextEdu = [...parsed.education];
                        nextEdu[idx].degree = e.target.value;
                        setParsed({ ...parsed, education: nextEdu });
                      }}
                      className="w-full font-bold text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 pb-1 focus:outline-none focus:border-brand-500"
                    />
                    <div className="flex gap-4 text-[11px] text-slate-500">
                      <span>{edu.institution}</span>
                      <span>•</span>
                      <span>{edu.year}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. Projects Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-500" />
                  Demonstrated Projects ({parsed.projects.length})
                </h4>
                {parsed.projects.map((proj, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const nextP = [...parsed.projects];
                          nextP[idx].title = e.target.value;
                          setParsed({ ...parsed, projects: nextP });
                        }}
                        className="font-bold text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 pb-0.5 focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
                      />
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-200">
                        {proj.tech_stack}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const nextP = [...parsed.projects];
                        nextP[idx].description = e.target.value;
                        setParsed({ ...parsed, projects: nextP });
                      }}
                      className="w-full text-xs text-slate-600 dark:text-slate-400 bg-transparent resize-none focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
