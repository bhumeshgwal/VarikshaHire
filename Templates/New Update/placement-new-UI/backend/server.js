const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Small dependency-free request logger for local development and deployment logs.
app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`));
    next();
});

const mongoose = require('mongoose');
const { Student, Company, Admin, Job, Application, Notice, Message, Report, NotificationState } = require('./models');
const { hashPassword, comparePassword, generatetoken, verifytoken, requireRole, authLimiter } = require('./auth');

// Role Middlewares
const verifyAdmin = requireRole('admin');
const verifyStudent = requireRole('student');
const verifyCompany = requireRole('company');
const verifyOwner = (req, res, next) => verifyAdmin(req, res, () => {
    if (!req.user.isOwner) return res.status(403).json({ error: 'Only the owner can create admin accounts' });
    next();
});

function roleMatches(expectedRole, actualRole) {
    // Admins use the same two public login tabs instead of a discoverable admin tab.
    return !expectedRole || expectedRole === actualRole || actualRole === 'admin';
}

function ownerEmail() {
    return String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
}

const MAX_JOB_DEADLINE_DAYS = 365;
function validJobDeadline(value) {
    if (!value) return { valid: true, date: null };
    const date = new Date(value);
    const latest = new Date();
    latest.setHours(0, 0, 0, 0);
    latest.setDate(latest.getDate() + MAX_JOB_DEADLINE_DAYS);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { valid: !Number.isNaN(date.getTime()) && date >= today && date <= latest, date };
}

function updateOptions() {
    // Mongoose 9 prefers returnDocument; this removes the legacy update-option warning.
    return { returnDocument: 'after', runValidators: true };
}

const notificationTemplates = [
    'A new opportunity is ready', 'A fresh role has opened', 'Career update', 'Placement desk alert', 'Your next role may be here',
    'New campus hiring news', 'A company has shared an opening', 'Keep this opportunity in view', 'Hiring update for eligible students', 'A new role deserves a look',
    'Placement opportunity just arrived', 'Explore this employer opening', 'A role has been added to VrikshaHire', 'Your job board has an update', 'New recruiter announcement',
    'Opportunity spotlight', 'A new application window is open', 'Campus careers update', 'New role, new possibility', 'Hiring notice',
    'Open position announcement', 'Recruitment update', 'A company is looking for candidates', 'New placement drive', 'A role is now available',
    'Career board update', 'Employer opportunity alert', 'Application update', 'New opening for students', 'Placement portal notification',
    'Recruiter spotlight', 'Job board announcement', 'Hiring information', 'Fresh application opportunity', 'Company vacancy update',
    'New opportunity from the placement cell', 'A position has been posted', 'Candidate alert', 'Employment update', 'New job listing',
    'Placement news', 'A new company role is live', 'Opportunity bulletin', 'Recruitment bulletin', 'Job opportunity update'
];

function deadlineLabel(value) {
    if (!value) return 'Not specified';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not specified' : `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

async function nextNotificationIntro() {
    const state = await NotificationState.findOne({ key: 'job-notification-templates' }) || new NotificationState({ key: 'job-notification-templates' });
    const blocked = new Set(state.recentTemplateIndexes || []);
    const available = notificationTemplates.map((_, index) => index).filter(index => !blocked.has(index));
    const index = available[Math.floor(Math.random() * available.length)];
    state.recentTemplateIndexes = [...(state.recentTemplateIndexes || []), index].slice(-20);
    await state.save();
    return notificationTemplates[index];
}

function jobCriteria(job) {
    const branches = job.allowedBranches?.length ? job.allowedBranches.join(', ') : 'All branches';
    return `Minimum CGPA ${job.minCGPA}; maximum backlogs ${job.maxBacklogs}; branches: ${branches}.`;
}

async function publishJobNotice(job, event = 'posted') {
    const intro = await nextNotificationIntro();
    const action = event === 'extended' ? 'has extended the application deadline' : 'has posted a new role';
    const message = `${intro}: ${job.companyName} ${action} — ${job.title}. Salary: ₹${(Number(job.salary) / 100000).toFixed(1)} LPA. ${jobCriteria(job)} Deadline: ${deadlineLabel(job.deadline)}.`;
    return new Notice({ message, author: job.companyName }).save();
}

async function publishExpiredJobReminders() {
    if (mongoose.connection.readyState !== 1) return;
    const expired = await Job.find({ deadline: { $lte: new Date() }, deadlineReminderSent: { $ne: true } });
    for (const job of expired) {
        const intro = await nextNotificationIntro();
        await new Notice({ message: `${intro}: applications for ${job.title} at ${job.companyName} closed on ${deadlineLabel(job.deadline)}.`, author: job.companyName }).save();
        job.deadlineReminderSent = true;
        job.status = 'closed';
        await job.save();
    }
}

