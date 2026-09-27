const BASE_URL = "http://localhost:5000";

const MOCK_JOBS = [
  { _id: "j1", title: "Software Engineer", companyName: "TCS", salary: 450000, minCGPA: 7.0, allowedBranches: ["CS", "IT"], maxBacklogs: 0, postedAt: "2026-09-20" },
  { _id: "j2", title: "Data Analyst", companyName: "Infosys", salary: 380000, minCGPA: 6.5, allowedBranches: ["CS", "IT", "EC"], maxBacklogs: 1, postedAt: "2026-09-18" },
  { _id: "j3", title: "Backend Developer", companyName: "Wipro", salary: 420000, minCGPA: 7.5, allowedBranches: ["CS"], maxBacklogs: 0, postedAt: "2026-09-22" },
  { _id: "j4", title: "Frontend Developer", companyName: "HCL", salary: 360000, minCGPA: 6.0, allowedBranches: ["CS", "IT"], maxBacklogs: 2, postedAt: "2026-09-15" },
  { _id: "j5", title: "ML Engineer", companyName: "Google", salary: 1200000, minCGPA: 8.5, allowedBranches: ["CS"], maxBacklogs: 0, postedAt: "2026-09-25" },
  { _id: "j6", title: "DevOps Engineer", companyName: "Amazon", salary: 900000, minCGPA: 8.0, allowedBranches: ["CS", "IT"], maxBacklogs: 0, postedAt: "2026-09-24" },
  { _id: "j7", title: "Android Developer", companyName: "Zomato", salary: 600000, minCGPA: 7.0, allowedBranches: ["CS", "IT"], maxBacklogs: 1, postedAt: "2026-09-21" },
  { _id: "j8", title: "QA Engineer", companyName: "Capgemini", salary: 320000, minCGPA: 6.0, allowedBranches: ["CS", "IT", "EC", "ME"], maxBacklogs: 2, postedAt: "2026-09-10" },
  { _id: "j9", title: "Full Stack Developer", companyName: "Razorpay", salary: 850000, minCGPA: 8.0, allowedBranches: ["CS"], maxBacklogs: 0, postedAt: "2026-09-23" },
  { _id: "j10", title: "System Analyst", companyName: "IBM", salary: 550000, minCGPA: 7.5, allowedBranches: ["CS", "IT"], maxBacklogs: 0, postedAt: "2026-09-17" },
  { _id: "j11", title: "UI/UX Designer", companyName: "Swiggy", salary: 480000, minCGPA: 6.5, allowedBranches: ["CS", "IT"], maxBacklogs: 1, postedAt: "2026-09-19" },
  { _id: "j12", title: "Cloud Engineer", companyName: "Microsoft", salary: 1100000, minCGPA: 8.5, allowedBranches: ["CS", "IT"], maxBacklogs: 0, postedAt: "2026-09-26" },
  { _id: "j13", title: "Network Engineer", companyName: "Cisco", salary: 500000, minCGPA: 7.0, allowedBranches: ["CS", "IT", "EC"], maxBacklogs: 1, postedAt: "2026-09-14" },
  { _id: "j14", title: "Cybersecurity Analyst", companyName: "Deloitte", salary: 700000, minCGPA: 7.5, allowedBranches: ["CS", "IT"], maxBacklogs: 0, postedAt: "2026-09-16" },
  { _id: "j15", title: "React Developer", companyName: "Flipkart", salary: 750000, minCGPA: 7.0, allowedBranches: ["CS", "IT"], maxBacklogs: 1, postedAt: "2026-09-27" },
];

const MOCK_NOTICES = [
  { _id: "n1", message: "TCS campus drive registration closes September 30.", date: "2026-09-27" },
  { _id: "n2", message: "Pre-placement talk by Infosys on October 2 at 11 AM, Seminar Hall.", date: "2026-09-26" },
  { _id: "n3", message: "Resume submission deadline for all drives: September 28.", date: "2026-09-25" },
  { _id: "n4", message: "Google recruitment process begins October 5.", date: "2026-09-24" },
  { _id: "n5", message: "Aptitude test for Wipro scheduled October 3, 10 AM.", date: "2026-09-23" },
  { _id: "n6", message: "Amazon SDE drive: shortlisted students check email.", date: "2026-09-22" },
  { _id: "n7", message: "Placement cell office hours: Mon–Fri, 2–4 PM.", date: "2026-09-21" },
  { _id: "n8", message: "Mock interview sessions starting October 1. Register at placement cell.", date: "2026-09-20" },
  { _id: "n9", message: "HCL hiring for 2026 batch — CGPA above 6.0 eligible.", date: "2026-09-19" },
  { _id: "n10", message: "Soft skills workshop by placement cell: September 29, 3 PM.", date: "2026-09-18" },
  { _id: "n11", message: "Razorpay drive shortlist announced — check portal.", date: "2026-09-17" },
  { _id: "n12", message: "Students with backlogs: special drive by Capgemini on October 4.", date: "2026-09-16" },
  { _id: "n13", message: "Microsoft Azure certification reimbursement — apply before October 10.", date: "2026-09-15" },
  { _id: "n14", message: "Dress code for all placement drives: formal attire mandatory.", date: "2026-09-14" },
  { _id: "n15", message: "Cisco network engineer drive: EC and CS students eligible.", date: "2026-09-13" },
  { _id: "n16", message: "Deloitte cybersecurity analyst drive — registration open.", date: "2026-09-12" },
  { _id: "n17", message: "Flipkart React Developer drive: coding round on October 6.", date: "2026-09-11" },
  { _id: "n18", message: "IBM system analyst drive results: selected students notified.", date: "2026-09-10" },
  { _id: "n19", message: "Swiggy UI/UX drive: portfolio submission required.", date: "2026-09-09" },
  { _id: "n20", message: "Zomato Android drive shortlist: 12 students selected for interview.", date: "2026-09-08" },
  { _id: "n21", message: "Placement orientation for MCA Sem 1 batch: October 7.", date: "2026-09-07" },
  { _id: "n22", message: "Students must update CGPA on portal before September 30.", date: "2026-09-06" },
  { _id: "n23", message: "No objection certificate (NOC) required for off-campus placements.", date: "2026-09-05" },
  { _id: "n24", message: "Group discussion round for TCS: October 1, 9 AM.", date: "2026-09-04" },
  { _id: "n25", message: "Placement cell WhatsApp group link shared via college email.", date: "2026-09-03" },
];

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("studentId");
  localStorage.removeItem("role");
}

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeFetch(url, options = {}) {
  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (res.status === 401 && options.headers?.Authorization) {
    logout();
    window.dispatchEvent(new Event("auth:expired"));
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function signup(name, email, password, branch, cgpa, backlogs) {
  return safeFetch(`${BASE_URL}/api/student/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, branch, cgpa, backlogs }),
  });
}

export async function login(email, password) {
  return safeFetch(`${BASE_URL}/api/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function getJobs() {
  try {
    return await safeFetch(`${BASE_URL}/api/job`);
  } catch {
    return { jobs: MOCK_JOBS };
  }
}

export async function getNotices() {
  try {
    return await safeFetch(`${BASE_URL}/api/notice`);
  } catch {
    return { notices: MOCK_NOTICES };
  }
}

export async function applyToJob(jobId) {
  return safeFetch(`${BASE_URL}/api/application`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ jobId }),
  });
}

export async function getMyApplications() {
  return safeFetch(`${BASE_URL}/api/application/mine`, {
    headers: authHeader(),
  });
}

export async function getAdminOverview() {
  return safeFetch(`${BASE_URL}/api/admin/overview`, {
    headers: authHeader(),
  });
}
