require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
const { Student, Job, Application, Notice } = require('./models');
const { hashPassword, comparePassword, generatetoken, verifytoken } = require('./auth');

mongoose.connect(process.env.MONGO_URI)
    .catch((err) => console.log('MongoDB Connection Error:', err));

app.get('/', (req, res) => {
    res.send('VrikshaHire API running.');
}); 

app.get('/api/student', async (req, res) => {
    try {
        const students = await Student.find();
        res.json({ students });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/application/student/:studentId', verifytoken, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.studentId)) {
        return res.status(400).json({ error: 'Invalid Student ID format' });
    }
    try {
        const applications = await Application.find({ studentId: req.params.studentId });
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
        const student = await Student.findOne({ email: req.body.email });
        if (!student) {
            return res.status(404).json({ error: 'Student not Found' });
        }

        const isMatch = await comparePassword(req.body.password, student.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect Password' });
        }
        
        const token = generatetoken({ id: student._id });
       res.json({message : 'Login Succesfully.', token: token, data: student});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/student/:id', verifytoken, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student updated', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/job', async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json({ jobs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/job', verifytoken, async (req, res) => {
    try {
        const newJob = new Job(req.body);
        await newJob.save();
        res.json({ message: 'Job added', data: newJob });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/job/:id', verifytoken, async (req, res) => {
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

app.delete('/api/job/:id', verifytoken, async (req, res) => {
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

app.post('/api/notice', verifytoken, async (req, res) => {
    try {
        const newNotice = new Notice(req.body);
        await newNotice.save();
        res.json({ message: 'Notice added', data: newNotice });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notice/:id', verifytoken, async (req, res) => {
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

app.delete('/api/notice/:id', verifytoken, async (req, res) => {
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

app.get('/api/application', async (req, res) => {
    try {
        const data = await Application.find();
        res.json({ applications: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/application', verifytoken, async (req, res) => {
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
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/application/:id', verifytoken, async (req, res) => {
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

app.delete('/api/application/:id', verifytoken, async (req, res) => {
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