// Student-only career assistant. The provider key stays on the server.
app.post('/api/chat', verifyStudent, async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const history = req.body?.history;
    if (!message || message.length > 2000) {
        return res.status(400).json({ error: 'Message must be between 1 and 2000 characters' });
    }
    if (!Array.isArray(history) || history.length > 8 || history.some(item =>
        !item || !['user', 'model'].includes(item.role) || typeof item.text !== 'string' || item.text.length > 2000
    )) {
        return res.status(400).json({ error: 'Chat history is invalid or too long' });
    }
    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'AI assistant is not configured. Add GEMINI_API_KEY to the server environment.' });
    }
    try {
        const student = await Student.findById(req.user.id).select('branch cgpa skills');
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const contents = history.map(item => ({ role: item.role, parts: [{ text: item.text }] }));
        contents.push({ role: 'user', parts: [{ text: message }] });
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: `You are VrikshaBot, a concise career advisor for placement preparation. Give practical interview, placement, and resume advice in at most three short paragraphs. Student context: branch ${student.branch}, CGPA ${student.cgpa}, skills ${(student.skills || []).slice(0, 20).join(', ') || 'not specified'}.` }] },
                contents,
                generationConfig: { maxOutputTokens: 500 }
            })
        });
        if (!response.ok) return res.status(502).json({ error: 'AI service is temporarily unavailable. Please try again.' });
        const result = await response.json();
        const reply = result.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
        if (!reply) return res.status(502).json({ error: 'AI did not return a reply. Please try again.' });
        return res.json({ reply });
    } catch {
        return res.status(502).json({ error: 'AI service is temporarily unavailable. Please try again.' });
    }
});

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.warn('MONGO_URI is not set. Add it to backend/.env to enable database-backed features.');
} else {
    let reminderInterval;
    const connectToMongo = async () => {
        try {
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
            console.log('MongoDB Connected');
            if (!reminderInterval) {
                publishExpiredJobReminders().catch(err => console.error('Deadline reminder check failed:', err.message));
                reminderInterval = setInterval(() => {
                    publishExpiredJobReminders().catch(err => console.error('Deadline reminder check failed:', err.message));
                }, 60 * 60 * 1000);
            }
        } catch (err) {
            console.error('MongoDB Connection Error:', err.message);
            console.error('Check that the Atlas cluster is running, your IP is allowed in Network Access, and MONGO_URI credentials are correct.');
            setTimeout(connectToMongo, 30000).unref();
        }
    };
    connectToMongo();
}

function ensureDatabaseReady(res) {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            error: 'Database is not connected. Start MongoDB and verify MONGO_URI in backend/.env.'
        });
    }
    return false;
}


// ==========================================
// HELPER: ELIGIBILITY & MATCH ENGINE
// ==========================================
function evaluateStudentEligibility(student, job) {
    const reasons = [];
    let score = 50;

    // 1. CGPA check
    if (student.cgpa < job.minCGPA) {
        reasons.push(`Requires minimum ${job.minCGPA} CGPA (You have ${student.cgpa})`);
    } else {
        score += Math.min(25, (student.cgpa - job.minCGPA) * 10);
    }

    // 2. Backlogs check
    if ((student.backlogs ?? 0) > (job.maxBacklogs ?? 0)) {
        reasons.push(`Max allowed backlogs is ${job.maxBacklogs} (You have ${student.backlogs})`);
    } else {
        score += 10;
    }

    // 3. Branch check
    const allowed = (job.allowedBranches || []).map(b => b.trim().toUpperCase());
    const studentBranch = (student.branch || '').trim().toUpperCase();
    if (allowed.length > 0 && !allowed.includes(studentBranch)) {
        reasons.push(`Branch not eligible. Allowed: ${allowed.join(', ')}`);
    } else {
        score += 15;
    }

    // 4. Deadline check
    if (job.deadline && new Date() > new Date(job.deadline)) {
        reasons.push('Application deadline has passed');
    }

    return {
        isEligible: reasons.length === 0,
        reasons,
        matchScore: Math.min(100, Math.round(score)),
    };
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
app.post('/api/student/signup', authLimiter,async (req, res) => {
    if (ensureDatabaseReady(res)) return;
    try {
        const { name, email, password, branch, cgpa, backlogs } = req.body;
        const cgpaValue = Number(cgpa);
        const backlogsValue = Number(backlogs);
        if (!name || !email || !password || !branch || !Number.isFinite(cgpaValue) || cgpaValue < 0 || cgpaValue > 10 || !Number.isInteger(backlogsValue) || backlogsValue < 0) {
            return res.status(400).json({ error: 'Name, email, password, branch, CGPA, and backlogs are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const [company, admin, student] = await Promise.all([
            Company.findOne({ email: normalizedEmail }),
            Admin.findOne({ email: normalizedEmail }),
            Student.findOne({ email: normalizedEmail }),
        ]);
        if (student || company || admin || normalizedEmail === ownerEmail()) {
            return res.status(409).json({ error: 'Email is already registered' });
        }
        const hashedPassword = await hashPassword(password);
        const newStudent = new Student({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            branch: String(branch).trim(),
            cgpa: cgpaValue,
            backlogs: backlogsValue
        });
        await newStudent.save();
        res.json({ message: 'Student Registered', data: { _id: newStudent._id, branch: newStudent.branch } });
    } catch (err) { sendSafeError(res, err); }
});

app.post('/api/company/signup',authLimiter, async (req, res) => {
    if (ensureDatabaseReady(res)) return;
    try {
        const { name, email, password, website } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const [company, student, admin] = await Promise.all([
            Company.findOne({ email: normalizedEmail }),
            Student.findOne({ email: normalizedEmail }),
            Admin.findOne({ email: normalizedEmail }),
        ]);
        if (company || student || admin || normalizedEmail === ownerEmail()) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await hashPassword(password);
        const newCompany = new Company({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            website: website || '',
            approved: false, // Locked until admin approves
        });
        await newCompany.save();
        res.json({ message: 'Registration received. Awaiting admin approval.' });
    } catch (err) {
        sendSafeError(res, err);
    }
});
app.get('/api/student/me', verifyStudent, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        res.json({ student });
    } catch (err) {
        sendSafeError(res, err);
    }
});


