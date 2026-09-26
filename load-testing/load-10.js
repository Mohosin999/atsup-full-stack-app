import http from "k6/http";

export const options = {
  stages: [
    { duration: "20s", target: 10 },
    { duration: "30s", target: 10 },
    { duration: "10s", target: 0 },
  ],
};

export default function () {
  http.get("http://localhost:5000/health");
}
