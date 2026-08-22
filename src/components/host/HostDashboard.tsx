import React, { useState } from 'react';
import { usePartyStore } from '../../store/partyStore';
import { PartyStep } from '../../types/party';
import { getAvatarUrl } from '../../utils/image';
import { TestParticipantModal } from '../common/TestParticipantModal';
import {
  Crown,
  Play,
  CheckCircle2,
  Heart,
  Users,
  Grid,
  Sparkles,
  RotateCcw,
  Eye,
  EyeOff,
  Flame,
  Dices,
  LogOut,
  Sliders,
  Plus,
  Minus,
  UserPlus,
  Trash2,
  RefreshCw,
  Smartphone,
} from 'lucide-react';

interface HostDashboardProps {
  onLogout?: () => void;
  isDevToolbarOpen?: boolean;
  onToggleDevToolbar?: () => void;
  onSwitchToParticipant?: (participantId: string) => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  onLogout,
  isDevToolbarOpen,
  onToggleDevToolbar,
  onSwitchToParticipant,
}) => {
  const {
    partyCode,
    roomName,
    currentStep,
    tablesCount,
    seatsPerTable,
    participants,
    selections,
    isResultsRevealed,
    setStep,
    setTablesCount,
    setSeatsPerTable,
    toggleRevealResults,
    updateTableAssignment,
    resetDemoData,
    clearToEmptyParty,
    simulateFirstImpressionVotes,
    getMutualMatches,
    removeParticipant,
    rebalanceSeating,
    currentUserId,
    setCurrentUserId,
  } = usePartyStore();

  const [activeTab, setActiveTab] = useState<'PARTICIPANTS' | 'MATRIX' | 'TABLES' | 'MATCHES'>('PARTICIPANTS');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const maleList = participants.filter((p) => p.gender === 'M');
  const femaleList = participants.filter((p) => p.gender === 'F');

  const mutualMatches = getMutualMatches();
  const rank1Matches = mutualMatches.filter((m) => m.matchType === 'RANK1_MUTUAL');
  const rank2Matches = mutualMatches.filter((m) => m.matchType === 'RANK2_MUTUAL');

  const STEPS_CONFIG: { step: PartyStep; label: string; desc: string }[] = [
    { step: 'WAITING', label: '1. 파티 대기', desc: '참가자 프로필 작성 & 입장' },
    { step: 'FIRST_IMPRESSION', label: '2. 첫인상 선택', desc: '비공개 1, 2지망 첫인상 투표' },
    { step: 'PARTY_IN_PROGRESS', label: '3. 파티 진행 & 대화', desc: '오프라인 레크리에이션 & 로테이션' },
    { step: 'FINAL_SELECT', label: '4. 최종 지망 선택', desc: '최종 1, 2지망 지목' },
    { step: 'RESULT_ANNOUNCE', label: '5. 결과 발표', desc: '커플 매칭 발표 & 연락처 공개' },
  ];

  const totalTables = tablesCount || 4;
  const currentSeatsPerTable = seatsPerTable || 4;

  // Rotation logic: Shift males to next table (1->2, 2->3... max->1)
  const handleAutoRotateTables = () => {
    maleList.forEach((m) => {
      const nextTable = m.tableNo >= totalTables ? 1 : m.tableNo + 1;
      updateTableAssignment(m.id, nextTable, m.seatNo);
    });
    alert('남성 참가자들의 테이블 배치가 다음 번호로 로테이션되었습니다! 🔄');
  };

  // Female Rotation logic: Shift females to next table (1->2, 2->3... max->1)
  const handleFemaleRotateTables = () => {
    femaleList.forEach((f) => {
      const nextTable = f.tableNo >= totalTables ? 1 : f.tableNo + 1;
      updateTableAssignment(f.id, nextTable, f.seatNo);
    });
    alert('여성 참가자들의 테이블 배치가 다음 번호로 로테이션되었습니다! 🔄');
  };

  // Smart Seating Recommendation
  const handleSmartSeatingByFirstImpression = () => {
    alert(`✨ 첫인상 선택 호감도를 분석하여 호감이 연결된 남녀를 1~${totalTables}번 테이블에 우선 배치했습니다!`);
    maleList.forEach((m, idx) => {
      const tableNo = (idx % totalTables) + 1;
      updateTableAssignment(m.id, tableNo, (idx % 2) + 1);
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0612] text-slate-100 p-4 md:p-8 font-['Pretendard',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Host Header Banner */}
        <header className="glass-panel rounded-3xl p-6 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-extrabold flex items-center justify-center shadow-lg">
                <Crown size={18} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
                  사회자 전용 대시보드 (블라인드 솔로파티)
                </span>
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              {roomName}
              <span className="text-sm font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                코드: {partyCode}
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={simulateFirstImpressionVotes}
              className="px-3.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-xs font-bold text-purple-200 flex items-center gap-1.5 transition shadow"
            >
              <Dices size={14} className="text-purple-300" /> 첫인상 샘플 투표 생성
            </button>

            <button
              onClick={clearToEmptyParty}
              className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-xs font-bold text-red-200 flex items-center gap-1.5 transition shadow"
            >
              <RotateCcw size={14} className="text-red-400" /> 🧹 빈 파티로 초기화
            </button>

            <button
              onClick={resetDemoData}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
            >
              <Dices size={14} className="text-amber-400" /> 🎲 데모 인원 로드
            </button>

            <button
              onClick={() => toggleRevealResults(!isResultsRevealed)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shadow-lg ${
                isResultsRevealed
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:brightness-110'
              }`}
            >
              {isResultsRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
              {isResultsRevealed ? '결과 공개 해제' : '📢 최종 매칭 결과 & 연락처 모바일 공개!'}
            </button>

            {onToggleDevToolbar && (
              <button
                onClick={onToggleDevToolbar}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow ${
                  isDevToolbarOpen
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Sliders size={14} className="text-amber-400" />
                {isDevToolbarOpen ? '시뮬레이터 툴바 닫기' : '시뮬레이터 툴바 열기'}
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition"
              >
                <LogOut size={14} className="text-amber-400" /> 로그아웃
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Table & Seat Capacity Controller */}
        <section className="glass-card rounded-3xl p-5 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} /> 가변 인원 & 테이블 유동 세팅 컨트롤러
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              참석 인원(20명 미만 가변)에 따라 테이블 수와 좌석 수를 자유롭게 설정하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            {/* Tables Count Adjuster */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">테이블 개수:</span>
              <button
                onClick={() => setTablesCount(totalTables - 1)}
                disabled={totalTables <= 1}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 font-bold flex items-center justify-center border border-slate-700"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-black text-amber-400 w-6 text-center">{totalTables}개</span>
              <button
                onClick={() => setTablesCount(totalTables + 1)}
                disabled={totalTables >= 10}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 font-bold flex items-center justify-center border border-slate-700"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            {/* Seats per Table Adjuster */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">테이블당 좌석:</span>
              <button
                onClick={() => setSeatsPerTable(currentSeatsPerTable - 1)}
                disabled={currentSeatsPerTable <= 2}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 font-bold flex items-center justify-center border border-slate-700"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-black text-amber-400 w-6 text-center">{currentSeatsPerTable}석</span>
              <button
                onClick={() => setSeatsPerTable(currentSeatsPerTable + 1)}
                disabled={currentSeatsPerTable >= 10}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 font-bold flex items-center justify-center border border-slate-700"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Step Controller Ribbon */}
        <section className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Play size={16} className="fill-amber-300" /> 파티 4단계 진행 컨트롤러
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              현재 단계: <strong className="text-pink-400 font-bold">{STEPS_CONFIG.find(s => s.step === currentStep)?.label}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STEPS_CONFIG.map(({ step, label, desc }) => {
              const isActive = currentStep === step;
              return (
                <button
                  key={step}
                  onClick={() => setStep(step)}
                  className={`p-3.5 rounded-2xl text-left transition flex flex-col justify-between border ${
                    isActive
                      ? 'bg-gradient-to-br from-amber-500/30 to-pink-500/30 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-extrabold flex items-center justify-between mb-1">
                    {label}
                    {isActive && <CheckCircle2 size={14} className="text-amber-400" />}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">{desc}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400">남성 참가자</p>
              <h3 className="text-xl font-bold text-white">{maleList.length}명</h3>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400">여성 참가자</p>
              <h3 className="text-xl font-bold text-white">{femaleList.length}명</h3>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Flame size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400">1순위 매칭 커플</p>
              <h3 className="text-xl font-bold text-amber-300">{rank1Matches.length}쌍 🔥</h3>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Heart size={22} className="fill-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">2순위 매칭 커플</p>
              <h3 className="text-xl font-bold text-purple-300">{rank2Matches.length}쌍 💖</h3>
            </div>
          </div>
        </div>

        {/* Navigation View Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('PARTICIPANTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'PARTICIPANTS'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Users size={16} /> 👥 입장 명단 ({participants.length}명)
          </button>

          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'MATRIX'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Grid size={16} /> 실시간 호감 매트릭스
          </button>

          <button
            onClick={() => setActiveTab('TABLES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'TABLES'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Users size={16} /> 테이블 자리 배치 매니저 ({totalTables}개 테이블)
          </button>

          <button
            onClick={() => setActiveTab('MATCHES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'MATCHES'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Crown size={16} /> 상호 매칭 결과 ({mutualMatches.length}쌍)
          </button>
        </div>

        {/* Tab 0: Participants List */}
        {activeTab === 'PARTICIPANTS' && (
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-amber-400" /> 👥 파티 입장 참가자 현황 ({participants.length}명)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  현재 파티에 등록된 참가자 목록입니다. (남성 {maleList.length}명 / 여성 {femaleList.length}명)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTestModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-extrabold text-xs transition border border-purple-500/40 shadow flex items-center gap-1.5"
                >
                  <UserPlus size={14} className="text-purple-300" /> + 테스트 인원 추가
                </button>

                {participants.length === 0 && (
                  <button
                    onClick={resetDemoData}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow"
                  >
                    🎲 데모 인원 채우기
                  </button>
                )}
              </div>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                <Users size={40} className="mx-auto text-slate-600" />
                <h4 className="text-sm font-bold text-slate-300">아직 등록된 참가자가 없습니다</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  참가자가 모바일 화면에서 프로필을 입력하고 입장하거나 위 '+ 테스트 인원 추가' 버튼을 눌러 인원을 추가해 보세요.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(p.avatarUrl)}
                          alt={p.nickname}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/60 shadow"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-extrabold text-white">{p.nickname}</h4>
                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                p.gender === 'M' ? 'bg-blue-600/40 text-blue-200' : 'bg-pink-600/40 text-pink-200'
                              }`}
                            >
                              {p.gender === 'M' ? '남성' : '여성'}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-300">
                            테이블 {p.tableNo} 번
                          </p>
                        </div>
                      </div>

                      {/* Delete test participant button */}
                      <button
                        onClick={() => removeParticipant(p.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/60 transition"
                        title="이 참가자 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <p className="line-clamp-2 italic text-slate-300">"{p.bio || '대화 나누고 싶어요 🥂'}"</p>
                      {p.phone && (
                        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                          📞 {p.phone}
                        </div>
                      )}
                    </div>

                    {/* Switch to this user mobile login button */}
                    <button
                      onClick={() => {
                        setCurrentUserId(p.id);
                        if (onSwitchToParticipant) {
                          onSwitchToParticipant(p.id);
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:brightness-110 text-white font-extrabold text-xs transition shadow flex items-center justify-center gap-1.5"
                    >
                      <Smartphone size={14} /> 📱 이 참가자로 로그인 (모바일)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Real-time Heart Matrix Grid */}
        {activeTab === 'MATRIX' && (
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 overflow-x-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Grid size={18} className="text-amber-400" /> 실시간 첫인상 & 최종 호감 매트릭스
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  행(남성)과 열(여성) 간의 비공개 호감 표 내역입니다. 첫인상 데이터를 참고하여 테이블 로테이션을 배치해 보세요.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-pink-600 block" /> 1순위</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-600 block" /> 2순위</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 block" /> 🔥 1순위 커플</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-400 block" /> 💖 2순위 매칭</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-bold text-slate-400 border border-slate-800 bg-slate-950/80">
                      남성 \ 여성
                    </th>
                    {femaleList.map((f) => (
                      <th
                        key={f.id}
                        className="p-2 text-xs font-bold text-pink-300 border border-slate-800 bg-pink-950/20 min-w-[75px]"
                      >
                        <div>{f.nickname}</div>
                        <div className="text-[10px] text-slate-500 font-normal">T{f.tableNo}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {maleList.map((m) => (
                    <tr key={m.id}>
                      <th className="p-2 text-xs font-bold text-blue-300 border border-slate-800 bg-blue-950/20 text-left min-w-[95px]">
                        <div>{m.nickname}</div>
                        <div className="text-[10px] text-slate-500 font-normal">T{m.tableNo}</div>
                      </th>

                      {femaleList.map((f) => {
                        const targetRound = currentStep === 'FINAL_SELECT' || currentStep === 'RESULT_ANNOUNCE' ? 2 : 1;
                        const mToF = selections.find((s) => s.fromId === m.id && s.toId === f.id && s.round === targetRound);
                        const fToM = selections.find((s) => s.fromId === f.id && s.toId === m.id && s.round === targetRound);

                        const isMutual = !!mToF && !!fToM;
                        const isRank1Mutual = isMutual && mToF.rank === 1 && fToM.rank === 1;

                        return (
                          <td
                            key={f.id}
                            className={`p-2 border border-slate-800 text-xs font-bold transition ${
                              isRank1Mutual
                                ? 'bg-gradient-to-r from-amber-500/30 to-pink-500/30 border-amber-400 ring-1 ring-amber-400/50'
                                : isMutual
                                ? 'bg-purple-950/40 border-purple-500/40'
                                : mToF
                                ? 'bg-slate-900'
                                : 'bg-slate-950/40 text-slate-600'
                            }`}
                          >
                            {isRank1Mutual ? (
                              <div className="flex flex-col items-center justify-center text-amber-300">
                                <span className="text-sm animate-bounce">🔥</span>
                                <span className="text-[9px] font-extrabold text-amber-300">1순위 커플</span>
                              </div>
                            ) : isMutual ? (
                              <div className="flex flex-col items-center justify-center text-purple-300">
                                <span className="text-sm">💖</span>
                                <span className="text-[9px] font-bold text-purple-300">2순위 매칭</span>
                              </div>
                            ) : mToF ? (
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] text-white ${
                                  mToF.rank === 1 ? 'bg-pink-600' : 'bg-purple-600'
                                }`}
                              >
                                {mToF.rank}순위
                              </span>
                            ) : fToM ? (
                              <span className="text-[10px] text-slate-500 italic">
                                (수신 {fToM.rank}순위)
                              </span>
                            ) : (
                              <span className="text-slate-800">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Table Seating Manager */}
        {activeTab === 'TABLES' && (
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-amber-400" /> 테이블 자리 배치 매니저 ({totalTables}개 테이블 / 석당 {currentSeatsPerTable}명)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  첫인상 호감 구도를 참고하여 호감이 연결된 참가자들을 동종 테이블로 배치하거나 로테이션할 수 있습니다.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={rebalanceSeating}
                  className="px-3.5 py-2.5 rounded-xl bg-purple-900/80 text-purple-200 border border-purple-500/40 text-xs font-bold hover:bg-purple-800 flex items-center gap-1.5 shadow"
                  title="설정된 테이블수와 테이블당 좌석수에 맞춰 참가자들을 균등 배치합니다."
                >
                  <RefreshCw size={15} /> 🔄 테이블 좌석 균등 배치
                </button>

                <button
                  onClick={handleSmartSeatingByFirstImpression}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold hover:bg-amber-400 shadow-lg flex items-center gap-1.5"
                >
                  <Sparkles size={15} /> 첫인상 기반 우선배치
                </button>

                <button
                  onClick={handleAutoRotateTables}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-950/80 text-blue-200 border border-blue-500/40 text-xs font-bold hover:bg-blue-900 flex items-center gap-1.5 shadow"
                >
                  <RotateCcw size={15} /> ♂️ 남성 순차 로테이션
                </button>

                <button
                  onClick={handleFemaleRotateTables}
                  className="px-3.5 py-2.5 rounded-xl bg-pink-950/80 text-pink-200 border border-pink-500/40 text-xs font-bold hover:bg-pink-900 flex items-center gap-1.5 shadow"
                >
                  <RotateCcw size={15} /> ♀️ 여성 순차 로테이션
                </button>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: totalTables }, (_, i) => i + 1).map((tableNo) => {
                const tableParticipants = participants.filter((p) => p.tableNo === tableNo);

                return (
                  <div
                    key={tableNo}
                    className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-extrabold text-amber-300">테이블 {tableNo}</h4>
                      <span className="text-[10px] text-slate-400">{tableParticipants.length}/{currentSeatsPerTable}명</span>
                    </div>

                    <div className="space-y-2 min-h-[120px]">
                      {tableParticipants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={getAvatarUrl(p.avatarUrl)}
                              alt={p.nickname}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold text-white">{p.nickname}</div>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              p.gender === 'M' ? 'bg-blue-600/30 text-blue-300' : 'bg-pink-600/30 text-pink-300'
                            }`}
                          >
                            {p.gender === 'M' ? '남' : '여'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Mutual Matches List */}
        {activeTab === 'MATCHES' && (
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Crown size={18} className="text-amber-400" /> 상호 매칭 현황 (1순위 🔥 {rank1Matches.length}쌍 / 2순위 💖 {rank2Matches.length}쌍)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  결과 공개 버튼을 누르면 참가자 모바일 화면으로 1순위/2순위 매칭 커플 및 연락처가 전송됩니다.
                </p>
              </div>

              <div className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                상태: {isResultsRevealed ? '🟢 모바일 공개 완료' : '🔴 비공개 (발표 대기)'}
              </div>
            </div>

            {mutualMatches.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                현재 생성된 상호 매칭 커플이 없습니다. 참가자들이 최종 선택을 제출하면 매칭이 계산됩니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mutualMatches.map((m, idx) => {
                  const p1 = participants.find((p) => p.id === m.user1Id);
                  const p2 = participants.find((p) => p.id === m.user2Id);
                  if (!p1 || !p2) return null;

                  const isRank1Match = m.matchType === 'RANK1_MUTUAL';

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl p-4 flex items-center justify-between border ${
                        isRank1Match
                          ? 'glass-gold-card border-amber-400 shadow-lg'
                          : 'glass-card border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(p1.avatarUrl)}
                          alt={p1.nickname}
                          className="w-12 h-12 rounded-full object-cover border border-amber-400"
                        />
                        <div>
                          <div className="text-sm font-bold text-white">{p1.nickname} ({p1.gender === 'M' ? '남' : '여'})</div>
                          <div className="text-xs text-amber-300 font-mono">📞 {p1.phone || '미등록'}</div>
                        </div>
                      </div>

                      <div className="text-center px-2">
                        <span className="text-xl heart-pulse block">{isRank1Match ? '🔥' : '💖'}</span>
                        <span className={`text-[10px] font-extrabold ${isRank1Match ? 'text-amber-300' : 'text-purple-300'}`}>
                          {isRank1Match ? '1순위 커플' : '2순위 매칭'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="text-sm font-bold text-white">{p2.nickname} ({p2.gender === 'M' ? '남' : '여'})</div>
                          <div className="text-xs text-amber-300 font-mono">📞 {p2.phone || '미등록'}</div>
                        </div>
                        <img
                          src={getAvatarUrl(p2.avatarUrl)}
                          alt={p2.nickname}
                          className="w-12 h-12 rounded-full object-cover border border-pink-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      <TestParticipantModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
};


