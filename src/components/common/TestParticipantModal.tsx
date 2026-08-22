import React, { useState } from 'react';
import { usePartyStore } from '../../store/partyStore';
import { UserPlus, Sparkles, X, Plus, User, Phone, Table, Heart, Check } from 'lucide-react';

interface TestParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestParticipantModal: React.FC<TestParticipantModalProps> = ({ isOpen, onClose }) => {
  const { tablesCount, seatsPerTable, addQuickTestParticipant, registerNewParticipant, autoGenerateVotes } = usePartyStore();

  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [tableNo, setTableNo] = useState<number>(1);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleQuickAdd = (g: 'M' | 'F') => {
    const p = addQuickTestParticipant(g);
    showToast(`✨ ${p.nickname} (테이블 ${p.tableNo}) 생성 완료!`);
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert('닉네임을 입력해 주세요.');
      return;
    }

    const p = registerNewParticipant({
      nickname: nickname.trim(),
      gender,
      tableNo: Number(tableNo) || 1,
      bio: bio.trim() || '대화 나누고 싶어요 🥂',
      phone: phone.trim() || '010-1234-5678',
    });

    setNickname('');
    setBio('');
    setPhone('');
    showToast(`🎉 ${p.nickname} 참가자가 생성되었습니다!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-500 text-white flex items-center justify-center shadow-lg">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                🛠️ 테스트 참가자 추가 툴
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  테스터 전용
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                가변 인원 및 테이블 로테이션 테스트를 위해 인원을 자유롭게 생성해 보세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Check size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Quick Add Buttons */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles size={14} /> ⚡ 1초 쾌속 생성 (자동 할당)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickAdd('M')}
              className="py-2.5 px-3 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-200 text-xs font-extrabold flex items-center justify-center gap-2 transition shadow"
            >
              <Plus size={16} /> ♂️ 남성 1명 퀵 추가
            </button>

            <button
              onClick={() => handleQuickAdd('F')}
              className="py-2.5 px-3 rounded-xl bg-pink-950/80 hover:bg-pink-900 border border-pink-500/40 text-pink-200 text-xs font-extrabold flex items-center justify-center gap-2 transition shadow"
            >
              <Plus size={16} /> ♀️ 여성 1명 퀵 추가
            </button>
          </div>
        </div>

        {/* Auto Vote / Selection Generator Section */}
        <div className="bg-purple-950/40 p-4 rounded-2xl border border-purple-500/30 space-y-3">
          <h3 className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Heart size={14} className="text-pink-400 fill-pink-400" /> 🎲 투표 & 매칭 자동 선택 생성
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                autoGenerateVotes(1);
                showToast('🎲 1차 첫인상 투표가 자동 선택되었습니다!');
              }}
              className="py-2.5 px-3 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-200 text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow"
            >
              <Sparkles size={14} className="text-amber-400" /> 1차 첫인상 자동투표
            </button>

            <button
              onClick={() => {
                autoGenerateVotes(2);
                showToast('🔥 2차 최종선택 투표가 자동 선택되었습니다!');
              }}
              className="py-2.5 px-3 rounded-xl bg-pink-950/80 hover:bg-pink-900 border border-pink-500/50 text-pink-200 text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow"
            >
              <Heart size={14} className="text-pink-400 fill-pink-400" /> 2차 최종선택 자동투표
            </button>
          </div>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSubmitCustom} className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <User size={14} className="text-amber-400" /> 📝 직접 상세 입력
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Nickname */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 루키, 카일"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            {/* Gender Switch */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">성별</label>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setGender('M')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                    gender === 'M' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => setGender('F')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                    gender === 'F' ? 'bg-pink-600 text-white' : 'text-slate-400'
                  }`}
                >
                  여성
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Table Selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">배정 테이블</label>
              <select
                value={tableNo}
                onChange={(e) => setTableNo(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                {Array.from({ length: tablesCount || 4 }, (_, i) => i + 1).map((t) => (
                  <option key={t} value={t}>
                    테이블 {t} 번
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">전화번호</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">한 줄 소개 / 관심사</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="예: 와인 좋아해요 🍷 / 드라이브 취미입니다"
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:brightness-110 text-white font-extrabold text-xs transition shadow-lg flex items-center justify-center gap-2"
          >
            <Plus size={16} /> 신규 테스트 참가자 생성 및 대입
          </button>
        </form>
      </div>
    </div>
  );
};
