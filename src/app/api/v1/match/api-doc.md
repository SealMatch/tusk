# Match API Documentation

## POST `/api/v1/match`

이력서 열람 요청 API - 구인자(recruiter)가 구직자(applicant)에게 이력서 열람을 요청합니다.

### Request

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recruiterWalletAddress` | string | Yes | 구인자의 지갑 주소 |
| `applicantId` | string (uuid) | Yes | 구직자 ID |

#### Headers

```
Content-Type: application/json
```

### Response

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "355fd1c0-19d2-4baa-a817-e1f6d1e3d9cf",
    "recruiterWalletAddress": "0xRecruiter123",
    "applicantId": "f99db28d-81fa-4eaf-b054-a6a7dfecf169",
    "status": "pending",
    "createdAt": "2025-11-22T07:12:42.220Z",
    "updatedAt": "2025-11-22T07:12:42.220Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | 요청 성공 여부 |
| `data` | Match | 생성된 매치 정보 |
| `data.id` | string (uuid) | 매치 고유 ID |
| `data.recruiterWalletAddress` | string | 구인자 지갑 주소 |
| `data.applicantId` | string (uuid) | 구직자 ID |
| `data.status` | string | 매치 상태 (pending, accepted, rejected, cancelled) |
| `data.createdAt` | string (ISO 8601) | 생성 시각 |
| `data.updatedAt` | string (ISO 8601) | 수정 시각 |

#### Error Responses

**400 Bad Request - Missing Parameters**

```json
{
  "success": false,
  "errorMessage": "recruiterWalletAddress and applicantId are required"
}
```

**404 Not Found - Applicant Not Found**

```json
{
  "success": false,
  "errorMessage": "Applicant not found"
}
```

**409 Conflict - Duplicate Request**

```json
{
  "success": false,
  "errorMessage": "Match request already exists"
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

#### Example 1: 이력서 열람 요청 생성

**Request:**

```bash
curl -X POST "http://localhost:3000/api/v1/match" \
  -H "Content-Type: application/json" \
  -d '{
    "recruiterWalletAddress": "0xRecruiter123",
    "applicantId": "f99db28d-81fa-4eaf-b054-a6a7dfecf169"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "355fd1c0-19d2-4baa-a817-e1f6d1e3d9cf",
    "recruiterWalletAddress": "0xRecruiter123",
    "applicantId": "f99db28d-81fa-4eaf-b054-a6a7dfecf169",
    "status": "pending",
    "createdAt": "2025-11-22T07:12:42.220Z",
    "updatedAt": "2025-11-22T07:12:42.220Z"
  }
}
```

#### Example 2: 중복 요청 시도

같은 구인자가 같은 구직자에게 이미 pending 상태로 요청한 경우:

**Request:**

```bash
curl -X POST "http://localhost:3000/api/v1/match" \
  -H "Content-Type: application/json" \
  -d '{
    "recruiterWalletAddress": "0xRecruiter123",
    "applicantId": "f99db28d-81fa-4eaf-b054-a6a7dfecf169"
  }'
```

**Response:**

```json
{
  "success": false,
  "errorMessage": "Match request already exists"
}
```

#### Example 3: 존재하지 않는 구직자

**Request:**

```bash
curl -X POST "http://localhost:3000/api/v1/match" \
  -H "Content-Type: application/json" \
  -d '{
    "recruiterWalletAddress": "0xRecruiter123",
    "applicantId": "00000000-0000-0000-0000-000000000000"
  }'
```

**Response:**

```json
{
  "success": false,
  "errorMessage": "Applicant not found"
}
```

### Business Logic

#### 1. Applicant 존재 확인
- 요청된 `applicantId`가 데이터베이스에 존재하는지 확인
- 존재하지 않으면 404 에러 반환

#### 2. 중복 요청 방지
- 같은 `recruiterWalletAddress`와 `applicantId` 조합으로
- `status`가 `pending`인 매치가 이미 있는지 확인
- 중복이면 409 에러 반환

#### 3. 매치 생성
- 모든 검증을 통과하면 `status: "pending"`으로 매치 생성
- 생성된 매치 정보 반환

### Notes

- **가격 정보**: Match 테이블에는 `price` 필드가 없습니다. 가격 정보는 `applicants` 테이블의 `access_price`를 참조하세요.
- **중복 체크**: `pending` 상태인 요청만 중복으로 간주합니다. `accepted`, `rejected`, `cancelled` 상태는 중복 체크에서 제외됩니다.
- **상태 초기값**: 생성 시 `status`는 항상 `pending`으로 설정됩니다.
- **자동 생성 필드**: `id`, `createdAt`, `updatedAt`는 자동으로 생성됩니다.

### Database Schema

```sql
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  recruiter_wallet_address text NOT NULL,
  applicant_id uuid NOT NULL REFERENCES applicants(id),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX matches_recruiter_wallet_address_idx
  ON matches USING btree (recruiter_wallet_address);

CREATE INDEX matches_applicant_id_idx
  ON matches USING btree (applicant_id);

CREATE INDEX matches_status_idx
  ON matches USING btree (status);
```

### Implementation

- **Route**: [src/app/api/v1/match/route.ts](./route.ts)
- **Service**: [src/server/domains/match/match.service.ts](../../../../server/domains/match/match.service.ts)
- **Repository**: [src/server/domains/match/match.repository.ts](../../../../server/domains/match/match.repository.ts)
- **Schema**: [src/server/db/schema/matches.schema.ts](../../../../server/db/schema/matches.schema.ts)
