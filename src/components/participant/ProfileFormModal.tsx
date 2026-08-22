import React, { useState } from 'react';
import { Participant, Gender } from '../../types/party';
import { X, User, Lock, Phone } from 'lucide-react';

interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
  mode?: 'CREATE' | 'EDIT';
  onSave: (data: Partial<Participant>) => void;
}

export const ProfileFormModal: React.FC<ProfileFormModalProps> = ({
  isOpen,
  onClose,
  participant,
  mode = 'CREATE',
  onSave,
}) => {
  if (!isOpen) return null;

  const [nickname, setNickname] = useState(participant?.nickname || '');
  const [gender, setGender] = useState<Gender>(participant?.gender || 'M');
  const [bio, setBio] = useState(participant?.bio || '');
  const [phone, setPhone] = useState(participant?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(
    participant?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert('닉네임을 입력해 주세요.');
      return;
    }
    onSave({
      nickname,
      gender,
      avatarUrl,
      bio: bio.trim() || '반갑습니다! 대화 나누고 싶어요 🥂',
      phone,
    });
    onClose();
  };

  const isCreate = mode === 'CREATE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-amber-500/30 shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 mb-2 shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isCreate ? '🕶️ 블라인드 파티 프로필 등록' : '✏️ 프로필 정보 수정'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            파티 중에는 닉네임, 아바타, 한 줄 소개만 공개됩니다. (스펙 비공개)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 닉네임 */}
          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              파티에서 사용할 닉네임 <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 호야, 데이비드, 루시"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 focus:border-amber-400 focus:outline-none text-sm text-white placeholder-slate-500"
              required
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">성별</label>
            <div className="flex rounded-xl bg-slate-900/80 border border-slate-700/70 p-1">
              <button
                type="button"
                onClick={() => setGender('M')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  gender === 'M'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ♂️ 남성
              </button>
              <button
                type="button"
                onClick={() => setGender('F')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  gender === 'F'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ♀️ 여성
              </button>
            </div>
          </div>

          {/* 한 줄 소개 / 취향 키워드 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              한 줄 소개 / 관심사 키워드
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="예: 주말엔 커피 로스팅 ☕ / 삼겹살에 소주파 / 영화 감상 좋아해요"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 focus:border-amber-400 focus:outline-none text-sm text-white placeholder-slate-500"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-xs font-semibold text-pink-300 mb-1 flex items-center gap-1">
              <Lock size={12} /> 연락처 (최종 상호 매칭시에만 상대에게 공개)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 focus:border-amber-400 focus:outline-none text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-xs font-semibold hover:bg-slate-800"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white text-xs font-extrabold shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-98 transition"
            >
              {isCreate ? '🎉 파티 프로필 등록 완료' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

