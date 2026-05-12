# Initial API Contract
Ontology 기반 청원 + 후원 플랫폼 초기 API 계약서

## 1. 문서 목적

이 문서는 MVP 단계에서 사용할 초기 API 계약을 정의한다.  
목표는 다음과 같다.

- 프론트엔드와 백엔드 사이의 요청/응답 구조를 일관되게 맞춘다.
- 청원, 서명, 후원, 카테고리, 자동분류, 검토 큐, 대시보드 기능의 초기 범위를 명확히 한다.
- NestJS DTO, Prisma 모델, 프론트엔드 API 클라이언트 타입 정의의 기준 문서로 사용한다.
- MVP에서 필요한 수준만 먼저 고정하고, 이후 확장은 별도 버전으로 관리한다.

---

## 2. 기본 원칙

### 2.1 Base URL

```txt
/api
```

초기 MVP에서는 아래 예시와 같은 형태를 사용한다.

- `GET /api/petitions`
- `POST /api/auth/login`

---

### 2.2 Content-Type

기본 요청/응답 포맷은 JSON이다.

```http
Content-Type: application/json
```

파일 업로드가 필요한 경우에만 `multipart/form-data`를 사용한다.

---

### 2.3 인증 방식

MVP에서는 JWT 기반 인증을 사용한다.

```http
Authorization: Bearer <token>
```

인증이 필요한 API는 토큰이 없거나 유효하지 않으면 `401 Unauthorized`를 반환한다.

---

### 2.4 공통 응답 형식

성공 응답:

```json
{
  "success": true,
  "data": {}
}
```

실패 응답:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "잘못된 요청입니다."
  }
}
```

---

### 2.5 공통 에러 코드

초기 MVP에서 사용하는 대표 에러 코드는 다음과 같다.

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `DUPLICATE_SIGNATURE`
- `INVALID_STATUS`
- `REVIEW_REQUIRED`
- `PAYMENT_FAILED`

---

### 2.6 페이지네이션 형식

목록 조회 API는 다음 형식을 따른다.

Request query:

- `page`
- `pageSize`
- `sortBy`
- `sortOrder`

Response example:

```json
{
  "success": true,
  "data": {
    "items": []
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 125,
    "totalPages": 7
  }
}
```

---

## 3. 권한 모델

초기 권한 역할은 아래와 같다.

- `guest`
- `user`
- `petition_creator`
- `moderator`
- `admin`

MVP 단순화를 위해 실제 구현에서는 아래처럼 축약 가능하다.

- 일반 로그인 사용자: `user`
- 운영 검토 담당자: `moderator`
- 관리자: `admin`

---

## 4. 핵심 리소스

이 문서에서 다루는 핵심 리소스는 다음과 같다.

- `auth`
- `users`
- `petitions`
- `signatures`
- `donations`
- `categories`
- `review-queue`
- `dashboard`

---

## 5. Auth API

### 5.1 회원가입

`POST /api/auth/register`

Request:

```json
{
  "email": "user@example.com",
  "password": "password1234",
  "displayName": "홍길동"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "usr_001",
    "email": "user@example.com",
    "displayName": "홍길동",
    "role": "user",
    "accessToken": "jwt-token"
  }
}
```

---

### 5.2 로그인

`POST /api/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "password1234"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "usr_001",
    "email": "user@example.com",
    "displayName": "홍길동",
    "role": "user",
    "accessToken": "jwt-token"
  }
}
```

---

### 5.3 내 정보 조회

`GET /api/auth/me`

Response:

```json
{
  "success": true,
  "data": {
    "id": "usr_001",
    "email": "user@example.com",
    "displayName": "홍길동",
    "role": "user"
  }
}
```

---

## 6. Users API

### 6.1 내 프로필 조회

`GET /api/users/me`

Response:

```json
{
  "success": true,
  "data": {
    "id": "usr_001",
    "email": "user@example.com",
    "displayName": "홍길동",
    "role": "user",
    "createdAt": "2026-05-11T09:00:00.000Z"
  }
}
```

---

### 6.2 내 프로필 수정

`PATCH /api/users/me`

Request:

```json
{
  "displayName": "새 닉네임"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "usr_001",
    "displayName": "새 닉네임"
  }
}
```

---

## 7. Petitions API

### 7.1 청원 생성

`POST /api/petitions`

Request:

```json
{
  "title": "우리 지역 도서관 운영시간 연장 요청",
  "content": "직장인과 학생도 이용할 수 있도록 평일 운영시간을 밤 10시까지 연장해 주세요.",
  "regionCode": "KR-11",
  "decisionMakerId": "dm_001"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "pet_001",
    "title": "우리 지역 도서관 운영시간 연장 요청",
    "content": "직장인과 학생도 이용할 수 있도록 평일 운영시간을 밤 10시까지 연장해 주세요.",
    "status": "review",
    "authorId": "usr_001",
    "primaryCategoryCode": "EDU.LOCAL.FACILITY",
    "createdAt": "2026-05-11T10:00:00.000Z"
  }
}
```

설명:

- 청원 생성 시 자동분류가 함께 수행될 수 있다.
- 분류 confidence가 낮으면 `review` 상태로 검토 큐에 들어간다.

---

### 7.2 청원 목록 조회

`GET /api/petitions`

Query example:

```txt
/api/petitions?page=1&pageSize=20&status=published&categoryCode=EDU
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "pet_001",
        "title": "우리 지역 도서관 운영시간 연장 요청",
        "status": "published",
        "primaryCategoryCode": "EDU.LOCAL.FACILITY",
        "regionCode": "KR-11",
        "signatureCount": 1280,
        "donationAmount": 250000
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

