import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import { NextBestActionCard } from '../components/widgets/NextBestActionCard';
import { ReadinessRing } from '../components/widgets/ReadinessRing';
import { SkillGapSummary } from '../components/widgets/SkillGapSummary';
import { QuestsWidget } from '../components/widgets/QuestsWidget';
import { QuickActions } from '../components/widgets/QuickActions';
import { Sparkles, ShieldCheck, Tag, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const { career } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboard = async () => {
    try {
      const summary = await api.getDashboardSummary();
      setData(summary);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Aggregating career intelligence metrics...</p>
      </div>
    );
  }

  const profile = data?.career_profile || career;
  const recentSkills = data?.recent_skills || [
    { name: 'Python', category: 'Backend', evidence_level: 'resume_mentioned' },
    { name: 'React', category: 'Frontend', evidence_level: 'resume_mentioned' },
    { name: 'FastAPI', category: 'Backend', evidence_level: 'resume_mentioned' },
    { name: 'SQL', category: 'Database', evidence_level: 'self_reported' },
    { name: 'Git', category: 'DevOps', evidence_level: 'verified' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome & Career Goal Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">
              {profile?.handle || '@student'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">Student Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {profile?.full_name || 'Candidate'}!
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Targeting: <strong className="text-slate-800 dark:text-slate-200">{profile?.target_role || 'Full Stack Engineer'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('skill-gap')}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs md:text-sm shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Analyze Role Fit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row 1: Next Best Action Card */}
      <NextBestActionCard
        action={data?.next_best_action}
        onActionClick={(link) => onNavigate(link)}
      />

      {/* Row 2: Readiness Ring & Skill Gap Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReadinessRing
          readiness={data?.readiness}
          targetRole={profile?.target_role}
        />
        <SkillGapSummary
          latestReport={data?.latest_gap_report}
          onNavigateToAnalyzer={() => onNavigate('skill-gap')}
        />
      </div>

      {/* Row 3: Quests & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuestsWidget
          quests={data?.active_quests}
          xp={profile?.xp_points}
          level={profile?.current_level}
        />
        <QuickActions onNavigate={onNavigate} />
      </div>

      {/* Row 4: Demonstrated Skills with Evidence Badge Indicator */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Demonstrated Skills & Evidence Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Non-negotiable rule: Every skill is tagged by evidence type
            </p>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Manage Skills
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {recentSkills.map((s, idx) => {
            const badgeStyles: Record<string, string> = {
              resume_mentioned: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
              self_reported: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
              assessed: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
              verified: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            };
            const currentBadge = badgeStyles[s.evidence_level] || badgeStyles.resume_mentioned;

            return (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2"
              >
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {s.name}
                </span>
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border uppercase ${currentBadge}`}>
                  {s.evidence_level.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
