# CLAUDE.md

## Project Identity

이 프로젝트는 **청원 + 후원 + 온톨로지 기반 자동분류 + 통계 대시보드**를 제공하는 시민참여 플랫폼이다.  
서비스의 기본 방향은 Change.org 스타일의 청원 플랫폼을 참고하되, 다음 차별점을 가진다:

1. 청원 등록 시 **Ontology 기반 자동 분류**
2. 청원별 및 플랫폼 단위 **후원 기능**
3. 서명/후원/카테고리/인구통계 기반 **운영 대시보드**
4. 운영자가 검토 가능한 **Review Queue 중심 운영 구조**

이 프로젝트의 목표는 단순 게시판이 아니라,  
**청원 생성 → 분류 → 공개 → 서명 → 후원 → 확산 → 통계 분석 → 운영 검토**  
흐름을 가진 실제 서비스형 플랫폼을 구축하는 것이다.

---

## Primary Goal

이 프로젝트에서 Claude가 수행해야 할 최우선 목표는 다음과 같다:

- 안정적인 웹 서비스 구조를 구축한다
- 유지보수 가능한 모듈형 아키텍처를 유지한다
- 프론트/백엔드/DB/분류 엔진 간 계약을 일관성 있게 유지한다
- 온톨로지 기반 분류와 운영 검토 프로세스를 중심으로 구현한다
- MVP를 빠르게 만들되, 이후 확장을 고려한 구조를 택한다

---

## Core Product Scope

반드시 포함해야 하는 핵심 기능:

- 회원가입 / 로그인
- 청원 생성 / 수정 / 조회 / 목록
- 청원 자동 분류
- 카테고리 기반 탐색
- 서명 기능
- 후원 기능
- 관리자 검토 큐
- 운영 대시보드
- 청원 업데이트 기능
- 지역 / 연령대 / 성별 기반 집계

초기 MVP에서는 다음이 우선이다:

1. 청원 등록
2. 청원 조회
3. 서명
4. 카테고리 구조
5. 룰 기반 자동분류 MVP
6. 후원 구조의 기본 설계
7. 관리자 대시보드 MVP

---

## Tech Stack

기본 기술 스택은 다음을 우선 기준으로 한다.

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React Query 또는 Next 내장 데이터 패턴 중 일관된 방식 선택
- Zod 기반 폼 검증 가능

### Backend
- NestJS
- TypeScript
- Prisma
- PostgreSQL
- class-validator / class-transformer
- 필요 시 Swagger

### Infra / Supporting
- Redis (캐시 / 큐 확장 가능성)
- OpenSearch 또는 Elasticsearch (후속 검색 확장)
- S3 호환 스토리지 (첨부파일)
- Docker / docker-compose for local dev

### Analytics / Dashboard
- 우선 내부 DB 기반 집계
- 추후 외부 웹분석 도구 연동 가능하게 확장

### Ontology / Classification
- packages/ontology 내부 모듈화
- 초기에는 룰 기반 + 사전 기반
- 이후 임베딩/ML/LLM 확장 가능 구조

---

## Repository Structure

권장 디렉토리 구조:

```txt
apps/
  web/              # Next.js frontend
  api/              # NestJS backend

packages/
  shared/           # 공통 타입, 유틸, 상수
  ontology/         # 카테고리, 사전, 룰, 분류 엔진
  ui/               # 공통 UI 컴포넌트 (필요시)

docs/
  prd/
  architecture/
  ontology/
  api/
  prompts/

infra/
  docker/
  scripts/

.claude/
CLAUDE.md
