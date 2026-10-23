import React from 'react';
import { CareerQuestItem } from '../../types';
import { CheckCircle2, Circle, Flame, Award, ShieldAlert } from 'lucide-react';

interface Props {
  quests?: CareerQuestItem[];
  xp?: number;
  level?: number;
}

export const QuestsWidget: React.FC<Props> = ({ quests = [], xp = 200, level = 1 }) => {
  const nextLevelXp = level * 300;
  const progressPercent = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Active Career Quests
              </h3>
              <p className="text-xs text-slate-500">Daily micro-milestones for continuous progress</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            {xp} / {nextLevelXp} XP
          </span>
        </div>

        {/* Level XP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span>Level {level} Explorer</span>
            <span>Level {level + 1} ({nextLevelXp - xp} XP remaining)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-brand-500 rounded-full transition-all duration-700"
            />
          </div>
        </div>

        {/* Quest Items List */}
        <div className="space-y-2.5">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                quest.is_completed
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-brand-500'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {quest.is_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold ${quest.is_completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                    {quest.title}
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10">
                    +{quest.xp_reward} XP
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {quest.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Disclaimers Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>XP reflects learning consistency; verified code evidence remains distinct.</span>
      </div>
    </div>
  );
};
