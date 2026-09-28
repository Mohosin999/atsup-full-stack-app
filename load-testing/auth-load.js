import http from "k6/http";
import { check, sleep } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export const options = {
  scenarios: {
    auth_load_test: {
      executor: "ramping-vus",

      startVUs: 0,

      stages: [
        { duration: "10s", target: 10 },
        { duration: "20s", target: 20 },
        { duration: "30s", target: 20 },
        { duration: "30s", target: 0 },
      ],
    },
  },

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(99)<500"],

    checks: ["rate>0.95"],
  },
};

const BASE_URL = "http://localhost:5000";

export default function () {
  /*
   * Unique user for every VU/iteration
   * Prevents duplicate email problems during register testing.
   */
  const uniqueId = `${__VU}_${__ITER}_${randomString(6)}`;

  const email = `loadtest_${uniqueId}@gmail.com`;
  const password = "LoadTest@123456";

  // --------------------------------------------------
  // 1. REGISTER
  // --------------------------------------------------

  const registerPayload = JSON.stringify({
    name: `Load Test ${uniqueId}`,
    email: email,
    password: password,
  });

  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    registerPayload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      tags: {
        endpoint: "register",
      },
    },
  );

  check(registerRes, {
    "register request successful": (r) => r.status >= 200 && r.status < 300,
  });

  // --------------------------------------------------
  // 2. LOGIN
  // --------------------------------------------------

  const loginPayload = JSON.stringify({
    email: email,
    password: password,
  });

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: {
      "Content-Type": "application/json",
    },
    tags: {
      endpoint: "login",
    },
  });

  check(loginRes, {
    "login successful": (r) => r.status >= 200 && r.status < 300,
  });

  /*
   * Adjust these fields according to your actual login response.
   *
   * Example:
   * {
   *   "accessToken": "...",
   *   "refreshToken": "..."
   * }
   */

  let accessToken = "";
  let refreshToken = "";

  try {
    const loginData = loginRes.json();

    accessToken = loginData.accessToken || loginData.data?.accessToken || "";

    refreshToken = loginData.refreshToken || loginData.data?.refreshToken || "";
  } catch (error) {
    console.error("Could not parse login response:", error);
  }

  // --------------------------------------------------
  // 3. GET /api/auth/me
  // --------------------------------------------------

  const meRes = http.get(`${BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    tags: {
      endpoint: "me",
    },
  });

  check(meRes, {
    "me request successful": (r) => r.status === 200,
  });

  // --------------------------------------------------
  // 4. REFRESH TOKEN
  // --------------------------------------------------

  const refreshPayload = JSON.stringify({
    refreshToken: refreshToken,
  });

  const refreshRes = http.post(`${BASE_URL}/api/auth/refresh`, refreshPayload, {
    headers: {
      "Content-Type": "application/json",
    },
    tags: {
      endpoint: "refresh",
    },
  });

  check(refreshRes, {
    "refresh successful": (r) => r.status >= 200 && r.status < 300,
  });

  /*
   * If refresh endpoint returns a new access token,
   * update it for logout/me if necessary.
   */

  try {
    const refreshData = refreshRes.json();

    accessToken =
      refreshData.accessToken || refreshData.data?.accessToken || accessToken;

    refreshToken =
      refreshData.refreshToken ||
      refreshData.data?.refreshToken ||
      refreshToken;
  } catch (error) {
    // Ignore if refresh response has no JSON body
  }

  // --------------------------------------------------
  // 5. LOGOUT
  // --------------------------------------------------

  const logoutRes = http.post(
    `${BASE_URL}/api/auth/logout`,
    JSON.stringify({
      refreshToken: refreshToken,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      tags: {
        endpoint: "logout",
      },
    },
  );

  check(logoutRes, {
    "logout successful": (r) => r.status >= 200 && r.status < 300,
  });

  sleep(1);
}
