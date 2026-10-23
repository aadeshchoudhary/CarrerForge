import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { JobDescription, SkillGapReport } from '../types';
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
  Loader2,
  FileText
} from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<SkillGapReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.getSampleJobs();
        setJobs(data);
        if (data.length > 0) {
          setSelectedJobId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load benchmark jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = useCustom
        ? { custom_job_text: customText, custom_job_title: 'Custom Job Target' }
        : { job_id: selectedJobId };

      const res = await api.analyzeGap(payload);
      setReport(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to analyze skill gap.');
    } finally {
      setLoading(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Module 1.2 • Explainable AI
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            AI Skill-Gap Analyzer
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Compares candidate skills against job requirements using documented weighted formula scoring.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaModal(true)}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2 shrink-0"
        >
          <Calculator className="w-4 h-4 text-brand-500" />
          <span>Inspect Formula Breakdown</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Role Selector Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-500" />
            Target Role Selection
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseCustom(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                !useCustom
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Benchmark Roles
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                useCustom
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Paste Custom JD
            </button>
          </div>
        </div>

        {!useCustom ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              return (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <span className="text-[10px] font-mono font-semibold text-brand-600 dark:text-brand-400 block mb-1">
                    {job.company}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mb-1">
                    {job.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mb-2">
                    {job.location}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {job.essential_skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        {s}
                      </span>
                    ))}
                    {job.essential_skills.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        +{job.essential_skills.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <textarea
              rows={4}
              placeholder="Paste any job description text here (including required qualifications and skills)..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunAnalysis}
            disabled={loading || (useCustom && !customText.trim())}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs md:text-sm shadow-md transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Evaluating Skills against Requirements...' : 'Compute Skill Gap Coverage'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {report && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-brand-600"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(2 * Math.PI * 40) - (report.coverage_score / 100) * (2 * Math.PI * 40)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    {report.coverage_score}%
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Requirement Coverage
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {report.coverage_score >= 80 ? 'Strong Alignment' : report.coverage_score >= 50 ? 'Moderate Fit with Addressable Gaps' : 'Prerequisite Skill Building Recommended'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {report.improvement_advice}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 shrink-0 transition-colors"
            >
              <Calculator className="w-4 h-4 text-brand-500" />
              <span>Show Math Details</span>
            </button>
          </div>

          {/* 3 Categories Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 🟢 Matched Skills */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Matched Skills ({report.matched_skills.length})
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200">
                  Confirmed
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Skills present on your resume matching job criteria.</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {report.matched_skills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No matches detected.</span>
                ) : (
                  report.matched_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 🔴 Missing Essential Requirements */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-800/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Missing Essential ({report.missing_essential.length})
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200">
                  Weight 75%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Mandatory prerequisites for this position.</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {report.missing_essential.length === 0 ? (
                  <span className="text-xs text-emerald-600 font-semibold">Zero essential gaps!</span>
                ) : (
                  report.missing_essential.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 🟡 Missing Preferred Skills */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-800/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Preferred ({report.missing_preferred.length})
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200">
                  Weight 25%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Nice-to-have capabilities for competitive edge.</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {report.missing_preferred.length === 0 ? (
                  <span className="text-xs text-emerald-600 font-semibold">All preferred skills satisfied!</span>
                ) : (
                  report.missing_preferred.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Academic Integrity Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
            <span>{report.disclaimer}</span>
          </div>
        </div>
      )}

      {/* Formula Breakdown Modal for Viva Defense */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand-500" />
                Explainable AI: Weighted Scoring Formula
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <p>
                To avoid arbitrary black-box scores, the coverage score uses a documented weighted linear model:
              </p>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 space-y-1">
                <div>Score = (0.75 × S_essential) + (0.25 × S_preferred)</div>
                <div className="text-slate-500 dark:text-slate-400">
                  Where S_essential = (Matched Essential / Total Essential)
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Where S_preferred = (Matched Preferred / Total Preferred)
                </div>
              </div>

              {report?.formula_breakdown && (
                <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 space-y-1.5 text-slate-800 dark:text-slate-200">
                  <div className="font-bold text-brand-700 dark:text-brand-300">Live Evaluation Numbers:</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Matched Essential: {report.formula_breakdown.matched_essential_count} / {report.formula_breakdown.total_essential}</div>
                    <div>Essential Ratio: {report.formula_breakdown.essential_ratio}</div>
                    <div>Matched Preferred: {report.formula_breakdown.matched_preferred_count} / {report.formula_breakdown.total_preferred}</div>
                    <div>Preferred Ratio: {report.formula_breakdown.preferred_ratio}</div>
                  </div>
                  <div className="pt-2 font-mono font-bold text-xs text-brand-600 dark:text-brand-400">
                    Calculated Result: {report.formula_breakdown.calculated_score}%
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 italic">
                This exact calculation can be defended during academic viva as an explainable, deterministic scoring system.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