app.post('/api/student/login', authLimiter,async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const expectedRole = req.body.expectedRole;
        if (expectedRole && !['student', 'company', 'admin'].includes(expectedRole)) {
            return res.status(400).json({ error: 'Select a valid account type' });
        }

        // 1. Check Admin
        if (ownerEmail() && email === ownerEmail()) {
            if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Incorrect email or password' });
            if (!roleMatches(expectedRole, 'admin')) return res.status(403).json({ error: 'Use either Student or Company to sign in with an admin account.' });
            const token = generatetoken({ id: 'owner', role: 'admin', isOwner: true });
            return res.json({ message: 'Login successful.', token, role: 'admin' });
        }

        const admin = await Admin.findOne({ email });
        if (admin) {
            const match = await comparePassword(password, admin.password);
            if (!match) return res.status(401).json({ error: 'Incorrect email or password' });
            if (!roleMatches(expectedRole, 'admin')) return res.status(403).json({ error: 'Use either Student or Company to sign in with an admin account.' });
            const token = generatetoken({ id: admin._id, role: 'admin' });
            return res.json({ message: 'Login successful.', token, role: 'admin', data: { _id: admin._id, name: admin.name } });
        }

        // 2. Check Company
        const company = await Company.findOne({ email });
        if (company) {
            const match = await comparePassword(password, company.password);
            if (!match) return res.status(401).json({ error: 'Incorrect email or password' });
            if (!company.approved) return res.status(403).json({ error: 'Account pending admin approval' });
            if (!roleMatches(expectedRole, 'company')) return res.status(403).json({ error: 'This email belongs to a company account. Select Company to log in.' });
            const token = generatetoken({ id: company._id, role: 'company' });
            return res.json({ message: 'Login successful.', token, role: 'company', data: { _id: company._id, name: company.name } });
        }

        // 3. Check Student
        const student = await Student.findOne({ email });
        if (student) {
            const match = await comparePassword(password, student.password);
            if (!match) return res.status(401).json({ error: 'Incorrect email or password' });
            if (!roleMatches(expectedRole, 'student')) return res.status(403).json({ error: 'This email belongs to a student account. Select Student to log in.' });
            const token = generatetoken({ id: student._id, role: 'student' });
            return res.json({ message: 'Login successful.', token, role: 'student', data: { _id: student._id, name: student.name, cgpa: student.cgpa, branch: student.branch, backlogs: student.backlogs } });
        }

        return res.status(401).json({ error: 'Incorrect email or password' });
    } catch (err) {
        sendSafeError(res, err);
    }
});

// The .env owner can add more placement-cell admins. There is no public admin signup.
app.post('/api/admin/accounts', verifyOwner, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!name || !normalizedEmail || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        const [admin, student, company] = await Promise.all([
            Admin.findOne({ email: normalizedEmail }),
            Student.findOne({ email: normalizedEmail }),
            Company.findOne({ email: normalizedEmail }),
        ]);
        if (admin || student || company || normalizedEmail === ownerEmail()) {
            return res.status(409).json({ error: 'Email is already registered' });
        }
        const newAdmin = await new Admin({ name, email: normalizedEmail, password: await hashPassword(password) }).save();
        res.status(201).json({ message: 'Admin account created', data: { _id: newAdmin._id, name: newAdmin.name, email: newAdmin.email } });
    } catch (err) {
        res.status(500).json({ error: 'Could not create admin account' });
    }
});


