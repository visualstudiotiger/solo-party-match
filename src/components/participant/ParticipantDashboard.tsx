import React, { useState, useEffect } from 'react';
import { usePartyStore } from '../../store/partyStore';
import { Participant, Selection } from '../../types/party';
import { ProfileFormModal } from './ProfileFormModal';
import { ParticipantCardModal } from './ParticipantCardModal';
import { StepActionModal } from './StepActionModal';
import {
  Heart,
  Search,
  UserCheck,
  Sparkles,
  Users,
  Award,
  LogOut,
  Bell,
  CheckCircle2,
  Lock,
  ChevronRight,
  Filter,
  Hourglass,
  Flame,
  TrendingUp,
  History,
  MousePointerClick,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ParticipantDashboardProps {
  onOpenHostLogin?: () => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({ onOpenHostLogin }) => {
  const {
    partyCode,
    roomName,
    currentStep,
    tablesCount,
    participants,
    selections,
    isResultsRevealed,
    notes,
    currentUserId,
    setCurrentUserId,
    updateParticipant,
    registerNewParticipant,
    submitSelection,
    removeSelection,
    saveNote,
    getMutualMatches,
  } = usePartyStore();

  const activeUser = participants.find((p) => p.id === currentUserId) || participants[0];

  const [activeTab, setActiveTab] = useState<'ALL' | 'SENT' | 'RECEIVED' | 'MATCHES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'M' | 'F'>('ALL');
  const [tableFilter, setTableFilter] = useState<number | 'ALL'>('ALL');

  // Interactive Heart Journey Round Filter (1: 첫인상, 2: 2차, 3: 최종, 'ALL': 전체)
  const [selectedJourneyRound, setSelectedJourneyRound] = useState<1 | 2 | 3 | 'ALL'>(1);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormMode, setProfileFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedTarget, setSelectedTarget] = useState<Participant | null>(null);
  
  // Interactive Step Modal Auto-popup State
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [lastStep, setLastStep] = useState(currentStep);

  // Progressive Unmasking State
  const isWaitingStep = currentStep === 'WAITING';
  const isListVisible = true;

  const isBasicInfoUnlocked =
    currentStep === 'FIRST_INTRO' ||
    currentStep === 'FIRST_IMPRESSION' ||
    currentStep === 'ROTATION' ||
    currentStep === 'ROUND2_SELECT' ||
    currentStep === 'FINAL_SELECT' ||
    currentStep === 'RESULT_ANNOUNCE';

  const isChildrenInfoUnlocked =
    currentStep === 'FINAL_SELECT' || currentStep === 'RESULT_ANNOUNCE';

  // Automatically pop up step action modal whenever host changes step
  useEffect(() => {
    if (currentStep !== lastStep) {
      setLastStep(currentStep);

      if (
        currentStep === 'FIRST_INTRO' ||
        currentStep === 'FIRST_IMPRESSION' ||
        currentStep === 'ROTATION' ||
        currentStep === 'ROUND2_SELECT' ||
        currentStep === 'FINAL_SELECT'
      ) {
        setIsStepModalOpen(true);
      }

      if (currentStep === 'RESULT_ANNOUNCE') {
        setActiveTab('MATCHES');
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    }
  }, [currentStep, lastStep]);

  // Confetti trigger when results are revealed
  useEffect(() => {
    if (isResultsRevealed && activeTab === 'MATCHES') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isResultsRevealed, activeTab]);

  const isSelectionStep =
    currentStep === 'FIRST_IMPRESSION' ||
    currentStep === 'ROUND2_SELECT' ||
    currentStep === 'FINAL_SELECT';

  // Current user's sent selections
  const mySentSelections = selections.filter((s) => s.fromId === activeUser?.id);
  
  // Received count
  const receivedCount = selections.filter((s) => s.toId === activeUser?.id).length;

  // Mutual matches
  const mutualMatches = getMutualMatches().filter(
    (m) => m.user1Id === activeUser?.id || m.user2Id === activeUser?.id
  );

  // Heart Journey Timeline per round
  const round1Selections = mySentSelections.filter((s) => s.round === 1);
  const round2Selections = mySentSelections.filter((s) => s.round === 2);
  const round3Selections = mySentSelections.filter((s) => s.round === 3);

  // Filtered participant list for ALL tab
  const filteredParticipants = participants.filter((p) => {
    if (p.id === activeUser?.id) return false;

    if (searchQuery.trim()) {
      const matchNickname = p.nickname.toLowerCase().includes(searchQuery.toLowerCase());
      const matchJob = p.job.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchNickname && !matchJob) return false;
    }

    if (genderFilter !== 'ALL' && p.gender !== genderFilter) return false;
    if (tableFilter !== 'ALL' && p.tableNo !== tableFilter) return false;

    return true;
  });

  // Filtered list specifically for SENT tab based on selected Journey Round
  const activeJourneySelections = selectedJourneyRound === 'ALL'
    ? mySentSelections
    : mySentSelections.filter((s) => s.round === selectedJourneyRound);

  const journeyParticipants = participants.filter((p) => {
    if (p.id === activeUser?.id) return false;
    return activeJourneySelections.some((s) => s.toId === p.id);
  });

  const getStepTitle = () => {
    switch (currentStep) {
      case 'WAITING':
        return '1단계: 파티 대기 (참가자 입장 중)';
      case 'FIRST_INTRO':
        return '2단계: 1차 자기소개 (프로필 확인)';
      case 'FIRST_IMPRESSION':
        return '3단계: 1차 호감선택 (비공개 1, 2지망)';
      case 'ROTATION':
        return '4단계: 로테이션 & 자리배치 (테이블 이동)';
      case 'ROUND2_SELECT':
        return '5단계: 2차 호감선택 (호감 변화 기록)';
      case 'FINAL_SELECT':
        return '6단계: 최종 지망선택 (최종 지망 입력)';
      case 'RESULT_ANNOUNCE':
        return '7단계: 최종 매칭 결과 발표!';
      default:
        return '파티 진행 중';
    }
  };

  const [showDevSwitcher, setShowDevSwitcher] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0814] text-slate-100 flex flex-col items-center pb-20 select-none">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#110b1a] border-x border-slate-800/80 shadow-2xl relative">
        
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#150d21]/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-amber-500 to-pink-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg tracking-wider shadow">
              SOLOPARTY
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono tracking-widest uppercase">
              [{roomName.replace('SOLO PARTY ', '')}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeUser ? (
              <span className="text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                🟢 {activeUser.nickname} (T{activeUser.tableNo})
              </span>
            ) : (
              <button
                onClick={() => {
                  setProfileFormMode('CREATE');
                  setIsProfileModalOpen(true);
                }}
                className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg hover:bg-amber-500/20 transition flex items-center gap-1"
              >
                + 입장하기
              </button>
            )}
          </div>
        </header>

        {/* Profile Info Header / Join Party Hero Card */}
        <div className="p-4 bg-gradient-to-b from-[#1c122b] to-[#140c20] border-b border-slate-800/80">
          {activeUser ? (
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  {activeUser.nickname}님의 프로필
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    {partyCode}
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeUser.gender === 'M' ? '남성' : '여성'} • {activeUser.age}세 • {activeUser.job} ({activeUser.maritalStatus || '미혼'}) • T{activeUser.tableNo}
                </p>
              </div>

              <button
                onClick={() => {
                  setProfileFormMode('EDIT');
                  setIsProfileModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 transition shadow"
              >
                수정
              </button>
            </div>
          ) : (
            <div className="text-center space-y-3 py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 shadow-xl text-white">
                <Sparkles size={24} />
              </div>
              <h2 className="text-base font-black text-white">🎉 솔로파티 입장을 환영합니다!</h2>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                아직 등록된 프로필이 없습니다. 아래 버튼을 눌러 프로필을 입력하고 파티에 입장해 주세요.
              </p>
              <button
                onClick={() => {
                  setProfileFormMode('CREATE');
                  setIsProfileModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white font-extrabold text-xs shadow-xl hover:brightness-110 transition flex items-center justify-center gap-2 mx-auto"
              >
                <MousePointerClick size={14} /> 닉네임 & 프로필 입력하고 파티 입장하기
              </button>
            </div>
          )}

          {/* Real-time Party Step Status Banner & Manual Open Button */}
          <div
            onClick={() => setIsStepModalOpen(true)}
            className="flex items-center justify-between bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-amber-950/40 border border-pink-500/30 rounded-2xl px-3.5 py-2.5 cursor-pointer hover:border-pink-400 transition"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span className="text-xs font-bold text-pink-200">{getStepTitle()}</span>
            </div>
            {isSelectionStep && (
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                입력 창 열기 →
              </span>
            )}
          </div>

          {/* Filter Tabs (Visible when list is unlocked) */}
          {isListVisible && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                  activeTab === 'ALL'
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>전체</span>
                <span className="text-[9px] opacity-80">{filteredParticipants.length}명</span>
              </button>

              <button
                onClick={() => setActiveTab('SENT')}
                className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                  activeTab === 'SENT'
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>💖 내 호감</span>
                <span className="text-[9px] opacity-80">{mySentSelections.length}명</span>
              </button>

              <button
                onClick={() => setActiveTab('RECEIVED')}
                className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                  activeTab === 'RECEIVED'
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🔔 받은 호감</span>
                <span className="text-[9px] opacity-80">{receivedCount}</span>
              </button>

              <button
                onClick={() => setActiveTab('MATCHES')}
                className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                  activeTab === 'MATCHES'
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>💘 매칭결과</span>
                <span className="text-[9px] opacity-80">{mutualMatches.length}</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Display */}
        <div className="p-4 space-y-3 flex-1">
          
          {/* Rule 3: Step 1 WAITING View */}
          {activeTab === 'SENT' ? (
            /* TAB 2: SENT HEARTS + INTERACTIVE HEART JOURNEY TIMELINE */
            <div className="space-y-4">
              {/* Interactive Heart Journey Timeline Filter Bar */}
              <div className="glass-card rounded-2xl p-4 border border-amber-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-amber-300 tracking-wide uppercase flex items-center gap-1.5">
                    <TrendingUp size={14} /> 나의 호감 변화 추이 (클릭 시 해당 참가자 하단 노출)
                  </h3>
                  <button
                    onClick={() => setSelectedJourneyRound('ALL')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                      selectedJourneyRound === 'ALL'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    전체 보기
                  </button>
                </div>

                {/* 3 Clickable Round Cards */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Round 1 Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedJourneyRound(1)}
                    className={`p-2.5 rounded-xl border text-left transition relative ${
                      selectedJourneyRound === 1
                        ? 'bg-gradient-to-b from-pink-950/60 to-slate-900 border-pink-400 shadow-lg ring-2 ring-pink-400/50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-pink-300 block font-extrabold flex items-center justify-between mb-1">
                      1차 첫인상
                      {selectedJourneyRound === 1 && <MousePointerClick size={12} className="text-pink-400" />}
                    </span>
                    {round1Selections.length === 0 ? (
                      <span className="text-[11px] text-slate-600 block">미선택</span>
                    ) : (
                      round1Selections.map((s) => {
                        const target = participants.find((p) => p.id === s.toId);
                        return (
                          <div key={s.toId} className="text-[11px] font-bold text-white truncate">
                            {s.rank}순위: {target?.nickname}
                          </div>
                        );
                      })
                    )}
                  </button>

                  {/* Round 2 Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedJourneyRound(2)}
                    className={`p-2.5 rounded-xl border text-left transition relative ${
                      selectedJourneyRound === 2
                        ? 'bg-gradient-to-b from-purple-950/60 to-slate-900 border-purple-400 shadow-lg ring-2 ring-purple-400/50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-purple-300 block font-extrabold flex items-center justify-between mb-1">
                      2차 대화후
                      {selectedJourneyRound === 2 && <MousePointerClick size={12} className="text-purple-400" />}
                    </span>
                    {round2Selections.length === 0 ? (
                      <span className="text-[11px] text-slate-600 block">미선택</span>
                    ) : (
                      round2Selections.map((s) => {
                        const target = participants.find((p) => p.id === s.toId);
                        return (
                          <div key={s.toId} className="text-[11px] font-bold text-white truncate">
                            {s.rank}순위: {target?.nickname}
                          </div>
                        );
                      })
                    )}
                  </button>

                  {/* Round 3 Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedJourneyRound(3)}
                    className={`p-2.5 rounded-xl border text-left transition relative ${
                      selectedJourneyRound === 3
                        ? 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-400 shadow-lg ring-2 ring-amber-400/50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-amber-300 block font-extrabold flex items-center justify-between mb-1">
                      3차 최종지망
                      {selectedJourneyRound === 3 && <MousePointerClick size={12} className="text-amber-400" />}
                    </span>
                    {round3Selections.length === 0 ? (
                      <span className="text-[11px] text-slate-600 block">미선택</span>
                    ) : (
                      round3Selections.map((s) => {
                        const target = participants.find((p) => p.id === s.toId);
                        return (
                          <div key={s.toId} className="text-[11px] font-bold text-white truncate">
                            {s.rank}순위: {target?.nickname}
                          </div>
                        );
                      })
                    )}
                  </button>
                </div>
              </div>

              {/* Header Label for Currently Filtered Round List */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  {selectedJourneyRound === 'ALL'
                    ? '전체 호감 표현 상대 목록'
                    : selectedJourneyRound === 1
                    ? '📍 1차 첫인상 단계에서 선택한 상대'
                    : selectedJourneyRound === 2
                    ? '📍 2차 대화 후 선택한 상대'
                    : '📍 3차 최종 지망에서 선택한 상대'}
                  ({journeyParticipants.length}명)
                </span>

                {selectedJourneyRound !== 'ALL' && (
                  <span className="text-[10px] text-slate-400">
                    상단 카드 선택으로 변경 가능
                  </span>
                )}
              </div>

              {/* Filtered Participant Cards based on selected journey round */}
              {journeyParticipants.length === 0 ? (
                <div className="glass-card rounded-2xl p-6 text-center text-xs text-slate-400">
                  선택한 단계에 호감 표기한 참가자가 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {journeyParticipants.map((p) => {
                    // Find the selection record for this participant in the currently selected round (or latest)
                    const roundSelection = selectedJourneyRound === 'ALL'
                      ? mySentSelections.find((s) => s.toId === p.id)
                      : mySentSelections.find((s) => s.toId === p.id && s.round === selectedJourneyRound);

                    const userNote = notes[activeUser.id]?.[p.id];

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedTarget(p)}
                        className="glass-card rounded-2xl p-3 border border-slate-800/80 hover:border-pink-500/50 transition cursor-pointer relative flex flex-col justify-between"
                      >
                        {roundSelection && (
                          <span
                            className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold rounded-full text-white shadow ${
                              roundSelection.rank === 1 ? 'bg-pink-600' : 'bg-purple-600'
                            }`}
                          >
                            {selectedJourneyRound !== 'ALL' ? `${selectedJourneyRound}차 ` : ''}
                            {roundSelection.rank}순위 💖
                          </span>
                        )}

                        <div className="flex items-start gap-2.5 mb-2">
                          <img
                            src={p.avatarUrl}
                            alt={p.nickname}
                            className="w-12 h-12 rounded-full object-cover border border-amber-400/50"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-white truncate">{p.nickname}</h4>
                            <p className="text-[11px] text-amber-300/90 font-medium truncate">
                              {p.job} ({p.maritalStatus})
                            </p>
                            <span className="inline-block text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 mt-0.5">
                              T{p.tableNo}
                            </span>
                          </div>
                        </div>

                        {userNote && (
                          <div className="text-[10px] text-amber-300 font-medium line-clamp-3 bg-amber-950/30 p-2 rounded border border-amber-500/20 mb-2 whitespace-pre-line leading-tight">
                            📝 {userNote}
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTarget(p);
                          }}
                          className="w-full py-1.5 bg-pink-600 text-white rounded-xl text-xs font-bold"
                        >
                          {roundSelection ? `${roundSelection.rank}순위 프로필 & 메모` : '프로필 보기'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'RECEIVED' ? (
            <div className="glass-card rounded-2xl p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto border border-pink-500/30 heart-pulse">
                <Bell size={28} />
              </div>
              <h3 className="text-base font-bold text-white">비공개 호감 수신 현황</h3>
              <p className="text-xs text-slate-400">
                현재 <span className="text-pink-400 font-bold">{receivedCount}명</span>의 이성 참가자가 회원님께 관심 호감을 표현했습니다!
              </p>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                🔒 신솔파티의 '마음은 숨기고' 원칙에 따라, 상대방의 구체적인 신원은 서로 선택을 완료한 후 발표 시 공개됩니다.
              </div>
            </div>
          ) : activeTab === 'MATCHES' ? (
            /* TAB 4: MATCH RESULTS */
            <div className="space-y-3">
              {!isResultsRevealed ? (
                <div className="glass-card rounded-2xl p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto border border-purple-500/30">
                    <Lock size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white">매칭 결과 공개 대기 중</h3>
                  <p className="text-xs text-slate-400">
                    사회자가 최종 매칭 결과를 발표하면, 이 화면에서 서로 마음이 통해 커플이 된 참가자의 연락처가 공개됩니다.
                  </p>
                </div>
              ) : mutualMatches.length === 0 ? (
                <div className="glass-card rounded-2xl p-6 text-center space-y-2">
                  <h3 className="text-base font-bold text-slate-300">이번 파티 상호 매칭 미완료</h3>
                  <p className="text-xs text-slate-400">
                    아쉽게도 서로에게 하트를 보낸 참가자가 없습니다. 다음 로테이션 파티에서 새로운 인연을 만나보세요!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center py-2">
                    <h3 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-400">
                      🎉 축하합니다! 최종 매칭 결과 발표 🎉
                    </h3>
                    <p className="text-xs text-slate-300">서로의 호감이 통하여 인연이 연결되었습니다!</p>
                  </div>

                  {mutualMatches.map((match) => {
                    const matchedPartnerId =
                      match.user1Id === activeUser.id ? match.user2Id : match.user1Id;
                    const partner = participants.find((p) => p.id === matchedPartnerId);

                    if (!partner) return null;

                    const isRank1Match = match.matchType === 'RANK1_MUTUAL';

                    return (
                      <div
                        key={partner.id}
                        className={`rounded-2xl p-4 flex items-center justify-between animate-fadeIn border ${
                          isRank1Match
                            ? 'glass-gold-card border-amber-400 shadow-xl ring-2 ring-amber-400/40'
                            : 'glass-card border-purple-400/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={partner.avatarUrl}
                            alt={partner.nickname}
                            className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h4 className="text-base font-bold text-white">
                                {partner.nickname}님
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                                  isRank1Match ? 'bg-gradient-to-r from-amber-500 to-pink-500' : 'bg-purple-600'
                                }`}
                              >
                                {isRank1Match ? '🔥 1순위 상호 매칭' : '💖 2순위 매칭'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">
                              {partner.realName || partner.nickname} • {partner.job} ({partner.maritalStatus})
                            </p>
                            <p className="text-xs text-amber-300 font-mono mt-1 font-bold">
                              📞 연락처: {partner.phone || '010-XXXX-XXXX'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* TAB 1: ALL PARTICIPANTS GRID */
            <>
              {isWaitingStep ? (
                <div className="glass-card rounded-2xl p-4 border border-amber-500/30 text-xs text-slate-200 leading-relaxed flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
                      <Hourglass size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-amber-300">1단계: 파티 입장 대기 중</h4>
                      <p className="text-[11px] text-slate-300">
                        현재 총 <strong className="text-white font-bold">{participants.length}명</strong>(남 {participants.filter(p => p.gender === 'M').length}명 / 여 {participants.filter(p => p.gender === 'F').length}명) 입장 완료. 사회자가 진행할 때까지 프로필을 둘러보세요.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Notice Card */
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                  <span className="text-amber-400 text-sm">💡</span>
                  <div>
                    <strong className="text-amber-300">단계별 해금 규칙:</strong> 2단계 자기소개 시 기본 프로필 해금, 6단계 최종 선택 전 자녀유무 해금! (연락처는 최종 발표 시에만 공개)
                  </div>
                </div>
              )}

              {/* Search & Filter Inputs */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="닉네임 검색"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Sub Filters (Gender & Table) */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500">성별:</span>
                    {(['ALL', 'M', 'F'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenderFilter(g)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          genderFilter === g
                            ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {g === 'ALL' ? '전체' : g === 'M' ? '남성' : '여성'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500">테이블:</span>
                    <select
                      value={tableFilter}
                      onChange={(e) =>
                        setTableFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                      }
                      className="bg-slate-900 border border-slate-800 text-amber-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="ALL">전체</option>
                      {Array.from({ length: tablesCount || 4 }, (_, i) => i + 1).map((t) => (
                        <option key={t} value={t}>
                          테이블 {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Participant Card Grid List */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {filteredParticipants.map((p) => {
                  const isSameGender = p.gender === activeUser.gender;
                  const selection = mySentSelections.find((s) => s.toId === p.id);
                  const userNote = notes[activeUser.id]?.[p.id];

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedTarget(p)}
                      className="glass-card rounded-2xl p-3 border border-slate-800/80 hover:border-pink-500/50 transition cursor-pointer relative group flex flex-col justify-between"
                    >
                      {/* Selection rank badge or Same gender badge */}
                      {selection ? (
                        <span
                          className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold rounded-full text-white shadow ${
                            selection.rank === 1 ? 'bg-pink-600' : 'bg-purple-600'
                          }`}
                        >
                          {selection.rank}순위 💖
                        </span>
                      ) : isSameGender ? (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-bold rounded bg-slate-800 text-slate-400 border border-slate-700">
                          동성
                        </span>
                      ) : null}

                      <div className="flex items-start gap-2.5 mb-2">
                        <img
                          src={p.avatarUrl}
                          alt={p.nickname}
                          className="w-12 h-12 rounded-full object-cover border border-amber-400/50"
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-white truncate flex items-center gap-1">
                            {p.nickname}
                          </h4>
                          
                          {/* Unmasking Info Display */}
                          <div className="text-[11px] text-slate-400 truncate space-y-0.5">
                            {isBasicInfoUnlocked ? (
                              <p className="text-amber-300/90 font-medium truncate">
                                {p.job} ({p.maritalStatus || '미혼'})
                              </p>
                            ) : (
                              <p className="text-pink-300/80">🔒 1차 자기소개 전 비공개</p>
                            )}

                            {isChildrenInfoUnlocked && (
                              <p className="text-purple-300 text-[10px] font-semibold truncate">
                                👶 {p.hasChildren || '자녀 없음'}
                              </p>
                            )}
                          </div>

                          <span className="inline-block text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-1">
                            테이블 {p.tableNo}
                          </span>
                        </div>
                      </div>

                      {/* Bio snippet */}
                      <p className="text-[11px] text-slate-300 line-clamp-2 italic bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/50 mb-2">
                        "{p.bio}"
                      </p>

                      {/* Private Memo (up to 3 lines) */}
                      {userNote && (
                        <div className="text-[10px] text-amber-300 font-medium line-clamp-3 bg-amber-950/30 p-1.5 rounded border border-amber-500/20 mb-2 whitespace-pre-line leading-tight">
                          📝 {userNote}
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTarget(p);
                        }}
                        className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                          isSameGender
                            ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-pointer'
                            : selection
                            ? 'bg-pink-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {isSameGender ? (
                          '프로필 & 비밀 메모'
                        ) : (
                          <>
                            <Heart size={12} className={selection ? 'fill-white' : ''} />
                            {selection ? `${selection.rank}순위 호감 중` : '프로필 & 호감'}
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Profile Edit / Register Modal */}
        <ProfileFormModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          participant={profileFormMode === 'EDIT' ? (activeUser || null) : null}
          mode={profileFormMode}
          onSave={(data) => {
            if (profileFormMode === 'EDIT' && activeUser) {
              updateParticipant(activeUser.id, data);
              alert('프로필 수정이 완료되었습니다! ✏️');
            } else {
              const newP = registerNewParticipant(data);
              alert(`🎉 '${newP.nickname}'님으로 파티 입장이 성공적으로 완료되었습니다!`);
            }
          }}
        />

        {/* Target Participant Detail & Heart Selection Modal */}
        <ParticipantCardModal
          isOpen={!!selectedTarget}
          onClose={() => setSelectedTarget(null)}
          target={selectedTarget}
          myUserId={activeUser?.id}
          activeUserGender={activeUser?.gender}
          currentStep={currentStep}
          currentSelections={activeJourneySelections}
          onSelectHeart={(targetId, rank) => {
            if (activeUser) submitSelection(activeUser.id, targetId, rank, 1);
          }}
          onRemoveHeart={(targetId) => {
            if (activeUser) removeSelection(activeUser.id, targetId, 1);
          }}
          savedNote={selectedTarget && activeUser ? notes[activeUser.id]?.[selectedTarget.id] || '' : ''}
          onSaveNote={(targetId, note) => {
            if (activeUser) saveNote(activeUser.id, targetId, note);
          }}
          isSelectionActive={isSelectionStep}
        />

        {/* Interactive Step Auto-Popup Modal */}
        {isStepModalOpen && (
          <StepActionModal
            currentStep={currentStep}
            activeUser={activeUser}
            allParticipants={participants}
            selections={selections}
            onSubmitSelection={(toId, rank) => {
              if (activeUser) {
                submitSelection(activeUser.id, toId, rank, currentStep === 'FINAL_SELECT' ? 3 : currentStep === 'ROUND2_SELECT' ? 2 : 1);
              }
            }}
            onRemoveSelection={(toId) => {
              if (activeUser) {
                removeSelection(activeUser.id, toId, currentStep === 'FINAL_SELECT' ? 3 : currentStep === 'ROUND2_SELECT' ? 2 : 1);
              }
            }}
            isResultsRevealed={isResultsRevealed}
            onClose={() => setIsStepModalOpen(false)}
          />
        )}

        {/* Bottom Host Login Access Footer */}
        <footer className="mt-8 pt-4 pb-6 px-4 border-t border-slate-800/80 text-center space-y-2">
          <p className="text-[11px] text-slate-500">
            SOLO PARTY MATCH © 2026 • 참가자 전용 화면
          </p>
          {onOpenHostLogin && (
            <button
              onClick={onOpenHostLogin}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-300/10 hover:from-amber-500/20 hover:to-amber-300/20 border border-amber-500/30 text-xs font-extrabold text-amber-300 transition shadow-sm"
            >
              <Crown size={14} className="text-amber-400" />
              <span>👑 사회자(Host) 로그인 및 관리자 화면</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
