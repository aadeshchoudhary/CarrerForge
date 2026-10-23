import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const translations: Translations = {
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  resumeParser: { en: 'Resume Parser', hi: 'बायोडाटा विश्लेषक' },
  resumeBuilder: { en: 'AI Resume Builder', hi: 'बायोडाटा निर्माता' },
  skillGap: { en: 'Skill-Gap Analyzer', hi: 'स्किल गैप एनालिसिस' },
  careerFinder: { en: 'Career Role Finder', hi: 'कैरियर भूमिका खोजक' },
  roadmap: { en: 'Career Roadmaps', hi: 'कैरियर रोडमैप' },
  resourceHub: { en: 'Resource Hub', hi: 'प्रशिक्षण संसाधन' },
  tracker: { en: 'Preparation Tracker', hi: 'तैयारी ट्रैकर' },
  projectProof: { en: 'Project-to-Proof', hi: 'प्रोजेक्ट प्रूफ' },
  passport: { en: 'Career Passport', hi: 'कैरियर पासपोर्ट' },
  leaderboard: { en: 'Badges & Leaderboard', hi: 'लीडरबोर्ड और बैज' },
  careerID: { en: 'Career ID Profile', hi: 'कैरियर आईडी प्रोफाइल' },
  readinessScore: { en: 'Career Readiness Score', hi: 'कैरियर तैयारी स्कोर' },
  uploadResume: { en: 'Upload Resume', hi: 'रिज्यूमे अपलोड करें' },
  analyzeJob: { en: 'Analyze Job Match', hi: 'नौकरी मैच जांचें' },
  nextBestAction: { en: 'Next Best Action', hi: 'अगला सर्वश्रेष्ठ कदम' },
  quests: { en: 'Career Quests & XP', hi: 'कैरियर क्वेस्ट और एक्सपी' },
  settings: { en: 'Settings & Privacy', hi: 'सेटिंग्स और गोपनीयता' },
};

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'en';
  });

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('lang', next);
      return next;
    });
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
