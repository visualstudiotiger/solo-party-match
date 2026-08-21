# Solo Party Match — Product Overview

## 1. Product Definition

20명 규모의 30~40대 솔로파티에서 참가자는 모바일 웹을 통해 다른 참가자에게 호감을 표시하고, 서로의 마음이 확인되면 매칭된다.

사회자는 별도의 관리자 화면에서 참가자 현황, 호감 흐름, 매칭 결과, 테이블 배치를 확인하고 파티 진행에 활용한다.

### Core Concept

> **마음은 숨기고, 진행은 보이게.**

---

## 2. Target

### Primary Customer
20명 내외의 30~40대 솔로파티를 운영하는 사회자/주최자.

### End User
30~40대 솔로파티 참가자.

---

## 3. Core Problem

### 참가자
호감이 있어도 공개적으로 표현하기 부담스럽다.

### 사회자
20명의 참가자가 서로 누구에게 관심을 갖고 있는지 기억하거나 수기로 관리하기 어렵다.
동시에 파티 진행, 참가자 관리, 테이블 이동까지 수행해야 한다.

---

## 4. Core Solution

1. 참가자는 모바일 웹에서 비공개로 호감을 표시한다.
2. 사회자는 전체 호감 데이터를 확인한다.
3. 서로 선택한 경우에만 참가자에게 매칭 결과를 공개한다.
4. 사회자는 매칭과 호감 데이터를 참고하여 다음 테이블 및 자리 배치를 결정한다.

---

## 5. MVP Scope

### Participant (참가자 화면)
- Party 입장 (파티 코드 입력 또는 QR코드 스캔)
- 닉네임 / 성별 / 프로필 (한 줄 소개, 사진/아바타) 입력
- 참가자 목록 조회 (성별 필터링, 테이블 위치)
- 참가자 상세 보기 (프로필, 메모 기능)
- 라운드별 호감 선택 (1지망, 2지망 등)
- 단계별 상태 확인 (대기, 진행 중, 선택 시간, 결과 대기)
- 최종 선택 (최종 1, 2지망)
- 상호 매칭 결과 확인 (커플 탄생 시 연출)

### Host (사회자/관리자 화면)
- 관리자 로그인 / 파티 생성 & 관리
- 참가자 현황 (입장 인원, 남녀 비율)
- 파티 단계 관리 (대기 → 1차 소개 → 1차 호감선택 → 로테이션 → 2차 호감선택 → 최종 선택 → 결과 발표)
- 호감 현황 (실시간 호감 매트릭스 / 화살표 네트워크 그래프)
- 상호 매칭 현황 (서로 선택한 콤보 자동 계산)
- 테이블 및 자리 배치 관리 (테이블 1~N, 배치 변경 드래그앤드롭/버튼)
- 최종 매칭 결과 공개 제어

---

## 6. Explicit Non-Goals (MVP 제외)

- 1:1 인앱 채팅
- AI 매칭 추천
- 소셜 로그인 (간편 파티코드/닉네임 로그인 사용)
- 결제 시스템
- 푸시 알림 (웹 브라우저 갱신/서버 센트 이벤트로 대체)
- 친구 추천 / 복잡한 매칭 알고리즘
- 앱 설치 (Web Mobile 전용)
- 다중 파티 운영 SaaS 관리 기능

---

## 7. Product Principle

> 이 기능이 참가자의 부담을 줄이고 사회자의 진행을 쉽게 만드는가?
> 그렇지 않으면 MVP에서 제외한다.

---

## 8. Technical Architecture & Stack Recommendation

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Vanilla CSS / Tailwind CSS with modern UI tokens, dark mode toggle, sleek mobile party aesthetic
- **Real-time Engine**: Socket.io or Supabase Realtime / Broadcast channel for instant sync between Host dashboard and Participant phones
- **State Management**: Zustand (Local state, active round state, selection drafts)

---

## 9. Key Metric

- **North Star Metric**: 한 번의 파티에서 정상적으로 완료된 상호 매칭 수
- **Supporting Metrics**: 입장 완료율, 호감 선택률, 최종 선택 완료율, 사회자 진행 만족도
