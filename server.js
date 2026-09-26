require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
const { Student, Job, Application, Notice } = require('./models');
const {hashPassword, comparePassword, generatetoken, verifytoken} = require('./auth');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
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
    try {
        const applications = await Application.find({ studentId: req.params.studentId });
        res.json({ applications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/student/signup', async (req,res) => {
    try {
        const hashedPassword = await hashPassword(req.body.password);
        const newStudent = new Student({
            name : req.body.name,
            email : req.body.email,
            password : hashedPassword
        });
        await newStudent.save();
        res.json({message : 'Student Registered' , data : newStudent});
    } catch (err) {
        res.status(500).json({error : err.message});
    };
});

app.post('/api/student/login',async (req,res) => {
    try {
        const student = await Student.findOne({ email : req.body.email });
        if(!student){
            return res.status(404).json({ error : 'Student not Found'});
        }

        const isMatch = await comparePassword(req.body.password,student.password);
        if(!isMatch){
            return res.status(401).json({ error : 'Incorrect Password'});
        }
        
        const token = generatetoken({ id: student._id});
        res.json({message : 'Login Succesfully.', token: token});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/student/:id',verifytoken, async (req, res) => {
    try {
        const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student updated', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/student/:id',verifytoken, async (req, res) => {
    try {
        const deleted = await Student.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student deleted' });
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

app.post('/api/job',verifytoken, async (req, res) => {
    try {
        const newJob = new Job(req.body);
        await newJob.save();
        res.json({ message: 'Job added', data: newJob });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/job/:id',verifytoken, async (req, res) => {
    try {
        const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Job not found' });
        res.json({ message: 'Job updated', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/job/:id',verifytoken, async (req, res) => {
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

app.post('/api/notice',verifytoken, async (req, res) => {
    try {
        const newNotice = new Notice(req.body);
        await newNotice.save();
        res.json({ message: 'Notice added', data: newNotice });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notice/:id', verifytoken, async (req, res) => {
    try {
        const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Notice not found' });
        res.json({ message: 'Notice updated', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/notice/:id',verifytoken, async (req, res) => {
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

app.post('/api/application',verifytoken, async (req, res) => {
    try {
        const student = await Student.findById(req.body.studentId);
        const job = await Job.findById(req.body.jobId);

        if (!student || !job) {
            return res.status(404).json({ error: 'Student or Job not found' });
        }

        if (student.cgpa < job.minCGPA) {
            return res.status(400).json({ error: 'cgpa below requirement' });
        }
        if (!job.allowedBranches.includes(student.branch)) {
            return res.status(400).json({ error: 'branch not eligible' });
        }
        if (student.backlogs > job.maxBacklogs) {
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
    try {
        const updated = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Application not found' });
        res.json({ message: 'Application updated', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/application/:id', verifytoken, async (req, res) => {
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