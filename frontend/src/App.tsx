import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './pages/AuthPage';
import { Loader2 } from 'lucide-react';

const RootApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-3 font-sans">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <span className="text-xs text-slate-400 font-medium tracking-wide">
          Bootstrapping CareerForge AI Engine...
        </span>
      </div>
    );
  }

  return isAuthenticated ? <AppShell /> : <AuthPage />;
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <RootApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
