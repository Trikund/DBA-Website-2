const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, course } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            course: course || null
        });

        await user.save();
        
        try {
            const sendEmail = require('../utils/sendEmail');
            await sendEmail({
                to: email,
                subject: 'Welcome to Digital Byte Academy!',
                html: `
                    <h2>Welcome to Digital Byte Academy, ${name}! 🚀</h2>
                    <p>We are thrilled to have you join our cutting-edge learning platform.</p>
                    <p>Your journey to mastering tech starts today.</p>
                    <br>
                    <p>Happy Learning!</p>
                    <p>- The Digital Byte Team</p>
                `
            });
        } catch (emailErr) {
            console.error("Welcome email failed to send, but registration successful:", emailErr);
        }

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        
        // Auto-Register Flow: If user does not exist, create them instantly
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = new User({
                name: email.split('@')[0], // Fallback name from email
                email,
                password: hashedPassword,
                role: 'student' // Default to student
            });
            await user.save();
            
            try {
                const sendEmail = require('../utils/sendEmail');
                await sendEmail({
                    to: email,
                    subject: 'Welcome to Digital Byte Academy!',
                    html: `
                        <h2>Welcome to Digital Byte Academy! 🚀</h2>
                        <p>An account was automatically created for you.</p>
                        <p>Your journey to mastering tech starts today.</p>
                        <br>
                        <p>Happy Learning!</p>
                        <p>- The Digital Byte Team</p>
                    `
                });
            } catch (emailErr) {
                console.error("Welcome email failed on auto-register:", emailErr);
            }
        } else {
            // User exists, verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const secret = process.env.JWT_SECRET || 'digitalbyte_secret_key';

        jwt.sign(
            payload,
            secret,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role, name: user.name });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
