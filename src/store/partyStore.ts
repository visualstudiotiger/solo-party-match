import { create } from 'zustand';
import { PartyState, PartyStep, Participant, Selection, MutualMatch } from '../types/party';
import { INITIAL_PARTY_CODE, INITIAL_ROOM_NAME, INITIAL_PARTICIPANTS } from '../data/mockPartyData';

interface PartyStoreState extends PartyState {
  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;
  
  // Actions
  setStep: (step: PartyStep) => void;
  setTablesCount: (count: number) => void;
  setSeatsPerTable: (count: number) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  addParticipant: (participant: Participant) => void;
  registerNewParticipant: (participantData: Partial<Participant>) => Participant;
  submitSelection: (fromId: string, toId: string, rank: 1 | 2, round?: 1 | 2) => void;
  removeSelection: (fromId: string, toId: string, round: 1 | 2) => void;
  saveNote: (myUserId: string, targetUserId: string, note: string) => void;
  updateTableAssignment: (participantId: string, tableNo: number, seatNo: number) => void;
  toggleRevealResults: (revealed: boolean) => void;
  resetDemoData: () => void;
  clearToEmptyParty: () => void;
  simulateFirstImpressionVotes: () => void;
  removeParticipant: (id: string) => void;
  addQuickTestParticipant: (gender: 'M' | 'F') => Participant;
  rebalanceSeating: () => void;
  autoGenerateVotes: (round: 1 | 2) => void;




  
  // Computed / Helper getters
  getMutualMatches: () => MutualMatch[];
  getSentSelections: (userId: string, round?: 1 | 2) => Selection[];
  getReceivedCount: (userId: string) => number;
}

const STORAGE_KEY = 'soloparty_state_v2';
const CHANNEL_NAME = 'soloparty_broadcast_channel';

// Helper to generate demo 1st impression & final selections for mock data
const generateDemoFirstImpressionSelections = (participants: Participant[]): Selection[] => {
  const males = participants.filter((p) => p.gender === 'M');
  const females = participants.filter((p) => p.gender === 'F');
  const list: Selection[] = [];

  if (males.length === 0 || females.length === 0) return [];

  // Males voting females for Round 1 (첫인상)
  males.forEach((m, idx) => {
    const f1Index = idx % females.length;
    const f2Index = (idx + 3) % females.length;

    list.push({
      fromId: m.id,
      toId: females[f1Index].id,
      rank: 1,
      round: 1,
      timestamp: Date.now() - 300000 + idx * 100,
    });
    list.push({
      fromId: m.id,
      toId: females[f2Index].id,
      rank: 2,
      round: 1,
      timestamp: Date.now() - 300000 + idx * 100 + 10,
    });
  });

  // Females voting males for Round 1 (첫인상)
  females.forEach((f, idx) => {
    const m1Index = (idx + 1) % males.length;
    const m2Index = (idx + 4) % males.length;

    list.push({
      fromId: f.id,
      toId: males[m1Index].id,
      rank: 1,
      round: 1,
      timestamp: Date.now() - 300000 + idx * 100 + 20,
    });
    list.push({
      fromId: f.id,
      toId: males[m2Index].id,
      rank: 2,
      round: 1,
      timestamp: Date.now() - 300000 + idx * 100 + 30,
    });
  });

  // Add Round 2 (최종 선택) sample matches for demo
  list.push(
    { fromId: 'm1', toId: 'f1', round: 2, rank: 1, timestamp: Date.now() - 100000 },
    { fromId: 'f1', toId: 'm1', round: 2, rank: 1, timestamp: Date.now() - 100000 },

    { fromId: 'm2', toId: 'f2', round: 2, rank: 1, timestamp: Date.now() - 90000 },
    { fromId: 'f2', toId: 'm2', round: 2, rank: 1, timestamp: Date.now() - 90000 },

    { fromId: 'm3', toId: 'f4', round: 2, rank: 1, timestamp: Date.now() - 80000 },
    { fromId: 'f4', toId: 'm3', round: 2, rank: 2, timestamp: Date.now() - 80000 }
  );

  return list;
};

