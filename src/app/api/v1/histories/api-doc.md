# Search Histories API Documentation

## GET `/api/v1/histories`

검색 이력 조회 API - 특정 구인자(recruiter)의 검색 이력을 조회합니다.

### Request

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recruiterAddress` | string | Yes | 구인자의 지갑 주소 (0x로 시작) |

#### Headers

없음

### Response

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "3690d570-3d54-4e6a-b84f-631d72a1d711",
      "recruiterWalletAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "query": "React developer",
      "applicantIds": [
        "f99db28d-81fa-4eaf-b054-a6a7dfecf169"
      ],
      "createdAt": "2025-11-22T06:17:27.745Z"
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | 요청 성공 여부 |
| `data` | History[] | 검색 이력 배열 (최신순 정렬) |
| `data[].id` | string (uuid) | 검색 이력 고유 ID |
| `data[].recruiterWalletAddress` | string | 구인자 지갑 주소 |
| `data[].query` | string | 검색 쿼리 |
| `data[].applicantIds` | string[] | 검색 결과로 반환된 구직자 ID 배열 |
| `data[].createdAt` | string (ISO 8601) | 검색 시각 |

#### Error Responses

**400 Bad Request - Missing Parameter**

```json
{
  "success": false,
  "errorMessage": "recruiterAddress parameter is required"
}
```

**400 Bad Request - Invalid Address Format**

```json
{
  "success": false,
  "errorMessage": "Invalid wallet address format"
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "errorMessage": "Internal server error"
}
```

### Examples

#### Example 1: 검색 이력 조회

**Request:**

```bash
curl "http://localhost:3000/api/v1/histories?recruiterAddress=0x1234567890abcdef1234567890abcdef12345678"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "3690d570-3d54-4e6a-b84f-631d72a1d711",
      "recruiterWalletAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "query": "React developer",
      "applicantIds": [
        "f99db28d-81fa-4eaf-b054-a6a7dfecf169"
      ],
      "createdAt": "2025-11-22T06:17:27.745Z"
    },
    {
      "id": "2580d460-2c43-3d5a-a73e-520c61a0c600",
      "recruiterWalletAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "query": "Senior backend engineer",
      "applicantIds": [
        "a88cb17c-70ea-3dae-9043-95a6cfdbb058",
        "b99dc28e-81fb-4ebf-b165-b7b8egedf270"
      ],
      "createdAt": "2025-11-22T05:10:15.123Z"
    }
  ]
}
```

#### Example 2: 검색 이력이 없는 경우

**Request:**

```bash
curl "http://localhost:3000/api/v1/histories?recruiterAddress=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
```

**Response:**

```json
{
  "success": true,
  "data": []
}
```

#### Example 3: 잘못된 주소 형식

**Request:**

```bash
curl "http://localhost:3000/api/v1/histories?recruiterAddress=invalid-address"
```

**Response:**

```json
{
  "success": false,
  "errorMessage": "Invalid wallet address format"
}
```

### Notes

- 검색 이력은 `/api/v1/search` API 호출 시 자동으로 저장됩니다
- 검색 이력은 `createdAt` 기준 **최신순**으로 정렬되어 반환됩니다
- `applicantIds` 배열은 해당 검색에서 반환된 구직자들의 ID 목록입니다
- 검색 이력은 비동기적으로 저장되므로, `/api/v1/search` 응답 직후 바로 조회하면 나타나지 않을 수 있습니다 (일반적으로 수백ms 이내 저장)

### Related APIs

- [POST /api/v1/search](../search/api-doc.md) - 구직자 검색 API (검색 시 이력이 자동 저장됨)

### Database Schema

```sql
CREATE TABLE histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  recruiter_wallet_address text NOT NULL,
  query text NOT NULL,
  applicant_ids text[] NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX histories_recruiter_wallet_address_idx
  ON histories USING btree (recruiter_wallet_address);

CREATE INDEX histories_created_at_idx
  ON histories USING btree (created_at);
```

### Implementation

- **Route**: [src/app/api/v1/histories/route.ts](./route.ts)
- **Service**: [src/server/domains/histories/history.service.ts](../../../../server/domains/histories/history.service.ts)
- **Repository**: [src/server/domains/histories/history.repository.ts](../../../../server/domains/histories/history.repository.ts)
- **Schema**: [src/server/db/schema/histories.schema.ts](../../../../server/db/schema/histories.schema.ts)
