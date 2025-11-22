import mockApplicant from "@/server/shared/mock-data/applicant.mock.json";

const API_URL = "http://localhost:3000/api/v1/applicants";

async function testCreateApplicant() {
  console.log("🧪 Testing POST /api/v1/applicants with mock data...\n");

  // Mock 데이터를 API request 형식으로 변환
  const requestBody = {
    handle: mockApplicant.handle,
    walletAddress: mockApplicant.walletAddress,
    position: mockApplicant.position,
    techStack: mockApplicant.techStack,
    aiSummary: mockApplicant.aiSummary,
    blobId: mockApplicant.blobId,
    sealPolicyId: mockApplicant.sealPolicyId,
    accessPrice: mockApplicant.accessPrice,
    isJobSeeking: mockApplicant.isJobSeeking,
  };

  console.log("📤 Request Body:");
  console.log(JSON.stringify(requestBody, null, 2));
  console.log("\n" + "=".repeat(80) + "\n");

  try {
    console.log(`🔄 Sending POST request to ${API_URL}...`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log("\n📥 Response Body:");
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ Test PASSED!");
      if (typeof data.data === "string") {
        console.log(`   Applicant ID: ${data.data}`);
      } else {
        console.log(`   Applicant ID: ${data.data?.id}`);
        console.log(`   Message: ${data.data?.message}`);
      }
    } else {
      console.log("\n❌ Test FAILED!");
      console.log(`   Error: ${data.error}`);
      if (data.details) {
        console.log(`   Details:`, data.details);
      }
    }
  } catch (error) {
    console.error("\n❌ Request Error:");
    console.error(error);
  }
}

// 서버가 실행 중인지 확인
async function checkServer() {
  try {
    const response = await fetch("http://localhost:3000", {
      method: "GET",
    });
    return response.status !== undefined; // 어떤 응답이든 서버가 실행 중이면 OK
  } catch {
    return false;
  }
}

async function main() {
  const isServerRunning = await checkServer();

  if (!isServerRunning) {
    console.error("❌ Server is not running!");
    console.error("   Please start the server with: npm run dev");
    process.exit(1);
  }

  await testCreateApplicant();
}

main();