// ==========================================
// STUDENT PROFILE
// ==========================================
app.put('/api/student/:id', requireRole(['student', 'admin']), async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'You can only update your own profile' });
    }
    const updates = profileUpdates(req.body);
    try {
        const updated = await Student.findByIdAndUpdate(req.params.id, updates, updateOptions()).select('-password');
        if (!updated) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Profile updated', data: updated });
    } catch (err) {
        sendSafeError(res, err);
    }
});

// ==========================================
// PUBLIC & STUDENT JOB ROUTES
// ==========================================
app.get('/api/job', async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
        const query = {
            approved: true,
            status: 'open',
            $or: [{ deadline: null }, { deadline: { $gte: new Date() } }],
        };
        const [jobs, total] = await Promise.all([
            Job.find(query).sort({ postedAt: -1 }).skip((page - 1) * limit).limit(limit),
            Job.countDocuments(query),
        ]);
        res.json({ jobs, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        sendSafeError(res, err);
    }
});

app.get('/api/job/eligible', verifyStudent, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const jobs = await Job.find({
            approved: true,
            status: 'open',
            $or: [{ deadline: null }, { deadline: { $gte: new Date() } }],
        }).sort({ postedAt: -1 });
        const evaluated = jobs.map(job => {
            const { isEligible, reasons, matchScore } = evaluateStudentEligibility(student, job);
            return { ...job.toObject(), isEligible, reasons, matchScore };
        });

        res.json({ jobs: evaluated });
    } catch (err) {
        sendSafeError(res, err);
    }
});

// ==========================================
// COMPANY ROUTES
// ==========================================
app.get('/api/company/jobs', verifyCompany, async (req, res) => {
    try {
        const jobs = await Job.find({ companyId: req.user.id }).sort({ postedAt: -1 });
        res.json({ jobs });
    } catch (err) {
        sendSafeError(res, err);
    }
});

app.post('/api/company/jobs', verifyCompany, async (req, res) => {
    try {
        const company = await Company.findById(req.user.id);
        if (!company) return res.status(404).json({ error: 'Company not found' });
        const { title, salary, minCGPA, maxBacklogs, deadline, allowedBranches, requiredSkills } = req.body;
        const salaryValue = Number(salary);
        const cgpaValue = Number(minCGPA || 0);
        const backlogValue = Number(maxBacklogs || 0);
        const deadlineResult = validJobDeadline(deadline);
        if (!title || !Number.isFinite(salaryValue) || salaryValue < 0 || !Number.isFinite(cgpaValue) || cgpaValue < 0 || cgpaValue > 10 || !Number.isInteger(backlogValue) || backlogValue < 0 || !deadlineResult.valid) {
            return res.status(400).json({ error: 'Check salary, CGPA, backlogs, and choose a deadline within the next year.' });
        }
        const newJob = new Job({
            title: String(title).trim(), salary: salaryValue, minCGPA: cgpaValue,
            maxBacklogs: backlogValue, deadline: deadlineResult.date || undefined,
            allowedBranches: Array.isArray(allowedBranches) ? allowedBranches : [],
            requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
            companyId: company._id, companyName: company.name, approved: false,
        });
        await newJob.save();
        await publishJobNotice(newJob);
        res.json({ message: 'Job submitted for admin approval', data: newJob });
    } catch (err) {
        sendSafeError(res, err);
    }
});

app.put('/api/company/jobs/:id', verifyCompany, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid job ID format' });
    const updates = {};
    for (const field of ['title', 'salary', 'minCGPA', 'maxBacklogs', 'deadline', 'allowedBranches', 'requiredSkills', 'status']) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (updates.deadline !== undefined && !validJobDeadline(updates.deadline).valid) return res.status(400).json({ error: 'Choose a deadline from today through the next year.' });
    if (updates.deadline !== undefined) updates.deadline = validJobDeadline(updates.deadline).date || undefined;
    try {
        const previous = await Job.findOne({ _id: req.params.id, companyId: req.user.id });
        if (!previous) return res.status(404).json({ error: 'Job not found for this company' });
        const extended = updates.deadline && (!previous.deadline || new Date(updates.deadline) > new Date(previous.deadline));
        if (extended) updates.deadlineReminderSent = false;
        const job = await Job.findOneAndUpdate({ _id: req.params.id, companyId: req.user.id }, updates, updateOptions());
        if (extended) await publishJobNotice(job, 'extended');
        res.json({ message: 'Job updated', data: job });
    } catch (err) {
        res.status(500).json({ error: 'Could not update job' });
    }
});