// Setup BroadcastChannel for real-time multi-tab synchronization
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel(CHANNEL_NAME)
  : null;

const loadInitialState = (): PartyState => {
  const emptyDefault: PartyState = {
    partyCode: INITIAL_PARTY_CODE,
    roomName: INITIAL_ROOM_NAME,
    currentStep: 'WAITING',
    tablesCount: 4,
    seatsPerTable: 4,
    participants: [],
    selections: [],
    isResultsRevealed: false,
    notes: {},
  };

  if (typeof window === 'undefined') {
    return emptyDefault;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const roomName = parsed.roomName || INITIAL_ROOM_NAME;
      const storedParticipants = parsed.participants || [];

      return {
        ...parsed,
        roomName,
        tablesCount: parsed.tablesCount || 4,
        seatsPerTable: parsed.seatsPerTable || 4,
        participants: storedParticipants,
        selections: parsed.selections || [],
      };
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }

  return emptyDefault;
};

const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const CLIENT_ID = typeof window !== 'undefined'
  ? (window as any).__SOLOPARTY_CLIENT_ID || ((window as any).__SOLOPARTY_CLIENT_ID = 'client_' + Math.random().toString(36).substring(2, 9))
  : 'server';

let lastCloudSyncTimestamp = 0;

const publishCloudSync = (fullState: any) => {
  if (typeof window === 'undefined' || isLocalhost) return;

  try {
    const partyCode = fullState.partyCode || INITIAL_PARTY_CODE;
    const channelId = `soloparty_${partyCode}`;
    const payloadData = {
      senderId: CLIENT_ID,
      payload: fullState,
      timestamp: Date.now(),
    };
    lastCloudSyncTimestamp = payloadData.timestamp;
    const url = `https://ps.pubnub.com/publish/demo/demo/0/${channelId}/0/${encodeURIComponent(JSON.stringify(payloadData))}`;
    fetch(url).catch(() => {});
  } catch (e) {
    console.error('Cloud sync publish error:', e);
  }
};

export const fetchCloudSync = async () => {
  if (typeof window === 'undefined' || isLocalhost) return;
  try {
    const partyCode = usePartyStore.getState().partyCode || INITIAL_PARTY_CODE;
    const channelId = `soloparty_${partyCode}`;
    const url = `https://ps.pubnub.com/v2/history/sub-key/demo/channel/${channelId}?count=3`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0]) && data[0].length > 0) {
      const latestMsg = data[0][data[0].length - 1];
      if (
        latestMsg &&
        latestMsg.payload &&
        latestMsg.senderId !== CLIENT_ID &&
        latestMsg.timestamp > lastCloudSyncTimestamp
      ) {
        lastCloudSyncTimestamp = latestMsg.timestamp;
        const currentLocal = usePartyStore.getState();

        let localUserId = currentLocal.currentUserId;
        const newParticipants: Participant[] = latestMsg.payload.participants || [];
        const newSelections: Selection[] = latestMsg.payload.selections || [];

        if (localUserId && !newParticipants.some((p) => p.id === localUserId)) {
          localUserId = null;
        }

        const newState: Partial<PartyState> = {
          partyCode: latestMsg.payload.partyCode || currentLocal.partyCode,
          roomName: latestMsg.payload.roomName || currentLocal.roomName,
          currentStep: latestMsg.payload.currentStep || 'WAITING',
          tablesCount: latestMsg.payload.tablesCount || 4,
          seatsPerTable: latestMsg.payload.seatsPerTable || 4,
          participants: newParticipants,
          selections: newSelections,
          isResultsRevealed: typeof latestMsg.payload.isResultsRevealed === 'boolean'
            ? latestMsg.payload.isResultsRevealed
            : false,
          notes: latestMsg.payload.notes || {},
        };

        usePartyStore.setState({
          ...newState,
          currentUserId: localUserId,
        } as any);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      }
    }
  } catch (e) {
    // Silent catch
  }
};

