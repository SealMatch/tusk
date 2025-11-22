# Search Result Cards API 문서

## POST `/api/v1/search/result-cards`

검색 결과를 Match 정보와 함께 반환하는 API - 구인자가 열람 요청한 구직자 정보만 필터링하여 제공합니다.

### 개요

검색 결과를 입력받아, 해당 구인자가 Match 요청을 보낸 구직자들의 상세 정보만 반환합니다.

---

## Request

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | 검색 쿼리 (기록용) |
| `recruiterWalletAddress` | string | Yes | 구인자 지갑 주소 (0x로 시작) |
| `results` | SearchResultItem[] | Yes | 검색 결과 배열 |

#### SearchResultItem

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `applicantId` | string (uuid) | Yes | 구직자 ID |
| `similarity` | number | Yes | 유사도 점수 (0~1) |
| `createdAt` | string (ISO 8601) | Yes | 검색 시각 |

#### Headers

```http
Content-Type: application/json
```

### 요청 예시

```bash
curl -X POST "http://localhost:3000/api/v1/search/result-cards" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "풀스택 개발자 (신입)",
    "recruiterWalletAddress": "0xTestRecruiter",
    "results": [
      {
        "applicantId": "f99db28d-81fa-4eaf-b054-a6a7dfecf169",
        "similarity": 0.95,
        "createdAt": "2025-11-22T07:57:59.937Z"
      }
    ]
  }'
```

---

## Response

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "applicant": {
        "id": "f99db28d-81fa-4eaf-b054-a6a7dfecf169",
        "handle": "@developer123",
        "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
        "position": "풀스택 개발자 (신입)",
        "techStack": ["TypeScript", "React", "Node.js"],
        "aiSummary": "경험 많은 풀스택 개발자...",
        "accessPrice": 50000,
        "isJobSeeking": true,
        "createdAt": "2025-11-21T16:00:13.033Z",
        "updatedAt": "2025-11-21T16:00:13.033Z"
      },
      "match": {
        "id": "355fd1c0-19d2-4baa-a817-e1f6d1e3d9cf",
        "recruiterWalletAddress": "0xTestRecruiter",
        "applicantId": "f99db28d-81fa-4eaf-b054-a6a7dfecf169",
        "status": "pending",
        "createdAt": "2025-11-22T07:12:42.220Z",
        "updatedAt": "2025-11-22T07:12:42.220Z"
      },
      "similarity": 0.95,
      "createdAt": "2025-11-22T07:57:59.937Z"
    }
  ]
}
```

#### SearchResultCard

| Field | Type | Description |
|-------|------|-------------|
| `applicant` | Applicant | 구직자 상세 정보 |
| `match` | Match | 매치 정보 (열람 요청 상태 포함) |
| `similarity` | number | 유사도 점수 (0~1) |
| `createdAt` | Date | 검색 시각 |

---

## Error Responses

### 400 Bad Request - recruiterWalletAddress 누락

```json
{
  "success": false,
  "errorMessage": "recruiterWalletAddress is required"
}
```

### 400 Bad Request - 잘못된 지갑 주소 형식

```json
{
  "success": false,
  "errorMessage": "Invalid wallet address format"
}
```

**원인**: 지갑 주소가 `0x`로 시작하지 않음

### 400 Bad Request - query 누락

```json
{
  "success": false,
  "errorMessage": "query is required and must be a string"
}
```

### 400 Bad Request - 잘못된 results 형식

```json
{
  "success": false,
  "errorMessage": "results must be an array"
}
```

### 400 Bad Request - 잘못된 result 항목

```json
{
  "success": false,
  "errorMessage": "Each result item must have a valid applicantId"
}
```

**원인**: results 배열 항목에 필수 필드 누락:
- `applicantId` (string)
- `similarity` (number)
- `createdAt` (string)

### 500 Internal Server Error

```json
{
  "success": false,
  "errorMessage": "Internal server error"
}
```

---

## 처리 흐름

```text
POST /api/v1/search/result-cards
  ↓
1. Request Body 파싱 및 검증
  ↓
2. results[]에서 applicantId 추출
  ↓
3. 병렬 쿼리 실행:
   - ApplicantRepo.findByIds(applicantIds)
   - MatchRepo.findByRecruiterAndApplicantIds(recruiter, applicantIds)
  ↓
4. Map 생성:
   - applicantId → Applicant
   - applicantId → Match
  ↓
5. 필터링 & 결합 (match가 존재하는 항목만)
  ↓
6. SearchResultCard[] 반환
```

---

## 비즈니스 로직

### 1. 입력 검증
- `recruiterWalletAddress`가 `0x`로 시작하는지 확인
- `query`가 비어있지 않은 문자열인지 확인
- `results`가 유효한 배열인지 확인

### 2. Applicant ID 추출
- `results` 배열에서 모든 `applicantId` 추출
- 빈 배열인 경우 즉시 빈 결과 반환

### 3. 병렬 데이터베이스 쿼리
- **Query 1**: ID로 모든 applicant 조회
- **Query 2**: 구인자와 applicant ID로 모든 match 조회
- `Promise.all()`로 병렬 실행하여 성능 최적화

### 4. Map 생성
- `applicantsMap`: applicant ID로 빠른 조회
- `matchesMap`: applicant ID로 빠른 조회

### 5. 필터링 & 결합
- **중요**: match가 존재하는 항목만 반환
- match가 없는 applicant는 결과에서 제외
- applicant, match, similarity 데이터 결합

### 6. 결과 반환
- `SearchResultCard[]` 배열 반환
- match가 없으면 빈 배열 반환

---

## 예시

### 예시 1: 정상 요청 (Match 존재)

**Request:**

```bash
curl -X POST "http://localhost:3000/api/v1/search/result-cards" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "백엔드 개발자",
    "recruiterWalletAddress": "0xTestRecruiter",
    "results": [
      {
        "applicantId": "f99db28d-81fa-4eaf-b054-a6a7dfecf169",
        "similarity": 0.95,
        "createdAt": "2025-11-22T07:57:59.937Z"
      }
    ]
  }'
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "applicant": { /* 전체 applicant 데이터 */ },
      "match": {
        "id": "355fd1c0-19d2-4baa-a817-e1f6d1e3d9cf",
        "status": "pending",
        ...
      },
      "similarity": 0.95,
      "createdAt": "2025-11-22T07:57:59.937Z"
    }
  ]
}
```

### 예시 2: Match 없는 항목 필터링

**Request:**

```bash
# applicant1: Match 있음
# applicant2: Match 없음

