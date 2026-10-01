const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    techStack: [String],
    githubUrl: String,
    liveUrl: String,
    link: String,
});

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    branch: { type: String, required: true },
    cgpa: { type: Number, required: true },
    backlogs: { type: Number, default: 0 },
    skills: [{ type: String }],
    resumeUrl: { type: String, default: '' },
    resumeLink: { type: String, default: '' },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    projects: [projectSchema],
    createdAt: { type: Date, default: Date.now },
});
const Student = mongoose.model('Student', studentSchema);

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    website: { type: String, default: '' },
    approved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
const Company = mongoose.model('Company', companySchema);

// Extra placement-cell admins. The original owner stays in .env and is never stored here.
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const Admin = mongoose.model('Admin', adminSchema);

const jobSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    companyName: { type: String, required: true },
    title: { type: String, required: true },
    salary: { type: Number, required: true },
    minCGPA: { type: Number, default: 0 },
    allowedBranches: [{ type: String }],
    maxBacklogs: { type: Number, default: 0 },
    requiredSkills: [{ type: String }],
    deadline: { type: Date },
    approved: { type: Boolean, default: false },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    deadlineReminderSent: { type: Boolean, default: false },
    postedAt: { type: Date, default: Date.now },
});
const Job = mongoose.model('Job', jobSchema);

const applicationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    status: {
        type: String,
        enum: ['applied', 'shortlisted', 'interview', 'selected', 'rejected'],
        default: 'applied',
    },
    interviewDetails: {
        date: Date,
        meetingLink: String,
        notes: String,
    },
    appliedAt: { type: Date, default: Date.now },
});
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
const Application = mongoose.model('Application', applicationSchema);

const noticeSchema = new mongoose.Schema({
    message: { type: String, required: true },
    author: { type: String, default: 'Admin' },
    targetStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }, // If null, it's a global broadcast
    date: { type: Date, default: Date.now },
});
const Notice = mongoose.model('Notice', noticeSchema);

// A message is always tied to an application, which prevents unrelated users
// from starting a conversation with a student or a company.
const messageSchema = new mongoose.Schema({
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ['student', 'company'], required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

const reportSchema = new mongoose.Schema({
    reporterId: { type: String, required: true },
    reporterRole: { type: String, enum: ['student', 'company'], required: true },
    reporterEmail: { type: String, required: true },
    type: { type: String, enum: ['system_bug', 'account_report', 'message_report'], required: true },
    subjectRole: { type: String, enum: ['student', 'company'], default: null },
    subjectId: { type: String, default: null },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    status: { type: String, enum: ['open', 'reviewing', 'resolved'], default: 'open' },
    createdAt: { type: Date, default: Date.now },
});
const Report = mongoose.model('Report', reportSchema);

// Stored rotation history keeps notification wording varied even after a server restart.
const notificationStateSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    recentTemplateIndexes: { type: [Number], default: [] },
});
const NotificationState = mongoose.model('NotificationState', notificationStateSchema);

module.exports = { Student, Company, Admin, Job, Application, Notice, Message, Report, NotificationState };
