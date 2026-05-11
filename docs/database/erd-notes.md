# ERD Notes
Ontology 기반 청원 + 후원 플랫폼 데이터베이스 설계 노트

## 1. 문서 목적

이 문서는 MVP 단계에서 사용할 데이터베이스 구조와 엔티티 관계를 설명한다.  
목표는 다음과 같다.

- 핵심 엔티티와 관계를 명확히 정의한다
- Prisma schema 설계 전에 도메인 기준을 정리한다
- 프론트엔드 / 백엔드 / 온톨로지 / 대시보드 요구사항을 만족하는 데이터 구조를 설계한다
- 이후 마이그레이션과 구현 과정에서 설계 의도를 유지한다

이 문서는 **ERD 해설 문서**이며, 실제 구현은 `schema.prisma`를 기준으로 진행한다.

---

## 2. 설계 원칙

### 2.1 도메인 중심 설계
이 DB는 단순 게시판이 아니라 다음 흐름을 지원해야 한다.

- 청원 생성
- 자동분류
- 운영 검토
- 공개
- 서명
- 후원
- 통계 집계
- 운영 로그 추적

따라서 테이블 구조는 화면이 아니라 **도메인 이벤트와 상태 변화**를 기준으로 설계한다.

### 2.2 확장 가능한 MVP
MVP에서는 단순하게 시작하되, 다음 확장을 막지 않아야 한다.

- 실제 PG 연동
- 정기후원
- 검색엔진 연동
- 유사 청원 탐지
- 고급 통계
- 지식그래프 기반 온톨로지 확장

### 2.3 정규화와 실용성의 균형
- 핵심 엔티티는 정규화한다
- 통계에 자주 쓰이는 값은 일부 중복 저장 또는 캐시성 컬럼을 둘 수 있다
- 카테고리와 지역은 lookup table 또는 seed table 기준으로 관리한다

### 2.4 운영 가능성
- review queue를 별도 구조로 둔다
- 운영자 액션은 감사 로그로 남긴다
- 삭제보다 상태 전환을 우선한다

---

## 3. 주요 엔티티 목록

초기 MVP 기준 핵심 엔티티는 다음과 같다.

- User
- Petition
- PetitionCategory
- PetitionCategoryMapping
- PetitionClassificationResult
- PetitionUpdate
- Signature
- Donation
- PaymentAttempt
- BillingSubscription
- Region
- DecisionMaker
- ReviewQueue
- AdminAuditLog

선택적/후속 확장 엔티티:
- Hashtag
- PetitionHashtagMapping
- Organization
- PetitionAttachment
- PetitionViewStat
- Notification

---

## 4. 엔티티별 설명

## 4.1 User

### 역할
플랫폼 사용자 정보를 저장한다.

### 주요 책임
- 로그인/인증 주체
- 청원 작성자
- 서명 참여자
- 후원자
- 운영자/관리자

### 주요 필드
- id
- email
- passwordHash
- displayName
- role
- status
- createdAt
- updatedAt

### 비고
- `role`은 최소 `guest`, `user`, `petition_creator`, `moderator`, `admin` 지원
- 추후 소셜 로그인 확장 가능
- 개인정보 최소 수집 원칙 유지

---

## 4.2 Petition

### 역할
청원의 핵심 본문과 상태를 저장한다.

### 주요 책임
- 청원 제목/본문
- 작성자 정보
- 상태 관리
- 대표 지역 / 대상기관 정보
- 자동분류 결과와 연결
- 서명/후원/업데이트의 중심 엔티티

### 주요 필드
- id
- authorId
- title
- content
- summary (선택)
- status
- regionCode (nullable)
- decisionMakerId (nullable)
- decisionMakerNameRaw (nullable)
- primaryCategoryCode (nullable, 캐시성 또는 빠른 조회용)
- signatureCountCached (default 0)
- donationAmountCached (default 0)
- createdAt
- updatedAt
- publishedAt (nullable)
- closedAt (nullable)
- deletedAt (nullable)

### 비고
- `status`는 `review`, `published`, `rejected`, `closed`, `achieved` 등을 지원
- 서명 수와 후원 총액은 캐시성 필드로 운영 가능
- 본문 전체 텍스트는 검색 확장 가능성을 고려해 길이 제한을 충분히 둔다

---

