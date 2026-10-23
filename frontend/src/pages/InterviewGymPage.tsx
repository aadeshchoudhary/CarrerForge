import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  Clock,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { InterviewQuestionItem, InterviewEvaluationResult } from '../types';

export const InterviewGymPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('Full Stack Developer');
  const [selectedType, setSelectedType] = useState<string>('technical');

  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showHints, setShowHints] = useState<boolean>(false);

  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<InterviewEvaluationResult | null>(null);

  const roles = [
    'Full Stack Developer',
    'Data Analyst',
    'Machine Learning Engineer',
    'Cloud & DevOps Associate',
  ];

  const interviewTypes = [
    { key: 'technical', label: '💻 Technical Deep-Dive' },
    { key: 'behavioral', label: '⭐ Behavioral (STAR)' },
    { key: 'system_design', label: '🏗️ System Design' },
  ];

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      setEvaluationResult(null);
      setUserAnswer('');
      setCurrentQuestionIndex(0);

      const data = await api.getInterviewQuestions({
        role: selectedRole,
        type: selectedType,
      });
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load interview questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedRole, selectedType]);

  const currentQuestion = questions[currentQuestionIndex] || null;

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !userAnswer.trim()) return;

    try {
      setEvaluating(true);
      const result = await api.evaluateInterview({
        role_title: selectedRole,
        interview_type: selectedType,
        question_text: currentQuestion.question_text,
        user_answer: userAnswer.trim(),
      });
      setEvaluationResult(result);
    } catch (err) {
      console.error('Error evaluating answer:', err);
      alert('Failed to evaluate response. Please ensure response is at least 10 characters.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (questions.length === 0) return;
    const nextIdx = (currentQuestionIndex + 1) % questions.length;
    setCurrentQuestionIndex(nextIdx);
    setUserAnswer('');
    setEvaluationResult(null);
    setShowHints(false);
  };

  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-400/30">
                Phase 5: AI Interview Gym
              </span>
              <span className="bg-amber-500/30 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-400/30">
                <Flame className="w-3.5 h-3.5" /> Earns +20 XP per session
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Interactive AI Interview Gym
            </h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Practice real placement interview questions with transparent rubric scoring, constructive feedback on edge cases, and expert model answers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 font-mono text-indigo-200">
              Rubric: Depth + STAR + Edge Cases
            </span>
          </div>
        </div>
      </div>

      {/* Role & Mode Selectors */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
        {/* Role Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Role:
          </span>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedRole === r
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/30'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Round:
          </span>
          {interviewTypes.map((it) => (
            <button
              key={it.key}
              onClick={() => setSelectedType(it.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedType === it.key
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Question & Simulation Studio */}
      {loadingQuestions ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-500">Retrieving targeted interview drills...</p>
        </div>
      ) : !currentQuestion ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">No questions available for this combination. Please select another mode.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Question Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {currentQuestion.interview_type.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleNextQuestion}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Skip / Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-3">
              {currentQuestion.question_text}
            </h2>

            {/* Collapsible Hints */}
            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHints ? 'Hide Architectural Hints' : 'Show Architectural Hints'}</span>
                </button>
                {showHints && (
                  <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300 bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900">
                    {currentQuestion.hints.map((h, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* User Response Form */}
          <form
            onSubmit={handleEvaluate}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>Your Spoken or Written Response:</span>
              </label>
              <div className="text-xs text-slate-400 font-mono">
                {wordCount} words {wordCount >= 60 ? '✓ Thorough' : '(aim for 60+ words)'}
              </div>
            </div>

            <textarea
              rows={6}
              placeholder="State your solution step-by-step. For technical questions, mention trade-offs and edge cases. For behavioral questions, format using Situation, Task, Action, and Result (STAR)..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              required
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setUserAnswer((prev) =>
                      prev ? `${prev}\n\nEdge Cases Considered: Under high traffic or failure scenarios...` : 'Edge Cases Considered: '
                    )
                  }
                  className="text-[11px] bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                >
                  + Add Edge Cases
                </button>
                {selectedType === 'behavioral' && (
                  <button
                    type="button"
                    onClick={() =>
                      setUserAnswer(
                        'Situation: \nTask: \nAction: \nResult: '
                      )
                    }
                    className="text-[11px] bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                  >
                    + Insert STAR Template
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={evaluating || !userAnswer.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{evaluating ? 'Evaluating Rubrics...' : 'Submit Response (+20 XP)'}</span>
              </button>
            </div>
          </form>

          {/* AI Evaluation Results Panel */}
          {evaluationResult && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-indigo-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-lg shadow-sm border ${
                      evaluationResult.ai_score >= 8.0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : evaluationResult.ai_score >= 6.5
                        ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>{evaluationResult.ai_score}</span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">/ 10</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      AI Interview Evaluation
                    </h3>
                    <p className="text-xs text-slate-500">
                      Based on domain terminology, structural clarity, and edge-case handling
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Practice Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Strengths & Improvements Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-2">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Demonstrated Strengths</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {evaluationResult.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2">
                  <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Areas to Elevate</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {evaluationResult.areas_for_improvement.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">!</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Model Answer */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Curated Benchmark Answer</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                  {evaluationResult.suggested_answer}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
