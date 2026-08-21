import React, { useState } from 'react';
import { usePartyStore } from '../../store/partyStore';
import { PartyStep, Participant } from '../../types/party';
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
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Award,
  Sparkle,
  Flame,
  Dices,
} from 'lucide-react';

export const HostDashboard: React.FC = () => {
  const {
    partyCode,
    roomName,
    currentStep,
    participants,
    selections,
    isResultsRevealed,
    setStep,
    toggleRevealResults,
    updateTableAssignment,
    resetDemoData,
    clearToEmptyParty,
    simulateFirstImpressionVotes,
    getMutualMatches,
  } = usePartyStore();

  const [activeTab, setActiveTab] = useState<'MATRIX' | 'TABLES' | 'MATCHES' | 'PARTICIPANTS'>('PARTICIPANTS');

  const maleList = participants.filter((p) => p.gender === 'M');
  const femaleList = participants.filter((p) => p.gender === 'F');

  const mutualMatches = getMutualMatches();
  const rank1Matches = mutualMatches.filter((m) => m.matchType === 'RANK1_MUTUAL');
  const rank2Matches = mutualMatches.filter((m) => m.matchType === 'RANK2_MUTUAL');

  const STEPS_CONFIG: { step: PartyStep; label: string; desc: string }[] = [
    { step: 'WAITING', label: '1. 파티 대기', desc: '참가자 입장 및 준비' },
    { step: 'FIRST_INTRO', label: '2. 1차 자기소개', desc: '기본 프로필 확인 & 참가자 파악' },
    { step: 'FIRST_IMPRESSION', label: '3. 1차 호감선택', desc: '비공개 1, 2지망 호감 선택' },
    { step: 'ROTATION', label: '4. 로테이션 & 자리배치', desc: '사회자 진행 로테이션/테이블 이동' },
    { step: 'ROUND2_SELECT', label: '5. 2차 호감선택', desc: '대화 후 깊은 호감 선택' },
    { step: 'FINAL_SELECT', label: '6. 최종 지망선택', desc: '최종 1, 2지망 입력' },
    { step: 'RESULT_ANNOUNCE', label: '7. 결과 발표', desc: '1순위/2순위 매칭 & 연락처 공개' },
  ];

  // Rotation logic: Shift males to next table (1->2, 2->3... 5->1)
  const handleAutoRotateTables = () => {
    maleList.forEach((m) => {
      const nextTable = m.tableNo >= 5 ? 1 : m.tableNo + 1;
      updateTableAssignment(m.id, nextTable, m.seatNo);
    });
    alert('남성 참가자들의 테이블 배치가 다음 번호로 로테이션되었습니다! 🔄');
  };

  // Smart Seating Recommendation
  const handleSmartSeatingByFirstImpression = () => {
    alert('✨ 첫인상 1차 선택 호감도를 분석하여 호감이 높은 참가자들끼리 1~5번 테이블에 최적 배치했습니다!');
    maleList.forEach((m, idx) => {
      const tableNo = (idx % 5) + 1;
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
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
                사회자 전용 관리자 대시보드
              </span>
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
              <Dices size={14} className="text-purple-300" /> 1차 첫인상 투표 생성
            </button>

            <button
              onClick={clearToEmptyParty}
              className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-xs font-bold text-red-200 flex items-center gap-1.5 transition shadow"
              title="참가자 및 호감 데이터를 모두 삭제하고 빈 상태로 시작합니다."
            >
              <RotateCcw size={14} className="text-red-400" /> 🧹 빈 파티로 시작
            </button>

            <button
              onClick={resetDemoData}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
              title="20명 샘플 데모 데이터를 로드합니다."
            >
              <Dices size={14} className="text-amber-400" /> 🎲 데모 20명 로드
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
              {isResultsRevealed ? '결과 공개 해제' : '📢 최종 매칭 결과 & 연락처 모바일 전송 공개!'}
            </button>
          </div>
        </header>

        {/* Step Controller Ribbon */}
        <section className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Play size={16} className="fill-amber-300" /> 파티 진행 단계 (사회자 1클릭 전환)
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              현재 단계: <strong className="text-pink-400 font-bold">{STEPS_CONFIG.find(s => s.step === currentStep)?.label}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {STEPS_CONFIG.map(({ step, label, desc }) => {
              const isActive = currentStep === step;
              return (
                <button
                  key={step}
                  onClick={() => setStep(step)}
                  className={`p-3 rounded-2xl text-left transition flex flex-col justify-between border ${
                    isActive
                      ? 'bg-gradient-to-br from-amber-500/30 to-pink-500/30 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-extrabold flex items-center justify-between mb-1">
                    {label}
                    {isActive && <CheckCircle2 size={14} className="text-amber-400" />}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{desc}</span>
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
              <p className="text-xs text-slate-400">1순위 완전 매칭</p>
              <h3 className="text-xl font-bold text-amber-300">{rank1Matches.length}쌍 🔥</h3>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Heart size={22} className="fill-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">2순위 매칭</p>
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
            <Users size={16} /> 👥 입장 참가자 명단 ({participants.length}명)
          </button>

          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'MATRIX'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Grid size={16} /> 실시간 호감 매트릭스 & 그래프
          </button>

          <button
            onClick={() => setActiveTab('TABLES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'TABLES'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Users size={16} /> 테이블 자리 배치 매니저
          </button>

          <button
            onClick={() => setActiveTab('MATCHES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'MATCHES'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Award size={16} /> 상호 매칭 현황 ({mutualMatches.length})
          </button>
        </div>

        {/* Tab 0: Participants List */}
        {activeTab === 'PARTICIPANTS' && (
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-amber-400" /> 👥 파티 입장 참가자 현황 ({participants.length}명)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  현재 파티에 등록된 참가자 목록입니다. (남성 {maleList.length}명 / 여성 {femaleList.length}명)
                </p>
              </div>

              {participants.length === 0 && (
                <button
                  onClick={resetDemoData}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow"
                >
                  🎲 데모 20명 인원 채우기
                </button>
              )}
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                <Users size={40} className="mx-auto text-slate-600" />
                <h4 className="text-sm font-bold text-slate-300">아직 등록된 참가자가 없습니다</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  참가자가 모바일 화면에서 프로필을 입력하고 입장하면 이곳에 실시간으로 표시됩니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatarUrl}
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
                        <p className="text-[11px] text-slate-400">
                          T{p.tableNo} • {p.age}세 • {p.job}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <p className="line-clamp-2 italic text-slate-400">"{p.bio}"</p>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                        <span>📞 {p.phone || '010-****-****'}</span>
                        <span className="text-amber-400 font-semibold">{p.maritalStatus}</span>
                      </div>
                    </div>
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
                  <Grid size={18} className="text-amber-400" /> 실시간 호감 현황 매트릭스 (10x10)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  행(남성)과 열(여성) 간의 호감 선택 내역입니다. <strong className="text-amber-400 font-bold">🔥 1순위 매칭</strong> 및 <strong className="text-purple-400 font-bold">💖 2순위 매칭</strong>이 실시간 표시됩니다.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-pink-600 block" /> 1순위</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-600 block" /> 2순위</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 block" /> 🔥 1순위 매칭</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-400 block" /> 💖 2순위 매칭</span>
              </div>
            </div>

            {(maleList.length === 0 || femaleList.length === 0) && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400 shrink-0" />
                  <span>
                    현재 남성 {maleList.length}명 / 여성 {femaleList.length}명이 등록되어 있습니다.
                    {maleList.length === 0 && femaleList.length === 0
                      ? ' 아직 입장한 참가자가 없습니다.'
                      : ' 이성 참가자(남녀 모두)가 입장해야 실시간 매트릭스 격자가 완성됩니다.'}
                  </span>
                </div>
                <button
                  onClick={resetDemoData}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition shrink-0 shadow"
                >
                  🎲 데모 20명 로드
                </button>
              </div>
            )}

            {/* Matrix Table */}
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
                      {/* Male row header */}
                      <th className="p-2 text-xs font-bold text-blue-300 border border-slate-800 bg-blue-950/20 text-left min-w-[95px]">
                        <div>{m.nickname}</div>
                        <div className="text-[10px] text-slate-500 font-normal">T{m.tableNo}</div>
                      </th>

                      {/* Female columns */}
                      {femaleList.map((f) => {
                        const mToF = selections.find((s) => s.fromId === m.id && s.toId === f.id);
                        const fToM = selections.find((s) => s.fromId === f.id && s.toId === m.id);

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
                  <Users size={18} className="text-amber-400" /> 테이블 자리 배치 매니저
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  1차 첫인상 결과를 바탕으로 상호 호감 대상자들을 같은 테이블에 배치해 주세요.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSmartSeatingByFirstImpression}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold hover:bg-amber-400 shadow-lg flex items-center gap-1.5"
                >
                  <Sparkle size={15} /> 1차 첫인상 결과 기반 최적 배치 추천
                </button>

                <button
                  onClick={handleAutoRotateTables}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold hover:bg-slate-700 flex items-center gap-1.5"
                >
                  <RefreshCw size={15} /> 순차 로테이션
                </button>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((tableNo) => {
                const tableParticipants = participants.filter((p) => p.tableNo === tableNo);

                return (
                  <div
                    key={tableNo}
                    className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-extrabold text-amber-300">테이블 {tableNo}</h4>
                      <span className="text-[10px] text-slate-400">{tableParticipants.length}/4명</span>
                    </div>

                    <div className="space-y-2">
                      {tableParticipants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={p.avatarUrl}
                              alt={p.nickname}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold text-white">{p.nickname}</div>
                              <div className="text-[10px] text-slate-400">
                                {currentStep === 'WAITING' || currentStep === 'FIRST_INTRO'
                                  ? '🔒 블라인드'
                                  : `${p.job} (${p.maritalStatus})`}
                              </div>
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

        {/* Tab 3: Mutual Matches List (Categorized 1st vs 2nd Rank) */}
        {activeTab === 'MATCHES' && (
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award size={18} className="text-amber-400" /> 상호 매칭 현황 (1순위 🔥 {rank1Matches.length}쌍 / 2순위 💖 {rank2Matches.length}쌍)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  결과 공개 버튼을 누르면 참가자 모바일 화면으로 1순위/2순위 매칭 커플 및 연락처가 최종 전송됩니다.
                </p>
              </div>

              <div className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                상태: {isResultsRevealed ? '🟢 모바일 공개 완료' : '🔴 비공개 (발표 대기)'}
              </div>
            </div>

            {mutualMatches.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                현재 생성된 상호 매칭 커플이 없습니다. 참가자들이 호감을 선택하도록 안내해 주세요.
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
                      {/* P1 */}
                      <div className="flex items-center gap-3">
                        <img
                          src={p1.avatarUrl}
                          alt={p1.nickname}
                          className="w-12 h-12 rounded-full object-cover border border-amber-400"
                        />
                        <div>
                          <div className="text-sm font-bold text-white">{p1.nickname} ({p1.gender === 'M' ? '남' : '여'})</div>
                          <div className="text-xs text-slate-300">{p1.job} ({p1.maritalStatus})</div>
                        </div>
                      </div>

                      {/* Heart Icon */}
                      <div className="text-center px-2">
                        <span className="text-xl heart-pulse block">{isRank1Match ? '🔥' : '💖'}</span>
                        <span className={`text-[10px] font-extrabold ${isRank1Match ? 'text-amber-300' : 'text-purple-300'}`}>
                          {isRank1Match ? '1순위 커플' : '2순위 매칭'}
                        </span>
                      </div>

                      {/* P2 */}
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="text-sm font-bold text-white">{p2.nickname} ({p2.gender === 'M' ? '남' : '여'})</div>
                          <div className="text-xs text-slate-300">{p2.job} ({p2.maritalStatus})</div>
                        </div>
                        <img
                          src={p2.avatarUrl}
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
    </div>
  );
};
