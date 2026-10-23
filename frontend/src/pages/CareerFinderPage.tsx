import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CareerRoleComparison } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Building,
  Loader2,
  Target
} from 'lucide-react';

interface Props {
  onNavigateToRoadmap: (role: string) => void;
}

export const CareerFinderPage: React.FC<Props> = ({ onNavigateToRoadmap }) => {
  const { career, refreshProfile } = useAuth();
  const [roles, setRoles] = useState<CareerRoleComparison[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await api.exploreCareerRoles();
        setRoles(data);
      } catch (err) {
        console.error('Failed to load career path recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleSetTargetRole = async (roleTitle: string) => {
    setUpdatingRole(roleTitle);
    try {
      await api.updateProfile({ target_role: roleTitle });
      await api.generateRoadmap(roleTitle);
      await refreshProfile();
      onNavigateToRoadmap(roleTitle);
    } catch (err) {
      console.error('Failed to switch target role:', err);
    } finally {
      setUpdatingRole(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Evaluating career trajectory compatibility...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Module 2.5 • Trajectory Analysis
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Career & Job Role Finder
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Compare multiple technical career paths based on your confirmed skills and find your highest-leverage specialization.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-500" />
          <span>Current Target: <strong className="text-slate-900 dark:text-slate-100">{career?.target_role || 'Full Stack Developer'}</strong></span>
        </div>
      </div>

      {/* Role Comparison Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((r) => {
          const isTarget = r.is_current_target;
          return (
            <div
              key={r.job_id}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${
                isTarget
                  ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                      {r.company}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {r.title}
                    </h3>
                    <p className="text-xs text-slate-500">{r.location} • {r.experience_level}</p>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-black font-mono text-brand-600 dark:text-brand-400">
                        {r.compatibility_score}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Match</span>
                    </div>
                    {isTarget && (
                      <span className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active Target
                      </span>
                    )}
                  </div>
                </div>

                {/* Compatibility Progress Bar */}
                <div className="my-3">
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${r.compatibility_score}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${
                        r.compatibility_score >= 70
                          ? 'bg-emerald-500'
                          : r.compatibility_score >= 40
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Reasons Why It Fits */}
                <div className="space-y-1.5 my-3">
                  {r.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Required Skills & Gaps */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Essential Requirements:</span>
                    <span className="text-rose-500">{r.missing_essential.length} gaps to bridge</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.essential_skills.map((skill, idx) => {
                      const isMatched = r.matched_skills.includes(skill);
                      return (
                        <span
                          key={idx}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border ${
                            isMatched
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Focus: <strong>{r.improvement_focus.join(', ')}</strong>
                </span>

                <button
                  onClick={() => handleSetTargetRole(r.title)}
                  disabled={updatingRole === r.title}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    isTarget
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90'
                  }`}
                >
                  {updatingRole === r.title ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>{isTarget ? 'Open Active Roadmap' : 'Switch Target & Generate Roadmap'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
