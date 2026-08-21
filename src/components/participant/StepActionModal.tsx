import React from 'react';
import { PartyStep, Participant, Selection } from '../../types/party';
import { Heart, Sparkles, RotateCcw, X, Eye, Lock, Award, Users, AlertCircle } from 'lucide-react';

interface StepActionModalProps {
  currentStep: PartyStep;
  activeUser: Participant;
  allParticipants: Participant[];
  selections: Selection[];
  onSubmitSelection: (toId: string, rank: 1 | 2) => void;
  onRemoveSelection: (toId: string) => void;
  isResultsRevealed: boolean;
  onClose: () => void;
}

export const StepActionModal: React.FC<StepActionModalProps> = ({
  currentStep,
  activeUser,
  allParticipants,
  selections,
  onSubmitSelection,
  onRemoveSelection,
  isResultsRevealed,
  onClose,
}) => {
  // Opposite gender candidates
  const candidates = allParticipants.filter(
    (p) => p.gender !== activeUser.gender && p.id !== activeUser.id
  );

  const isFirstImpression = currentStep === 'FIRST_IMPRESSION';
  const isSelectionStep =
    isFirstImpression ||
    currentStep === 'ROUND2_SELECT' ||
    currentStep === 'FINAL_SELECT';

  const currentRound =
    currentStep === 'FINAL_SELECT' ? 3 : currentStep === 'ROUND2_SELECT' ? 2 : 1;

  const mySelections = selections.filter(
    (s) => s.fromId === activeUser.id && s.round === currentRound
  );

  const rank1Target = candidates.find(
    (c) => c.id === mySelections.find((s) => s.rank === 1)?.toId
  );
  const rank2Target = candidates.find(
    (c) => c.id === mySelections.find((s) => s.rank === 2)?.toId
  );

  const isComplete = !!rank1Target && !!rank2Target;

  const handleFinishSelection = () => {
    if (isFirstImpression && !isComplete) {
      alert('첫인상 1차 선택에서는 1순위와 2순위를 모두 선택하셔야 완료할 수 있습니다!');
      return;
    }
    onClose();
  };

  if (isSelectionStep) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-pink-500/30 shadow-2xl p-5 text-slate-100">
          {/* Allow close button only if not mandatory or selection complete */}
          {(!isFirstImpression || isComplete) && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-900/60"
            >
              <X size={18} />
            </button>
          )}

          {/* Header prompt */}
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-extrabold uppercase tracking-wider mb-2">
              {isFirstImpression
                ? '👀 1차 첫인상 선택 (필수 선택단계)'
                : currentStep === 'FINAL_SELECT'
                ? '💌 최종 3차 매칭 지망 입력'
                : '💖 2차 비공개 호감 선택'}
            </span>
            <h2 className="text-xl font-extrabold text-white">
              {isFirstImpression ? '첫인상 1순위, 2순위를 선택해 주세요!' : '마음에 드는 이성을 선택해 주세요!'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isFirstImpression
                ? '⚠️ 1순위와 2순위를 모두 선택해야 제출을 완료하고 대기 화면으로 이동할 수 있습니다.'
                : '상대방에게는 호감 선택 사실이 노출되지 않으며, 서로 선택 시에만 매칭됩니다.'}
            </p>
          </div>

          {/* Selection Status Summary Box */}
          <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="p-2 rounded-xl bg-pink-950/40 border border-pink-500/30 text-center">
              <span className="text-[10px] text-pink-300 block font-semibold">1순위 (1지망) *필수</span>
              <strong className="text-xs text-white truncate block">
                {rank1Target ? `${rank1Target.nickname}` : '⚠️ 미선택'}
              </strong>
            </div>

            <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center">
              <span className="text-[10px] text-purple-300 block font-semibold">2순위 (2지망) *필수</span>
              <strong className="text-xs text-white truncate block">
                {rank2Target ? `${rank2Target.nickname}` : '⚠️ 미선택'}
              </strong>
            </div>
          </div>

          {/* Candidate list */}
          <div className="space-y-2 mb-4">
            <h3 className="text-xs font-bold text-amber-300 tracking-wide uppercase">
              이성 참가자 목록 ({candidates.length}명)
            </h3>

            <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
              {candidates.map((c) => {
                const myRank = mySelections.find((s) => s.toId === c.id)?.rank;

                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                      myRank
                        ? 'bg-gradient-to-r from-pink-950/40 to-purple-950/40 border-pink-400/60 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatarUrl}
                        alt={c.nickname}
                        className="w-11 h-11 rounded-full object-cover border border-amber-400/50"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {c.nickname}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {isFirstImpression ? (
                            <span className="text-pink-300/80 font-medium">🔒 1차 자기소개 전 비공개</span>
                          ) : (
                            `${c.job} • ${c.age}세 • ${c.maritalStatus}`
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          myRank === 1 ? onRemoveSelection(c.id) : onSubmitSelection(c.id, 1)
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                          myRank === 1
                            ? 'bg-pink-600 text-white shadow ring-2 ring-pink-300'
                            : 'bg-slate-800 text-pink-300 hover:bg-pink-600/30'
                        }`}
                      >
                        <Heart size={12} className={myRank === 1 ? 'fill-white' : ''} />
                        1순위
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          myRank === 2 ? onRemoveSelection(c.id) : onSubmitSelection(c.id, 2)
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                          myRank === 2
                            ? 'bg-purple-600 text-white shadow ring-2 ring-purple-300'
                            : 'bg-slate-800 text-purple-300 hover:bg-purple-600/30'
                        }`}
                      >
                        <Heart size={12} className={myRank === 2 ? 'fill-white' : ''} />
                        2순위
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishSelection}
            disabled={isFirstImpression && !isComplete}
            className={`w-full py-3 rounded-2xl text-xs font-extrabold transition shadow-lg ${
              isFirstImpression && !isComplete
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-pink-500 text-white hover:brightness-110 active:scale-98'
            }`}
          >
            {isFirstImpression && !isComplete
              ? '⚠️ 1순위와 2순위를 모두 선택해 주세요'
              : '선택 완료 제출하고 대기 화면으로 이동'}
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'ROTATION') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-sm glass-panel rounded-3xl border border-amber-500/30 shadow-2xl p-6 text-center text-slate-100">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/40">
            <RotateCcw size={32} />
          </div>

          <h3 className="text-xl font-extrabold text-white mb-1">🔄 로테이션 & 자리배치 안내</h3>
          <p className="text-xs text-slate-300 mb-4">
            사회자의 안내에 따라 지정된 새로운 테이블로 이동해 주세요! 새로운 참가자분들과 인사를 나눠보세요.
          </p>

          <div className="bg-slate-900/90 border border-amber-400/40 rounded-2xl p-4 mb-4">
            <span className="text-xs text-slate-400 block mb-1">회원님의 배치 테이블</span>
            <strong className="text-2xl font-extrabold text-amber-300">
              테이블 {activeUser.tableNo} 번
            </strong>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700"
          >
            이동 확인 완료
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'FIRST_INTRO') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-sm glass-panel rounded-3xl border border-purple-500/30 shadow-2xl p-6 text-center text-slate-100">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto mb-3 border border-purple-500/40">
            <Users size={32} />
          </div>

          <h3 className="text-xl font-extrabold text-white mb-1">👋 1차 자기소개 시간</h3>
          <p className="text-xs text-slate-300 mb-4">
            참가자분들과 서로 인사하며 자기소개를 시작해 보세요! 상대방의 프로필 카드를 터치하여 한 줄 소개와 취향을 확인할 수 있습니다.
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-extrabold shadow-lg hover:brightness-110"
          >
            참가자 리스트 확인하기
          </button>
        </div>
      </div>
    );
  }

  return null;
};