// Helper to balance participants into tables based on tablesCount and seatsPerTable
const rebalanceParticipantSeating = (
  participants: Participant[],
  tablesCount: number,
  seatsPerTable: number
): Participant[] => {
  if (participants.length === 0) return [];

  const males = participants.filter((p) => p.gender === 'M');
  const females = participants.filter((p) => p.gender === 'F');

  const maxMalePerTable = Math.max(1, Math.floor(seatsPerTable / 2));
  const updatedMap = new Map<string, { tableNo: number; seatNo: number }>();

  // Assign Males evenly across tables
  males.forEach((m, idx) => {
    const tableNo = (idx % tablesCount) + 1;
    const seatNo = Math.floor(idx / tablesCount) + 1;
    updatedMap.set(m.id, { tableNo, seatNo });
  });

  // Assign Females evenly across tables
  females.forEach((f, idx) => {
    const tableNo = (idx % tablesCount) + 1;
    const seatNo = maxMalePerTable + Math.floor(idx / tablesCount) + 1;
    updatedMap.set(f.id, { tableNo, seatNo });
  });

  return participants.map((p) => {
    const assigned = updatedMap.get(p.id);
    if (assigned) {
      return {
        ...p,
        tableNo: assigned.tableNo,
        seatNo: assigned.seatNo,
      };
    }
    return p;
  });
};

