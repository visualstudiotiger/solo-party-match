import { create } from 'zustand';
import { PartyState, PartyStep, Participant, Selection, MutualMatch } from '../types/party';
import { INITIAL_PARTY_CODE, INITIAL_ROOM_NAME, INITIAL_PARTICIPANTS } from '../data/mockPartyData';

interface PartyStoreState extends PartyState {
  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;
  
  // Actions
  setStep: (step: PartyStep) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  addParticipant: (participant: Participant) => void;
  registerNewParticipant: (participantData: Partial<Participant>) => Participant;
  submitSelection: (fromId: string, toId: string, rank: 1 | 2, round: number) => void;
  removeSelection: (fromId: string, toId: string, round: number) => void;
  saveNote: (myUserId: string, targetUserId: string, note: string) => void;
  updateTableAssignment: (participantId: string, tableNo: number, seatNo: number) => void;
  toggleRevealResults: (revealed: boolean) => void;
  resetDemoData: () => void;
  clearToEmptyParty: () => void;
  simulateFirstImpressionVotes: () => void;
  
  // Computed / Helper getters
  getMutualMatches: () => MutualMatch[];
  getSentSelections: (userId: string, round?: number) => Selection[];
  getReceivedCount: (userId: string) => number;
}

const STORAGE_KEY = 'soloparty_state_v1';
const CHANNEL_NAME = 'soloparty_broadcast_channel';

// Helper to generate full demo 1st impression votes for all 20 participants
const generateDemoFirstImpressionSelections = (participants: Participant[]): Selection[] => {
  const males = participants.filter((p) => p.gender === 'M');
  const females = participants.filter((p) => p.gender === 'F');
  const list: Selection[] = [];

  // Males voting females for Round 1
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

  // Females voting males for Round 1
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

  // Add Round 2 and Round 3 sample matches
  list.push(
    { fromId: 'm1', toId: 'f1', round: 2, rank: 1, timestamp: Date.now() - 200000 },
    { fromId: 'm1', toId: 'f4', round: 2, rank: 2, timestamp: Date.now() - 200000 },
    { fromId: 'f1', toId: 'm1', round: 2, rank: 1, timestamp: Date.now() - 200000 },

    { fromId: 'm1', toId: 'f1', round: 3, rank: 1, timestamp: Date.now() - 100000 },
    { fromId: 'f1', toId: 'm1', round: 3, rank: 1, timestamp: Date.now() - 100000 },

    { fromId: 'm2', toId: 'f2', round: 3, rank: 1, timestamp: Date.now() - 90000 },
    { fromId: 'f2', toId: 'm2', round: 3, rank: 1, timestamp: Date.now() - 90000 },

    { fromId: 'm3', toId: 'f4', round: 3, rank: 1, timestamp: Date.now() - 80000 },
    { fromId: 'f4', toId: 'm3', round: 3, rank: 2, timestamp: Date.now() - 80000 }
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
    tablesCount: 5,
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
      return {
        ...parsed,
        participants: parsed.participants || [],
        selections: parsed.selections || [],
      };
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }

  return emptyDefault;
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

    submitSelection: (fromId: string, toId: string, rank: 1 | 2, round: number) => {
      const fromUser = get().participants.find((p) => p.id === fromId);
      const toUser = get().participants.find((p) => p.id === toId);

      if (!fromUser || !toUser || fromUser.gender === toUser.gender || fromId === toId) {
        console.warn('동성에게는 호감을 보낼 수 없습니다.');
        return;
      }

      const currentRound = round || (get().currentStep === 'FINAL_SELECT' ? 3 : get().currentStep === 'ROUND2_SELECT' ? 2 : 1);
      
      const filtered = get().selections.filter(
        (s) => !(s.fromId === fromId && s.round === currentRound && (s.rank === rank || s.toId === toId))
      );

      const newSelection: Selection = {
        fromId,
        toId,
        rank,
        round: currentRound,
        timestamp: Date.now(),
      };

      syncState({ selections: [...filtered, newSelection] });
    },

    removeSelection: (fromId: string, toId: string, round: number) => {
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

      const tableNo = (Math.floor(currentCount / 4) % 5) + 1;
      const seatNo = (currentCount % 4) + 1;

      const newId = `${genderPrefix}_${Date.now()}`;
      const defaultAvatars = isMale
        ? [
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          ]
        : [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
          ];

      const avatarUrl =
        participantData.avatarUrl || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

      const newParticipant: Participant = {
        id: newId,
        nickname: participantData.nickname || '신규 참가자',
        gender: participantData.gender || 'M',
        age: participantData.age || '32',
        job: participantData.job || '직장인',
        bio: participantData.bio || '반갑습니다! 솔로 파티 참가자입니다.',
        tableNo,
        seatNo,
        avatarUrl,
        phone: participantData.phone || '010-1234-5678',
        maritalStatus: participantData.maritalStatus || '미혼',
        hasChildren: participantData.hasChildren || '자녀 없음',
        loveStyle: participantData.loveStyle || {
          relationshipType: '친구같은 편안한 연애',
          dateStyle: '맛집 탐방 & 카페 수다',
          weekendHobby: '영화 감상 & 드라이브',
        },
      };

      const updated = [...get().participants, newParticipant];
      syncState({ participants: updated });
      set({ currentUserId: newId });
      return newParticipant;
    },

    clearToEmptyParty: () => {
      const emptyState: PartyState = {
        partyCode: INITIAL_PARTY_CODE,
        roomName: INITIAL_ROOM_NAME,
        currentStep: 'WAITING',
        tablesCount: 5,
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
        tablesCount: 5,
        seatsPerTable: 4,
        participants: INITIAL_PARTICIPANTS,
        selections: freshSelections,
        isResultsRevealed: false,
        notes: {},
      };
      localStorage.removeItem(STORAGE_KEY);
      syncState(fresh);
    },

    getMutualMatches: (): MutualMatch[] => {
      const { selections } = get();
      const matches: MutualMatch[] = [];
      const matchMap = new Set<string>();

      const latestSelections = selections.filter(s => s.round === 3 || s.round === 1 || s.round === 2);

      latestSelections.forEach((sel1) => {
        const reciprocal = latestSelections.find(
          (sel2) => sel2.fromId === sel1.toId && sel2.toId === sel1.fromId && sel2.round === sel1.round
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

    getSentSelections: (userId: string, round?: number): Selection[] => {
      const { selections } = get();
      return selections.filter(
        (s) => s.fromId === userId && (round === undefined || s.round === round)
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
      usePartyStore.setState(event.data.payload);
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'soloparty_state_v1' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        usePartyStore.setState(parsed);
      } catch (err) {
        console.error('Failed to parse storage update', err);
      }
    }
  });
}