## 4.3 PetitionCategory

### 역할
대분류/중분류/소분류 카테고리 마스터 데이터

### 주요 책임
- 카테고리 트리 관리
- 코드 기반 분류 기준 제공
- UI 표시명과 내부 코드 분리

### 주요 필드
- code
- label
- level
- parentCode (nullable)
- sortOrder
- isActive
- createdAt
- updatedAt

### 비고
- `code`를 PK 또는 unique key로 사용할 수 있음
- `level`은 1, 2, 3
- parent-child 자기참조 구조

---

## 4.4 PetitionCategoryMapping

### 역할
청원과 카테고리의 다대다 관계를 저장한다.

### 주요 책임
- 대표 카테고리
- 보조 카테고리
- 자동분류 / 수동수정 여부 추적

### 주요 필드
- id
- petitionId
- categoryCode
- isPrimary
- sourceType (`auto`, `manual`)
- confidence (nullable)
- createdAt

### 비고
- 하나의 청원은 여러 카테고리를 가질 수 있다
- 대표 카테고리는 1개를 원칙으로 하되 DB 차원 강제는 구현 방식에 따라 결정

---

## 4.5 PetitionClassificationResult

### 역할
자동분류 실행 결과를 별도 저장한다.

### 주요 책임
- 자동분류 결과 보존
- 후보 분류 추적
- confidence 기록
- 어떤 키워드/엔티티가 매칭됐는지 기록

### 주요 필드
- id
- petitionId
- classifierVersion
- primaryCategoryCode (nullable)
- secondaryCategoryCodesJson
- matchedKeywordsJson
- matchedEntitiesJson
- confidence
- reviewRequired
- rawReasoningSummary (nullable)
- createdAt

### 비고
- 같은 청원에 대해 재분류를 여러 번 실행할 수 있으므로 history 테이블처럼 운영 가능
- 최신 결과를 Petition에 반영하고, 세부 이력은 여기 보관

---

## 4.6 PetitionUpdate

### 역할
청원 진행상황 업데이트 기록

### 주요 책임
- 청원 작성자의 업데이트 게시
- 지지자에게 진행 상황 제공

### 주요 필드
- id
- petitionId
- authorId
- title
- content
- createdAt
- updatedAt

### 비고
- 제목 없이 본문만 허용할지 여부는 제품 정책에 따라 결정
- 상세 페이지 하단 연대기 형태로 노출 가능

---

## 4.7 Signature

### 역할
사용자의 청원 서명 기록

### 주요 책임
- 청원 참여 이력 저장
- 통계 집계를 위한 속성 저장
- 중복 서명 방지 기준 제공

### 주요 필드
- id
- petitionId
- userId (nullable, 정책에 따라 필수 가능)
- displayName
- regionCode (nullable)
- ageBand (nullable)
- gender (nullable)
- consentToStatistics
- createdAt

### 중복 방지 후보 키
- petitionId + userId
- 또는 petitionId + hashed identity 정책

### 비고
- 익명 서명을 허용할지 여부에 따라 설계 달라짐
- MVP에서는 로그인 사용자만 허용하면 구조가 단순해진다
- 개인정보 최소 수집 원칙 유지

---

## 4.8 Donation

### 역할
후원 기록의 중심 엔티티

### 주요 책임
- 청원별 / 플랫폼별 후원 저장
- 일시후원 / 정기후원 구분
- 금액/상태 관리

### 주요 필드
- id
- donorUserId (nullable)
- targetType (`petition`, `platform`)
- petitionId (nullable)
- donationType (`one_time`, `recurring`)
- amount
- currency
- provider
- status
- donorName (nullable)
- message (nullable)
- createdAt
- updatedAt

### 비고
- `petitionId`는 targetType이 petition일 때만 존재
- MVP에서는 mock provider 사용 가능
- 실제 결제 상태머신으로 확장될 수 있음

---

## 4.9 PaymentAttempt

### 역할
결제 시도 이력 저장

### 주요 책임
- 결제 요청/실패/성공 추적
- provider 응답 메타데이터 기록
- 디버깅 및 회계 보조

### 주요 필드
- id
- donationId
- provider
- providerTransactionId (nullable)
- requestPayloadJson (nullable)
- responsePayloadJson (nullable)
- status
- attemptedAt
- createdAt

