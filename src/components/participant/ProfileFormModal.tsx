import React, { useState } from 'react';
import { Participant, Gender, MaritalStatus, ChildrenStatus } from '../../types/party';
import { X, User, Briefcase, Calendar, Heart, Utensils, Tv, Check, Users, Home } from 'lucide-react';

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
  const [age, setAge] = useState(participant?.age || '33');
  const [job, setJob] = useState(participant?.job || '');
  const [bio, setBio] = useState(participant?.bio || '');
  const [phone, setPhone] = useState(participant?.phone || '');
  
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(
    participant?.maritalStatus || '미혼'
  );
  const [hasChildren, setHasChildren] = useState<ChildrenStatus>(
    participant?.hasChildren || '자녀 없음'
  );

  const [relationshipType, setRelationshipType] = useState(
    participant?.loveStyle?.relationshipType || '친구같은 연애'
  );
  const [dateStyle, setDateStyle] = useState(
    participant?.loveStyle?.dateStyle || '삼겹살에 소주파'
  );
  const [weekendHobby, setWeekendHobby] = useState(
    participant?.loveStyle?.weekendHobby || '야외 드라이브'
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
      age,
      job,
      bio,
      phone,
      maritalStatus,
      hasChildren,
      loveStyle: {
        relationshipType,
        dateStyle,
        weekendHobby,
      },
    });
    onClose();
  };

  const isCreate = mode === 'CREATE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-amber-500/20 shadow-2xl p-6 text-slate-100">
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
            {isCreate ? '🎉 파티 입장 프로필 등록' : '✏️ 프로필 정보 수정'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isCreate
              ? '파티에 입장할 본인의 닉네임과 연애 취향 프로필을 설정해 주세요.'
              : '변경할 프로필 및 연애 취향 정보를 업데이트합니다.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 닉네임 (자유 지정) */}
          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              본인 지정 닉네임 (별명) <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 호야, 데이비드, 루시"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 focus:border-amber-400 focus:outline-none text-sm text-white placeholder-slate-500"
              required
            />
          </div>

          {/* 성별 & 나이 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">성별</label>
              <div className="flex rounded-xl bg-slate-900/80 border border-slate-700/70 p-1">
                <button
                  type="button"
                  onClick={() => setGender('M')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                    gender === 'M'
                      ? 'bg-blue-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => setGender('F')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                    gender === 'F'
                      ? 'bg-pink-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  여성
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">나이</label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="예: 34"
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/70 focus:border-amber-400 focus:outline-none text-sm text-white"
              />
            </div>
          </div>

          {/* 직업 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">직업 / 분야</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="예: IT 기획자, 디자이너, 연구원"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/70 focus:border-amber-400 focus:outline-none text-sm text-white"
              />
            </div>
          </div>

          {/* 돌싱 유무 & 자녀 유무 선택 (신규) */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              💍 혼인 상태 및 자녀 정보 설정
            </h3>

            {/* 돌싱 유무 */}
            <div>
              <label className="block text-xs text-slate-300 mb-1">혼인 상태 (돌싱 유무)</label>
              <div className="grid grid-cols-2 gap-2">
                {(['미혼', '돌싱'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setMaritalStatus(status)}
                    className={`py-2 px-3 text-xs rounded-xl font-medium border text-center transition ${
                      maritalStatus === status
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {maritalStatus === status && <Check className="inline-block w-3.5 h-3.5 mr-1" />}
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* 자녀 유무 */}
            <div>
              <label className="block text-xs text-slate-300 mb-1">자녀 유무</label>
              <div className="grid grid-cols-3 gap-2">
                {(['자녀 없음', '자녀 있음(비양육)', '자녀 있음(양육)'] as const).map((cStatus) => (
                  <button
                    key={cStatus}
                    type="button"
                    onClick={() => setHasChildren(cStatus)}
                    className={`py-2 px-2 text-[11px] rounded-xl font-medium border text-center transition ${
                      hasChildren === cStatus
                        ? 'bg-pink-500/20 border-pink-400 text-pink-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {hasChildren === cStatus && <Check className="inline-block w-3 h-3 mr-1" />}
                    {cStatus}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 한 줄 소개 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">간단 자기소개 (Bio)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="취미, 관심사 또는 파티 임하는 한 마디!"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/70 focus:border-amber-400 focus:outline-none text-sm text-white placeholder-slate-500"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-xs font-semibold text-pink-300 mb-1">
              연락처 (상호 매칭 시에만 상대에게 공개)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/70 focus:border-amber-400 focus:outline-none text-sm text-white placeholder-slate-500"
            />
          </div>

          {/* 연애 취향 / 이상형 선택 */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              💘 연애 취향 & 데이트 스타일
            </h3>

            {/* Q1: 원하는 연애 분위기 */}
            <div>
              <p className="text-xs text-slate-300 mb-1.5">내가 원하는 연애 분위기</p>
              <div className="grid grid-cols-3 gap-2">
                {['친구같은 연애', '완전 설레는 연애', '상관없어요'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRelationshipType(opt)}
                    className={`py-2 px-2 text-[11px] rounded-xl font-medium border text-center transition ${
                      relationshipType === opt
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {relationshipType === opt && <Check className="inline-block w-3 h-3 mr-1" />}
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: 첫 만남 데이트 */}
            <div>
              <p className="text-xs text-slate-300 mb-1.5">첫 만남에서 하고 싶은 데이트</p>
              <div className="grid grid-cols-3 gap-2">
                {['삼겹살에 소주파', '파인다이닝파', '상관없어요'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDateStyle(opt)}
                    className={`py-2 px-2 text-[11px] rounded-xl font-medium border text-center transition ${
                      dateStyle === opt
                        ? 'bg-pink-500/20 border-pink-400 text-pink-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dateStyle === opt && <Check className="inline-block w-3 h-3 mr-1" />}
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: 주말 스타일 */}
            <div>
              <p className="text-xs text-slate-300 mb-1.5">주말 여가 스타일</p>
              <div className="grid grid-cols-3 gap-2">
                {['집에서 넷플릭스', '야외 드라이브', '상관없어요'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWeekendHobby(opt)}
                    className={`py-2 px-2 text-[11px] rounded-xl font-medium border text-center transition ${
                      weekendHobby === opt
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {weekendHobby === opt && <Check className="inline-block w-3 h-3 mr-1" />}
                    {opt}
                  </button>
                ))}
              </div>
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
              {isCreate ? '🎉 파티 입장 등록 완료하기' : '프로필 수정 저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
