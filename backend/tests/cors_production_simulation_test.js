/**
 * CORS Production Simulation Unit Test
 * Verifies CORS origin matching logic under production environment constraints.
 */

function testCorsLogic(nodeEnv, frontendUrlEnv, testOrigin) {
  const isProduction = nodeEnv === "production";
  const devDefaultOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  const configuredOrigins = frontendUrlEnv
    ? frontendUrlEnv.split(",")
        .map((o) => o.trim().replace(/\/$/, ""))
        .filter(Boolean)
    : [];

  const allowedOrigins = isProduction
    ? configuredOrigins
    : Array.from(new Set([...configuredOrigins, ...devDefaultOrigins]));

  if (!testOrigin) return { allowed: true, reason: "No origin header (direct/server-to-server)" };
  const normalized = testOrigin.trim().replace(/\/$/, "");
  const allowed = allowedOrigins.includes(normalized);
  return { allowed, allowedOrigins };
}

console.log("=== Testing CORS Production Scenarios ===");

// Scenario 1: Production with custom domain
const res1 = testCorsLogic("production", "https://heartsync.org,https://admin.heartsync.org", "https://heartsync.org");
console.log("Scenario 1 (Prod with configured domain):", res1.allowed ? "✅ PASS" : "❌ FAIL");
if (!res1.allowed) process.exit(1);

// Scenario 2: Production must reject localhost
const res2 = testCorsLogic("production", "https://heartsync.org", "http://localhost:5173");
console.log("Scenario 2 (Prod rejects localhost):", !res2.allowed ? "✅ PASS" : "❌ FAIL");
if (res2.allowed) process.exit(1);

// Scenario 3: Production without FRONTEND_URL rejects all origins
const res3 = testCorsLogic("production", "", "https://random.com");
console.log("Scenario 3 (Prod unset rejects random origin):", !res3.allowed ? "✅ PASS" : "❌ FAIL");
if (res3.allowed) process.exit(1);

// Scenario 4: Development allows localhost:5173
const res4 = testCorsLogic("development", "", "http://localhost:5173");
console.log("Scenario 4 (Dev allows localhost:5173):", res4.allowed ? "✅ PASS" : "❌ FAIL");
if (!res4.allowed) process.exit(1);

// Scenario 5: Development allows 127.0.0.1:5173
const res5 = testCorsLogic("development", "", "http://127.0.0.1:5173");
console.log("Scenario 5 (Dev allows 127.0.0.1:5173):", res5.allowed ? "✅ PASS" : "❌ FAIL");
if (!res5.allowed) process.exit(1);

// Scenario 6: Non-browser request allowed
const res6 = testCorsLogic("production", "https://heartsync.org", null);
console.log("Scenario 6 (Non-browser allowed):", res6.allowed ? "✅ PASS" : "❌ FAIL");
if (!res6.allowed) process.exit(1);

console.log("All 6 CORS simulation scenarios PASSED!");
