# Initial API Contract
Ontology 기반 청원 + 후원 플랫폼 초기 API 계약서

## 1. 문서 목적

이 문서는 MVP 단계에서 사용할 초기 API 계약을 정의한다.  
목표는 다음과 같다.

- 프론트엔드와 백엔드 간 데이터 계약을 명확히 한다
- 엔드포인트 구조를 일관되게 유지한다
- 인증, 청원, 서명, 후원, 리뷰 큐, 대시보드 API의 범위를 정의한다
- 이후 구현 과정에서 breaking change를 줄인다

이 문서는 **구현 전 합의 문서**이며, 실제 코드 작성 시 DTO / Validator / Prisma schema와 함께 지속적으로 업데이트되어야 한다.

---

## 2. API 설계 원칙

### 2.1 기본 원칙
- REST 스타일 우선
- 리소스 중심 URL 사용
- JSON 기반 요청/응답
- 인증 필요 여부를 명확히 구분
- 공개 API와 관리자 API를 명확히 분리
- 에러 포맷 일관성 유지
- 페이지네이션 / 정렬 / 필터 규칙 통일

### 2.2 네이밍 원칙
- 복수형 리소스 사용: `/petitions`, `/signatures`, `/categories`
- 관리자 API는 `/admin` prefix 사용
- review queue는 운영 기능이므로 `/admin/review-queue` 사용
- 대시보드는 `/admin/dashboard/*` 하위에 배치

### 2.3 응답 원칙
- 단건 조회: `data`
- 목록 조회: `data`, `meta`
- 생성/수정 후: 변경된 리소스 반환
- 에러: `error` 객체로 통일

---

## 3. Base URL 및 버전 전략

### 3.1 Base URL
```txt
/api
