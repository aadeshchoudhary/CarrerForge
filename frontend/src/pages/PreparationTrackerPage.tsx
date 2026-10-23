import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrackerSummary, UserGoal } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Award,
  BookOpen,
  Calendar,
  Loader2,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const PreparationTrackerPage: React.FC = () => {
  const { career, refreshProfile } = useAuth();
  const [data, setData] = useState<TrackerSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // New Goal State
  const [goalTitle, setGoalTitle] = useState<string>('');
  const [goalCategory, setGoalCategory] = useState<string>('study');
  const [addingGoal, setAddingGoal] = useState<boolean>(false);

  // New Study Log State
  const [logTopic, setLogTopic] = useState<string>('');
  const [logHours, setLogHours] = useState<number>(1.5);
  const [logNotes, setLogNotes] = useState<string>('');
  const [loggingStudy, setLoggingStudy] = useState<boolean>(false);

  const fetchTracker = async () => {
    try {
      const summary = await api.getTrackerSummary();
      setData(summary);
    } catch (err) {
      console.error('Failed to load tracker summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracker();
  }, []);

  const handleToggleGoal = async (goalId: string) => {
    try {
      const updated = await api.toggleGoal(goalId);
      if (data) {
        const nextGoals = data.goals.map((g) => (g.id === goalId ? updated : g));
        const completed = nextGoals.filter((g) => g.is_completed).length;
        const total = nextGoals.length;
        setData({
          ...data,
          goals: nextGoals,
          completed_goals_today: completed,
          completion_rate_percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      }
      await refreshProfile();
    } catch (err) {
      console.error('Failed to toggle goal:', err);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    setAddingGoal(true);
    try {
      const newGoal = await api.createGoal({
        title: goalTitle.trim(),
        category: goalCategory,
        target_date: 'Today',
      });
      if (data) {
        setData({
          ...data,
          goals: [newGoal, ...data.goals],
          total_goals_today: data.total_goals_today + 1,
        });
      }
      setGoalTitle('');
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setAddingGoal(false);
    }
  };

  const handleLogStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTopic.trim() || logHours <= 0) return;
    setLoggingStudy(true);
    try {
      const newLog = await api.logStudy({
        topic: logTopic.trim(),
        hours_spent: Number(logHours),
        notes: logNotes.trim(),
      });
      if (data) {
        setData({
          ...data,
          total_study_hours_this_week: Number((data.total_study_hours_this_week + Number(logHours)).toFixed(1)),
          recent_logs: [newLog, ...data.recent_logs],
        });
      }
      setLogTopic('');
      setLogNotes('');
      await refreshProfile();
    } catch (err) {
      console.error('Failed to log study session:', err);
    } finally {
      setLoggingStudy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading preparation tracking metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
              Module 3.15 • Consistency Tracking
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Real-Time Preparation Tracker
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Monitor daily study activity, build consecutive learning streaks, and track tangible career preparation tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{data?.consecutive_days_streak || 1} Day Streak</span>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Daily Goals Completed</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                {data?.completed_goals_today || 0} / {data?.total_goals_today || 0}
              </span>
              <span className="text-xs font-bold text-emerald-600">({data?.completion_rate_percent || 0}%)</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Study Logged This Week</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                {data?.total_study_hours_this_week || 0}h
              </span>
              <span className="text-xs text-slate-400 font-medium">focused learning</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Earned Experience</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-amber-500">
                {career?.xp_points || 200} XP
              </span>
              <span className="text-xs text-slate-400 font-medium">Level {career?.current_level || 1}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Daily Preparation Goals */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-500" />
              Preparation Tasks & Goals
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              {data?.goals.length || 0} Tasks
            </span>
          </div>

          {/* Add Goal Input */}
          <form onSubmit={handleAddGoal} className="flex gap-2">
            <input
              type="text"
              placeholder="Add daily task (e.g. solve 2 SQL problems, build navbar)..."
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={addingGoal}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              {addingGoal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Add</span>
            </button>
          </form>

          {/* Goals List */}
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {data?.goals.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No tasks recorded yet. Set your first goal above!</p>
            ) : (
              data?.goals.map((g) => (
                <div
                  key={g.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    g.is_completed
                      ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleGoal(g.id)}
                      className="text-slate-400 hover:text-brand-500 transition-colors shrink-0"
                    >
                      {g.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-semibold truncate ${
                        g.is_completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {g.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                      {g.source_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Log Study Time & Recent Sessions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Log Focused Study Session
            </h3>
            <span className="text-[11px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
              +15 XP per log
            </span>
          </div>

          <form onSubmit={handleLogStudy} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Study Topic</label>
                <input
                  type="text"
                  placeholder="e.g. FastAPI Dependency Injection"
                  value={logTopic}
                  onChange={(e) => setLogTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={logHours}
                  onChange={(e) => setLogHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Key Takeaway / Notes</label>
              <textarea
                rows={2}
                placeholder="What concepts did you master or practice today?..."
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loggingStudy}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              {loggingStudy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              <span>Record Study Time & Claim XP</span>
            </button>
          </form>

          {/* Recent Study Sessions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Recent Logged Sessions
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {data?.recent_logs.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No study sessions logged yet.</p>
              ) : (
                data?.recent_logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{log.topic}</span>
                      {log.notes && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{log.notes}</p>}
                    </div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      {log.hours_spent}h
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