app.delete('/api/company/jobs/:id', verifyCompany, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid job ID format' });
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, companyId: req.user.id });
        if (!job) return res.status(404).json({ error: 'Job not found for this company' });
        await Application.deleteMany({ jobId: job._id });
        res.json({ message: 'Job and its applications deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Could not delete job' });
    }
});

app.get('/api/company/jobs/:jobId/applicants', verifyCompany, async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.jobId, companyId: req.user.id });
        if (!job) return res.status(404).json({ error: 'Job not found for this company' });
        const applications = await Application.find({ jobId: job._id })
            .populate('studentId', 'name email branch cgpa backlogs skills projects resumeUrl')
            .sort({ appliedAt: -1 });
        res.json({ applications });
    } catch (err) {
        sendSafeError(res, err);
    }
});

app.put('/api/company/applications/:id', verifyCompany, async (req, res) => {
    try {
        const { status, interviewDetails } = req.body;
        if (!['applied', 'shortlisted', 'interview', 'selected', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid application status' });
        }
        const application = await Application.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.id },
            { status, ...(interviewDetails ? { interviewDetails } : {}) },
            updateOptions()
        ).populate('jobId', 'title companyName').populate('studentId', 'name branch cgpa skills');
        if (!application) return res.status(404).json({ error: 'Application not found for this company' });

        // Automate notification for student
        if (['shortlisted', 'interview', 'selected', 'rejected'].includes(status)) {
            await new Notice({
                message: `Your application for ${application.jobId.title} at ${application.jobId.companyName} has been marked as: ${status.toUpperCase()}.`,
                author: application.jobId.companyName,
                targetStudentId: application.studentId
            }).save();
        }

        res.json({ message: 'Status updated', application });
    } catch (err) {
        sendSafeError(res, err);
    }
});

// ==========================================
// APPLICATION ROUTES
// ==========================================
app.get('/api/application/mine', verifyStudent, async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.user.id })
            .populate('jobId', 'title companyName salary status')
            .sort({ appliedAt: -1 });
        res.json({ applications });
    } catch (err) {
        sendSafeError(res, err);
    }
});

app.post('/api/application', verifyStudent, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        const job = await Job.findById(req.body.jobId);

        if (!student || !job) return res.status(404).json({ error: 'Student or Job not found' });
        if (!job.approved || job.status !== 'open') return res.status(400).json({ error: 'This job is not open for applications' });
        
        const eligibility = evaluateStudentEligibility(student, job);
        if (!eligibility.isEligible) {
            return res.status(400).json({ error: 'Not eligible', reasons: eligibility.reasons });
        }

        const existing = await Application.findOne({ studentId: student._id, jobId: job._id });
        if (existing) return res.status(409).json({ error: 'You already applied for this job' });

        const newApp = new Application({ studentId: student._id, jobId: job._id, companyId: job.companyId });
        await newApp.save();
        res.json({ message: 'Application submitted', data: newApp });
    } catch (err) {
        sendSafeError(res, err);
    }
});

function applicationParticipant(application, user) {
    return (user.role === 'student' && String(application.studentId) === String(user.id)) ||
        (user.role === 'company' && String(application.companyId) === String(user.id));
}

// Only the student who applied and the company that owns that application can read or send messages.
app.get('/api/application/:id/messages', requireRole(['student', 'company']), async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid application ID format' });
    try {
        const application = await Application.findById(req.params.id);
        if (!application || !applicationParticipant(application, req.user)) return res.status(403).json({ error: 'You cannot access this conversation' });
        const messages = await Message.find({ applicationId: application._id }).populate('replyTo', 'message senderRole createdAt').sort({ createdAt: 1 });
        res.json({ messages });
    } catch (err) { sendSafeError(res, err); }
});

app.post('/api/application/:id/messages', requireRole(['student', 'company']), async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const replyTo = req.body?.replyTo;
    if (!message || message.length > 2000) return res.status(400).json({ error: 'Message must contain 1 to 2000 characters' });
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid application ID format' });
    try {
        const application = await Application.findById(req.params.id);
        if (!application || !applicationParticipant(application, req.user)) return res.status(403).json({ error: 'You cannot access this conversation' });
        if (req.user.role === 'student' && !['shortlisted', 'interview', 'selected'].includes(application.status)) {
            return res.status(403).json({ error: 'You can message this company after you are shortlisted, invited to interview, or selected.' });
        }
        if (replyTo && (!mongoose.Types.ObjectId.isValid(replyTo) || !await Message.exists({ _id: replyTo, applicationId: application._id }))) {
            return res.status(400).json({ error: 'The message you are replying to is not in this conversation' });
        }
        const saved = await new Message({ applicationId: application._id, senderId: req.user.id, senderRole: req.user.role, message, replyTo: replyTo || null }).save();
        await saved.populate('replyTo', 'message senderRole createdAt');
        res.status(201).json({ message: saved });
    } catch (err) { sendSafeError(res, err); }
});

