require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/auth-db';
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('AuthDB Connected');
        // Wipe users on startup for clean state (as requested)
        try {
            await User.deleteMany({});
            console.log('🧹 [AUTH] Database wiped for clean startup.');
        } catch (err) {
            console.error('❌ [AUTH] Error wiping database:', err);
        }
    })
    .catch(err => console.error('AuthDB Error:', err));

// User Schema (Enhanced for MySakn)
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' },
    age: Number,
    gender: String,
    homeGov: String,
    studyGov: String,
    university: String,
    uniEmail: String,
    studentStatus: String,
    purpose: String,
    paymentMethod: String,
    roleInfo1: String, // Dynamic field based on role (Address/Agency)
    roleInfo2: String, // Dynamic field based on role (District)
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Routes
app.post('/register', async (req, res) => {
    try {
        console.log('📝 [AUTH] Registration attempt:', req.body.email || 'NO_EMAIL');
        const { name, email, password, role, ...extraFields } = req.body;

        if (!email || !password) {
            console.error('❌ [AUTH] Missing credentials');
            return res.status(400).json({ error: 'Email and password required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.warn('⚠️ [AUTH] Email already exists:', email);
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            ...extraFields
        });

        console.log('💾 [AUTH] Saving user to MongoDB...');
        await user.save();
        console.log('✅ [AUTH] User saved successfully:', email);

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.status(201).json({
            msg: 'User registered',
            token,
            user: { id: user._id, name, email, role }
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ msg: 'Login success', token, user: { id: user._id, name: user.name, email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/verify', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token' });

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret');
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ valid: false, error: 'Invalid token' });
    }
});

app.get('/health', (req, res) => res.json({ status: 'Auth Service OK' }));

const PORT = 3001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
