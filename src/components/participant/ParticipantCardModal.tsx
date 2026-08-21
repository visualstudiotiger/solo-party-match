import React, { useState } from 'react';
import { Participant, PartyStep } from '../../types/party';
import { X, Heart, Sparkles, MessageSquare, Briefcase, Calendar, Lock, Users } from 'lucide-react';

interface ParticipantCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: Participant | null;
  myUserId: string | null;
  currentStep: PartyStep;
  currentSelections: { toId: string; rank: 1 | 2 }[];
  onSelectHeart: (targetId: string, rank: 1 | 2) => void;
  onRemoveHeart: (targetId: string) => void;
  savedNote: string;
  onSaveNote: (targetId: string, note: string) => void;
  isSelectionActive: boolean;
  activeUserGender?: 'M' | 'F';
}

export const ParticipantCardModal: React.FC<ParticipantCardModalProps> = ({
  isOpen,
  onClose,
  target,
  myUserId,
  currentStep,
  currentSelections,
  onSelectHeart,
  onRemoveHeart,
  savedNote,
  onSaveNote,
  isSelectionActive,
  activeUserGender,
}) => {
  if (!isOpen || !target) return null;

  const [noteText, setNoteText] = useState(savedNote || '');
  const [isSaved, setIsSaved] = useState(false);

  const isSameGender = activeUserGender ? target.gender === activeUserGender : false;
  const existingSelection = currentSelections.find((s) => s.toId === target.id);

  // Progressive Unmasking Rules
  const isBasicInfoUnlocked =
    currentStep === 'FIRST_INTRO' ||
    currentStep === 'FIRST_IMPRESSION' ||
    currentStep === 'ROTATION' ||
    currentStep === 'ROUND2_SELECT' ||
    currentStep === 'FINAL_SELECT' ||
    currentStep === 'RESULT_ANNOUNCE';

  const isChildrenInfoUnlocked =
    currentStep === 'FINAL_SELECT' || currentStep === 'RESULT_ANNOUNCE';

  const handleNoteSave = () => {
    onSaveNote(target.id, noteText);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm glass-panel rounded-3xl border border-pink-500/20 shadow-2xl p-5 text-slate-100 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1.5 rounded-full bg-slate-900/50 backdrop-blur-sm z-10"
        >
          <X size={18} />
        </button>

        {/* Header Profile Photo & Badge */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="relative mb-3">
            <img
              src={target.avatarUrl}
              alt={target.nickname}
              className="w-24 h-24 rounded-full object-cover border-2 border-amber-400 shadow-xl shadow-amber-500/10"
            />
            <span
              className={`absolute bottom-0 right-0 px-2 py-0.5 text-[10px] font-bold rounded-full text-white shadow ${
                target.gender === 'M' ? 'bg-blue-600' : 'bg-pink-600'
              }`}
            >
              {target.gender === 'M' ? '남성' : '여성'}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
            {target.nickname}
            <span className="text-xs font-normal text-amber-400 bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
              테이블 {target.tableNo}
            </span>
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 mt-2">
            {isBasicInfoUnlocked ? (
              <>
                <span className="flex items-center gap-1"><Calendar size={13} /> {target.age}세</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Briefcase size={13} /> {target.job}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-[11px]">
                  {target.maritalStatus || '미혼'}
                </span>
              </>
            ) : (
              <span className="text-pink-300/90 text-xs font-semibold bg-pink-950/40 border border-pink-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                <Lock size={12} /> 나이 / 직업 / 돌싱유무: 1차 자기소개 시 해금
              </span>
            )}
          </div>

          {/* 자녀 유무 해금 상태 */}
          <div className="mt-2 text-xs">
            {isChildrenInfoUnlocked ? (
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/40 text-purple-300 font-bold text-[11px]">
                👶 {target.hasChildren || '자녀 없음'}
              </span>
            ) : (
              <span className="text-slate-400 text-[10px] italic">
                🔒 자녀 유무: 최종 선택 전 해금
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 italic mt-3 bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 w-full text-center">
            "{target.bio || '안녕하세요! 파티 즐겁게 즐겨요 :)'}"
          </p>
        </div>

        {/* 연애 취향 카테고리 태그 */}
        <div className="space-y-2 mb-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-3">
          <h4 className="text-[11px] font-semibold text-amber-400 tracking-wide uppercase flex items-center gap-1">
            <Sparkles size={12} /> 연애 취향 & 데이트 스타일
          </h4>

          <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-300">
            <div className="flex justify-between items-center bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">원하는 연애 분위기</span>
              <span className="font-medium text-amber-300">{target.loveStyle?.relationshipType || '미설정'}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">첫 만남 데이트</span>
              <span className="font-medium text-pink-300">{target.loveStyle?.dateStyle || '미설정'}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">주말 여가 스타일</span>
              <span className="font-medium text-purple-300">{target.loveStyle?.weekendHobby || '미설정'}</span>
            </div>
          </div>
        </div>

        {/* 호감 보내기 (동성 금지 검증) */}
        {isSelectionActive && myUserId !== target.id && (
          isSameGender ? (
            <div className="mb-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center">
              <p className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-1">
                <Lock size={13} className="text-slate-500" />
                동성 참가자에게는 호감을 보낼 수 없습니다
              </p>
            </div>
          ) : (
            <div className="mb-4 bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-500/30 rounded-2xl p-3 text-center">
              <p className="text-xs font-semibold text-pink-300 mb-2 flex items-center justify-center gap-1">
                <Heart size={14} className="fill-pink-400 text-pink-400" />
                비공개 호감 보내기
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    existingSelection?.rank === 1
                      ? onRemoveHeart(target.id)
                      : onSelectHeart(target.id, 1)
                  }
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    existingSelection?.rank === 1
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30 ring-2 ring-pink-300'
                      : 'bg-slate-900/80 text-pink-300 border border-pink-500/30 hover:bg-pink-500/20'
                  }`}
                >
                  <Heart size={14} className={existingSelection?.rank === 1 ? 'fill-white' : ''} />
                  1지망 호감
                </button>

                <button
                  onClick={() =>
                    existingSelection?.rank === 2
                      ? onRemoveHeart(target.id)
                      : onSelectHeart(target.id, 2)
                  }
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    existingSelection?.rank === 2
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-300'
                      : 'bg-slate-900/80 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20'
                  }`}
                >
                  <Heart size={14} className={existingSelection?.rank === 2 ? 'fill-white' : ''} />
                  2지망 호감
                </button>
              </div>
              {existingSelection && (
                <p className="text-[10px] text-pink-400 mt-2 font-medium">
                  ✓ 현재 {target.nickname}님께 {existingSelection.rank}지망 호감을 보냈습니다!
                </p>
              )}
            </div>
          )
        )}

        {/* 나만의 3줄 비공개 메모 (확장) */}
        {myUserId !== target.id && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <MessageSquare size={12} /> 나만의 비밀 메모 (3줄까지 작성 가능, 나만 봄)
              </label>
              {isSaved && <span className="text-[10px] text-emerald-400 font-bold">저장됨!</span>}
            </div>

            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="예: 첫인상이 상냥해 보이셨음 (1차)&#10;대화 시 와인/영화 취향 일치 (2차)&#10;진솔한 느낌이 제일 좋았음 (3차)"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-amber-400 leading-relaxed placeholder-slate-600"
            />
            <button
              onClick={handleNoteSave}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 rounded-xl transition border border-slate-700 shadow"
            >
              메모 저장하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