app.get('/api/messages/inbox', requireRole(['student', 'company']), async (req, res) => {
    try {
        const query = req.user.role === 'student' ? { studentId: req.user.id } : { companyId: req.user.id };
        const applications = await Application.find(query)
            .populate('studentId', 'name email branch')
            .populate('jobId', 'title companyName')
            .sort({ appliedAt: -1 });
        res.json({ applications });
    } catch (err) { sendSafeError(res, err); }
});

app.post('/api/report', requireRole(['student', 'company']), async (req, res) => {
    const { type, subjectRole, subjectId, messageId, applicationId } = req.body;
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    if (!['system_bug', 'account_report', 'message_report'].includes(type)) return res.status(400).json({ error: 'Choose a valid report type' });
    if (type === 'account_report' && !['student', 'company'].includes(subjectRole)) return res.status(400).json({ error: 'Choose whether the report concerns a student or company' });
    if (description.length < 10 || description.length > 2000) return res.status(400).json({ error: 'Explain the issue in 10 to 2000 characters' });
    try {
        const account = req.user.role === 'student' ? await Student.findById(req.user.id).select('email') : await Company.findById(req.user.id).select('email');
        if (!account) return res.status(404).json({ error: 'Your account was not found' });
        if (type === 'message_report' && (!mongoose.Types.ObjectId.isValid(messageId) || !mongoose.Types.ObjectId.isValid(applicationId))) return res.status(400).json({ error: 'Choose a valid message to report' });
        const report = await new Report({ reporterId: String(req.user.id), reporterRole: req.user.role, reporterEmail: account.email, type, subjectRole: type === 'account_report' ? subjectRole : null, subjectId: subjectId || null, messageId: type === 'message_report' ? messageId : null, applicationId: type === 'message_report' ? applicationId : null, description }).save();
        res.status(201).json({ message: 'Report submitted', report });
    } catch (err) { sendSafeError(res, err); }
});

// ==========================================
// NOTICE ROUTES
// ==========================================
app.get('/api/notice', requireRole(['student', 'company', 'admin']), async (req, res) => {
    try {
        // Fetch global notices and student-specific notices if logged in
        const query = req.user?.role === 'student' 
            ? { $or: [{ targetStudentId: null }, { targetStudentId: req.user.id }] } 
            : { targetStudentId: null };
            
        const notices = await Notice.find(query).sort({ date: -1 });
        res.json({ notices });
    } catch (err) {
        sendSafeError(res, err);
    }
});

app.post('/api/notice', verifyAdmin, async (req, res) => {
    try {
        const newNotice = new Notice(req.body);
        await newNotice.save();
        res.json({ message: 'Notice added', data: newNotice });
    } catch (err) {
        sendSafeError(res, err);
    }
});

app.delete('/api/notice/:id', verifyAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
    try {
        const deleted = await Notice.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Notice not found' });
        res.json({ message: 'Notice deleted' });
    } catch (err) {
        sendSafeError(res, err);
    }
});

// ==========================================
// ADMIN DASHBOARD & APPROVALS
// ==========================================
app.get('/api/admin/overview', verifyAdmin, async (req, res) => {
    try {
        const [students, companies, jobs, applicationCount, placedStudents, pendingCompanies, pendingJobs] = await Promise.all([
            Student.countDocuments(),
            Company.countDocuments(),
            Job.countDocuments(),
            Application.countDocuments(),
            Application.distinct('studentId', { status: 'selected' }),
            Company.countDocuments({ approved: { $ne: true } }),
            Job.countDocuments({ approved: { $ne: true } }),
        ]);
        
        const applications = await Application.find()
            .populate('studentId', 'name email branch')
            .populate('jobId', 'title companyName')
            .sort({ appliedAt: -1 })
            .limit(100);

        res.json({
            stats: { 
                students, 
                companies,
                jobs, 
                applications: applicationCount,
                placed: placedStudents.length,
                unplaced: students - placedStudents.length,
                pendingCompanies,
                pendingJobs,
            },
            applications
        });
    } catch (err) {
        sendSafeError(res, err);
    }
});