---

### 7.3 청원 상세 조회

`GET /api/petitions/:petitionId`

Response:

```json
{
  "success": true,
  "data": {
    "id": "pet_001",
    "title": "우리 지역 도서관 운영시간 연장 요청",
    "content": "직장인과 학생도 이용할 수 있도록 평일 운영시간을 밤 10시까지 연장해 주세요.",
    "status": "published",
    "author": {
      "id": "usr_001",
      "displayName": "홍길동"
    },
    "regionCode": "KR-11",
    "decisionMaker": {
      "id": "dm_001",
      "name": "서울시교육청"
    },
    "categories": [
      {
        "code": "EDU.LOCAL.FACILITY",
        "label": "교육 > 지역교육환경 > 공공시설",
        "isPrimary": true
      }
    ],
    "signatureCount": 1280,
    "donationAmount": 250000,
    "createdAt": "2026-05-11T10:00:00.000Z"
  }
}
```

---

### 7.4 청원 수정

`PATCH /api/petitions/:petitionId`

Request:

```json
{
  "title": "우리 지역 공공도서관 운영시간 연장 요청",
  "content": "직장인과 학생들이 더 쉽게 이용할 수 있도록 운영시간을 밤 10시까지 연장해 주세요."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "pet_001",
    "title": "우리 지역 공공도서관 운영시간 연장 요청",
    "status": "review"
  }
}
```

설명:

- 공개된 청원을 수정하면 다시 검토 상태로 전환할 수 있다.

---

### 7.5 청원 상태 변경

`PATCH /api/petitions/:petitionId/status`

운영자 전용 API.

Request:

```json
{
  "status": "published"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "pet_001",
    "status": "published"
  }
}
```

허용 상태값:

- `review`
- `published`
- `rejected`
- `closed`
- `achieved`

---

### 7.6 내가 작성한 청원 목록

`GET /api/petitions/me`

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "pet_001",
        "title": "우리 지역 도서관 운영시간 연장 요청",
        "status": "review",
        "signatureCount": 0,
        "createdAt": "2026-05-11T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 8. Signatures API

### 8.1 서명 등록

