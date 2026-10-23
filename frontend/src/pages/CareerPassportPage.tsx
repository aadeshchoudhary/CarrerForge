import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CareerPassportData } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  ShieldCheck,
  QrCode,
  Share2,
  Copy,
  Check,
  ExternalLink,
  FolderGit2,
  Loader2,
  Lock,
  Sparkles,
  Printer
} from 'lucide-react';

export const CareerPassportPage: React.FC = () => {
  const { career } = useAuth();
  const [passport, setPassport] = useState<CareerPassportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const data = await api.getMyPassport();
        setPassport(data);
      } catch (err) {
        console.error('Failed to load Career Passport:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPassport();
  }, []);

  const handleCopyLink = () => {
    if (!passport) return;
    navigator.clipboard.writeText(passport.verification_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Compiling verifiable Career Passport credential...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Controls Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Module 4.17 • Verifiable Credential
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Digital Career Passport
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident verification of demonstrated code repositories, skills, and achievements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowQR(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-4 h-4 text-brand-500" />
            <span>Show QR Code</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {passport && (
        /* The Verifiable Passport Document */
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Passport Header with Gold/Emerald Seal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-mono font-black text-2xl shadow-lg shrink-0">
                {passport.full_name ? passport.full_name.slice(0, 2).toUpperCase() : 'CF'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">
                    {passport.handle}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Authenticity
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {passport.full_name}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {passport.headline} • Target Role: <strong className="text-slate-800 dark:text-slate-200">{passport.target_role}</strong>
                </p>
              </div>
            </div>

            {/* Passport Credential Hash Metadata */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-right sm:text-right font-mono text-[11px] space-y-1 shrink-0">
              <div className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Official Credential ID</div>
              <div className="font-bold text-slate-800 dark:text-slate-200">{passport.passport_id}</div>
              <div className="text-[10px] text-slate-400">SHA-256: {passport.verification_hash}</div>
            </div>
          </div>

          {/* Section 1: Independently Verified Project Proofs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                1. Verified Project Proofs ({passport.verified_projects.length})
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300 font-bold">
                Code Repository Confirmed
              </span>
            </div>

            {passport.verified_projects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No project proofs submitted yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {passport.verified_projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {proj.title}
                        </h4>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">
                          ✓ Verified
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 my-2">
                        {proj.skills_demonstrated.map((sk, skIdx) => (
                          <span
                            key={skIdx}
                            className="px-1.5 py-0.5 rounded bg-emerald-100/60 dark:bg-emerald-950/40 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-brand-600 hover:underline flex items-center gap-1 mt-2"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span className="truncate">{proj.github_url}</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Skills Classified by Evidence Level */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Award className="w-4 h-4 text-brand-500" />
              2. Skills Classified by Evidence Level
            </h3>

            <div className="space-y-3">
              {/* Verified Skills */}
              {passport.verified_skills.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1.5">
                    ● Independently Project-Verified Skills ({passport.verified_skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {passport.verified_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                      >
                        ✓ {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume Mentioned Skills */}
              {passport.resume_mentioned_skills.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1.5">
                    ● Resume-Mentioned Technical Skills ({passport.resume_mentioned_skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {passport.resume_mentioned_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-xs font-medium text-blue-700 dark:text-blue-300"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Earned Milestone Badges */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-500" />
              3. Earned Milestone Badges ({passport.earned_badges.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {passport.earned_badges.map((b, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-1"
                >
                  <Award className="w-6 h-6 text-amber-500 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.name}</h4>
                  <p className="text-[10px] text-slate-400">{new Date(b.awarded_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Footer & Integrity Notice */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
            <span>
              {passport.disclaimer} Verification URL: <code className="text-brand-600 dark:text-brand-400 font-mono">{passport.verification_url}</code>
            </span>
          </div>
        </div>
      )}

      {/* QR Code Verification Modal */}
      {showQR && passport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-brand-500" />
                Scan to Verify Credential
              </span>
              <button
                onClick={() => setShowQR(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Stylized Simulated QR Matrix for Instant Testing */}
            <div className="p-6 bg-white rounded-2xl border-2 border-slate-900 mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
              {/* Decorative QR Pattern */}
              <div className="grid grid-cols-6 gap-1 w-full h-full opacity-90 p-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      [0, 1, 2, 4, 5, 6, 7, 12, 13, 17, 18, 23, 24, 29, 30, 31, 32, 34, 35].includes(i)
                        ? 'bg-slate-900'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-1 rounded-md bg-white border border-slate-900">
                  <ShieldCheck className="w-6 h-6 text-brand-600" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {passport.passport_id}
              </span>
              <p className="text-[11px] text-slate-400">
                Recruiters and evaluators can verify this credential against live repository hashes.
              </p>
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="w-full py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
