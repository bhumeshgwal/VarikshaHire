const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function hashPassword(plainPassword) {
    const hashed = await bcrypt.hash(plainPassword, 10);
    return hashed;
}

async function comparePassword(plainPassword, hashPassword) {
    const compare = await bcrypt.compare(plainPassword, hashPassword);
    return compare;
}

function generatetoken(payload) {
    const token = jwt.sign(payload, process.env.JWTsec, { expiresIn: '7d' });
    return token;
}

function verifytoken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token Provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWTsec);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = { hashPassword, comparePassword, generatetoken, verifytoken };