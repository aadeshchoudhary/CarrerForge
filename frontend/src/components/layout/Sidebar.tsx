import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Target,
  Sparkles,
  Compass,
  Award,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wand2,
  BookOpen,
  CalendarCheck,
  Code2,
  QrCode,
  Trophy,
  Bot
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  ready: boolean;
  tag?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();

  const menuSections: MenuSection[] = [
    {
      title: 'Resume & Analysis',
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, ready: true },
        { id: 'resume-parser', label: t('resumeParser'), icon: FileText, ready: true },
        { id: 'resume-builder', label: t('resumeBuilder'), icon: Wand2, ready: true },
        { id: 'skill-gap', label: t('skillGap'), icon: Target, ready: true },
      ],
    },
    {
      title: 'Career & Learning',
      items: [
        { id: 'career-finder', label: t('careerFinder'), icon: Compass, ready: true },
        { id: 'roadmap', label: t('roadmap'), icon: Compass, ready: true },
        { id: 'resources', label: t('resourceHub'), icon: BookOpen, ready: true },
        { id: 'tracker', label: t('tracker'), icon: CalendarCheck, ready: true },
      ],
    },
    {
      title: 'Proof & Credentials',
      items: [
        { id: 'project-proof', label: t('projectProof'), icon: Code2, ready: true },
        { id: 'passport', label: t('passport'), icon: ShieldCheck, ready: true },
        { id: 'leaderboard', label: t('leaderboard'), icon: Trophy, ready: true },
        { id: 'profile', label: t('careerID'), icon: Award, ready: true },
      ],
    },
    {
      title: 'Community & Mentorship',
      items: [
        { id: 'community-feed', label: 'Community Feed', icon: Users, ready: true },
        { id: 'career-connect', label: 'Career Connect', icon: Sparkles, ready: true },
      ],
    },
    {
      title: 'Opportunities & Practice',
      items: [
        { id: 'opportunities', label: 'Opportunities Center', icon: Briefcase, ready: true },
        { id: 'interview-gym', label: 'AI Interview Gym', icon: Bot, ready: true },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">
                CareerForge AI
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Phase 1, 2 & 3 Active</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            {!collapsed && (
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.ready) setCurrentTab(item.id);
                  }}
                  disabled={!item.ready}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                      : item.ready
                      ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                      : 'text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} />
                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!collapsed && item.tag && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                      {item.tag}
                    </span>
                  )}
                  {!collapsed && item.ready && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-600 dark:text-slate-400">Phase 1, 2 & 3: Operational</span>
          </div>
        </div>
      )}
    </aside>
  );
};
