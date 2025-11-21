# Summary API Documentation

## Endpoint

```http
POST /api/v1/summary
```

## Description

PDF 이력서를 분석하여 지원자의 직무, 기술 스택, 경력 상세 정보를 추출합니다.

## Request

### Content-Type

```http
multipart/form-data
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pdf | File | Yes | PDF 형식의 이력서 파일 |

### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/api/v1/summary \
  -H "Content-Type: multipart/form-data" \
  -F "pdf=@/path/to/resume.pdf"
```

### Example Request (JavaScript)

```javascript
const formData = new FormData();
formData.append('pdf', pdfFile); // File object

const response = await fetch('/api/v1/summary', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "position": "풀스택 개발자 (신입)",
    "techStack": [
      "TypeScript",
      "NestJS",
      "Next.js",
      "Flutter",
      "React",
      "Vue3",
      "PostgreSQL",
      "AWS",
      "Nginx",
      "GitActions"
    ],
    "careerDetail": "늦은 나이에 프로그래밍에 입문하여 절실한 마음으로 풀스택 개발 역량을 쌓은 신입 개발자입니다. 정부지원과정과 3개의 스타트업 경험을 통해 NestJS, Next.js, Flutter, React, Vue3 등을 활용한 풀스택 개발 및 프로젝트 구축 경험을 보유하고 있습니다..."
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | 요청 성공 여부 |
| data.position | string | 주요 직무 (예: Backend Developer, Frontend Engineer, Full-stack Developer) |
| data.techStack | string[] | 기술 스택 목록 (최대 10개) |
| data.careerDetail | string | 경력 요약 (10-15문장) |

### Error Response (400 Bad Request)

#### Case 1: PDF 파일 누락

```json
{
  "success": false,
  "errorMessage": "PDF file is required"
}
```

#### Case 2: AI 분석 실패

```json
{
  "success": false,
  "errorMessage": "Failed to analyze PDF resume"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "errorMessage": "Internal server error"
}
```

## Notes

- **파일 크기 제한**: 최대 15MB
- **지원 형식**: PDF만 지원
- **타임아웃**: 최대 60초
- **언어**: 이력서의 주요 언어로 자동 응답 (한국어 이력서 → 한국어 응답)
- **AI 모델**: Google Gemini 2.5 Flash 사용

## Implementation Details

### Process Flow

1. multipart/form-data 파싱 (Busboy 사용)
2. PDF 파일 Buffer 추출
3. Google Gemini API를 통한 이력서 분석
4. JSON 응답 파싱 및 검증
5. 클라이언트에 결과 반환

### Error Handling

- FormData 파싱 실패 시 500 에러 반환
- PDF 파일이 없을 경우 400 에러 반환
- AI 분석 실패 시 400 에러 반환
- 예상치 못한 에러 시 500 에러 반환

## Example Usage in Postman

1. Method: `POST`
2. URL: `http://localhost:3000/api/v1/summary`
3. Body:
   - Type: `form-data`
   - Key: `pdf` (File type)
   - Value: Select PDF file

## Rate Limiting

현재 Rate Limiting이 적용되어 있지 않습니다. 프로덕션 환경에서는 적절한 Rate Limiting 구현을 권장합니다.

## Related APIs

- `POST /api/v1/embed` - 텍스트 임베딩 생성 (향후 구현 예정)
