const API_URL = "http://localhost:3000/api/v1/search/result-cards";

/**
 * Test POST /api/v1/search/result-cards
 *
 * Prerequisites:
 * 1. Server must be running (npm run dev)
 * 2. Database must have:
 *    - At least one applicant
 *    - At least one match record for that applicant
 */
async function testSearchResultCards() {
  console.log("🧪 Testing POST /api/v1/search/result-cards...\n");

  // Request body using actual test data from database
  const requestBody = {
    query: "풀스택 개발자 (신입)",
    recruiterWalletAddress: "0xTestRecruiter",
    results: [
      {
        applicantId: "f99db28d-81fa-4eaf-b054-a6a7dfecf169",
        similarity: 0.95,
        createdAt: new Date().toISOString(),
      },
    ],
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
      console.log(`   Success: ${data.success}`);
      if (data.data) {
        console.log(`   Result Cards Count: ${data.data.length}`);
        if (data.data.length > 0) {
          console.log("\n   First Result Card:");
          console.log(`   - Applicant ID: ${data.data[0].applicant.id}`);
          console.log(`   - Match ID: ${data.data[0].match.id}`);
          console.log(`   - Match Status: ${data.data[0].match.status}`);
          console.log(`   - Similarity: ${data.data[0].similarity}`);
        }
      }
    } else {
      console.log("\n❌ Test FAILED!");
      console.log(`   Error: ${data.errorMessage}`);
    }
  } catch (error) {
    console.error("\n❌ Request Error:");
    console.error(error);
  }
}

/**
 * Test validation errors
 */
async function testValidation() {
  console.log("\n\n🧪 Testing Validation Errors...\n");

  const testCases = [
    {
      name: "Missing recruiterWalletAddress",
      body: {
        query: "test",
        results: [],
      },
      expectedError: "recruiterWalletAddress is required",
    },
    {
      name: "Invalid wallet address format",
      body: {
        query: "test",
        recruiterWalletAddress: "invalid-address",
        results: [],
      },
      expectedError: "Invalid wallet address format",
    },
    {
      name: "Missing query",
      body: {
        recruiterWalletAddress: "0x1234567890123456789012345678901234567890",
        results: [],
      },
      expectedError: "query is required",
    },
    {
      name: "Results is not an array",
      body: {
        query: "test",
        recruiterWalletAddress: "0x1234567890123456789012345678901234567890",
        results: "not an array",
      },
      expectedError: "results must be an array",
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.name}`);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testCase.body),
      });

      const data = await response.json();

      if (response.status === 400 && data.errorMessage?.includes(testCase.expectedError)) {
        console.log(`   ✅ Validation works: "${data.errorMessage}"`);
      } else {
        console.log(`   ❌ Unexpected response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error(`   ❌ Request Error:`, error);
    }
  }
}

/**
 * Test empty results
 */
async function testEmptyResults() {
  console.log("\n\n🧪 Testing Empty Results...\n");

  const requestBody = {
    query: "test",
    recruiterWalletAddress: "0x1234567890123456789012345678901234567890",
    results: [],
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok && data.success && Array.isArray(data.data) && data.data.length === 0) {
      console.log("✅ Empty results handled correctly");
    } else {
      console.log(`❌ Unexpected response: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error("❌ Request Error:", error);
  }
}

// 서버가 실행 중인지 확인
async function checkServer() {
  try {
    const response = await fetch("http://localhost:3000", {
      method: "GET",
    });
    return response.status !== undefined;
  } catch {
    return false;
  }
}

async function main() {
  console.log("=" .repeat(80));
  console.log("  POST /api/v1/search/result-cards - API Test Suite");
  console.log("=".repeat(80) + "\n");

  const isServerRunning = await checkServer();

  if (!isServerRunning) {
    console.error("❌ Server is not running!");
    console.error("   Please start the server with: npm run dev");
    process.exit(1);
  }

  console.log("✅ Server is running\n");

  // Run tests
  await testSearchResultCards();
  await testValidation();
  await testEmptyResults();

  console.log("\n" + "=".repeat(80));
  console.log("  Test Suite Completed");
  console.log("=".repeat(80) + "\n");
}

main();
