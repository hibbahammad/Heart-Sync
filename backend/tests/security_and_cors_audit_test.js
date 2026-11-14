/**
 * Security and CORS Verification Test Suite
 * Heart Sync — Enterprise Blood Bank & Hospital Coordination Platform
 *
 * Verifies:
 * 1. CORS headers on authorized origins (http://localhost:5173)
 * 2. CORS rejection on unauthorized origins (http://evil-tracker.com)
 * 3. CORS preflight OPTIONS behavior
 * 4. Non-browser request handling (no Origin header)
 * 5. Body parser size limits (rejection of >15kb JSON payload with 413)
 * 6. Helmet security headers (nosniff, X-Frame-Options, no x-powered-by)
 * 7. Rate limiting headers on /api and /api/auth
 */

const BASE_URL = process.env.TEST_API_URL || "http://localhost:5000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("HEART SYNC — BACKEND SECURITY & CORS AUDIT VERIFICATION");
  console.log(`Target: ${BASE_URL}`);
  console.log("==================================================================\n");

  // 1. Authorized Origin CORS Test
  console.log("--- 1. Testing Authorized Origin (http://localhost:5173) ---");
  try {
    const res = await fetch(`${BASE_URL}/api/health`, {
      headers: {
        Origin: "http://localhost:5173",
      },
    });
    const allowOrigin = res.headers.get("access-control-allow-origin");
    const allowCreds = res.headers.get("access-control-allow-credentials");
    
    assert(res.status === 200, `Health check returned 200 (got ${res.status})`);
    assert(allowOrigin === "http://localhost:5173", `Access-Control-Allow-Origin matches authorized origin (got '${allowOrigin}')`);
    assert(allowCreds === "true", `Access-Control-Allow-Credentials is true (got '${allowCreds}')`);
  } catch (err) {
    assert(false, `Authorized origin test failed with error: ${err.message}`);
  }

  // 2. Unauthorized Origin CORS Test
  console.log("\n--- 2. Testing Unauthorized Origin Rejection (http://malicious-site.com) ---");
  try {
    const res = await fetch(`${BASE_URL}/api/health`, {
      headers: {
        Origin: "http://malicious-site.com",
      },
    });
    const allowOrigin = res.headers.get("access-control-allow-origin");
    const isRejected = res.status === 403 || allowOrigin !== "http://malicious-site.com";

    assert(isRejected, `Unauthorized origin rejected appropriately (status: ${res.status}, allow-origin: ${allowOrigin})`);
    assert(allowOrigin !== "http://malicious-site.com", "Access-Control-Allow-Origin is NOT granted to malicious site");
  } catch (err) {
    assert(false, `Unauthorized origin test threw: ${err.message}`);
  }

  // 3. Preflight OPTIONS Request (Authorized)
  console.log("\n--- 3. Testing Preflight OPTIONS Request (Authorized Origin) ---");
  try {
    const res = await fetch(`${BASE_URL}/api/donors`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization",
      },
    });
    const allowOrigin = res.headers.get("access-control-allow-origin");
    const allowMethods = res.headers.get("access-control-allow-methods");
    const allowHeaders = res.headers.get("access-control-allow-headers");

    assert(res.status === 204 || res.status === 200, `Preflight status code is 204/200 (got ${res.status})`);
    assert(allowOrigin === "http://localhost:5173", `Preflight returns Access-Control-Allow-Origin for authorized origin`);
    assert(allowMethods && allowMethods.includes("POST"), `Preflight returns allowed methods containing POST (got '${allowMethods}')`);
    assert(allowHeaders && allowHeaders.toLowerCase().includes("authorization"), `Preflight allows Authorization header`);
  } catch (err) {
    assert(false, `Preflight test threw: ${err.message}`);
  }

  // 4. Preflight OPTIONS Request (Unauthorized Origin)
  console.log("\n--- 4. Testing Preflight OPTIONS Request (Unauthorized Origin) ---");
  try {
    const res = await fetch(`${BASE_URL}/api/donors`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://attacker-controlled.net",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization",
      },
    });
    const allowOrigin = res.headers.get("access-control-allow-origin");

    assert(allowOrigin !== "http://attacker-controlled.net", "Unauthorized preflight does NOT receive Access-Control-Allow-Origin");
  } catch (err) {
    assert(false, `Unauthorized preflight threw: ${err.message}`);
  }

  // 5. Non-browser request (no Origin header)
  console.log("\n--- 5. Testing Non-Browser Direct Request (no Origin header) ---");
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert(res.status === 200, `Direct request without Origin header succeeds (got ${res.status})`);
  } catch (err) {
    assert(false, `Direct request threw: ${err.message}`);
  }

  // 6. Security Headers Audit (Helmet)
  console.log("\n--- 6. Testing HTTP Security Headers (Helmet) ---");
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const xContentType = res.headers.get("x-content-type-options");
    const xFrameOptions = res.headers.get("x-frame-options");
    const xPoweredBy = res.headers.get("x-powered-by");

    assert(xContentType === "nosniff", `X-Content-Type-Options is 'nosniff' (got '${xContentType}')`);
    assert(xFrameOptions === "SAMEORIGIN" || xFrameOptions === "DENY", `X-Frame-Options is protective (got '${xFrameOptions}')`);
    assert(!xPoweredBy, `X-Powered-By header is stripped/disabled (got '${xPoweredBy}')`);
  } catch (err) {
    assert(false, `Security headers check threw: ${err.message}`);
  }

  // 7. Request Body Size Limit Test (>15kb payload)
  console.log("\n--- 7. Testing Request Body Size Limit (15kb DoS Protection) ---");
  try {
    // Generate a payload exceeding 15kb (~20kb)
    const largeData = "A".repeat(20 * 1024);
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "test@example.com", padding: largeData }),
    });

    assert(res.status === 413, `Oversized payload rejected with 413 Payload Too Large (got ${res.status})`);
    const body = await res.json();
    assert(body.success === false, `Response body has success: false`);
    assert(body.message.includes("15kb"), `Response message clearly identifies size restriction`);
  } catch (err) {
    assert(false, `Size limit test threw: ${err.message}`);
  }

  // 8. Rate Limiting Headers
  console.log("\n--- 8. Testing Rate Limiting Headers ---");
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const limit = res.headers.get("ratelimit-limit");
    const remaining = res.headers.get("ratelimit-remaining");

    assert(limit !== null, `RateLimit-Limit header present (got '${limit}')`);
    assert(remaining !== null, `RateLimit-Remaining header present (got '${remaining}')`);
  } catch (err) {
    assert(false, `Rate limiting check threw: ${err.message}`);
  }

  console.log("\n==================================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
