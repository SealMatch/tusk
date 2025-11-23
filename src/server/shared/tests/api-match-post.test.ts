const API_URL = "http://localhost:3000/api/v1/match";

/**
 * Test POST /api/v1/match
 *
 * Prerequisites:
 * 1. Server must be running (npm run dev)
 * 2. Database must have:
 *    - At least one applicant to create match with
 */

/**
 * Test successful match creation
 */
async function testCreateMatch() {
  console.log("🧪 Testing POST /api/v1/match - Create Match...\n");

  // Test data - adjust these based on your actual database
  const testMatchData = {
    recruiterWalletAddress: "0xRecruiterTest123",
    applicantId: "test-applicant-id", // Replace with actual applicant ID from DB
    viewRequestId: "view-request-" + Date.now(), // Unique view request ID
  };

  console.log("📤 Request Body:");
  console.log(JSON.stringify(testMatchData, null, 2));
  console.log("\n" + "=".repeat(80) + "\n");

  try {
    console.log(`🔄 Sending POST request to ${API_URL}...`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testMatchData),
    });

    const data = await response.json();

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log("\n📥 Response Body:");
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 201 && data.success) {
      console.log("\n✅ Test PASSED!");
      console.log(`   Match ID: ${data.data.id}`);
      console.log(`   Recruiter: ${data.data.recruiterWalletAddress}`);
      console.log(`   Applicant: ${data.data.applicantId}`);
      console.log(`   Status: ${data.data.status}`);
      console.log(`   View Request ID: ${data.data.viewRequestId}`);

      return data.data.id; // Return match ID for cleanup
    } else {
      console.log("\n❌ Test FAILED!");
      console.log(`   Expected status 201, got ${response.status}`);
      console.log(`   Error: ${data.errorMessage || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("\n❌ Request Error:");
    console.error(error);
  }

  return null;
}

/**
 * Test duplicate match creation (should return 409)
 */
async function testDuplicateMatch() {
  console.log("\n\n🧪 Testing POST /api/v1/match - Duplicate Match...\n");

  // Same data as first test to create duplicate
  const testMatchData = {
    recruiterWalletAddress: "0xRecruiterTest123",
    applicantId: "test-applicant-id",
    viewRequestId: "view-request-duplicate-" + Date.now(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testMatchData),
    });

    const data = await response.json();

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (response.status === 409 && !data.success) {
      console.log("✅ Duplicate match correctly rejected");
      console.log(`   Error Message: ${data.errorMessage}`);
    } else if (response.status === 201 && data.success) {
      console.log("⚠️  Match created (may not be duplicate if previous test failed)");
      console.log(`   Match ID: ${data.data.id}`);
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
      name: "Missing all required fields",
      body: {},
      expectedStatus: 400,
    },
    {
      name: "Missing recruiterWalletAddress",
      body: {
        applicantId: "test-applicant-id",
        viewRequestId: "view-request-test",
      },
      expectedStatus: 400,
    },
    {
      name: "Missing applicantId",
      body: {
        recruiterWalletAddress: "0xRecruiterTest",
        viewRequestId: "view-request-test",
      },
      expectedStatus: 400,
    },
    {
      name: "Missing viewRequestId",
      body: {
        recruiterWalletAddress: "0xRecruiterTest",
        applicantId: "test-applicant-id",
      },
      expectedStatus: 400,
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

      if (response.status === testCase.expectedStatus && !data.success) {
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
 * Test with non-existent applicant
 */
async function testNonExistentApplicant() {
  console.log("\n\n🧪 Testing POST /api/v1/match - Non-existent Applicant...\n");

  const testMatchData = {
    recruiterWalletAddress: "0xRecruiterTest123",
    applicantId: "non-existent-applicant-id-12345",
    viewRequestId: "view-request-" + Date.now(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testMatchData),
    });

    const data = await response.json();

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (response.status === 500 && !data.success && data.errorMessage?.includes("not found")) {
      console.log("✅ Non-existent applicant correctly rejected");
      console.log(`   Error Message: ${data.errorMessage}`);
    } else {
      console.log(`❌ Unexpected response: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.error("❌ Request Error:", error);
  }
}

/**
 * Test response data structure
 */
async function testDataStructure() {
  console.log("\n\n🧪 Testing Response Data Structure...\n");

  const testMatchData = {
    recruiterWalletAddress: "0xRecruiterStructureTest",
    applicantId: "test-applicant-id",
    viewRequestId: "view-request-structure-" + Date.now(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testMatchData),
    });

    const data = await response.json();

    if (response.status === 201 && data.success) {
      const isValidStructure =
        data.success === true &&
        data.data !== undefined &&
        typeof data.data.id === "string" &&
        typeof data.data.recruiterWalletAddress === "string" &&
        typeof data.data.applicantId === "string" &&
        typeof data.data.viewRequestId === "string" &&
        typeof data.data.status === "string" &&
        data.data.createdAt !== undefined &&
        data.data.updatedAt !== undefined;

      if (isValidStructure) {
        console.log("✅ Response structure is valid");
        console.log("   - success: boolean ✅");
        console.log("   - data.id: string ✅");
        console.log("   - data.recruiterWalletAddress: string ✅");
        console.log("   - data.applicantId: string ✅");
        console.log("   - data.viewRequestId: string ✅");
        console.log("   - data.status: string ✅");
        console.log("   - data.createdAt: exists ✅");
        console.log("   - data.updatedAt: exists ✅");
      } else {
        console.log("❌ Response structure is invalid");
        console.log(`   Received: ${JSON.stringify(data, null, 2)}`);
      }
    } else {
      console.log(`⚠️  Could not test structure (status ${response.status})`);
      console.log(`   This may happen if the applicant doesn't exist in DB`);
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
  console.log("  POST /api/v1/match - API Test Suite");
  console.log("=".repeat(80) + "\n");

  const isServerRunning = await checkServer();

  if (!isServerRunning) {
    console.error("❌ Server is not running!");
    console.error("   Please start the server with: npm run dev");
    process.exit(1);
  }

  console.log("✅ Server is running\n");

  console.log("⚠️  Important Notes:");
  console.log("   1. Make sure 'test-applicant-id' exists in your database");
  console.log("   2. You may need to update test data with actual IDs from your DB");
  console.log("   3. Some tests intentionally fail (validation tests)\n");

  // Run tests
  await testCreateMatch();
  await testDuplicateMatch();
  await testValidation();
  await testNonExistentApplicant();
  await testDataStructure();

  console.log("\n" + "=".repeat(80));
  console.log("  Test Suite Completed");
  console.log("=".repeat(80) + "\n");
}

main();
