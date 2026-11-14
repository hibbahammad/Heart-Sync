import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://127.0.0.1:5000";

console.log("===================================================================");
console.log("       HEART SYNC — REAL LOCAL API END-TO-END VERIFICATION         ");
console.log("===================================================================\n");

let results = {
  passed: [],
  failed: [],
  blocked: [],
};

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    results.passed.push({ name: testName, details });
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    results.failed.push({ name: testName, details });
  }
}

async function request(url, options = {}) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, data, headers: res.headers };
}

async function runTests() {
  console.log("--- 1. SYSTEM & HEALTH CHECK ENDPOINTS ---");
  const healthRes = await request("/api/health");
  assert(healthRes.status === 200 && healthRes.data.status === "healthy", "GET /api/health returns healthy", JSON.stringify(healthRes.data));

  const rootRes = await request("/");
  assert(rootRes.status === 200 && typeof rootRes.data === "string" && rootRes.data.includes("Heart Sync"), "GET / returns API Running string");

  console.log("\n--- 2. REAL AUTHENTICATION TESTING ---");
  // A. Invalid Login
  const badLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@heartsync.org", password: "wrongpassword123" }),
  });
  assert(badLogin.status === 401 && badLogin.data.success === false, "POST /api/auth/login rejects invalid password with 401");

  // B. Super Admin Login
  const adminLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@heartsync.org", password: "admin123" }),
  });
  assert(adminLogin.status === 200 && adminLogin.data.role === "SUPER_ADMIN" && Boolean(adminLogin.data.token), "POST /api/auth/login Super Admin success", `Token: ${adminLogin.data.token ? "Received" : "Missing"}`);
  const adminToken = adminLogin.data?.token;

  // C. Hospital Staff Login & Contract Check
  const hospLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "hospital@heartsync.org", password: "hospital123" }),
  });
  assert(hospLogin.status === 200 && hospLogin.data.role === "HOSPITAL_STAFF", "POST /api/auth/login Hospital Staff success");
  assert(typeof hospLogin.data.organization === "object" && Boolean(hospLogin.data.organization?.name), "Login response returns populated organization object", `Org name: ${hospLogin.data.organization?.name}`);
  assert(Boolean(hospLogin.data.organizationId), "Login response returns organizationId string/id");
  assert(hospLogin.data.phone !== undefined, "Login response returns phone field");
  const hospToken = hospLogin.data?.token;

  // D. Blood Bank Staff Login
  const bbLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "bloodbank@heartsync.org", password: "bloodbank123" }),
  });
  assert(bbLogin.status === 200 && bbLogin.data.role === "BLOOD_BANK_STAFF", "POST /api/auth/login Blood Bank Staff success");
  const bbToken = bbLogin.data?.token;

  // E. Donor Login
  const donorLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "donor@heartsync.org", password: "donor123" }),
  });
  assert(donorLogin.status === 200 && donorLogin.data.role === "DONOR", "POST /api/auth/login Voluntary Donor success");
  const donorToken = donorLogin.data?.token;

  // F. GET /api/auth/me
  const unauthMe = await request("/api/auth/me");
  assert(unauthMe.status === 401, "GET /api/auth/me without token returns 401 Protected");

  const hospMe = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${hospToken}` },
  });
  assert(hospMe.status === 200 && hospMe.data.role === "HOSPITAL_STAFF", "GET /api/auth/me with Hospital Token returns user profile");
  assert(typeof hospMe.data.organization === "object" && Boolean(hospMe.data.organization?.name), "GET /api/auth/me returns populated organization object");
  assert(Boolean(hospMe.data.organizationId), "GET /api/auth/me returns organizationId");

  // G. Safe Registration Contract Check
  const testRegEmail = `test_qa_${Date.now()}@example.com`;
  const regRes = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "QA Automated Tester",
      email: testRegEmail,
      password: "password123",
      phone: "+92 311 0000000",
      role: "DONOR",
    }),
  });
  assert(regRes.status === 201 && regRes.data.success === true, "POST /api/auth/register creates new account with 201");
  assert(regRes.data.organization === null && regRes.data.organizationId === null, "Registration for DONOR returns organization: null and organizationId: null");
  assert(regRes.data.phone === "+92 311 0000000", "Registration returns phone field correctly");

  console.log("\n--- 3. REAL DONOR PRIVACY & MASKING TESTING ---");
  // A. Guest Access (No Token)
  const guestDonors = await request("/api/donors");
  assert(guestDonors.status === 200 && Array.isArray(guestDonors.data), "GET /api/donors responds with 200 array for guest");
  const firstGuestDonor = guestDonors.data[0];
  assert(firstGuestDonor && firstGuestDonor.isMasked === true, "Guest view has isMasked = true on donor records");
  assert(firstGuestDonor && firstGuestDonor.phone.includes("••••"), "Guest view masks donor phone numbers", `Masked: ${firstGuestDonor?.phone}`);
  assert(firstGuestDonor && firstGuestDonor.email.includes("••••"), "Guest view masks donor email addresses", `Masked: ${firstGuestDonor?.email}`);

  // B. Voluntary Donor Access (Logged-in Donor Token)
  const donorView = await request("/api/donors", {
    headers: { Authorization: `Bearer ${donorToken}` },
  });
  const firstDonorView = donorView.data[0];
  assert(firstDonorView && firstDonorView.isMasked === true, "Logged-in civilian DONOR sees other donors MASKED (isMasked = true)");
  assert(firstDonorView && firstDonorView.phone.includes("••••"), "Logged-in civilian DONOR phone is masked");

  // C. Hospital Staff Access (Authorized Token)
  const staffView = await request("/api/donors", {
    headers: { Authorization: `Bearer ${hospToken}` },
  });
  const firstStaffDonor = staffView.data[0];
  assert(firstStaffDonor && firstStaffDonor.isMasked === false, "Authorized HOSPITAL_STAFF sees unmasked donor details (isMasked = false)");
  assert(firstStaffDonor && !firstStaffDonor.phone.includes("••••"), "Authorized HOSPITAL_STAFF sees full donor phone number", `Unmasked: ${firstStaffDonor?.phone}`);
  assert(firstStaffDonor && !firstStaffDonor.email.includes("••••"), "Authorized HOSPITAL_STAFF sees full donor email address", `Unmasked: ${firstStaffDonor?.email}`);

  // D. Super Admin Access (Authorized Token)
  const adminView = await request("/api/donors", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const firstAdminDonor = adminView.data[0];
  assert(firstAdminDonor && firstAdminDonor.isMasked === false, "Authorized SUPER_ADMIN sees unmasked donor details (isMasked = false)");

  // E. Donor Search with Query Parameters
  const searchRes = await request("/api/donors/search?city=Lahore&bloodGroup=O-");
  assert(searchRes.status === 200 && Array.isArray(searchRes.data), "GET /api/donors/search handles city and bloodGroup queries");

  console.log("\n--- 4. PUBLIC RESOURCES & CATALOGS ---");
  // A. Blood Requests
  const reqsRes = await request("/api/requests");
  assert(reqsRes.status === 200 && Array.isArray(reqsRes.data), "GET /api/requests returns blood requests array", `Count: ${reqsRes.data.length}`);

  // B. Organizations
  const orgsRes = await request("/api/organizations");
  assert(orgsRes.status === 200 && Array.isArray(orgsRes.data), "GET /api/organizations returns organizations array", `Count: ${orgsRes.data.length}`);

  // C. Camps
  const campsRes = await request("/api/camps");
  assert(campsRes.status === 200 && Array.isArray(campsRes.data), "GET /api/camps returns donation camps array", `Count: ${campsRes.data.length}`);

  console.log("\n--- 5. INVENTORY & RBAC ACCESS TESTING ---");
  // A. Unauthenticated Inventory Access
  const unauthInv = await request("/api/inventory");
  assert(unauthInv.status === 401, "GET /api/inventory without token returns 401 Protected");

  // B. Blood Bank Staff Inventory Access
  const bbInv = await request("/api/inventory", {
    headers: { Authorization: `Bearer ${bbToken}` },
  });
  assert(bbInv.status === 200 && Array.isArray(bbInv.data), "GET /api/inventory with Blood Bank token returns 200 array", `Units count: ${bbInv.data.length}`);

  // C. Inventory Summary
  const invSummary = await request("/api/inventory/summary", {
    headers: { Authorization: `Bearer ${bbToken}` },
  });
  assert(invSummary.status === 200 && Boolean(invSummary.data?.summary), "GET /api/inventory/summary returns cold-storage summary");

  console.log("\n--- 6. ADMIN METRICS RBAC TESTING ---");
  // A. Public / Guest Access to Admin Metrics
  const guestAdminMetrics = await request("/api/admin/metrics");
  assert(guestAdminMetrics.status === 401, "GET /api/admin/metrics without auth strictly returns 401 (Protected)");

  // B. Hospital Staff Access to Admin Metrics (Forbidden)
  const staffAdminMetrics = await request("/api/admin/metrics", {
    headers: { Authorization: `Bearer ${hospToken}` },
  });
  assert(staffAdminMetrics.status === 403, "GET /api/admin/metrics with Hospital Staff token returns 403 Forbidden");

  // C. Super Admin Access to Admin Metrics (Allowed)
  const adminMetrics = await request("/api/admin/metrics", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminMetrics.status === 200 && Boolean(adminMetrics.data?.metrics), "GET /api/admin/metrics with Super Admin token returns 200 system metrics");

  console.log("\n===================================================================");
  console.log(`TOTAL PASSED: ${results.passed.length} | TOTAL FAILED: ${results.failed.length}`);
  console.log("===================================================================");

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution threw fatal error:", err);
  process.exit(1);
});
