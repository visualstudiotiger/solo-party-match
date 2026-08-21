import React, { useState } from 'react';
import { ParticipantDashboard } from './components/participant/ParticipantDashboard';
import { HostDashboard } from './components/host/HostDashboard';
import { HostLoginModal } from './components/host/HostLoginModal';
import { Smartphone, Crown, Sliders, X } from 'lucide-react';

const HOST_AUTH_KEY = 'soloparty_host_auth';
const DEV_TOOLBAR_KEY = 'soloparty_dev_toolbar_open';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'PARTICIPANT' | 'HOST'>('PARTICIPANT');
  const [isDevToolbarOpen, setIsDevToolbarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(DEV_TOOLBAR_KEY);
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [isHostAuthenticated, setIsHostAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(HOST_AUTH_KEY) === 'true';
    }
    return false;
  });

  const toggleDevToolbar = () => {
    setIsDevToolbarOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(DEV_TOOLBAR_KEY, String(next));
      }
      return next;
    });
  };

  const handleLoginSuccess = () => {
    setIsHostAuthenticated(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(HOST_AUTH_KEY, 'true');
    }
  };

  const handleLogout = () => {
    setIsHostAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(HOST_AUTH_KEY);
    }
    setViewMode('PARTICIPANT');
  };

  return (
    <div className="min-h-screen bg-[#0d0814] text-slate-100 flex flex-col relative">
      {/* Top View Mode Switcher Header for Pair Testing */}
      {isDevToolbarOpen && (
        <nav className="bg-[#170e24] border-b border-slate-800 px-4 py-2 flex items-center justify-between z-40 sticky top-0 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-400">
              SOLO PARTY MATCH
            </span>
            <span className="hidden sm:inline-block text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              🛠️ 시뮬레이터 툴바
            </span>
          </div>

          {/* View Switcher Toggle Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('PARTICIPANT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
                  viewMode === 'PARTICIPANT'
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone size={14} /> 📱 참가자 모바일 화면
              </button>

              <button
                onClick={() => setViewMode('HOST')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
                  viewMode === 'HOST'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crown size={14} /> 👑 사회자 대시보드
              </button>
            </div>

            <button
              onClick={toggleDevToolbar}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
              title="시뮬레이터 툴바 닫기"
            >
              <X size={16} />
            </button>
          </div>
        </nav>
      )}

      {/* Floating Button to Reopen Dev Toolbar if closed */}
      {!isDevToolbarOpen && (
        <button
          onClick={toggleDevToolbar}
          className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold text-xs rounded-xl shadow-2xl flex items-center gap-1.5 border border-amber-300 transition animate-bounce"
          title="개발 시뮬레이션 툴바 열기"
        >
          <Sliders size={14} /> 🛠️ 시뮬레이터 툴바 열기
        </button>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {viewMode === 'PARTICIPANT' ? (
          <ParticipantDashboard />
        ) : isHostAuthenticated ? (
          <HostDashboard
            onLogout={handleLogout}
            isDevToolbarOpen={isDevToolbarOpen}
            onToggleDevToolbar={toggleDevToolbar}
          />
        ) : (
          <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4">
            <HostLoginModal
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => setViewMode('PARTICIPANT')}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