`POST /api/petitions/:petitionId/signatures`

Request:

```json
{
  "displayName": "김시민",
  "regionCode": "KR-11",
  "ageBand": "30_39",
  "gender": "female",
  "comment": "야간 운영이 꼭 필요합니다.",
  "consentToStatistics": true
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "sig_001",
    "petitionId": "pet_001",
    "displayName": "김시민",
    "regionCode": "KR-11",
    "ageBand": "30_39",
    "gender": "female",
    "createdAt": "2026-05-11T11:00:00.000Z"
  }
}
```

규칙:

- 동일 사용자의 중복 서명은 제한한다.
- 통계 목적의 인구 정보는 동의 기반으로 저장한다.

---

### 8.2 서명 목록 조회

`GET /api/petitions/:petitionId/signatures`

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "sig_001",
        "displayName": "김시민",
        "regionCode": "KR-11",
        "ageBand": "30_39",
        "gender": "female",
        "createdAt": "2026-05-11T11:00:00.000Z"
      }
    ]
  }
}
```

---

### 8.3 서명 통계 조회

`GET /api/petitions/:petitionId/signatures/stats`

Response:

```json
{
  "success": true,
  "data": {
    "totalCount": 1280,
    "byRegion": [
      { "regionCode": "KR-11", "count": 720 },
      { "regionCode": "KR-41", "count": 220 }
    ],
    "byAgeBand": [
      { "ageBand": "20_29", "count": 300 },
      { "ageBand": "30_39", "count": 540 }
    ],
    "byGender": [
      { "gender": "female", "count": 700 },
      { "gender": "male", "count": 540 },
      { "gender": "other", "count": 40 }
    ]
  }
}
```

---

## 9. Donations API

결제는 2단계 흐름을 따른다.

1. `POST /api/donations/intent` → PG 결제 Intent 생성, checkout URL 반환
2. 사용자가 PG 페이지에서 결제 완료
3. `POST /api/donations/confirm/:id` → 결제 확인 및 상태 업데이트

결제 Provider는 서버 환경변수(`PAYMENT_PROVIDER`)로 선택되며, 클라이언트는 provider를 지정할 수 없다.

---

### 9.1 후원 Intent 생성

`POST /api/donations/intent`

Request:

```json
{
  "targetType": "petition",
  "petitionId": "pet_001",
  "donationType": "one_time",
  "amount": 10000,
  "currency": "KRW",
  "donorName": "홍후원",
  "message": "좋은 변화에 힘을 보탭니다.",
  "idempotencyKey": "unique-client-key-001"
}
```

설명:

- `provider` 필드는 클라이언트에서 전송하지 않는다. 서버가 환경변수로 결정한다.
- `idempotencyKey`는 선택 사항이나, 네트워크 재시도로 인한 중복 결제 방지를 위해 권장한다.
- `targetType`이 `"petition"`인 경우 `petitionId`가 필수이고, `"platform"`인 경우 `petitionId`를 포함하지 않는다.

Response:

```json
{
  "success": true,
  "data": {
    "donationId": "don_001",
    "paymentIntentId": "order-abc123",
    "checkoutUrl": "https://pay.toss.im/checkout/...",
    "amount": 10000,
    "currency": "KRW",
    "expiresAt": "2026-05-11T12:00:00.000Z"
  }
}
```

설명:

- `checkoutUrl`은 PG 결제 페이지 URL이다. Mock provider는 로컬 URL을 반환한다.
- `paymentIntentId`는 PG 측 주문 식별자로, confirm 단계에서 사용한다.

---

### 9.2 결제 확인

`POST /api/donations/confirm/:donationId`

Request:

```json
{
  "amount": 10000,
  "paymentKey": "toss_payment_key_abc"
}
```

설명:

- `paymentKey`는 Toss Payments 사용 시 PG에서 발급한 키이다. Mock provider에서는 불필요하다.
- `amount`는 결제 금액 확인용이다. Intent 생성 시 금액과 불일치하면 `400 Bad Request`를 반환한다.

Response:

```json
{
  "success": true,
  "data": {
    "id": "don_001",
    "targetType": "petition",
    "petitionId": "pet_001",
    "donationType": "one_time",
    "amount": 10000,
    "currency": "KRW",
    "status": "paid",
    "paidAt": "2026-05-11T11:30:05.000Z",
    "createdAt": "2026-05-11T11:30:00.000Z"
  }
}
```

에러 응답:

- `404 Not Found` — donationId가 존재하지 않을 때
- `400 Bad Request` — 요청자가 소유자가 아닐 때, 금액 불일치
- `409 Conflict` — 이미 완료된 결제에 재시도할 때
- `402 Payment Required` — PG가 결제 실패를 반환했을 때

---

### 9.3 결제 Webhook 수신

`POST /api/webhooks/payments`

PG(Toss Payments 등)가 결제 이벤트를 서버로 전달하는 엔드포인트이다.

Request header (Toss 사용 시):

```http
toss-signature: <HMAC-SHA256 signature>
Content-Type: application/json
```

Request body:

```json
{
  "eventId": "evt_abc001",
  "eventType": "payment.completed",
  "paymentIntentId": "order-abc123",
  "status": "paid"
}
```

설명:

- 서버는 서명을 검증한 후 페이로드를 처리한다. Mock provider는 서명 검증을 건너뛴다.
- 동일 `eventId`의 중복 전달은 무시된다 (멱등성 보장).
- 응답은 항상 `200 OK`이며, 처리 결과를 본문에 포함하지 않는다.

Response:

```json
{ "success": true }
```

---

### 9.4 내 후원 목록 조회

`GET /api/donations/me`

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "don_001",
        "targetType": "petition",
        "petitionId": "pet_001",
        "amount": 10000,
        "currency": "KRW",
        "status": "paid",
        "createdAt": "2026-05-11T11:30:00.000Z"
      }
    ]
  }
}
```

