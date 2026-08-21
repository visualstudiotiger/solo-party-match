import React, { useState } from 'react';
import { Crown, Lock, User, KeyRound, ArrowLeft, ShieldAlert, LogIn } from 'lucide-react';

interface HostLoginModalProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const HostLoginModal: React.FC<HostLoginModalProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (trimmedUser === 'soloparty' && trimmedPass === '1357') {
      onLoginSuccess();
    } else {
      setErrorMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown size={30} className="stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">사회자 대시보드 로그인</h2>
          <p className="text-xs text-slate-400">
            파티 관리 및 진행을 위해 사회자 인증 계정을 입력해 주세요.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-2.5 animate-shake">
            <ShieldAlert size={18} className="text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User size={14} className="text-amber-400" /> 사회자 아이디
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디 입력 (soloparty)"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound size={14} className="text-amber-400" /> 비밀번호
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력 (1357)"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> 사회자 대시보드 입장
          </button>
        </form>

        {/* Footer / Cancel Button */}
        <div className="pt-2 border-t border-slate-800 text-center relative z-10">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft size={14} /> 참가자 모바일 화면으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
