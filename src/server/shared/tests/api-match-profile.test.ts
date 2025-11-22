const API_URL = "http://localhost:3000/api/v1/match";

/**
 * Test GET /api/v1/match
 *
 * Prerequisites:
 * 1. Server must be running (npm run dev)
 * 2. Database must have:
 *    - At least one applicant with a wallet address
 *    - Optional: match records for testing
 */

/**
 * Test successful profile page data retrieval
 */
async function testGetProfilePageData() {
  console.log("🧪 Testing GET /api/v1/match with valid wallet address...\n");

  // Test wallet address - using actual recruiter from database (has requestedList data)
  const testWalletAddress = "0xRecruiter123";

  const url = `${API_URL}?walletAddress=${encodeURIComponent(testWalletAddress)}`;

  console.log("📤 Request URL:");
  console.log(url);
  console.log("\n" + "=".repeat(80) + "\n");

  try {
    console.log(`🔄 Sending GET request to ${url}...`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log("\n📥 Response Body:");
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ Test PASSED!");
      console.log(`   Success: ${data.success}`);
      if (data.data) {
        console.log(`   Requested List Count: ${data.data.requestedList.length}`);
        console.log(`   Received List Count: ${data.data.receivedList.length}`);

        if (data.data.requestedList.length > 0) {
          console.log("\n   First Requested Match:");
          console.log(`   - Match ID: ${data.data.requestedList[0].match.id}`);
          console.log(`   - Match Status: ${data.data.requestedList[0].match.status}`);
          console.log(`   - Applicant ID: ${data.data.requestedList[0].applicant.id}`);
          console.log(`   - Applicant Handle: ${data.data.requestedList[0].applicant.handle}`);
        }

        if (data.data.receivedList.length > 0) {
          console.log("\n   First Received Match:");
          console.log(`   - Match ID: ${data.data.receivedList[0].match.id}`);
          console.log(`   - Match Status: ${data.data.receivedList[0].match.status}`);
          console.log(`   - Applicant ID: ${data.data.receivedList[0].applicant.id}`);
          console.log(`   - Applicant Handle: ${data.data.receivedList[0].applicant.handle}`);
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
 * Test with empty data (wallet with no matches)
 */
async function testEmptyProfileData() {
  console.log("\n\n🧪 Testing GET /api/v1/match with wallet that has no matches...\n");

  // Non-existent or new wallet address
  const testWalletAddress = "0x0000000000000000000000000000000000000000";
  const url = `${API_URL}?walletAddress=${encodeURIComponent(testWalletAddress)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (
      response.ok &&
      data.success &&
      data.data.requestedList.length === 0 &&
      data.data.receivedList.length === 0
    ) {
      console.log("✅ Empty data handled correctly");
      console.log(`   Requested List: ${data.data.requestedList.length}`);
      console.log(`   Received List: ${data.data.receivedList.length}`);
    } else {
      console.log(`❌ Unexpected response: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.error("❌ Request Error:", error);
  }
}

/**
 * Test validation errors
 */
async function testValidation() {
  console.log("\n\n🧪 Testing Validation Errors...\n");

  const testCases = [
    {
      name: "Missing walletAddress parameter",
      url: API_URL,
      expectedError: "walletAddress is required",
      expectedStatus: 400,
    },
    {
      name: "Empty walletAddress parameter",
      url: `${API_URL}?walletAddress=`,
      expectedError: "walletAddress is required",
      expectedStatus: 400,
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.name}`);

    try {
      const response = await fetch(testCase.url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (
        response.status === testCase.expectedStatus &&
        data.errorMessage?.includes(testCase.expectedError)
      ) {
        console.log(`   ✅ Validation works: "${data.errorMessage}"`);
      } else {
        console.log(
          `   ❌ Expected status ${testCase.expectedStatus}, got ${response.status}`
        );
        console.log(`   Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error(`   ❌ Request Error:`, error);
    }
  }
}

/**
 * Test data structure validation
 */
async function testDataStructure() {
  console.log("\n\n🧪 Testing Response Data Structure...\n");

  // Using applicant wallet (has receivedList data)
  const testWalletAddress = "0x1234567890abcdef1234567890abcdef12345678";
  const url = `${API_URL}?walletAddress=${encodeURIComponent(testWalletAddress)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      const isValidStructure =
        data.success === true &&
        data.data !== undefined &&
        Array.isArray(data.data.requestedList) &&
        Array.isArray(data.data.receivedList);

      if (isValidStructure) {
        console.log("✅ Response structure is valid");
        console.log("   - success: boolean");
        console.log("   - data.requestedList: array");
        console.log("   - data.receivedList: array");

        // Check item structure if there are items
        if (data.data.requestedList.length > 0) {
          const item = data.data.requestedList[0];
          const hasValidItemStructure =
            item.match !== undefined && item.applicant !== undefined;

          if (hasValidItemStructure) {
            console.log("   - requestedList items have match and applicant properties ✅");
          } else {
            console.log("   ❌ requestedList items missing required properties");
          }
        }

        if (data.data.receivedList.length > 0) {
          const item = data.data.receivedList[0];
          const hasValidItemStructure =
            item.match !== undefined && item.applicant !== undefined;

          if (hasValidItemStructure) {
            console.log("   - receivedList items have match and applicant properties ✅");
          } else {
            console.log("   ❌ receivedList items missing required properties");
          }
        }
      } else {
        console.log("❌ Response structure is invalid");
        console.log(`   Received: ${JSON.stringify(data, null, 2)}`);
      }
    } else {
      console.log(`❌ Request failed with status ${response.status}`);
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
  console.log("=".repeat(80));
  console.log("  GET /api/v1/match - API Test Suite");
  console.log("=".repeat(80) + "\n");

  const isServerRunning = await checkServer();

  if (!isServerRunning) {
    console.error("❌ Server is not running!");
    console.error("   Please start the server with: npm run dev");
    process.exit(1);
  }

  console.log("✅ Server is running\n");

  // Run tests
  await testGetProfilePageData();
  await testEmptyProfileData();
  await testValidation();
  await testDataStructure();

  console.log("\n" + "=".repeat(80));
  console.log("  Test Suite Completed");
  console.log("=".repeat(80) + "\n");
}

main();
