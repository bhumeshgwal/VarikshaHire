const API_URL = "http://localhost:5000/api";

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

async function handleRes(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      logout();
      window.dispatchEvent(new Event("auth:expired"));
    }
    throw new Error(data.error || "An error occurred");
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

export async function login(email, password, expectedRole) {
  const res = await fetch(`${API_URL}/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, expectedRole }),
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

export async function getMyProfile() {
  const res = await fetch(`${API_URL}/student/me`, { headers: authHeaders() });
  return handleRes(res);
}

// Fetches jobs with Eligibility and Match Score for the student
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

export async function getNotices() {
  const res = await fetch(`${API_URL}/notice`, { headers: authHeaders() });
  return handleRes(res);
}

export async function sendChatMessage(message, history) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message, history }),
  });
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

export async function updateMyProfile(updates) {
  const res = await fetch(`${API_URL}/student/me`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(updates),
  });
  return handleRes(res);
}

export async function getStudentProfile(studentId) {
  const res = await fetch(`${API_URL}/student/${studentId}/profile`, { headers: authHeaders() });
  return handleRes(res);
}

export async function searchPeople(search = "") {
  const res = await fetch(`${API_URL}/student/people?search=${encodeURIComponent(search)}`, { headers: authHeaders() });
  return handleRes(res);
}

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

// Company endpoints
export async function getMyJobs() {
  const res = await fetch(`${API_URL}/company/jobs`, { headers: authHeaders() });
  return handleRes(res);
}

export async function postJob(jobData) {
  const res = await fetch(`${API_URL}/company/jobs`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(jobData),
  });
  return handleRes(res);
}

export async function updateMyJob(jobId, jobData) {
  const res = await fetch(`${API_URL}/company/jobs/${jobId}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(jobData),
  });
  return handleRes(res);
}

export async function deleteMyJob(jobId) {
  const res = await fetch(`${API_URL}/company/jobs/${jobId}`, { method: "DELETE", headers: authHeaders() });
  return handleRes(res);
}

export async function getJobApplicants(jobId) {
  const res = await fetch(`${API_URL}/company/jobs/${jobId}/applicants`, { headers: authHeaders() });
  return handleRes(res);
}

export async function updateApplicationStatus(applicationId, status) {
  const res = await fetch(`${API_URL}/company/applications/${applicationId}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify({ status }),
  });
  return handleRes(res);
}

// Admin management endpoints
export async function getAdminCompanies() {
  const res = await fetch(`${API_URL}/admin/companies`, { headers: authHeaders() });
  return handleRes(res);
}

export async function getAdminJobs() {
  const res = await fetch(`${API_URL}/admin/jobs`, { headers: authHeaders() });
  return handleRes(res);
}

export async function getAdminStudents() {
  const res = await fetch(`${API_URL}/admin/students`, { headers: authHeaders() });
  return handleRes(res);
}

export async function updateAdminRecord(type, id, updates) {
  const res = await fetch(`${API_URL}/admin/${type}/${id}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(updates),
  });
  return handleRes(res);
}

export async function deleteAdminRecord(type, id) {
  const res = await fetch(`${API_URL}/admin/${type}/${id}`, { method: "DELETE", headers: authHeaders() });
  return handleRes(res);
}

// Application conversations are scoped to an existing application.
export async function getApplicationMessages(applicationId) {
  const res = await fetch(`${API_URL}/application/${applicationId}/messages`, { headers: authHeaders() });
  return handleRes(res);
}

export async function sendApplicationMessage(applicationId, message, replyTo) {
  const res = await fetch(`${API_URL}/application/${applicationId}/messages`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify({ message, replyTo }),
  });
  return handleRes(res);
}

export async function getInbox() {
  const res = await fetch(`${API_URL}/messages/inbox`, { headers: authHeaders() });
  return handleRes(res);
}

export async function submitReport(report) {
  const res = await fetch(`${API_URL}/report`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(report),
  });
  return handleRes(res);
}

export async function getAdminReports() {
  const res = await fetch(`${API_URL}/admin/reports`, { headers: authHeaders() });
  return handleRes(res);
}

export async function updateReportStatus(reportId, status) {
  const res = await fetch(`${API_URL}/admin/reports/${reportId}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify({ status }),
  });
  return handleRes(res);
}
