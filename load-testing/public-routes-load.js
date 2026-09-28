import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    visitors: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 20 },
        { duration: "20s", target: 50 },
        { duration: "30s", target: 100 },
        { duration: "1m", target: 500 },
        { duration: "30s", target: 1000 },
        { duration: "2m", target: 1000 }, // hold
        { duration: "30s", target: 0 },
      ],
    },
  },

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(99)<500"],
  },
};

const BASE_URL = "http://localhost:5000";

export default function () {
  const responses = http.batch([
    ["GET", `${BASE_URL}/health`],
    ["GET", `${BASE_URL}/`],
    ["GET", `${BASE_URL}/api/feedback/home`],
  ]);

  check(responses[0], { "health 200": (r) => r.status === 200 });
  check(responses[1], { "home 200": (r) => r.status === 200 });
  check(responses[2], { "feedback 200": (r) => r.status === 200 });

  sleep(1);
}