curl -X POST "http://localhost:3000/api/v1/search/result-cards" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "개발자",
    "recruiterWalletAddress": "0xRecruiter123",
    "results": [
      {
        "applicantId": "applicant1-id",
        "similarity": 0.95,
        "createdAt": "2025-11-22T08:00:00.000Z"
      },
      {
        "applicantId": "applicant2-id",
        "similarity": 0.87,
        "createdAt": "2025-11-22T08:00:00.000Z"
      }
    ]
  }'
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "applicant": { /* applicant1 데이터 */ },
      "match": { /* applicant1 match */ },
      "similarity": 0.95,
      ...
    }
    // applicant2는 match가 없어서 제외됨
  ]
}
```

### 예시 3: 빈 결과

**Request:**

```bash
curl -X POST "http://localhost:3000/api/v1/search/result-cards" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test",
    "recruiterWalletAddress": "0xTestRecruiter",
    "results": []
  }'
```

**Response:**

```json
{
  "success": true,
  "data": []
}
```

---

## 사용 예시

### JavaScript (Fetch API)

```javascript
const getSearchResultCards = async (query, recruiterWalletAddress, results) => {
  const response = await fetch('/api/v1/search/result-cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      recruiterWalletAddress,
      results,
    }),
  });

  const data = await response.json();

  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.errorMessage);
  }
};
```

### TypeScript

```typescript
interface SearchResultItem {
  applicantId: string;
  similarity: number;
  createdAt: string;
}

interface SearchResultCard {
  applicant: Applicant;
  match: Match;
  similarity: number;
  createdAt: Date;
}

const getSearchResultCards = async (
  query: string,
  recruiterWalletAddress: string,
  results: SearchResultItem[]
): Promise<SearchResultCard[]> => {
  const response = await fetch('/api/v1/search/result-cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      recruiterWalletAddress,
      results,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.errorMessage);
  }

  return data.data;
};
```

### React Query

```typescript
import { useMutation } from '@tanstack/react-query';

const useGetSearchResultCards = () => {
  return useMutation({
    mutationFn: async ({
      query,
      recruiterWalletAddress,
      results,
    }: {
      query: string;
      recruiterWalletAddress: string;
      results: SearchResultItem[];
    }) => {
      const response = await fetch('/api/v1/search/result-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          recruiterWalletAddress,
          results,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.errorMessage);
      }

      return data.data;
    },
  });
};
```

---

## 핵심 포인트

### 중요 사항

- **Match 존재 항목만 반환**: Match 요청이 있는 applicant만 결과에 포함
- **필터링 로직**: `results`에 있어도 match가 없으면 제외됨
- **성능 최적화**: Applicant와 Match 조회를 병렬로 실행
- **빈 배열 처리**: `results`가 빈 배열이면 DB 조회 없이 즉시 빈 결과 반환

### 사용 시나리오

1. **검색 후 열람 요청 상태 확인**: 검색 후 이력서 열람 요청을 보낸 후보자들의 정보를 다시 확인
2. **Match 상태별 필터링**: 응답받은 `data` 배열을 `match.status`로 필터링 (pending/accepted/rejected)
3. **가격 정보 확인**: Match 테이블에는 `price` 필드가 없으므로 `applicant.accessPrice` 사용

---

## 관련 엔드포인트

- **GET `/api/v1/search`** - 벡터 유사도 기반 구직자 검색
- **POST `/api/v1/match`** - 이력서 열람 요청 생성
- **GET `/api/v1/histories`** - 구인자의 검색 이력 조회

---

## 구현 파일

- **Route**: [src/app/api/v1/search/result-cards/route.ts](./route.ts)
- **Service**: [src/server/domains/histories/history.service.ts](../../../../../server/domains/histories/history.service.ts)
- **Repository (Applicants)**: [src/server/domains/applicants/applicants.repository.ts](../../../../../server/domains/applicants/applicants.repository.ts)
- **Repository (Match)**: [src/server/domains/match/match.repository.ts](../../../../../server/domains/match/match.repository.ts)
- **타입 정의**: [src/server/domains/histories/history.type.ts](../../../../../server/domains/histories/history.type.ts)

---

## 테스트

### 테스트 스크립트

```bash
# 데이터베이스 테스트 데이터 확인
npx tsx src/server/shared/tests/prepare-test-data.ts

# API 테스트 실행
npx tsx src/server/shared/tests/api-search-result-cards.test.ts
```

### 테스트 커버리지

- ✅ 정상 케이스 (match 존재)
- ✅ Validation 에러 (모든 필수 필드)
- ✅ 빈 배열 처리
- ✅ Match 없는 항목 필터링

---

## 버전 히스토리

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-22 | 초기 구현 |
