require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
const { Student, Job, Application, Notice } = require('./models');
const { hashPassword, comparePassword, generatetoken, verifytoken, requireRole } = require('./auth');
const verifyAdmin = requireRole('admin');
const verifyStudent = requireRole('student');

mongoose.connect(process.env.MONGO_URI)
    .catch((err) => console.log('MongoDB Connection Error:', err));

app.get('/', (req, res) => {
    res.send('VrikshaHire API running.');
}); 

app.get('/api/student', verifyAdmin, async (req, res) => {
    try {
        const students = await Student.find().select('-password');
        res.json({ students });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/application/mine', verifyStudent, async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.user.id })
            .populate('jobId', 'title companyName salary status')
            .sort({ appliedAt: -1 });
        res.json({ applications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/student/signup', async (req, res) => {
    try {
        const { name, email, password, branch, cgpa, backlogs } = req.body;
        if (!name || !email || !password || !branch || !Number.isFinite(Number(cgpa)) || !Number.isFinite(Number(backlogs))) {
            return res.status(400).json({ error: 'Name, email, password, branch, CGPA, and backlogs are required' });
        }

        const hashedPassword = await hashPassword(req.body.password);
        const newStudent = new Student({
            name,
            email,
            password: hashedPassword,
            branch: String(branch).trim(),
            cgpa: Number(cgpa),
            backlogs: Number(backlogs)
        });
        await newStudent.save();
        res.json({ message: 'Student Registered', data: { _id: newStudent._id, branch: newStudent.branch } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/student/login', async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (adminEmail && email === adminEmail.trim().toLowerCase()) {
            if (!adminPassword) {
                return res.status(503).json({ error: 'Admin login is not configured on the server' });
            }
            if (password !== adminPassword) {
                return res.status(401).json({ error: 'Incorrect email or password' });
            }
            const token = generatetoken({ id: 'admin', role: 'admin' });
            return res.json({ message: 'Login successful.', token, role: 'admin' });
        }

        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }

        const isMatch = await comparePassword(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }
        
        const token = generatetoken({ id: student._id, role: 'student' });
        res.json({ message: 'Login successful.', token, role: 'student', data: { _id: student._id, name: student.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/student/:id', verifytoken, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'You can only update your own profile' });
    }
    const updates = {};
    for (const field of ['name', 'branch', 'cgpa', 'backlogs']) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    try {
        const updated = await Student.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
        if (!updated) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student updated', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/job', async (req, res) => {
    try {
        const jobs = await Job.find({ $or: [{ status: 'open' }, { status: { $exists: false } }] });
        res.json({ jobs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/job', verifyAdmin, async (req, res) => {
    try {
        const newJob = new Job(req.body);
        await newJob.save();
        res.json({ message: 'Job added', data: newJob });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/job/:id', verifyAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Job not found' });
        res.json({ message: 'Job updated', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/job/:id', verifyAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const deleted = await Job.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Job not found' });
        res.json({ message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/notice', async (req, res) => {
    try {
        const notices = await Notice.find();
        res.json({ notices });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/notice', verifyAdmin, async (req, res) => {
    try {
        const newNotice = new Notice(req.body);
        await newNotice.save();
        res.json({ message: 'Notice added', data: newNotice });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notice/:id', verifyAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Notice not found' });
        res.json({ message: 'Notice updated', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/notice/:id', verifyAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const deleted = await Notice.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Notice not found' });
        res.json({ message: 'Notice deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/overview', verifyAdmin, async (req, res) => {
    try {
        const [students, jobs, applicationCount, applications] = await Promise.all([
            Student.countDocuments(),
            Job.countDocuments(),
            Application.countDocuments(),
            Application.find()
                .populate('studentId', 'name email branch')
                .populate('jobId', 'title companyName')
                .sort({ appliedAt: -1 })
                .limit(100)
        ]);
        res.json({
            stats: { students, jobs, applications: applicationCount },
            applications
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/application', verifyStudent, async (req, res) => {
    // Use the authenticated account from the signed token instead of trusting a
    // studentId supplied by the browser (which can be stale or missing).
    const studentId = req.user.id;
    const { jobId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ error: 'Invalid ID format.' });
    }

    try {
        const student = await Student.findById(studentId);
        const job = await Job.findById(jobId);

        if (!student || !job) {
            return res.status(404).json({ error: 'Student or Job not found' });
        }
        if (job.status && job.status !== 'open') {
            return res.status(400).json({ error: 'This job is closed' });
        }
        const existingApplication = await Application.findOne({ studentId, jobId });
        if (existingApplication) {
            return res.status(409).json({ error: 'You already applied for this job' });
        }

        if (student.cgpa < job.minCGPA) {
            return res.status(400).json({ error: 'cgpa below requirement' });
        }
        const allowedBranches = Array.isArray(job.allowedBranches) ? job.allowedBranches : [];
        const branchAliases = {
            cs: 'cs', cse: 'cs', computerscience: 'cs', computerscienceengineering: 'cs',
            it: 'it', informationtechnology: 'it',
            ec: 'ec', ece: 'ec', electronics: 'ec', electronicsandcommunication: 'ec',
            me: 'me', mech: 'me', mechanical: 'me', mechanicalengineering: 'me'
        };
        const normalizeBranch = (branch) => {
            const normalized = String(branch || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return branchAliases[normalized] || normalized;
        };
        const studentBranch = normalizeBranch(student.branch);
        const branchIsAllowed = allowedBranches.some(
            (branch) => normalizeBranch(branch) === studentBranch
        );
        if (!studentBranch || !branchIsAllowed) {
            return res.status(400).json({ error: 'branch not eligible' });
        }
        if ((student.backlogs ?? 0) > (job.maxBacklogs ?? 0)) {
            return res.status(400).json({ error: 'Too many backlogs' });
        }

        const newItem = new Application({
            studentId: student._id,
            jobId: job._id
        });
        await newItem.save();
        res.json({ message: 'Application submitted', data: newItem });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'You already applied for this job' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/application/:id', verifyAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const updated = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Application not found' });
        res.json({ message: 'Application updated', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/application/:id', verifyAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const deleted = await Application.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Application not found' });
        res.json({ message: 'Application deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => {
    console.log('Server Running');
});
