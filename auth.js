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
        const authHeader = req.get('authorization');
        const match = authHeader && authHeader.match(/^Bearer\s+(\S+)$/i);
        if (!match) {
            return res.status(401).json({ error: 'A Bearer token is required' });
        }
        if (!process.env.JWTsec) {
            console.error('JWTsec is not configured');
            return res.status(500).json({ error: 'Authentication is not configured' });
        }
        const token = match[1];
        const decoded = jwt.verify(token, process.env.JWTsec);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { hashPassword, comparePassword, generatetoken, verifytoken };
