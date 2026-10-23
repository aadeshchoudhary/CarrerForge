import React from 'react';
import { Sparkles, ArrowRight, BookOpen, Target, FileUp } from 'lucide-react';

interface Props {
  action?: {
    title: string;
    subtitle: string;
    cta_label: string;
    cta_link: string;
    type: string;
  };
  onActionClick: (link: string) => void;
}

export const NextBestActionCard: React.FC<Props> = ({ action, onActionClick }) => {
  const title = action?.title || 'Upload your resume to discover your skill baseline';
  const subtitle = action?.subtitle || 'Our AI parser will extract your demonstrated skills and identify requirements.';
  const cta = action?.cta_label || 'Upload Resume Now';
  const link = action?.cta_link || 'resume-parser';
  const type = action?.type || 'resume';

  const getIcon = () => {
    switch (type) {
      case 'gap':
        return <Target className="w-6 h-6 text-indigo-400" />;
      case 'learn':
        return <BookOpen className="w-6 h-6 text-amber-400" />;
      default:
        return <FileUp className="w-6 h-6 text-brand-400" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-6 text-white shadow-md border border-brand-800/50">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-20 -mb-6 w-32 h-32 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shrink-0">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-500/30 text-brand-200 border border-brand-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-300" />
                AI Career Twin Suggestion
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white mb-1">
              {title}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => onActionClick(link.replace('/', ''))}
          className="self-start md:self-center px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs md:text-sm shadow-lg hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <span>{cta}</span>
          <ArrowRight className="w-4 h-4 text-brand-600" />
        </button>
      </div>
    </div>
  );
};
