import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DashboardPage } from './pages/DashboardPage';
import { PracticePage } from './pages/PracticePage';
import { LiveCoachPage } from './pages/LiveCoachPage';
import { SessionReportPage } from './pages/SessionReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProgressPage } from './pages/ProgressPage';
import { ComparePage } from './pages/ComparePage';
import { PracticePlanPage } from './pages/PracticePlanPage';
import { AICoachChatPage } from './pages/AICoachChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { SpeakingMode, User } from './types';
import { api, removeToken } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Live session config state
  const [liveConfig, setLiveConfig] = useState<{
    mode: SpeakingMode;
    targetDuration: number;
    topic: string;
    webcamEnabled: boolean;
    customFillers: string[];
    isDemoMode: boolean;
  } | null>(null);

  useEffect(() => {
    api.getMe()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);

  const handleStartDemo = () => {
    setLiveConfig({
      mode: 'presentation',
      targetDuration: 180,
      topic: 'Machine Learning in Healthcare Keynote',
      webcamEnabled: true,
      customFillers: ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'so'],
      isDemoMode: true,
    });
    setActiveTab('live-coach');
  };

  const handleStartSession = (config: any) => {
    setLiveConfig(config);
    setActiveTab('live-coach');
  };

  const handleCompleteSession = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setActiveTab('report');
  };

  const handleSelectSession = (id: number) => {
    setSelectedSessionId(id);
    setActiveTab('report');
  };

  const handleLogout = () => {
    removeToken();
    api.getMe()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartDemo={handleStartDemo}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
        }}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            setActiveTab={setActiveTab}
            onSelectSession={handleSelectSession}
            onStartDemo={handleStartDemo}
          />
        )}

        {activeTab === 'practice' && (
          <PracticePage onStartSession={handleStartSession} />
        )}

        {activeTab === 'live-coach' && liveConfig && (
          <LiveCoachPage
            config={liveConfig}
            onCompleteSession={handleCompleteSession}
          />
        )}

        {activeTab === 'report' && selectedSessionId && (
          <SessionReportPage
            sessionId={selectedSessionId}
            onBack={() => setActiveTab('history')}
            onGoToPlan={() => setActiveTab('plan')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage onSelectSession={handleSelectSession} />
        )}

        {activeTab === 'progress' && <ProgressPage />}

        {activeTab === 'compare' && <ComparePage />}

        {activeTab === 'plan' && <PracticePlanPage />}

        {activeTab === 'chat' && <AICoachChatPage />}

        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-dark-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            SPEAKER<span className="text-brand-500 font-bold">.AI</span> — Real-Time AI Public Speaking Coach
          </div>
          <div className="flex gap-4 text-slate-400">
            <span>JWT Auth & Guest Modes</span>
            <span>•</span>
            <span>Deterministic Score Derivation</span>
            <span>•</span>
            <span>Voice Privacy Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
