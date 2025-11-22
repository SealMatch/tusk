# Search API Documentation

## Endpoint

```
GET /api/v1/search?query=
```

벡터 유사도 기반 지원자 검색 API

## Description

자연어 검색어를 입력받아 LLM 임베딩을 생성하고, PostgreSQL pgvector를 통해 유사도 검색을 수행합니다.

### Flow

1. **검색어 입력** → 프론트엔드에서 검색어 전송
2. **벡터 임베딩** → Gemini embedding-004로 768차원 벡터 생성
3. **유사도 검색** → PostgreSQL pgvector의 cosine distance로 유사도 계산
4. **결과 반환** → 유사도 점수와 함께 상위 N개 후보자 반환

---

## Request

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | ✅ Yes | - | 검색어 (예: "React 3년차 백엔드 개발자") |
| `limit` | number | ❌ No | 20 | 결과 개수 제한 (1~100) |

### Example Request

```bash
# 기본 검색
GET /api/v1/search?query=React%20개발자

# 결과 개수 제한
GET /api/v1/search?query=백엔드%20개발자%203년차&limit=10

# cURL
curl "http://localhost:3000/api/v1/search?query=React%20개발자&limit=5"
```

---

## Response

### Success Response (200 OK)

```typescript
{
  success: true,
  data: {
    results: SearchResultItem[],
    total: number
  }
}
```

#### SearchResultItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | 지원자 ID (UUID) |
| `handle` | string | 사용자 핸들 |
| `position` | string | 직무/포지션 |
| `techStack` | string[] | 기술 스택 배열 |
| `aiSummary` | string | AI 생성 요약 |
| `blobId` | string | Walrus 스토리지 ID |
| `sealPolicyId` | string | Seal 암호화 정책 ID |
| `accessPrice` | number | 접근 비용 |
| `similarity` | number | 유사도 점수 (0~1, 높을수록 유사) |
| `createdAt` | Date | 생성 시간 |

### Example Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "handle": "developer123",
        "position": "백엔드 개발자",
        "techStack": ["React", "Node.js", "PostgreSQL", "TypeScript"],
        "aiSummary": "3년차 풀스택 개발자로 React와 Node.js를 활용한 웹 애플리케이션 개발 경험이 풍부합니다.",
        "blobId": "walrus_blob_abc123",
        "sealPolicyId": "seal_policy_xyz",
        "accessPrice": 1000,
        "similarity": 0.9523,
        "createdAt": "2025-01-15T10:30:00.000Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "handle": "coder456",
        "position": "프론트엔드 개발자",
        "techStack": ["React", "Vue.js", "TailwindCSS"],
        "aiSummary": "React 전문 프론트엔드 개발자, UI/UX 최적화 경험 보유",
        "blobId": "walrus_blob_def456",
        "sealPolicyId": "seal_policy_uvw",
        "accessPrice": 800,
        "similarity": 0.8891,
        "createdAt": "2025-01-14T15:20:00.000Z"
      }
    ],
    "total": 2
  }
}
```

---

## Error Responses

### 400 Bad Request - Missing Query

```json
{
  "success": false,
  "errorMessage": "Query parameter is required"
}
```

**원인**: `query` 파라미터가 누락되거나 빈 문자열

---

### 400 Bad Request - Invalid Limit

```json
{
  "success": false,
  "errorMessage": "Limit must be between 1 and 100"
}
```

**원인**: `limit` 값이 1~100 범위를 벗어남

---

### 500 Internal Server Error - Embedding Failure

```json
{
  "success": false,
  "errorMessage": "Failed to create embedding"
}
```

**원인**: LLM 임베딩 생성 실패 (Gemini API 오류, 네트워크 문제 등)

---

### 500 Internal Server Error - Database Error

```json
{
  "success": false,
  "errorMessage": "Database query failed"
}
```

**원인**: PostgreSQL pgvector 검색 실패

---

## Technical Details

### Vector Similarity Search

- **임베딩 모델**: Google Gemini `text-embedding-004`
- **벡터 차원**: 768
- **유사도 측정**: Cosine Distance (`<=>` 연산자)
- **유사도 계산 공식**: `similarity = 1 - cosine_distance`

### SQL Query (Internal)

```sql
SELECT
  id,
  handle,
  position,
  tech_stack,
  ai_summary,
  blob_id,
  seal_policy_id,
  access_price,
  created_at,
  1 - (embedding <=> '[0.123, -0.456, ...]'::vector) as similarity
FROM applicants
WHERE is_job_seeking = true
ORDER BY embedding <=> '[0.123, -0.456, ...]'::vector
LIMIT 20;
```

### Performance Considerations

- **인덱싱**: pgvector IVFFlat 또는 HNSW 인덱스 권장 (현재 미적용)
- **캐싱**: 동일 검색어에 대한 임베딩 결과 캐싱 고려
- **Rate Limiting**: Gemini API 호출 제한 고려 필요

---

## Usage Examples

### JavaScript (Fetch API)

```javascript
const searchApplicants = async (query, limit = 20) => {
  const response = await fetch(
    `/api/v1/search?query=${encodeURIComponent(query)}&limit=${limit}`
  );

  const data = await response.json();

  if (data.success) {
    return data.data.results;
  } else {
    throw new Error(data.errorMessage);
  }
};

// 사용
const results = await searchApplicants("React 개발자", 10);
console.log(results);
```

### TypeScript (with Axios)

```typescript
import axios from 'axios';

interface SearchResult {
  id: string;
  handle: string;
  position: string;
  techStack: string[];
  aiSummary: string;
  similarity: number;
  // ...
}

const searchApplicants = async (
  query: string,
  limit: number = 20
): Promise<SearchResult[]> => {
  const { data } = await axios.get('/api/v1/search', {
    params: { query, limit },
  });

  if (!data.success) {
    throw new Error(data.errorMessage);
  }

  return data.data.results;
};
```

### React Query

```typescript
import { useQuery } from '@tanstack/react-query';

const useSearchApplicants = (query: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['search', query, limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.errorMessage);
      }

      return data.data.results;
    },
    enabled: query.length > 0,
  });
};
```

---

## Related Endpoints

- `POST /api/v1/applicants` - 지원자 등록 (임베딩 자동 생성)
- `POST /api/v1/embed` - 텍스트 임베딩 생성
- `POST /api/v1/summary` - PDF 이력서 분석

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-22 | Initial implementation |

---

## Notes

- 검색어는 자연어로 입력 가능 (예: "React 3년차 백엔드 개발자")
- `is_job_seeking = true`인 지원자만 검색 대상
- 유사도 점수는 0~1 범위 (1에 가까울수록 유사)
- 검색 결과는 유사도 내림차순으로 정렬됨
