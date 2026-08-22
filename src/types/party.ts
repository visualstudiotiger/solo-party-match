export type Gender = 'M' | 'F';

export type PartyStep =
  | 'WAITING'           // 1단계: 파티 대기 (참가자 입장 및 프로필 등록)
  | 'FIRST_IMPRESSION'  // 2단계: 첫인상 호감 선택 (비공개 1, 2지망 선택)
  | 'PARTY_IN_PROGRESS' // 3단계: 파티 진행 & 로테이션 (오프라인 대화 전념, 앱 조작 중단)
  | 'FINAL_SELECT'      // 4단계: 최종 지망 선택 (최종 1, 2지망 입력)
  | 'RESULT_ANNOUNCE';  // 5단계: 최종 매칭 결과 발표 (모바일 결과 & 상호 매칭 공개)

export interface Participant {
  id: string;
  nickname: string;
  gender: Gender;
  avatarUrl: string;
  bio: string;             // 한 줄 소개 / 취향 키워드
  tableNo: number;
  seatNo: number;
  phone?: string;
  age?: string;            // 비공개/사회자 참고용 옵션
  job?: string;            // 비공개/사회자 참고용 옵션
}

export interface Selection {
  fromId: string;
  toId: string;
  round: 1 | 2;             // 1: 첫인상 선택, 2: 최종 선택
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
  tablesCount: number;      // 동적 테이블 개수 (2~6개 가변)
  seatsPerTable: number;    // 테이블당 자리수 (2~8개 가변)
  participants: Participant[];
  selections: Selection[];
  isResultsRevealed: boolean;
  notes: Record<string, Record<string, string>>;
}

