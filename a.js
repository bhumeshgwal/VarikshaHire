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
    res.send('Placement Portal API running');
});

// Routes

app.listen(5000, () => {
    console.log('Server Running on port 5000');
});