---

### 9.3 청원별 후원 통계 조회

`GET /api/petitions/:petitionId/donations/stats`

Response:

```json
{
  "success": true,
  "data": {
    "totalAmount": 250000,
    "donationCount": 18,
    "averageAmount": 13888,
    "currency": "KRW"
  }
}
```

---

## 10. Categories API

### 10.1 카테고리 트리 조회

`GET /api/categories/tree`

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "code": "EDU",
        "label": "교육",
        "level": 1,
        "children": [
          {
            "code": "EDU.LOCAL",
            "label": "지역교육환경",
            "level": 2,
            "children": [
              {
                "code": "EDU.LOCAL.FACILITY",
                "label": "공공시설",
                "level": 3
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### 10.2 카테고리 상세 조회

`GET /api/categories/:categoryCode`

Response:

```json
{
  "success": true,
  "data": {
    "code": "EDU.LOCAL.FACILITY",
    "label": "공공시설",
    "level": 3,
    "parentCode": "EDU.LOCAL",
    "isActive": true
  }
}
```

---

## 11. Classification API

### 11.1 청원 분류 결과 조회

`GET /api/petitions/:petitionId/classification`

Response:

```json
{
  "success": true,
  "data": {
    "petitionId": "pet_001",
    "classifierVersion": "v1-rule-based",
    "primaryCategoryCode": "EDU.LOCAL.FACILITY",
    "secondaryCategoryCodes": [
      "LOCAL.GOV.PUBLIC_SERVICE"
    ],
    "confidence": 0.82,
    "reviewRequired": true,
    "matchedKeywords": [
      "도서관",
      "운영시간",
      "연장"
    ]
  }
}
```

---

### 11.2 운영자 수동 재분류

`PATCH /api/petitions/:petitionId/classification`

Request:

```json
{
  "primaryCategoryCode": "LOCAL.GOV.PUBLIC_SERVICE",
  "secondaryCategoryCodes": [
    "EDU.LOCAL.FACILITY"
  ],
  "reason": "운영자 수동 재분류"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "petitionId": "pet_001",
    "primaryCategoryCode": "LOCAL.GOV.PUBLIC_SERVICE",
    "secondaryCategoryCodes": [
      "EDU.LOCAL.FACILITY"
    ],
    "reviewRequired": false
  }
}
```

---

## 12. Review Queue API

### 12.1 검토 큐 목록 조회

`GET /api/review-queue`

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "rev_001",
        "petitionId": "pet_001",
        "reviewStatus": "pending",
        "confidence": 0.82,
        "primaryCategoryCode": "EDU.LOCAL.FACILITY",
        "assignedModeratorId": null,
        "createdAt": "2026-05-11T10:00:02.000Z"
      }
    ]
  }
}
```

---

### 12.2 검토 상세 조회

`GET /api/review-queue/:reviewQueueId`

Response:

```json
{
  "success": true,
  "data": {
    "id": "rev_001",
    "petitionId": "pet_001",
    "reviewStatus": "pending",
    "petition": {
      "id": "pet_001",
      "title": "우리 지역 도서관 운영시간 연장 요청"
    },
    "classification": {
      "primaryCategoryCode": "EDU.LOCAL.FACILITY",
      "secondaryCategoryCodes": [
        "LOCAL.GOV.PUBLIC_SERVICE"
      ],
      "confidence": 0.82,
      "matchedKeywords": [
        "도서관",
        "운영시간",
        "연장"
      ]
    }
  }
}
```

---

### 12.3 검토 승인

`PATCH /api/review-queue/:reviewQueueId/approve`

Request:

```json
{
  "notes": "문제 없음. 게시 승인."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "rev_001",
    "reviewStatus": "approved",
    "petitionStatus": "published"
  }
}
```

---

### 12.4 검토 반려

`PATCH /api/review-queue/:reviewQueueId/reject`

Request:

```json
{
  "reason": "운영 정책 위반"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "rev_001",
    "reviewStatus": "rejected",
    "petitionStatus": "rejected"
  }
}
```

---

### 12.5 재분류 후 승인

`PATCH /api/review-queue/:reviewQueueId/reclassify`

Request:

```json
{
  "primaryCategoryCode": "LOCAL.GOV.PUBLIC_SERVICE",
  "secondaryCategoryCodes": [
    "EDU.LOCAL.FACILITY"
  ],
  "notes": "운영자 검토 후 재분류"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "rev_001",
    "reviewStatus": "reclassified",
    "petitionStatus": "published"
  }
}
```

---

## 13. Dashboard API

### 13.1 관리자 대시보드 요약

`GET /api/admin/dashboard/overview`

Response:

```json
{
  "success": true,
  "data": {
    "totalUsers": 1024,
    "totalPetitions": 210,
    "publishedPetitions": 178,
    "pendingReviewPetitions": 12,
    "totalSignatures": 58320,
    "totalDonationAmount": 12850000
  }
}
```

---

### 13.2 서명 통계 대시보드

`GET /api/admin/dashboard/signatures`

Response:

```json
{
  "success": true,
  "data": {
    "totalCount": 58320,
    "byRegion": [
      { "regionCode": "KR-11", "count": 22000 }
    ],
    "byAgeBand": [
      { "ageBand": "20_29", "count": 13000 },
      { "ageBand": "30_39", "count": 19000 }
    ],
    "byGender": [
      { "gender": "female", "count": 31000 },
      { "gender": "male", "count": 26000 },
      { "gender": "other", "count": 320 }
    ]
  }
}
```

---

### 13.3 후원 통계 대시보드

`GET /api/admin/dashboard/donations`

Response:

```json
{
  "success": true,
  "data": {
    "totalAmount": 12850000,
    "donationCount": 920,
    "averageAmount": 13967,
    "byTargetType": [
      { "targetType": "petition", "amount": 9400000 },
      { "targetType": "platform", "amount": 3450000 }
    ]
  }
}
```

---

## 14. 상태값 정의

### 14.1 PetitionStatus

```txt
review
published
rejected
closed
achieved
```

### 14.2 ReviewStatus

```txt
pending
approved
rejected
reclassified
```

### 14.3 DonationStatus

```txt
pending      # Intent 생성 후 결제 대기
processing   # confirmPayment 호출 후 PG 응답 대기
paid         # PG 결제 성공
failed       # PG 결제 실패
cancelled    # 사용자가 결제 전 취소
refunded     # 환불 완료
```

### 14.4 DonationType

```txt
one_time
recurring
```

### 14.5 Gender

```txt
male
female
other
unknown
```

### 14.6 AgeBand

```txt
under_19
20_29
30_39
40_49
50_59
60_plus
unknown
```

---

## 15. MVP 우선 구현 API

초기 구현 우선순위는 아래와 같다.

### 1순위

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/petitions`
- `GET /api/petitions`
- `GET /api/petitions/:petitionId`
- `POST /api/petitions/:petitionId/signatures`
- `GET /api/categories/tree`

