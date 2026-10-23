import React from 'react';
import { ReadinessBreakdown } from '../../types';
import { CheckCircle2, AlertCircle, Award } from 'lucide-react';

interface Props {
  readiness?: ReadinessBreakdown;
  targetRole?: string;
}

export const ReadinessRing: React.FC<Props> = ({ readiness, targetRole = 'Software Engineer' }) => {
  const score = readiness?.overall_score ?? 68;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const subScores = [
    { label: 'Technical Skills', score: readiness?.technical_score ?? 70, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Project Proof', score: readiness?.project_score ?? 60, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Resume Quality', score: readiness?.resume_score ?? 85, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Interview Prep', score: readiness?.interview_score ?? 55, color: 'text-purple-500 bg-purple-500/10' },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-500" />
            Career Readiness Index
          </h3>
          <p className="text-xs text-slate-500">Benchmark for {targetRole}</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
          Explainable Metric
        </span>
      </div>

      {/* Center Circular Progress */}
      <div className="flex items-center justify-center my-4">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-brand-600 dark:text-brand-500 transition-all duration-1000 ease-out"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {score}%
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Score Breakdown Chips */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        {subScores.map((item, idx) => (
          <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate mr-1">
              {item.label}
            </span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${item.color}`}>
              {item.score}%
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-slate-500 text-center leading-relaxed">
        {readiness?.summary_text || 'Score combines resume keywords (20%), verified projects (25%), technical assessments (35%), and interview practice (20%).'}
      </p>
    </div>
  );
};