app.get('/api/admin/pending', verifyAdmin, async (req, res) => {
    try {
        const [pendingCompanies, pendingJobs] = await Promise.all([
            // $ne also includes older records created before the approval field existed.
            Company.find({ approved: { $ne: true } }),
            Job.find({ approved: { $ne: true } }),
        ]);
        res.json({ pendingCompanies, pendingJobs });
    } catch (err) {
        sendSafeError(res, err);
    }
});

function publicStudentProfile(student) {
    return {
        _id: student._id, name: student.name, branch: student.branch,
        headline: student.headline || '', bio: student.bio || '', skills: student.skills || [],
        projects: student.projects || [], githubUrl: student.githubUrl || '', linkedinUrl: student.linkedinUrl || '',
        resumeLink: student.resumeLink || student.resumeUrl || '',
    };
}

function sendSafeError(res, err) {
    console.error('Request failed:', err.message);
    return res.status(500).json({ error: 'Something went wrong on the server' });
}

function profileUpdates(body) {
    const updates = {};
    for (const field of ['name', 'branch', 'headline', 'bio', 'skills', 'projects', 'githubUrl', 'linkedinUrl', 'resumeLink', 'resumeUrl', 'cgpa', 'backlogs']) {
        if (body[field] !== undefined) updates[field] = body[field];
    }
    return updates;
}

app.put('/api/student/me', verifyStudent, async (req, res) => {
    const updates = profileUpdates(req.body);
    if (updates.cgpa !== undefined && (!Number.isFinite(Number(updates.cgpa)) || Number(updates.cgpa) < 0 || Number(updates.cgpa) > 10)) return res.status(400).json({ error: 'CGPA must be between 0 and 10' });
    if (updates.backlogs !== undefined && (!Number.isInteger(Number(updates.backlogs)) || Number(updates.backlogs) < 0)) return res.status(400).json({ error: 'Backlogs must be zero or more' });
    try {
        const student = await Student.findByIdAndUpdate(req.user.id, updates, updateOptions()).select('-password');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Profile updated', student });
    } catch (err) { res.status(500).json({ error: 'Could not update profile' }); }
});

app.get('/api/student/people', verifyStudent, async (req, res) => {
    const search = String(req.query.search || '').trim();
    const expression = search ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
    const query = expression ? { $or: [{ name: expression }, { branch: expression }, { skills: expression }] } : {};
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    try {
        const [students, total] = await Promise.all([
            Student.find(query).select('name branch headline skills').skip((page - 1) * limit).limit(limit),
            Student.countDocuments(query),
        ]);
        res.json({ students, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ error: 'Could not search students' }); }
});

app.get('/api/student/:id/profile', requireRole(['student', 'company', 'admin']), async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid student ID format' });
    try {
        const student = await Student.findById(req.params.id).select('-password');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        const profile = publicStudentProfile(student);
        if (req.user.role === 'admin') Object.assign(profile, { email: student.email, cgpa: student.cgpa, backlogs: student.backlogs });
        if (req.user.role === 'company' && await Application.exists({ studentId: student._id, companyId: req.user.id })) {
            Object.assign(profile, { email: student.email, cgpa: student.cgpa, backlogs: student.backlogs });
        }
        res.json({ profile });
    } catch (err) { res.status(500).json({ error: 'Could not load student profile' }); }
});

app.get('/api/admin/queue', verifyAdmin, async (req, res) => {
    try {
        const [pendingCompanies, pendingJobs] = await Promise.all([
            Company.find({ approved: { $ne: true } }).select('-password'),
            Job.find({ approved: { $ne: true } }),
        ]);
        res.json({ pendingCompanies, pendingJobs });
    } catch (err) {
        res.status(500).json({ error: 'Could not load the approval queue' });
    }
});

app.get('/api/admin/companies', verifyAdmin, async (req, res) => {
    try {
        res.json({ companies: await Company.find().select('-password').sort({ createdAt: -1 }) });
    } catch (err) {
        res.status(500).json({ error: 'Could not load companies' });
    }
});

app.get('/api/admin/jobs', verifyAdmin, async (req, res) => {
    try {
        res.json({ jobs: await Job.find().sort({ postedAt: -1 }) });
    } catch (err) {
        res.status(500).json({ error: 'Could not load jobs' });
    }
});

app.get('/api/admin/students', verifyAdmin, async (req, res) => {
    try {
        res.json({ students: await Student.find().select('-password').sort({ createdAt: -1 }) });
    } catch (err) {
        res.status(500).json({ error: 'Could not load students' });
    }
});

app.get('/api/admin/reports', verifyAdmin, async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 }).limit(200);
        res.json({ reports });
    } catch (err) { sendSafeError(res, err); }
});

