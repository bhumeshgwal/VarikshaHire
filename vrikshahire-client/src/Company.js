// src/api/api.js

const API_URL = "http://localhost:5000/api";

// ==========================================
// CORE UTILITIES & AUTH HEADERS
// ==========================================
function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Global response handler: catches errors and handles expired sessions
async function handleRes(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 || (res.status === 403 && data.error?.includes('session'))) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    throw new Error(data.error || "An unknown server error occurred");
  }
  return data;
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("studentId");
  localStorage.removeItem("profile");
}

// ==========================================
// AUTHENTICATION
// ==========================================
export async function login(email, password) {
  const res = await fetch(`${API_URL}/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleRes(res);
}

export async function signup(name, email, password, branch, cgpa, backlogs) {
  const res = await fetch(`${API_URL}/student/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, branch, cgpa, backlogs }),
  });
  return handleRes(res);
}

export async function signupCompany(payload) {
  const res = await fetch(`${API_URL}/company/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

// ==========================================
// STUDENT ENDPOINTS
// ==========================================
export async function getMyProfile() {
  const res = await fetch(`${API_URL}/student/me`, { headers: authHeaders() });
  return handleRes(res);
}

export async function updateProfile(id, updates) {
  const res = await fetch(`${API_URL}/student/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  return handleRes(res);
}

export async function getEligibleJobs() {
  const res = await fetch(`${API_URL}/job/eligible`, { headers: authHeaders() });
  return handleRes(res);
}

export async function getMyApplications() {
  const res = await fetch(`${API_URL}/application/mine`, { headers: authHeaders() });
  return handleRes(res);
}

export async function applyToJob(jobId) {
  const res = await fetch(`${API_URL}/application`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ jobId }),
  });
  return handleRes(res);
}

// ==========================================
// COMPANY ENDPOINTS
// ==========================================
export async function getMyJobs() {
  const res = await fetch(`${API_URL}/company/jobs`, { headers: authHeaders() });
  return handleRes(res);
}

export async function postJob(jobData) {
  const res = await fetch(`${API_URL}/company/jobs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(jobData),
  });
  return handleRes(res);
}

export async function getJobApplicants(jobId) {
  const res = await fetch(`${API_URL}/company/job/${jobId}/applicants`, { headers: authHeaders() });
  return handleRes(res);
}

export async function updateApplicationStatus(applicationId, status, interviewDetails = null) {
  const res = await fetch(`${API_URL}/company/application/${applicationId}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status, interviewDetails }),
  });
  return handleRes(res);
}

// ==========================================
// ADMIN ENDPOINTS
// ==========================================
export async function getAdminOverview() {
  const res = await fetch(`${API_URL}/admin/overview`, { headers: authHeaders() });
  return handleRes(res);
}

export async function getPendingApprovals() {
  const res = await fetch(`${API_URL}/admin/pending`, { headers: authHeaders() });
  return handleRes(res);
}

export async function approveCompany(companyId) {
  const res = await fetch(`${API_URL}/admin/approve-company/${companyId}`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return handleRes(res);
}

export async function approveJob(jobId) {
  const res = await fetch(`${API_URL}/admin/approve-job/${jobId}`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return handleRes(res);
}

export async function postNotice(noticeData) {
  const res = await fetch(`${API_URL}/notice`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(noticeData),
  });
  return handleRes(res);
}

export async function deleteNotice(noticeId) {
  const res = await fetch(`${API_URL}/notice/${noticeId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleRes(res);
}

// ==========================================
// SHARED ENDPOINTS (Notices)
// ==========================================
export async function getNotices() {
  const res = await fetch(`${API_URL}/notice`, { headers: authHeaders() });
  return handleRes(res);
}