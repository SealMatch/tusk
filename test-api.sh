#!/bin/bash

echo "🧪 Testing POST /api/v1/applicants with curl"
echo "============================================"
echo ""

# Mock 데이터를 기반으로 한 JSON payload
curl -X POST http://localhost:3000/api/v1/applicants \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "김철수",
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
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
    "aiSummary": "이 후보자는 비전공자 출신임에도 불구하고 3개의 스타트업 경험을 통해 실전 풀스택 개발 역량을 단기간에 습득한 신입 개발자입니다. NestJS와 Next.js를 중심으로 한 TypeScript 기반 풀스택 아키텍처 설계 및 구현 경험을 보유하고 있으며, AI OCR 서비스 개발, S3 presignedUrl을 활용한 보안 최적화, CI/CD 파이프라인 구축 등 실무 중심의 다양한 프로젝트를 주도한 이력이 있습니다.",
    "blobId": "blob_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
    "sealPolicyId": "seal_policy_xyz789abc123def456ghi789jkl012mno345",
    "accessPrice": 50000,
    "isJobSeeking": true
  }' \
  | jq '.'

echo ""
echo "✅ Test completed!"