### 2순위

- `GET /api/petitions/:petitionId/classification`
- `GET /api/review-queue`
- `PATCH /api/review-queue/:reviewQueueId/approve`
- `PATCH /api/review-queue/:reviewQueueId/reject`
- `PATCH /api/review-queue/:reviewQueueId/reclassify`

### 3순위

- `POST /api/donations/intent`
- `POST /api/donations/confirm/:donationId`
- `POST /api/webhooks/payments`
- `GET /api/petitions/:petitionId/signatures/stats`
- `GET /api/petitions/:petitionId/donations/stats`
- `GET /api/admin/dashboard/overview`
- `GET /api/admin/dashboard/signatures`
- `GET /api/admin/dashboard/donations`

---

## 16. 구현 메모

- 청원 생성 시 자동분류 엔진을 실행하고, 결과를 별도 classification 결과로 저장한다.
- confidence가 낮은 경우 review queue에 자동 등록한다.
- 청원 테이블에는 `primaryCategoryCode`, `signatureCount`, `donationAmount` 같은 캐시 필드를 둘 수 있다.
- 서명 및 후원 통계는 대시보드 응답 최적화를 위해 별도 집계 로직을 둘 수 있다.
- 개인정보 보호를 위해 소수 집단 통계는 추후 마스킹 정책을 추가한다.
- 후원은 `IPaymentProvider` 추상화를 통해 Mock / Toss Payments를 환경변수로 전환 가능하다. 상세는 [docs/payments/payment-provider-abstraction.md](../payments/payment-provider-abstraction.md) 참조.
- 결제는 Intent → (PG 페이지) → Confirm의 2단계 흐름이며, Webhook을 통한 비동기 상태 업데이트를 지원한다.
- `provider` 필드는 클라이언트 DTO에 존재하지 않으며 서버가 `PAYMENT_PROVIDER` 환경변수로 결정한다.

---

## 17. 결론

이 API 계약서는 Ontology 기반 청원 + 후원 플랫폼의 MVP를 빠르게 구현하기 위한 초기 기준 문서다.

초기 개발 단계에서는 아래 흐름이 끊기지 않도록 구현하는 것이 가장 중요하다.

- 회원가입 / 로그인
- 청원 생성
- 자동분류 수행
- 검토 큐 반영
- 청원 게시
- 사용자 서명
- 후원 기록
- 관리자 통계 조회

이 문서를 기준으로 다음 단계에서 아래 작업으로 이어질 수 있다.

- Prisma `schema.prisma` 작성
- NestJS DTO / Controller / Service 생성
- Swagger 문서화
- 프론트엔드 API 클라이언트 타입 정의
- 인증/권한 Guard 구현

