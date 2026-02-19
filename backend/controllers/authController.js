const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'medireach_secret_key_2026';
const JWT_EXPIRES = '7d';

const signToken = (userId) =>
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });

        const existing = await User.findOne({ email });
        if (existing)
            return res.status(409).json({ success: false, message: 'Email already registered' });

        // Hash password manually (bypasses Mongoose pre-save hook issue)
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, password: hashedPassword, role });
        const token = signToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const token = signToken(user._id);

        res.json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Login failed', error: err.message });
    }
};

// GET /api/auth/me  (requires Authorization: Bearer <token>)
const getMe = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ success: false, message: 'No token provided' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, user });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = { register, login, getMe };
