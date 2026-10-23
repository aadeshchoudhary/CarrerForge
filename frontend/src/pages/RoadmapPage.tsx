import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Roadmap, RoadmapItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  Code2,
  ExternalLink,
  Loader2,
  RotateCcw
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { career, refreshProfile } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    try {
      const data = await api.getActiveRoadmap();
      setRoadmap(data);
    } catch (err) {
      console.error('Failed to load active roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleItem = async (itemId: string) => {
    setTogglingId(itemId);
    try {
      const updatedItem = await api.toggleRoadmapMilestone(itemId);
      if (roadmap) {
        const nextItems = roadmap.items.map((it) => (it.id === itemId ? updatedItem : it));
        const completed = nextItems.filter((i) => i.status === 'completed').length;
        const total = nextItems.length;
        setRoadmap({
          ...roadmap,
          items: nextItems,
          completed_milestones: completed,
          progress_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      }
      await refreshProfile();
    } catch (err) {
      console.error('Failed to toggle roadmap milestone:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const fresh = await api.generateRoadmap(career?.target_role);
      setRoadmap(fresh);
    } catch (err) {
      console.error('Failed to regenerate roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Assembling adaptive curriculum milestones...</p>
      </div>
    );
  }

  // Group milestones by Phase title
  const groupedMilestones: Record<string, RoadmapItem[]> = {};
  roadmap?.items.forEach((item) => {
    if (!groupedMilestones[item.phase_title]) {
      groupedMilestones[item.phase_title] = [];
    }
    groupedMilestones[item.phase_title].push(item);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
              Module 2.7 • Adaptive Curriculum
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {roadmap?.title || 'Personalized Career Roadmap'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Adapts sequentially to your verified background. Check off milestones as you master skills or deploy projects.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Regenerate for Latest Skills</span>
        </button>
      </div>

      {/* Progress Card */}
      {roadmap && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Roadmap Progress Overview
            </span>
            <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
              {roadmap.completed_milestones} of {roadmap.total_milestones} Completed ({roadmap.progress_percentage}%)
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${roadmap.progress_percentage}%` }}
              className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-700"
            />
          </div>
        </div>
      )}

      {/* Timeline Phases */}
      <div className="space-y-6">
        {Object.entries(groupedMilestones).map(([phaseTitle, items], pIdx) => (
          <div key={pIdx} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-3 h-3 rounded-full bg-brand-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {phaseTitle}
              </h2>
            </div>

            <div className="space-y-3">
              {items.map((item) => {
                const isCompleted = item.status === 'completed';
                const isProject = item.is_project_milestone;

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-90'
                        : isProject
                        ? 'bg-purple-50/30 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/50 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleItem(item.id)}
                          disabled={togglingId === item.id}
                          className="mt-0.5 text-slate-400 hover:text-brand-500 transition-colors"
                        >
                          {togglingId === item.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                              {item.title}
                            </h3>
                            {isProject && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300">
                                Project Proof Milestone
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                            {item.description}
                          </p>

                          {/* Skills Targeted Chips */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {item.skills_targeted.map((sk, skIdx) => (
                              <span
                                key={skIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[11px] font-mono font-bold text-amber-500 px-2 py-0.5 rounded bg-amber-500/10">
                          +30 XP
                        </span>
                      </div>
                    </div>

                    {/* Curated Resources Links */}
                    {item.resource_recommendations && item.resource_recommendations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          Recommended Resources:
                        </span>
                        {item.resource_recommendations.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                          >
                            <span>{res.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
