const BASE_URL = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, method = "GET", body = null, needsAuth = false) {
  const headers = { "Content-Type": "application/json" };
  if (needsAuth) headers.Authorization = "Bearer " + getToken();

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export function signup(name, email, password, branch, cgpa, backlogs) {
  return request("/api/student/signup", "POST", {
    name, email, password, branch,
    cgpa: Number(cgpa),
    backlogs: Number(backlogs),
  });
}

export function login(email, password) {
  return request("/api/student/login", "POST", { email, password });
}

export function logout() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return !!getToken();
}

export function getJobs() {
  return request("/api/job", "GET");
}

export function applyToJob(studentId, jobId) {
  return request("/api/application", "POST", { studentId, jobId }, true);
}

export function getApplications() {
  return request("/api/application", "GET");
}

export function getNotices() {
  return request("/api/notice", "GET");
}
