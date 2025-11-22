# Seal Match - 로컬 개발 환경 설정 가이드

## 📋 사전 요구사항

- Docker & Docker Compose
- Node.js 20+
- npm

## 🚀 빠른 시작

### 1. PostgreSQL + pgvector 시작

로컬 데이터베이스를 Docker로 실행합니다:

```bash
docker-compose up -d
```

데이터베이스가 정상적으로 시작되었는지 확인:

```bash
docker-compose ps
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/seal_match

# 기타 환경 변수들...
```

### 3. 데이터베이스 초기화

데이터베이스 스키마를 초기화합니다:

```bash
npm run db:init
```

이 명령은 다음 작업을 수행합니다:
- pgvector extension 활성화
- 기존 테이블 삭제 (개발 환경용)
- applicants, matches, histories 테이블 생성
- 필요한 인덱스 생성

### 4. 개발 서버 시작

```bash
npm run dev
```

## 🗂️ 데이터베이스 스키마

### applicants 테이블
- 지원자 정보 저장
- pgvector를 사용한 임베딩 저장 (768차원)
- Walrus/Seal 관련 정보
- 공개 정보 및 접근 제어

### matches 테이블
- 채용자와 지원자 간의 매칭 정보
- 상태 관리 (pending, accepted, rejected)

### histories 테이블
- 채용자의 검색 히스토리
- 검색 쿼리 및 결과 저장

## 🛠️ 유용한 명령어

### 데이터베이스 관리

```bash
# 데이터베이스 초기화 (테이블 재생성)
npm run db:init

# Drizzle Studio로 데이터 확인
npm run db:studio

# 마이그레이션 생성
npm run db:generate

# 마이그레이션 실행
npm run db:migrate

# 스키마를 데이터베이스에 직접 푸시
npm run db:push
```

### Docker 관리

```bash
# PostgreSQL 시작
docker-compose up -d

# PostgreSQL 중지
docker-compose down

# PostgreSQL 중지 및 데이터 삭제
docker-compose down -v

# 로그 확인
docker-compose logs -f postgres

# PostgreSQL 컨테이너 접속
docker-compose exec postgres psql -U postgres -d seal_match
```

## 🔍 문제 해결

### 데이터베이스 연결 실패

1. Docker 컨테이너가 실행 중인지 확인:
   ```bash
   docker-compose ps
   ```

2. `.env.local`의 `DATABASE_URL`이 올바른지 확인

3. PostgreSQL 컨테이너 재시작:
   ```bash
   docker-compose restart postgres
   ```

### pgvector extension 오류

PostgreSQL 컨테이너가 `pgvector/pgvector:pg16` 이미지를 사용하는지 확인하세요.

### 마이그레이션 오류

기존 테이블을 모두 삭제하고 다시 초기화:

```bash
npm run db:init
```

## 📚 추가 리소스

- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [pgvector 문서](https://github.com/pgvector/pgvector)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
