import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LeaderboardData, BadgeItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Flame,
  ShieldCheck,
  Trophy,
  Medal,
  Sparkles,
  Lock,
  CheckCircle2,
  Loader2,
  FileText,
  Code2,
  Compass
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { career } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges'>('leaderboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadData, badgeData] = await Promise.all([
          api.getLeaderboard(),
          api.getUserBadges(),
        ]);
        setLeaderboard(leadData);
        setBadges(badgeData);
      } catch (err) {
        console.error('Failed to load leaderboard & badges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const style = `w-7 h-7 ${isUnlocked ? 'text-amber-500' : 'text-slate-400'}`;
    switch (iconName) {
      case 'FileText':
        return <FileText className={style} />;
      case 'Code2':
        return <Code2 className={style} />;
      case 'ShieldCheck':
        return <ShieldCheck className={style} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={style} />;
      case 'Flame':
        return <Flame className={style} />;
      case 'Compass':
        return <Compass className={style} />;
      default:
        return <Award className={style} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading real-time leaderboards & badge matrix...</p>
      </div>
    );
  }

  const unlockedCount = badges.filter((b) => b.is_unlocked).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              Module 4.18 & 4.19 • Gamification Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Leaderboard & Badge Achievements
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Build consistency, earn published milestone badges, and compare progress with peer students across technical tracks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{unlockedCount} / {badges.length} Badges Unlocked</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Student Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'badges'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Master Badge Catalog ({badges.length})</span>
        </button>
      </div>

      {activeTab === 'leaderboard' ? (
        /* Leaderboard Table View */
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Global Learning Consistency Standings
                </h3>
                <p className="text-xs text-slate-500">
                  Your Current Rank: <strong className="text-brand-600 dark:text-brand-400">#{leaderboard?.current_user_rank}</strong> out of {leaderboard?.total_participants} registered students
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Target Track</th>
                    <th className="py-3 px-4 text-center">Level</th>
                    <th className="py-3 px-4 text-center">Verified Projects</th>
                    <th className="py-3 px-4 text-center">Badges</th>
                    <th className="py-3 px-4 text-right">Total XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {leaderboard?.rankings.map((user) => {
                    const isTop1 = user.rank === 1;
                    const isTop2 = user.rank === 2;
                    const isTop3 = user.rank === 3;

                    return (
                      <tr
                        key={user.rank}
                        className={`transition-colors ${
                          user.is_current_user
                            ? 'bg-brand-50/60 dark:bg-brand-950/40 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {isTop1 ? (
                              <Medal className="w-5 h-5 text-amber-500" />
                            ) : isTop2 ? (
                              <Medal className="w-5 h-5 text-slate-400" />
                            ) : isTop3 ? (
                              <Medal className="w-5 h-5 text-amber-700" />
                            ) : (
                              <span className="font-mono text-slate-500 px-1.5">#{user.rank}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {user.full_name} {user.is_current_user && '(You)'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{user.handle}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {user.target_role}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                            Lvl {user.level}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300 font-mono font-bold text-xs">
                            {user.verified_projects_count} Verified
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                            {user.badges_count} 🏅
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-black text-amber-500">
                          {user.total_xp} XP
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Academic Integrity Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
              <span>{leaderboard?.disclaimer}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Badges Showcase Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between text-center relative overflow-hidden ${
                b.is_unlocked
                  ? 'bg-gradient-to-b from-amber-500/10 via-white to-white dark:via-slate-900 dark:to-slate-900 border-amber-300 dark:border-amber-800/60 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                  {getBadgeIcon(b.icon_name, b.is_unlocked)}
                </div>

                <div className="flex items-center justify-center gap-1 mb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {b.name}
                  </h3>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold inline-block mb-2">
                  {b.category}
                </span>

                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {b.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                {b.is_unlocked ? (
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked (+{b.xp_reward} XP)</span>
                  </div>
                ) : (
                  <div className="text-slate-400 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span className="italic">{b.criteria_rule}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
