import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LearningResource } from '../types';
import {
  BookOpen,
  Search,
  ExternalLink,
  Clock,
  Award,
  Video,
  FileCode,
  GraduationCap,
  Loader2,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const ResourceHubPage: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<string>('');
  const [freeOnly, setFreeOnly] = useState<boolean>(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await api.searchResources({
        skill: selectedSkill || undefined,
        resource_type: selectedType || undefined,
        language: selectedLang || undefined,
        free_only: freeOnly,
      });
      setResources(data);
    } catch (err) {
      console.error('Failed to query resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedSkill, selectedType, selectedLang, freeOnly]);

  const skillsList = ['python', 'react', 'fastapi', 'sql', 'postgresql', 'docker', 'pandas', 'git'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'documentation':
        return <FileCode className="w-4 h-4 text-brand-500" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
              Module 3.11 • Learning & Development
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Training Resource Hub
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Curated open-access tutorials, official documentation, and project guides. Includes bilingual Hindi and English resources.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{resources.length} Verified Educational Resources</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Skill Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Skill:</span>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
            >
              <option value="">All Skills</option>
              {skillsList.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
            >
              <option value="">All Formats</option>
              <option value="documentation">Official Docs</option>
              <option value="youtube">YouTube Video</option>
              <option value="course">Interactive Course</option>
              <option value="project_tutorial">Project Tutorial</option>
            </select>
          </div>

          {/* Language Selector (EN / HI) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Language:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
            </select>
          </div>

          {/* 100% Free Toggle */}
          <button
            onClick={() => setFreeOnly(!freeOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              freeOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            ✓ 100% Free Only
          </button>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Filtering learning materials...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No resources match your active filter combination.
          </p>
          <button
            onClick={() => {
              setSelectedSkill('');
              setSelectedType('');
              setSelectedLang('');
              setFreeOnly(false);
            }}
            className="mt-3 text-xs font-bold text-brand-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500 dark:hover:border-brand-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    {getTypeIcon(item.resource_type)}
                    <span className="capitalize">{item.resource_type.replace('_', ' ')}</span>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 border border-brand-200">
                    {item.language}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 mb-1.5">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {item.description || 'Verified educational curriculum resource.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.provider}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{item.estimated_hours}h
                  </span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
