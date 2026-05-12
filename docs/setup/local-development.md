# Local Development Guide
Ontology 기반 청원 + 후원 플랫폼 로컬 개발 환경 설정 가이드

## 1. 문서 목적

이 문서는 프로젝트를 로컬 환경에서 실행하기 위한 개발 환경 구성 절차를 정리한다.  
목표는 다음과 같다.

- 신규 개발자가 빠르게 프로젝트를 실행할 수 있게 한다
- Web / API / DB / Seed / Migration 흐름을 일관되게 맞춘다
- 환경변수와 실행 절차를 표준화한다
- 로컬 개발 시 자주 발생하는 문제를 줄인다

이 문서는 **로컬 개발 기준 문서**이며, 배포 환경 구성과는 별도로 관리한다.

---

## 2. 기본 가정

이 문서는 다음 구조를 기준으로 작성한다.

```txt
apps/
  web/        # Next.js
  api/        # NestJS

packages/
  shared/
  ontology/

docs/
infra/
CLAUDE.md
README.md
```

---

## 3. Payment System (Local Dev)

기본값 `PAYMENT_PROVIDER=mock`으로 실제 PG 없이 전체 2단계 결제 흐름을 테스트할 수 있다.

### Mock 결제 흐름

1. `POST /donations/intent` → `{ donationId, checkoutUrl, paymentIntentId }` 반환
2. `checkoutUrl`은 로컬 mock checkout URL (실제 결제 페이지 없음)
3. `POST /donations/confirm/:donationId` with `{ amount }` → 결제 완료 상태 반환

로컬에서는 intent 생성 직후 confirm 엔드포인트를 바로 호출해서 테스트할 수 있다.

### Mock Webhook 테스트

```bash
curl -X POST http://localhost:3001/webhooks/payments \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "mock-event-001",
    "eventType": "payment.completed",
    "paymentIntentId": "<createIntent 응답의 paymentIntentId>",
    "status": "paid"
  }'
```

Mock provider는 서명 검증을 건너뛰므로 signature 헤더 없이 호출 가능하다.

### Toss Payments로 전환

`.env`에 다음을 설정:

```
PAYMENT_PROVIDER=toss
TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
TOSS_WEBHOOK_SECRET=<Toss 개발자 콘솔에서 발급>
TOSS_SUCCESS_URL=http://localhost:3000/donations/success
TOSS_FAIL_URL=http://localhost:3000/donations/fail
```

전체 체크리스트는 [docs/payments/payment-provider-abstraction.md](../payments/payment-provider-abstraction.md)를 참조한다.