export const usePartyStore = create<PartyStoreState>((set, get) => {
  const initial = loadInitialState();

  const syncState = (newState: Partial<PartyState>) => {
    set(newState as any);
    const fullState = {
      partyCode: get().partyCode,
      roomName: get().roomName,
      currentStep: get().currentStep,
      tablesCount: get().tablesCount,
      seatsPerTable: get().seatsPerTable,
      participants: get().participants,
      selections: get().selections,
      isResultsRevealed: get().isResultsRevealed,
      notes: get().notes,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));
      channel?.postMessage({ type: 'STATE_SYNC', payload: fullState });
      publishCloudSync(fullState);
    } catch (e) {
      console.error('Failed to sync state', e);
    }
  };

  return {
    ...initial,
    currentUserId: initial.participants.length > 0 ? initial.participants[0].id : null,

    setCurrentUserId: (id: string | null) => set({ currentUserId: id }),

    setStep: (step: PartyStep) => {
      syncState({ currentStep: step });
    },

    setTablesCount: (count: number) => {
      const validCount = Math.max(1, Math.min(10, count));
      const seatsPerTable = get().seatsPerTable || 4;
      const rebalanced = rebalanceParticipantSeating(get().participants, validCount, seatsPerTable);
      syncState({
        tablesCount: validCount,
        participants: rebalanced,
      });
    },

    setSeatsPerTable: (count: number) => {
      const validSeats = Math.max(2, Math.min(10, count));
      const tablesCount = get().tablesCount || 4;
      const rebalanced = rebalanceParticipantSeating(get().participants, tablesCount, validSeats);
      syncState({
        seatsPerTable: validSeats,
        participants: rebalanced,
      });
    },


    updateParticipant: (id: string, updates: Partial<Participant>) => {
      const updated = get().participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      syncState({ participants: updated });
    },

    addParticipant: (participant: Participant) => {
      const existing = get().participants.find((p) => p.id === participant.id);
      if (existing) {
        get().updateParticipant(participant.id, participant);
        return;
      }
      syncState({ participants: [...get().participants, participant] });
    },

    submitSelection: (fromId: string, toId: string, rank: 1 | 2, round?: 1 | 2) => {
      const fromUser = get().participants.find((p) => p.id === fromId);
      const toUser = get().participants.find((p) => p.id === toId);

      if (!fromUser || !toUser || fromUser.gender === toUser.gender || fromId === toId) {
        console.warn('동성에게는 호감을 보낼 수 없습니다.');
        return;
      }

      const activeRound: 1 | 2 = round || (get().currentStep === 'FINAL_SELECT' || get().currentStep === 'RESULT_ANNOUNCE' ? 2 : 1);
      
      const filtered = get().selections.filter(
        (s) => !(s.fromId === fromId && s.round === activeRound && (s.rank === rank || s.toId === toId))
      );

      const newSelection: Selection = {
        fromId,
        toId,
        rank,
        round: activeRound,
        timestamp: Date.now(),
      };

      syncState({ selections: [...filtered, newSelection] });
    },

    removeSelection: (fromId: string, toId: string, round: 1 | 2) => {
      const filtered = get().selections.filter(
        (s) => !(s.fromId === fromId && s.toId === toId && s.round === round)
      );
      syncState({ selections: filtered });
    },

    saveNote: (myUserId: string, targetUserId: string, note: string) => {
      const userNotes = get().notes[myUserId] || {};
      const updatedNotes = {
        ...get().notes,
        [myUserId]: {
          ...userNotes,
          [targetUserId]: note,
        },
      };
      syncState({ notes: updatedNotes });
    },

    updateTableAssignment: (participantId: string, tableNo: number, seatNo: number) => {
      const updated = get().participants.map((p) =>
        p.id === participantId ? { ...p, tableNo, seatNo } : p
      );
      syncState({ participants: updated });
    },

    toggleRevealResults: (revealed: boolean) => {
      syncState({ isResultsRevealed: revealed });
    },

    simulateFirstImpressionVotes: () => {
      const demoSelections = generateDemoFirstImpressionSelections(get().participants);
      syncState({
        selections: demoSelections,
        currentStep: 'FIRST_IMPRESSION',
      });
    },

    registerNewParticipant: (participantData: Partial<Participant>) => {
      const currentCount = get().participants.length;
      const isMale = participantData.gender !== 'F';
      const genderPrefix = isMale ? 'm' : 'f';

      const numTables = get().tablesCount || 4;
      const seatsPerTable = get().seatsPerTable || 4;
      const tableNo = (Math.floor(currentCount / seatsPerTable) % numTables) + 1;
      const seatNo = (currentCount % seatsPerTable) + 1;

      const newId = `${genderPrefix}_${Date.now()}`;
      const defaultAvatars = isMale
        ? [
            '/avatars/m1.jpg',
            '/avatars/m2.jpg',
            '/avatars/m3.jpg',
            '/avatars/m4.jpg',
            '/avatars/m5.jpg',
            '/avatars/m6.jpg',
            '/avatars/m7.jpg',
            '/avatars/m8.jpg',
          ]
        : [
            '/avatars/f1.jpg',
            '/avatars/f2.jpg',
            '/avatars/f3.jpg',
            '/avatars/f4.jpg',
            '/avatars/f5.jpg',
            '/avatars/f6.jpg',
            '/avatars/f7.jpg',
            '/avatars/f8.jpg',
          ];

      const avatarUrl =
        participantData.avatarUrl || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

      const newParticipant: Participant = {
        id: newId,
        nickname: participantData.nickname || '신규 참가자',
        gender: participantData.gender || 'M',
        bio: participantData.bio || '반갑습니다! 대화 나누고 싶어요 🥂',
        tableNo,
        seatNo,
        avatarUrl,
        phone: participantData.phone || '010-1234-5678',
      };

      const updated = [...get().participants, newParticipant];
      syncState({ participants: updated });
      set({ currentUserId: newId });
      return newParticipant;
    },

    removeParticipant: (id: string) => {
      const updatedParticipants = get().participants.filter((p) => p.id !== id);
      const updatedSelections = get().selections.filter((s) => s.fromId !== id && s.toId !== id);
      const currentUserId = get().currentUserId === id
        ? (updatedParticipants.length > 0 ? updatedParticipants[0].id : null)
        : get().currentUserId;

      syncState({
        participants: updatedParticipants,
        selections: updatedSelections,
      });
      set({ currentUserId });
    },

    addQuickTestParticipant: (gender: 'M' | 'F') => {
      const isMale = gender === 'M';
      const existingSameGender = get().participants.filter((p) => p.gender === gender);
      const nextNum = existingSameGender.length + 1;

      const maleNames = ['카일', '리오', '노아', '루카스', '제이든', '아서', '오스카', '하비', '마일스', '카이'];
      const femaleNames = ['클로이', '소피', '엠버', '릴리', '마야', '엘라', '노라', '아리아', '해나', '조이'];

      const namesPool = isMale ? maleNames : femaleNames;
      const nickname = `${namesPool[(nextNum - 1) % namesPool.length]} (${isMale ? '남' : '여'}${nextNum})`;

      const bios = isMale
        ? [
            '주말엔 드라이브와 맛집 탐방을 즐깁니다 🚗',
            '운동하는 것을 좋아하고 커피를 사랑해요 ☕',
            '음악 듣고 진솔한 이야기 나누는 거 좋아해요 🎵',
            '새로운 만남이 설레네요! 편하게 대화해요 😊',
          ]
        : [
            '전시회 관람과 디저트 카페 투어가 취미예요 🎨',
            '웃음이 많고 긍정적인 성격입니다 🌸',
            '와인 한 잔 하면서 따뜻한 대화 나눠요 🍷',
            '좋은 인연을 만나고 싶어 참가했습니다 ✨',
          ];

      const bio = bios[Math.floor(Math.random() * bios.length)];

      return get().registerNewParticipant({
        nickname,
        gender,
        bio,
        phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    },

    rebalanceSeating: () => {
      const tablesCount = get().tablesCount || 4;
      const seatsPerTable = get().seatsPerTable || 4;
      const rebalanced = rebalanceParticipantSeating(get().participants, tablesCount, seatsPerTable);
      syncState({ participants: rebalanced });
    },

    autoGenerateVotes: (round: 1 | 2) => {
      const participants = get().participants;
      const males = participants.filter((p) => p.gender === 'M');
      const females = participants.filter((p) => p.gender === 'F');

      if (males.length === 0 || females.length === 0) {
        console.warn('남성 및 여성 참가자가 최소 1명 이상 등록되어 있어야 합니다.');
        return;
      }

      const existingOtherRounds = get().selections.filter((s) => s.round !== round);
      const generated: Selection[] = [];

      // Males voting Females
      males.forEach((m, idx) => {
        const f1 = females[idx % females.length];
        const f2 = females[(idx + 1) % females.length];

        generated.push({
          fromId: m.id,
          toId: f1.id,
          rank: 1,
          round,
          timestamp: Date.now() - 60000 + idx * 10,
        });

        if (females.length > 1 && f2.id !== f1.id) {
          generated.push({
            fromId: m.id,
            toId: f2.id,
            rank: 2,
            round,
            timestamp: Date.now() - 60000 + idx * 10 + 5,
          });
        }
      });

      // Females voting Males
      females.forEach((f, idx) => {
        const m1 = males[idx % males.length];
        const m2 = males[(idx + 1) % males.length];

        generated.push({
          fromId: f.id,
          toId: m1.id,
          rank: 1,
          round,
          timestamp: Date.now() - 60000 + idx * 10 + 1,
        });

        if (males.length > 1 && m2.id !== m1.id) {
          generated.push({
            fromId: f.id,
            toId: m2.id,
            rank: 2,
            round,
            timestamp: Date.now() - 60000 + idx * 10 + 6,
          });
        }
      });

      const targetStep = round === 1 ? 'FIRST_IMPRESSION' : 'FINAL_SELECT';

      syncState({
        selections: [...existingOtherRounds, ...generated],
        currentStep: targetStep,
      });
    },




    clearToEmptyParty: () => {
      const emptyState: PartyState = {
        partyCode: INITIAL_PARTY_CODE,
        roomName: INITIAL_ROOM_NAME,
        currentStep: 'WAITING',
        tablesCount: 4,
        seatsPerTable: 4,
        participants: [],
        selections: [],
        isResultsRevealed: false,
        notes: {},
      };
      localStorage.removeItem(STORAGE_KEY);
      syncState(emptyState);
      set({ currentUserId: null });
    },

    resetDemoData: () => {
      const freshSelections = generateDemoFirstImpressionSelections(INITIAL_PARTICIPANTS);
      const fresh: PartyState = {
        partyCode: INITIAL_PARTY_CODE,
        roomName: INITIAL_ROOM_NAME,
        currentStep: 'FIRST_IMPRESSION',
        tablesCount: 4,
        seatsPerTable: 4,
        participants: INITIAL_PARTICIPANTS,
        selections: freshSelections,
        isResultsRevealed: false,
        notes: {},
      };
      localStorage.removeItem(STORAGE_KEY);
      syncState(fresh);
      set({ currentUserId: INITIAL_PARTICIPANTS[0].id });
    },

    getMutualMatches: (): MutualMatch[] => {
      const { selections, currentStep } = get();
      const matches: MutualMatch[] = [];
      const matchMap = new Set<string>();

      // Target round: round 2 (최종) if in FINAL_SELECT / RESULT_ANNOUNCE, or round 1 if in FIRST_IMPRESSION
      const targetRound: 1 | 2 = (currentStep === 'FINAL_SELECT' || currentStep === 'RESULT_ANNOUNCE') ? 2 : 1;
      const relevantSelections = selections.filter((s) => s.round === targetRound);

      relevantSelections.forEach((sel1) => {
        const reciprocal = relevantSelections.find(
          (sel2) => sel2.fromId === sel1.toId && sel2.toId === sel1.fromId
        );

        if (reciprocal) {
          const pairKey = [sel1.fromId, sel1.toId].sort().join('_');
          if (!matchMap.has(pairKey)) {
            matchMap.add(pairKey);

            const isRank1Mutual = sel1.rank === 1 && reciprocal.rank === 1;

            matches.push({
              user1Id: sel1.fromId,
              user2Id: sel1.toId,
              rankUser1To2: sel1.rank,
              rankUser2To1: reciprocal.rank,
              matchedAtRound: sel1.round,
              matchType: isRank1Mutual ? 'RANK1_MUTUAL' : 'RANK2_MUTUAL',
            });
          }
        }
      });

      return matches;
    },

    getSentSelections: (userId: string, round?: 1 | 2): Selection[] => {
      const { selections, currentStep } = get();
      const targetRound = round || (currentStep === 'FINAL_SELECT' || currentStep === 'RESULT_ANNOUNCE' ? 2 : 1);
      return selections.filter(
        (s) => s.fromId === userId && s.round === targetRound
      );
    },

    getReceivedCount: (userId: string): number => {
      const { selections } = get();
      return selections.filter((s) => s.toId === userId).length;
    },
  };
});

if (channel) {
  channel.onmessage = (event) => {
    if (event.data?.type === 'STATE_SYNC') {
      const localUserId = usePartyStore.getState().currentUserId;
      usePartyStore.setState({
        ...event.data.payload,
        currentUserId: localUserId,
      });
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'soloparty_state_v1' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        const localUserId = usePartyStore.getState().currentUserId;
        usePartyStore.setState({
          ...parsed,
          currentUserId: localUserId,
        });
      } catch (err) {
        console.error('Failed to parse storage update', err);
      }
    }
  });

  setTimeout(() => fetchCloudSync(), 300);
  setInterval(() => fetchCloudSync(), 2000);
}

