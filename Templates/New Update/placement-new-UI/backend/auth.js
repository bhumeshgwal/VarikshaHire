const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;

// 1. Password Hashing
async function hashPassword(plainPassword) {
    const hashed = await bcrypt.hash(plainPassword, 10);
    return hashed;
}

async function comparePassword(plainPassword, hashPassword) {
    const compare = await bcrypt.compare(plainPassword, hashPassword);
    return compare;
}

// 2. JWT Generation
function generatetoken(payload) {
    const token = jwt.sign(payload, process.env.JWTsec, { expiresIn: '7d' });
    return token;
}

// 3. Token Verification
function verifytoken(req, res, next) {
    try {
        const authHeader = req.get('authorization');
        const match = authHeader && authHeader.match(/^Bearer\s+(\S+)$/i);
        if (!match) {
            return res.status(401).json({ error: 'A Bearer token is required' });
        }
        if (!process.env.JWTsec) {
            console.error('JWTsec is not configured in .env');
            return res.status(500).json({ error: 'Server authentication is not configured' });
        }
        const token = match[1];
        const decoded = jwt.verify(token, process.env.JWTsec);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// 4. Role-based Access Control (Upgraded for Multi-Role Support)
function requireRole(allowedRoles) {
    return function roleMiddleware(req, res, next) {
        verifytoken(req, res, () => {
            if (!req.user || !req.user.role) {
                return res.status(401).json({ error: 'Please log in again to refresh your session' });
            }
            
            // Normalize allowedRoles into an array
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
            
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'You do not have permission to access this resource' });
            }
            next();
        });
    };
}

// Login attempts are identified by both IP and the claimed email. This avoids
// one person testing on shared Wi-Fi locking out everyone else on that network.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,
    keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.email || 'anonymous').trim().toLowerCase()}`,
    message: { error: 'Too many attempts for this email from this network. Please try again after 15 minutes.' },
    standardHeaders: true, 
    legacyHeaders: false,
});

module.exports = { hashPassword, comparePassword, generatetoken, verifytoken, requireRole, authLimiter };
