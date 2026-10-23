import React from 'react';
import { FileUp, Target, UserCheck, Code2, Users, ShieldCheck } from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

export const QuickActions: React.FC<Props> = ({ onNavigate }) => {
  const actions = [
    {
      id: 'resume-parser',
      label: 'Upload / Parse Resume',
      desc: 'PDF or DOCX document',
      icon: FileUp,
      color: 'bg-brand-500 text-white',
    },
    {
      id: 'project-proof',
      label: 'Submit Project Proof',
      desc: 'Verify skills with GitHub',
      icon: Code2,
      color: 'bg-emerald-600 text-white',
    },
    {
      id: 'community-feed',
      label: 'Community & Peer Feed',
      desc: 'Discussions & tips',
      icon: Users,
      color: 'bg-indigo-600 text-white',
    },
    {
      id: 'passport',
      label: 'Career Passport',
      desc: 'Official SHA-256 credential',
      icon: ShieldCheck,
      color: 'bg-purple-600 text-white',
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
        Quick Actions
      </h3>
      <p className="text-xs text-slate-500 mb-4">Direct shortcuts to high-impact activities</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onNavigate(act.id)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-all hover:-translate-y-0.5 group"
            >
              <div className={`w-8 h-8 rounded-lg ${act.color} flex items-center justify-center mb-2.5 shadow-md`}>
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors line-clamp-1">
                {act.label}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {act.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