### 비고
- Donation과 분리해서 설계하면 결제 리트라이, 실패 이력 추적이 쉬움
- 민감정보는 저장 금지 또는 마스킹 필요

---

## 4.10 BillingSubscription

### 역할
정기후원 구독 정보를 저장

### 주요 책임
- 정기결제 상태 추적
- 반복 과금 기준 저장
- provider billing key 연동 준비

### 주요 필드
- id
- donorUserId
- targetType
- petitionId (nullable)
- amount
- currency
- billingCycle (`monthly`, `yearly`)
- provider
- providerSubscriptionId (nullable)
- status
- startedAt
- nextBillingAt (nullable)
- canceledAt (nullable)
- createdAt
- updatedAt

### 비고
- MVP에서는 구조만 두고 실제 과금은 mock 가능
- Donation과는 1:N 관계 가능

---

## 4.11 Region

### 역할
지역 마스터 데이터

### 주요 책임
- 지역 코드 관리
- 통계 및 필터 기준 제공

### 주요 필드
- code
- label
- level
- parentCode (nullable)
- sortOrder
- isActive

### 비고
- 국가 / 시도 / 시군구 확장 가능
- 초기에는 시도 단위부터 시작 가능

---

## 4.12 DecisionMaker

### 역할
청원의 대상 기관/결정권자 정보

### 주요 책임
- 청원이 향하는 기관/인물 저장
- 자동분류와 검색/탐색 지원

### 주요 필드
- id
- name
- type (`government`, `local_government`, `school`, `company`, `public_org`, `other`)
- regionCode (nullable)
- normalizedName
- isActive
- createdAt
- updatedAt

### 비고
- 초기엔 자유 입력 + 정규화 후보 저장 방식 가능
- 나중에 마스터 테이블 확장

---

## 4.13 ReviewQueue

### 역할
운영 검토가 필요한 청원 기록

### 주요 책임
- 낮은 confidence 분류 결과 관리
- 운영자 검토 상태 추적
- 승인 / 반려 / 재분류 이력 관리

### 주요 필드
- id
- petitionId
- latestClassificationResultId
- reviewStatus
- reviewReason
- assignedModeratorId (nullable)
- reviewedById (nullable)
- reviewedAt (nullable)
- note (nullable)
- createdAt
- updatedAt

### 비고
- petition.status = review 와 별개로 review queue 상태 관리 가능
- 운영자 workflow 추적에 중요

---

## 4.14 AdminAuditLog

### 역할
운영자 액션 감사 로그

### 주요 책임
- 운영자 승인/반려/분류수정 이력 저장
- 보안 및 운영 추적

### 주요 필드
- id
- actorUserId
- actionType
- targetType
- targetId
- beforeJson (nullable)
- afterJson (nullable)
- metadataJson (nullable)
- createdAt

### 비고
- review queue 처리, 상태 변경, 카테고리 수정 등을 기록
- 개인정보가 포함된 before/after 저장 시 마스킹 필요

---

## 5. 관계 요약

## 5.1 핵심 관계

- User 1 : N Petition
- User 1 : N PetitionUpdate
- User 1 : N Signature
- User 1 : N Donation
- User 1 : N BillingSubscription
- Petition 1 : N PetitionUpdate
- Petition 1 : N Signature
- Petition 1 : N Donation
- Petition 1 : N PetitionCategoryMapping
- Petition 1 : N PetitionClassificationResult
- Petition 1 : 0..1 ReviewQueue
- PetitionCategory 1 : N PetitionCategoryMapping
- DecisionMaker 1 : N Petition
- Region 1 : N Petition
- Region 1 : N Signature
- Donation 1 : N PaymentAttempt

---

## 6. 텍스트 기반 ERD 개요

```txt
User
 ├─< Petition
 ├─< PetitionUpdate
 ├─< Signature
 ├─< Donation
 ├─< BillingSubscription
 └─< AdminAuditLog

Petition
 ├─< PetitionCategoryMapping >─ PetitionCategory
 ├─< PetitionClassificationResult
 ├─< PetitionUpdate
 ├─< Signature
 ├─< Donation
 └─  ReviewQueue

Donation
 └─< PaymentAttempt

Region
 ├─< Petition
 ├─< Signature
 └─< DecisionMaker (optional)

DecisionMaker
 └─< Petition
