const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    branch: String,
    cgpa: Number,
    backlogs: { type: Number, default: 0 }
});
const Student = mongoose.model('Student', studentSchema);

const jobSchema = new mongoose.Schema({
    title: String,
    companyName: String,
    salary: String,
    minCGPA: Number,
    allowedBranches: [String],
    maxBacklogs: { type: Number, default: 0 },
    status: { type: String, default: 'open' }
});
const Job = mongoose.model('Job', jobSchema);

const applicationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    status: { type: String, default: 'applied' },
    appliedAt: { type: Date, default: Date.now }
});
const Application = mongoose.model('Application', applicationSchema);

const noticeSchema = new mongoose.Schema({
    message: String,
    date: { type: Date, default: Date.now }
});
const Notice = mongoose.model('Notice', noticeSchema);

module.exports = { Student, Job, Application, Notice };
