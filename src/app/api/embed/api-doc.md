# Embed API

텍스트를 벡터 임베딩으로 변환하는 API입니다.

## 기본 정보

- **Endpoint**: `POST /api/embed`
- **Model**: Google Gemini `text-embedding-004`
- **Vector Dimensions**: 768

## Request

**Headers**
- Content-Type: application/json

**Body**
- `text` (string, required): 임베딩으로 변환할 텍스트 (최소 1자 이상)

**Example**
```json
{
  "text": "Java 개발 역량: Spring Boot 프레임워크 활용, JPA를 이용한 데이터베이스 설계, RESTful API 설계 및 구현"
}
```

## Response

### 성공 (200 OK)
```json
{
  "success": true,
  "data": {
    "embedding": [-0.027926963, 0.007929906, 0.0216715, ...],
    "dimensions": 768
  }
}
```

### 실패

**Validation 에러 (400)**
```json
{
  "success": false,
  "errorMessage": "Invalid request data"
}
```

**임베딩 생성 실패 (400)**
```json
{
  "success": false,
  "errorMessage": "Failed to create embedding"
}
```

**서버 에러 (500)**
```json
{
  "success": false,
  "errorMessage": "Internal server error"
}
```

## 참고사항

- 최대 입력 길이: Gemini API 제한에 따름
- Rate Limiting: 환경에 따라 다를 수 있음
