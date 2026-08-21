export type Gender = 'M' | 'F';

export type MaritalStatus = '미혼' | '돌싱';
export type ChildrenStatus = '자녀 없음' | '자녀 있음(비양육)' | '자녀 있음(양육)';

export type PartyStep =
  | 'WAITING'           // 1단계: 파티 대기 (참가자 입장 및 프로필 준비)
  | 'FIRST_INTRO'       // 2단계: 1차 자기소개 (기본 프로필 확인 & 인디케이터)
  | 'FIRST_IMPRESSION'  // 3단계: 1차 호감선택 (비공개 1, 2지망 호감 선택)
  | 'ROTATION'          // 4단계: 로테이션 & 자리배치 (사회자 안내에 따른 테이블 이동)
  | 'ROUND2_SELECT'     // 5단계: 2차 호감선택 (대화 후 깊은 호감 선택)
  | 'FINAL_SELECT'      // 6단계: 최종 지망선택 (최종 1, 2지망 입력)
  | 'RESULT_ANNOUNCE';  // 7단계: 최종 매칭 결과 발표 (모바일 결과 & 상호 매칭 공개)

export interface LoveStyle {
  relationshipType: string;
  dateStyle: string;
  weekendHobby?: string;
}

export interface Participant {
  id: string;
  nickname: string;
  realName?: string;
  gender: Gender;
  age: string;
  job: string;
  bio: string;
  tableNo: number;
  seatNo: number;
  avatarUrl: string;
  phone?: string;
  maritalStatus: MaritalStatus;
  hasChildren: ChildrenStatus;
  loveStyle: LoveStyle;
}

export interface Selection {
  fromId: string;
  toId: string;
  round: number;            // 1: 첫인상, 2: 2차, 3: 최종
  rank: 1 | 2;              // 1순위, 2순위
  timestamp: number;
}

export interface MutualMatch {
  user1Id: string;
  user2Id: string;
  rankUser1To2: 1 | 2;
  rankUser2To1: 1 | 2;
  matchedAtRound: number;
  matchType: 'RANK1_MUTUAL' | 'RANK2_MUTUAL'; // 1순위 매칭 vs 2순위 매칭
}

export interface PartyState {
  partyCode: string;
  roomName: string;
  currentStep: PartyStep;
  tablesCount: number;
  seatsPerTable: number;
  participants: Participant[];
  selections: Selection[];
  isResultsRevealed: boolean;
  notes: Record<string, Record<string, string>>;
}
