import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Building2,
  TrendingUp,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  X,
  Target
} from 'lucide-react';
import { api } from '../services/api';
import {
  JobApplicationItem,
  ApplicationStage,
  ApplicationStats,
  CompanyItem,
  TechTrendItem
} from '../types';

interface Props {
  onNavigateToGym?: () => void;
  onNavigateToResources?: () => void;
}

export const OpportunityCenterPage: React.FC<Props> = ({ onNavigateToGym, onNavigateToResources }) => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'companies' | 'trends'>('kanban');

  // Kanban Application State
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loadingApps, setLoadingApps] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State
  const [newCompany, setNewCompany] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newStage, setNewStage] = useState<ApplicationStage>('applied');
  const [newLocation, setNewLocation] = useState<string>('Remote / Hybrid');
  const [newSalary, setNewSalary] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [submittingApp, setSubmittingApp] = useState<boolean>(false);

  // Company Explorer State
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [companySearch, setCompanySearch] = useState<string>('');
  const [companyTechFilter, setCompanyTechFilter] = useState<string>('All');
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [expandedCompanyTips, setExpandedCompanyTips] = useState<Record<string, boolean>>({});

  // Tech Trends State
  const [trends, setTrends] = useState<TechTrendItem[]>([]);
  const [trendCategory, setTrendCategory] = useState<string>('All');
  const [loadingTrends, setLoadingTrends] = useState<boolean>(false);

  const stages: { key: ApplicationStage; label: string; color: string; border: string }[] = [
    { key: 'saved', label: '📌 Saved / Wishlist', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200', border: 'border-slate-300 dark:border-slate-700' },
    { key: 'applied', label: '📝 Applied', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800' },
    { key: 'screening', label: '🔍 Screening / Assessment', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800' },
    { key: 'interview', label: '🎙️ Technical Interview', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800' },
    { key: 'offer', label: '🎉 Offer Extended', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' },
    { key: 'rejected', label: '📦 Archived', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800' },
  ];

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const [appsData, statsData] = await Promise.all([
        api.getApplications(),
        api.getApplicationStats(),
      ]);
      setApplications(appsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const data = await api.getCompanies({
        search: companySearch.trim() || undefined,
        tech: companyTechFilter !== 'All' ? companyTechFilter : undefined,
      });
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchTrends = async () => {
    try {
      setLoadingTrends(true);
      const data = await api.getTechTrends({
        category: trendCategory !== 'All' ? trendCategory : undefined,
      });
      setTrends(data);
    } catch (err) {
      console.error('Error fetching trends:', err);
    } finally {
      setLoadingTrends(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (activeTab === 'companies') {
      fetchCompanies();
    }
  }, [activeTab, companySearch, companyTechFilter]);

  useEffect(() => {
    if (activeTab === 'trends') {
      fetchTrends();
    }
  }, [activeTab, trendCategory]);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newTitle.trim()) return;

    try {
      setSubmittingApp(true);
      const created = await api.createApplication({
        company_name: newCompany.trim(),
        job_title: newTitle.trim(),
        stage: newStage,
        location: newLocation.trim() || 'Remote / Hybrid',
        salary_range: newSalary.trim() || undefined,
        job_url: newUrl.trim() || undefined,
        notes: newNotes.trim() || undefined,
      });

      setApplications([created, ...applications]);
      setNewCompany('');
      setNewTitle('');
      setNewSalary('');
      setNewUrl('');
      setNewNotes('');
      setShowAddModal(false);

      // Refresh pipeline stats
      const updatedStats = await api.getApplicationStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Error adding application:', err);
      alert('Failed to log application.');
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleAdvanceStage = async (appId: string, nextStage: ApplicationStage) => {
    try {
      // Optimistic update
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: nextStage } : a))
      );
      await api.updateApplication(appId, { stage: nextStage });
      const updatedStats = await api.getApplicationStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Error updating stage:', err);
      fetchApplications();
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!window.confirm('Remove this application from tracking?')) return;
    try {
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      await api.deleteApplication(appId);
      const updatedStats = await api.getApplicationStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Error deleting application:', err);
      fetchApplications();
    }
  };

  const handleTrackCompanyFromExplorer = (company: CompanyItem) => {
    setNewCompany(company.name);
    setNewTitle('Software Engineer');
    setNewLocation(company.location);
    setNewUrl(company.website || '');
    setShowAddModal(true);
    setActiveTab('kanban');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-400/30">
                Phase 5: Opportunity Intelligence
              </span>
              <span className="bg-emerald-500/30 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Closed Feedback Loop
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Opportunity Command Center
            </h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Track your hiring pipeline, discover company engineering cultures, and track high-growth technology market demand.
            </p>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'kanban'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Kanban Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'companies'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Company Explorer</span>
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'trends'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Tech Trends</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'kanban' ? (
        <div className="space-y-6">
          {/* Top Pipeline Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Active Applications</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats?.total_applications ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">In Screening</span>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {stats?.screening_count ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
              <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Technical Interviews</span>
              <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {stats?.interview_count ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Offers Extended</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats?.offer_count ?? 0}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col justify-center items-center text-center">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-3 rounded-lg shadow transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Log Application</span>
              </button>
            </div>
          </div>

          {/* Kanban Board Columns */}
          {loadingApps ? (
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading your opportunity pipeline...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start">
              {stages.map((st) => {
                const stageApps = applications.filter((a) => a.stage === st.key);
                return (
                  <div
                    key={st.key}
                    className="bg-slate-100/70 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700 flex flex-col min-h-[450px]"
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {stageApps.length}
                      </span>
                    </div>

                    {/* Cards in this stage */}
                    <div className="space-y-2.5 flex-1 overflow-y-auto">
                      {stageApps.length === 0 ? (
                        <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700/60 rounded-xl text-center p-2">
                          <span className="text-[11px] text-slate-400 italic">No applications</span>
                        </div>
                      ) : (
                        stageApps.map((app) => (
                          <div
                            key={app.id}
                            className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all group"
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                                {app.company_name}
                              </h4>
                              <button
                                onClick={() => handleDeleteApplication(app.id)}
                                className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-1.5 line-clamp-1">
                              {app.job_title}
                            </p>

                            {/* Tags: Salary / Location */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              {app.salary_range && (
                                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                                  {app.salary_range}
                                </span>
                              )}
                              {app.location && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                                  {app.location}
                                </span>
                              )}
                            </div>

                            {app.notes && (
                              <p className="text-[10px] text-slate-400 italic mb-2 line-clamp-2">
                                "{app.notes}"
                              </p>
                            )}

                            {/* Stage Advancement Quick Selector */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">Move:</span>
                              <select
                                value={app.stage}
                                onChange={(e) => handleAdvanceStage(app.id, e.target.value as ApplicationStage)}
                                className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-200"
                              >
                                <option value="saved">Saved</option>
                                <option value="applied">Applied</option>
                                <option value="screening">Screening</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer</option>
                                <option value="rejected">Archived</option>
                              </select>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'companies' ? (
        /* Company Explorer Tab */
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies by name or industry (e.g. AI, SaaS, Fintech)..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Stack:</span>
              {['All', 'FastAPI', 'React', 'Python', 'Docker', 'PyTorch', 'SQL'].map((t) => (
                <button
                  key={t}
                  onClick={() => setCompanyTechFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    companyTechFilter === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {loadingCompanies ? (
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading company benchmark profiles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {comp.name}
                        </h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          {comp.industry} • {comp.location}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 whitespace-nowrap">
                        {comp.hiring_status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      {comp.description}
                    </p>

                    {/* Tech Stack Pills */}
                    <div className="mb-3">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">Tech Stack:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {comp.tech_stack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Interview Insights Accordion */}
                    {comp.typical_interview_rounds && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Hiring Process:</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2 text-[11px]">
                          {comp.typical_interview_rounds}
                        </p>
                        {comp.interview_tips && (
                          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                            💡 Tip: {comp.interview_tips}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                    <button
                      onClick={() => handleTrackCompanyFromExplorer(comp)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Track Application</span>
                    </button>
                    {onNavigateToGym && (
                      <button
                        onClick={onNavigateToGym}
                        className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-100 text-xs font-semibold py-2 px-3 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <span>Simulate Interview</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Technology Trends Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Real-Time Tech Demand & Benchmark Market Intelligence
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Curated demand growth, market adoption, and average salary bands across high-growth engineering domains.
              </p>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['All', 'Language', 'Framework', 'Cloud/DevOps', 'AI/ML', 'Database'].map((c) => (
                <button
                  key={c}
                  onClick={() => setTrendCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    trendCategory === c
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loadingTrends ? (
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-slate-500">Aggregating market trends...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trends.map((tr) => (
                <div
                  key={tr.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {tr.name}
                      </h3>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {tr.demand_growth}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 font-medium">
                      {tr.category} • {tr.market_adoption}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {tr.description}
                    </p>

                    <div className="space-y-1.5 mb-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Benchmark Salary:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{tr.avg_salary_inr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Active Campus Openings:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{tr.open_roles_count}+ roles</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">Frequently Paired Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {tr.top_pairing_skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {onNavigateToResources && (
                    <button
                      onClick={onNavigateToResources}
                      className="mt-4 w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Explore Learning Resources</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateApplication}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Track New Job Application (+15 XP)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. TechNova Solutions"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Junior Full Stack Developer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stage</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as ApplicationStage)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="saved">Saved / Wishlist</option>
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary / Stipend</label>
                <input
                  type="text"
                  placeholder="e.g. ₹8 LPA or ₹30k/mo"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job / Portal URL</label>
              <input
                type="url"
                placeholder="https://careers.company.com/job/123"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Next Steps</label>
              <textarea
                rows={2}
                placeholder="Mention referral contact, key interview date, or required assignment..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingApp}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition-colors disabled:opacity-50"
              >
                {submittingApp ? 'Saving...' : 'Save Application'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
