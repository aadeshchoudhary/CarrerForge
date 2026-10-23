import React from 'react';
import { SkillGapReport } from '../../types';
import { Target, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface Props {
  latestReport?: SkillGapReport | null;
  onNavigateToAnalyzer: () => void;
}

export const SkillGapSummary: React.FC<Props> = ({ latestReport, onNavigateToAnalyzer }) => {
  const matched = latestReport?.matched_skills?.length ?? 6;
  const missingEss = latestReport?.missing_essential?.length ?? 2;
  const missingPref = latestReport?.missing_preferred?.length ?? 3;
  const total = matched + missingEss + missingPref;
  const matchPct = total > 0 ? Math.round((matched / total) * 100) : 60;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            Skill Gap Snapshot
          </h3>
          <p className="text-xs text-slate-500">
            {latestReport ? `Latest analysis for target role` : 'Baseline estimation'}
          </p>
        </div>
        <button
          onClick={onNavigateToAnalyzer}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition-colors"
        >
          View Full Breakdown
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar Distribution */}
      <div className="my-3">
        <div className="flex justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-600 dark:text-slate-300">Coverage Ratio</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{matchPct}% Matched</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(matched / total) * 100}%` }}
            className="bg-emerald-500 h-full transition-all duration-700"
            title={`Matched: ${matched}`}
          />
          <div
            style={{ width: `${(missingEss / total) * 100}%` }}
            className="bg-rose-500 h-full transition-all duration-700"
            title={`Missing Essential: ${missingEss}`}
          />
          <div
            style={{ width: `${(missingPref / total) * 100}%` }}
            className="bg-amber-400 h-full transition-all duration-700"
            title={`Missing Preferred: ${missingPref}`}
          />
        </div>
      </div>

      {/* 3 Status Cards */}
      <div className="grid grid-cols-3 gap-2 my-2">
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{matched}</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">Matched</span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-center">
          <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold mb-0.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>{missingEss}</span>
          </div>
          <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">Essential Gaps</span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{missingPref}</span>
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">Preferred Gaps</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 truncate max-w-[220px]">
          {latestReport?.missing_essential?.[0]
            ? `Top priority: learn ${latestReport.missing_essential[0]}`
            : 'Explore benchmark requirements for top companies'}
        </span>
        <button
          onClick={onNavigateToAnalyzer}
          className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          Compare Role
        </button>
      </div>
    </div>
  );
};
