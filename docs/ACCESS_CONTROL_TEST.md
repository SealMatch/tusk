# Access Control Test Suite

이 문서는 Seal-Match의 Access Control 기능을 테스트하기 위한 통합 테스트 인터페이스에 대한 설명입니다.

## 개요

Access Control Test Suite는 다음과 같은 전체 워크플로우를 테스트할 수 있게 해줍니다:

1. **파일 업로드** - Walrus에 암호화된 파일 업로드
2. **열람 요청** - 파일에 대한 접근 권한 요청
3. **승인/거절** - 관리자가 열람 요청을 승인하거나 거절
4. **파일 다운로드** - 권한이 있는 경우에만 파일 다운로드 및 복호화

## 페이지 접근

테스트 인터페이스는 다음 경로에서 접근할 수 있습니다:

```
/upload
```

## 구성 요소

### 1. Hooks

#### `useRequestAccess`
- **위치**: `src/clients/shared/hooks/useRequestAccess.ts`
- **기능**: 파일 열람 권한 요청
- **파라미터**:
  - `policyObjectId`: 접근 정책 오브젝트 ID
  - `accessPrice`: 접근 가격 (MIST 단위)
- **반환**: `viewRequestId` - 생성된 열람 요청 ID

#### `useApproveAccess`
- **위치**: `src/clients/shared/hooks/useApproveAccess.ts`
- **기능**: 열람 요청 승인
- **파라미터**:
  - `viewRequestId`: 열람 요청 ID
  - `policyObjectId`: 접근 정책 오브젝트 ID
  - `adminCapId`: 관리자 권한 ID

#### `useRejectAccess`
- **위치**: `src/clients/shared/hooks/useRejectAccess.ts`
- **기능**: 열람 요청 거절
- **파라미터**:
  - `viewRequestId`: 열람 요청 ID
  - `policyObjectId`: 접근 정책 오브젝트 ID
  - `adminCapId`: 관리자 권한 ID

### 2. Components

#### `AccessControlPanel`
- **위치**: `src/clients/components/main/molecules/AccessControlPanel.tsx`
- **기능**: Access control hooks를 테스트하기 위한 통합 UI 패널
- **Props**:
  - `policyObjectId`: 접근 정책 오브젝트 ID
  - `adminCapId`: 관리자 권한 ID

#### `WalrusUpload`
- **위치**: `src/clients/components/main/atoms/WalrusUpload.tsx`
- **기능**: 파일 업로드 및 암호화
- **Props**:
  - `onUploadComplete`: 업로드 완료 시 콜백 함수 (optional)

#### `WalrusDownload`
- **위치**: `src/clients/components/main/atoms/WalrusDownload.tsx`
- **기능**: 파일 다운로드 및 복호화

## 테스트 워크플로우

### Step 1: 파일 업로드

1. "Upload File" 섹션에서 파일을 선택합니다 (최대 10 MiB)
2. "Encrypt & Upload to Walrus" 버튼을 클릭합니다
3. 업로드 진행 상태를 확인합니다:
   - Encrypting → Encoding → Encoded → Registering → Uploading → Uploaded → Certifying → Done
4. 업로드 완료 후 다음 정보를 확인합니다:
   - **Blob ID**: Walrus에 저장된 파일 ID
   - **Policy Object ID**: 접근 정책 오브젝트 ID
   - **Capability ID**: 관리자 권한 ID
   - **Encryption ID**: 암호화 ID

### Step 2: 접근 제어

업로드가 완료되면 "Access Control" 섹션이 자동으로 나타납니다.

#### 2-1. 열람 요청
1. Access Price 입력 (기본값: 1000000 MIST = 0.001 SUI)
2. "Request Access" 버튼 클릭
3. View Request ID가 생성되면 자동으로 입력 필드에 채워집니다

#### 2-2. 승인 또는 거절
1. View Request ID가 있는지 확인
2. 승인하려면 "Approve" 버튼 클릭
3. 거절하려면 "Reject" 버튼 클릭

### Step 3: 파일 다운로드

"Download & Verify Access" 섹션에서:

1. Quick Fill 정보를 참고하여 다음 정보를 입력:
   - Blob ID
   - Policy Object ID
   - Encryption ID
2. "Download & Decrypt" 버튼 클릭
3. 권한이 있는 경우에만 파일이 다운로드됩니다

## 주요 기능

### 자동 연동
- 파일 업로드 완료 시 자동으로 Access Control 패널이 활성화됩니다
- Policy Object ID와 Admin Cap ID가 자동으로 전달됩니다
- 다운로드 섹션에 Quick Fill 정보가 표시됩니다

### 상태 추적
- 각 단계별 진행 상태를 실시간으로 확인할 수 있습니다
- 에러 발생 시 자세한 에러 메시지를 표시합니다

### UI/UX
- 단계별로 색상으로 구분 (Blue → Green → Purple)
- 각 단계에 번호와 명확한 설명 제공
- 다크 모드 지원

## 에러 처리

각 섹션에서 에러가 발생하면 붉은색 에러 박스에 상세한 에러 메시지가 표시됩니다:
- 트랜잭션 실패
- 권한 부족
- 네트워크 오류
- 입력값 오류 등

## 기술 스택

- **React**: UI 컴포넌트
- **TypeScript**: 타입 안정성
- **Sui SDK**: 블록체인 상호작용
- **Walrus SDK**: 파일 저장
- **Seal SDK**: 암호화
- **TailwindCSS**: 스타일링

## 개발자 노트

### 새로운 기능 추가

Access Control에 새로운 기능을 추가하려면:

1. `src/clients/shared/hooks/` 에 새로운 hook 생성
2. `AccessControlPanel.tsx` 에 UI 추가
3. 필요한 경우 `contracts.libs.ts` 에 트랜잭션 함수 추가

### 콜백 시스템

`WalrusUpload` 컴포넌트는 `onUploadComplete` 콜백을 지원하여 다른 컴포넌트에서도 재사용 가능합니다:

```tsx
<WalrusUpload 
  onUploadComplete={(result) => {
    console.log('Upload completed!', result);
  }} 
/>
```

## 트러블슈팅

### 업로드가 실패하는 경우
- 지갑이 연결되어 있는지 확인
- 파일 크기가 10 MiB 이하인지 확인
- 충분한 SUI 잔액이 있는지 확인

### 열람 요청이 실패하는 경우
- Policy Object ID가 올바른지 확인
- Access Price가 올바른 형식인지 확인 (MIST 단위)

### 승인/거절이 실패하는 경우
- Admin Cap ID가 현재 계정과 일치하는지 확인
- View Request ID가 올바른지 확인

### 다운로드가 실패하는 경우
- 열람 요청이 승인되었는지 확인
- Blob ID, Policy Object ID, Encryption ID가 모두 올바른지 확인
