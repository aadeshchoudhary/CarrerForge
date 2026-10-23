import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DashboardPage } from '../../pages/DashboardPage';
import { ResumeParserPage } from '../../pages/ResumeParserPage';
import { ResumeBuilderPage } from '../../pages/ResumeBuilderPage';
import { SkillGapPage } from '../../pages/SkillGapPage';
import { CareerFinderPage } from '../../pages/CareerFinderPage';
import { RoadmapPage } from '../../pages/RoadmapPage';
import { ResourceHubPage } from '../../pages/ResourceHubPage';
import { PreparationTrackerPage } from '../../pages/PreparationTrackerPage';
import { ProjectToProofPage } from '../../pages/ProjectToProofPage';
import { CareerPassportPage } from '../../pages/CareerPassportPage';
import { LeaderboardPage } from '../../pages/LeaderboardPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { CommunityFeedPage } from '../../pages/CommunityFeedPage';
import { CareerConnectPage } from '../../pages/CareerConnectPage';
import { OpportunityCenterPage } from '../../pages/OpportunityCenterPage';
import { InterviewGymPage } from '../../pages/InterviewGymPage';
import { Bot, Sparkles, X, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AppShell: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hi! I am your AI Career Twin. Ask me anything about your skill gaps, verified project proofs, or career passport credentials!',
    },
  ]);
  const { career } = useAuth();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let reply = `Based on your goal of becoming a ${career?.target_role || 'Software Engineer'}, your priority should be bridging any essential missing skills before applying. Have you checked your Skill Gap Report?`;
      const lower = userText.toLowerCase();
      if (lower.includes('proof') || lower.includes('project')) {
        reply = 'You can submit GitHub code repositories in the "Project-to-Proof" tab! Once verified, your targeted skills are automatically upgraded to [verified] status.';
      } else if (lower.includes('passport') || lower.includes('credential')) {
        reply = 'Check out the "Career Passport" tab! It compiles all your verified projects, skills, and badges with a unique SHA-256 hash and QR verification code.';
      } else if (lower.includes('badge') || lower.includes('leaderboard')) {
        reply = 'Visit the "Badges & Leaderboard" tab to track your rank against peers and unlock the 8 core milestone badges!';
      } else if (lower.includes('community') || lower.includes('feed') || lower.includes('post')) {
        reply = 'In the "Community Feed" tab, you can share technical milestones, get feedback on projects, and earn +25 XP and reputation for helpful answers!';
      } else if (lower.includes('connect') || lower.includes('mentor') || lower.includes('group') || lower.includes('peer')) {
        reply = 'Head to the "Career Connect" tab to discover peer mentors with verified skills, chat 1-on-1, or join active collaborative study circles!';
      } else if (lower.includes('interview') || lower.includes('gym') || lower.includes('practice')) {
        reply = 'Try the "AI Interview Gym" tab! You can practice technical, behavioral (STAR), and system design questions tailored to your target role with instant AI rubric scoring.';
      } else if (lower.includes('job') || lower.includes('application') || lower.includes('opportunity') || lower.includes('company')) {
        reply = 'Check the "Opportunities Center" tab to manage your Kanban hiring pipeline, browse company tech stacks, and check real-time market trends!';
      } else if (lower.includes('resume')) {
        reply = 'You can build an ATS-compliant Word DOCX resume in the "AI Resume Builder" tab, or parse an existing PDF in the "Resume Parser" tab!';
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'resume-parser':
        return <ResumeParserPage />;
      case 'resume-builder':
        return <ResumeBuilderPage />;
      case 'skill-gap':
        return <SkillGapPage />;
      case 'career-finder':
        return <CareerFinderPage onNavigateToRoadmap={() => setCurrentTab('roadmap')} />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'resources':
        return <ResourceHubPage />;
      case 'tracker':
        return <PreparationTrackerPage />;
      case 'project-proof':
        return <ProjectToProofPage />;
      case 'passport':
        return <CareerPassportPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'profile':
        return <ProfilePage />;
      case 'community-feed':
        return <CommunityFeedPage />;
      case 'career-connect':
        return <CareerConnectPage />;
      case 'opportunities':
        return (
          <OpportunityCenterPage
            onNavigateToGym={() => setCurrentTab('interview-gym')}
            onNavigateToResources={() => setCurrentTab('resources')}
          />
        );
      case 'interview-gym':
        return <InterviewGymPage />;
      case 'dashboard':
      default:
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Sticky Header */}
        <TopBar onOpenProfile={() => setCurrentTab('profile')} />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating AI Career Twin Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs md:text-sm shadow-xl shadow-brand-500/25 active:scale-95 transition-all"
          >
            <Bot className="w-5 h-5 text-white animate-pulse" />
            <span className="hidden sm:inline">AI Career Twin</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[450px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <div>
                  <h4 className="text-xs font-bold">AI Career Twin</h4>
                  <span className="text-[10px] text-brand-200">Personalized Guidance</span>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message History */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-600 flex items-center justify-center shrink-0 text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-2.5 rounded-xl ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask your career twin..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
