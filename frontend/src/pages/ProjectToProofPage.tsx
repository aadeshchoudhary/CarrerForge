import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProjectCatalogItem, ProjectSubmission } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  ShieldCheck,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  Award,
  Loader2,
  FileCode,
  FolderGit2,
  Sparkles
} from 'lucide-react';

export const ProjectToProofPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [catalog, setCatalog] = useState<ProjectCatalogItem[]>([]);
  const [mySubmissions, setMySubmissions] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'submissions'>('catalog');

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<ProjectCatalogItem | null>(null);
  const [projTitle, setProjTitle] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [demoUrl, setDemoUrl] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [skillsText, setSkillsText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [catData, subData] = await Promise.all([
        api.getProjectCatalog(),
        api.getMySubmissions(),
      ]);
      setCatalog(catData);
      setMySubmissions(subData);
    } catch (err) {
      console.error('Failed to load project-to-proof data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenSubmit = (item?: ProjectCatalogItem) => {
    setErrorMsg(null);
    if (item) {
      setSelectedCatalogItem(item);
      setProjTitle(item.title);
      setDescription(item.objective);
      setSkillsText(item.skills_targeted.join(', '));
    } else {
      setSelectedCatalogItem(null);
      setProjTitle('');
      setDescription('');
      setSkillsText('');
    }
    setGithubUrl('');
    setDemoUrl('');
    setShowModal(true);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim() || !projTitle.trim() || !description.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const parsedSkills = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const submission = await api.submitProjectProof({
        project_catalog_id: selectedCatalogItem?.id,
        title: projTitle.trim(),
        github_url: githubUrl.trim(),
        live_demo_url: demoUrl.trim() || undefined,
        description: description.trim(),
        skills_demonstrated: parsedSkills,
      });

      setMySubmissions([submission, ...mySubmissions]);
      setShowModal(false);
      setSuccessMsg(`Project verified! Targeted skills promoted to [verified] status (+100 XP).`);
      setActiveTab('submissions');
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to submit project repository proof.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading project-to-proof catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Module 3.14 • Proof of Work
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Project-to-Proof Verification System
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Watching tutorials is not proof. Submit verifiable GitHub repositories to promote your skills to <strong>[verified]</strong> status.
          </p>
        </div>

        <button
          onClick={() => handleOpenSubmit()}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs md:text-sm shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Custom Project Proof</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'catalog'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Recommended Benchmark Projects ({catalog.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>My Verified Proofs</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
            {mySubmissions.length}
          </span>
        </button>
      </div>

      {activeTab === 'catalog' ? (
        /* Benchmark Catalog Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {catalog.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-brand-500 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-200">
                    {item.role_category}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{item.estimated_hours}h build time</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {item.objective}
                </p>

                {/* Requirements Checklist */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 mb-4">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Technical Deliverables:
                  </span>
                  {item.requirements_checklist.map((req, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>

                {/* Targeted Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {item.skills_targeted.map((sk, skIdx) => (
                    <span
                      key={skIdx}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-500">+100 XP Reward</span>
                <button
                  onClick={() => handleOpenSubmit(item)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>Submit GitHub Proof</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* My Verified Submissions Gallery */
        <div className="space-y-4">
          {mySubmissions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <FolderGit2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No verified project proofs yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Submit a GitHub repository from our benchmark catalog or your own custom capstone to unlock verified credentials.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Browse Projects
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mySubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Project Verified
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {sub.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      {sub.description}
                    </p>

                    {/* Verified Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {sub.skills_demonstrated.map((sk, skIdx) => (
                        <span
                          key={skIdx}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"
                        >
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <a
                      href={sub.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
                    >
                      <FolderGit2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <span className="truncate max-w-[220px]">{sub.github_url}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>

                    {sub.live_demo_url && (
                      <a
                        href={sub.live_demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-brand-500" />
                Submit Code Repository Proof
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Full-Stack SaaS E-Commerce API"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Live Demo / Deployment URL (Optional)</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://myproject.onrender.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Skills Demonstrated (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="Python, FastAPI, React, PostgreSQL, Docker"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Architecture & Technical Overview</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your design choices, database schema, and test methodology..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{submitting ? 'Verifying...' : 'Submit & Verify Skills'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