app.put('/api/admin/reports/:id', verifyAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid report ID format' });
    if (!['open', 'reviewing', 'resolved'].includes(req.body.status)) return res.status(400).json({ error: 'Choose Open, Reviewing, or Resolved' });
    try {
        const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, updateOptions());
        if (!report) return res.status(404).json({ error: 'Report not found' });
        res.json({ message: 'Report updated', report });
    } catch (err) { sendSafeError(res, err); }
});

app.put('/api/admin/approve-company/:id', verifyAdmin, async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, { approved: true }, updateOptions());
        res.json({ message: 'Company approved', company });
    } catch (err) {
        sendSafeError(res, err);
    }
});

app.put('/api/admin/approve-job/:id', verifyAdmin, async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, { approved: true }, updateOptions());
        res.json({ message: 'Job approved and live', job });
    } catch (err) {
        sendSafeError(res, err);
    }
});

app.put('/api/admin/company/:id', verifyAdmin, async (req, res) => {
    const updates = {};
    for (const field of ['name', 'website', 'approved']) if (req.body[field] !== undefined) updates[field] = req.body[field];
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, updates, updateOptions()).select('-password');
        if (!company) return res.status(404).json({ error: 'Company not found' });
        res.json({ message: 'Company updated', data: company });
    } catch (err) {
        res.status(500).json({ error: 'Could not update company' });
    }
});

app.put('/api/admin/job/:id', verifyAdmin, async (req, res) => {
    const updates = {};
    for (const field of ['title', 'salary', 'minCGPA', 'maxBacklogs', 'deadline', 'allowedBranches', 'requiredSkills', 'status', 'approved']) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (updates.deadline !== undefined && !validJobDeadline(updates.deadline).valid) return res.status(400).json({ error: 'Choose a deadline from today through the next year.' });
    if (updates.deadline !== undefined) updates.deadline = validJobDeadline(updates.deadline).date || undefined;
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, updates, updateOptions());
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json({ message: 'Job updated', data: job });
    } catch (err) {
        res.status(500).json({ error: 'Could not update job' });
    }
});

app.put('/api/admin/student/:id', verifyAdmin, async (req, res) => {
    const updates = {};
    for (const field of ['name', 'branch', 'cgpa', 'backlogs', 'skills', 'resumeUrl', 'projects']) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, updates, updateOptions()).select('-password');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student updated', data: student });
    } catch (err) {
        res.status(500).json({ error: 'Could not update student' });
    }
});

app.delete('/api/admin/company/:id', verifyAdmin, async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) return res.status(404).json({ error: 'Company not found' });
        await Promise.all([Job.deleteMany({ companyId: company._id }), Application.deleteMany({ companyId: company._id })]);
        res.json({ message: 'Company, its jobs, and applications deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Could not delete company' });
    }
});

app.delete('/api/admin/job/:id', verifyAdmin, async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        await Application.deleteMany({ jobId: job._id });
        res.json({ message: 'Job and its applications deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Could not delete job' });
    }
});

app.delete('/api/admin/student/:id', verifyAdmin, async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        await Promise.all([Application.deleteMany({ studentId: student._id }), Notice.deleteMany({ targetStudentId: student._id })]);
        res.json({ message: 'Student and their applications deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Could not delete student' });
    }
});

// Development reset route. It requires an admin token and an explicit confirmation
// so it cannot be triggered accidentally from the client application.
app.delete('/api/admin/reset-data', verifyAdmin, async (req, res) => {
    if (req.body?.confirmation !== 'DELETE_ALL_DATA') {
        return res.status(400).json({ error: 'Send confirmation: DELETE_ALL_DATA to reset the database' });
    }
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: 'MongoDB is not connected. Wait for "MongoDB Connected" in the server terminal, then try again.' });
    }
    try {
        const [applications, jobs, notices, companies, students] = await Promise.all([
            Application.deleteMany({}),
            Job.deleteMany({}),
            Notice.deleteMany({}),
            Company.deleteMany({}),
            Student.deleteMany({}),
        ]);
        res.json({
            message: 'Placement data cleared',
            deleted: {
                applications: applications.deletedCount,
                jobs: jobs.deletedCount,
                notices: notices.deletedCount,
                companies: companies.deletedCount,
                students: students.deletedCount,
            },
        });
    } catch (err) {
        console.error('Database reset failed:', err.message);
        res.status(500).json({ error: 'Could not clear database data' });
    }
});

// Serve the built React app after every API route. This keeps direct visits to
// a client view working in deployment without intercepting API requests.
const clientBuildPath = path.resolve(__dirname, '..', 'frontend', 'dist');
app.use(express.static(clientBuildPath));
app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(clientBuildPath, 'index.html'), err => err && next(err));
});

// Final safety net for unexpected Express errors.
app.use((err, req, res, next) => {
    console.error('Unhandled request error:', err.message);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});
