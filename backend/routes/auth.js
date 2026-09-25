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
        
        if (!user) { return res.status(400).json({ msg: 'Invalid Credentials' }); } else {
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

// @route   GET /api/auth/seed-demo-data
// @desc    Seed 25 Indian Students and 5 Trainers
router.get('/seed-demo-data', async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        // Just to prevent abuse, though it's a demo
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        
        const trainers = [
            { name: 'Ravi Kumar', email: 'ravi@digitalbyte.com', password: hashedPassword, role: 'trainer', course: 'MERN Full Stack' },
            { name: 'Priya Sharma', email: 'priya@digitalbyte.com', password: hashedPassword, role: 'trainer', course: 'Data Science' },
            { name: 'Amit Patel', email: 'amit@digitalbyte.com', password: hashedPassword, role: 'trainer', course: 'Cyber Security' },
            { name: 'Sneha Gupta', email: 'sneha@digitalbyte.com', password: hashedPassword, role: 'trainer', course: 'Cloud Computing' },
            { name: 'Vikram Singh', email: 'vikram@digitalbyte.com', password: hashedPassword, role: 'trainer', course: 'AI ML' }
        ];
        
        const students = [
            'Rahul Verma', 'Neha Reddy', 'Karan Desai', 'Pooja Joshi', 'Aditya Nair',
            'Ananya Iyer', 'Siddharth Rao', 'Kavya Pillai', 'Rohan Mehta', 'Ishita Agarwal',
            'Varun Chauhan', 'Aarohi Sen', 'Tanya Menon', 'Pranav Kadam', 'Shruti Bansal',
            'Yash Bhatia', 'Riya Kapoor', 'Dhruv Malhotra', 'Kriti Jain', 'Arjun Saxena',
            'Megha Tiwari', 'Nikhil Pandey', 'Anjali Yadav', 'Devendra Rajput', 'Sanya Thakur'
        ];
        
        const studentDocs = students.map((name, i) => ({
            name: name,
            email: 'student' + (i+1) + '@gmail.com',
            password: hashedPassword,
            role: 'student',
            course: ['MERN Full Stack', 'Data Science', 'Cyber Security', 'Cloud Computing', 'AI ML'][i % 5]
        }));
        
        // Insert all
        for (let t of trainers) {
            await User.findOneAndUpdate({ email: t.email }, t, { upsert: true });
        }
        for (let s of studentDocs) {
            await User.findOneAndUpdate({ email: s.email }, s, { upsert: true });
        }
        
        res.json({ msg: 'Seeded 25 Students and 5 Trainers successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/fix-admin', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('shivam_boss_123', salt);
        await User.findOneAndUpdate(
            { email: 'superadmin@gmail.com' },
            { 
                name: 'Shivam Boss',
                email: 'superadmin@gmail.com',
                password: hashedPassword,
                role: 'admin'
            },
            { upsert: true }
        );
        res.json({ msg: 'Admin fixed!' });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});
router.get('/seed-courses', async (req, res) => {
    try {
        const Course = require('../models/Course');
        
        const courses = [
            {
                title: 'MERN Full Stack Web Development',
                description: 'Master MongoDB, Express.js, React, and Node.js. Build production-ready web applications from scratch.',
                instructor: 'Ravi Kumar',
                duration: '6 Months',
                totalFee: 25000,
                category: 'Web Development'
            },
            {
                title: 'Python for Data Science & AI',
                description: 'Learn Python programming, Data Structures, Pandas, NumPy, and Machine Learning algorithms.',
                instructor: 'Priya Sharma',
                duration: '4 Months',
                totalFee: 20000,
                category: 'Data Science'
            },
            {
                title: 'Advanced Generative AI',
                description: 'Dive deep into LLMs, LangChain, OpenAI APIs, and build real-world Gen-AI tools.',
                instructor: 'Amit Patel',
                duration: '3 Months',
                totalFee: 30000,
                category: 'Artificial Intelligence'
            },
            {
                title: 'Cyber Security & Ethical Hacking',
                description: 'Learn network security, cryptography, vulnerability assessment, and penetration testing.',
                instructor: 'Neha Singh',
                duration: '5 Months',
                totalFee: 28000,
                category: 'Security'
            }
        ];
        
        for (const course of courses) {
            await Course.findOneAndUpdate(
                { title: course.title },
                course,
                { upsert: true }
            );
        }
        
        res.json({ msg: '4 Courses added successfully!' });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});
router.get('/remove-duplicate-admin', async (req, res) => {
    try {
        const User = require('../models/User');
        await User.deleteOne({ email: 'admin@digitalbyte.com' });
        res.json({ msg: 'Duplicate admin deleted successfully!' });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});
router.get('/rename-admin', async (req, res) => {
    try {
        const User = require('../models/User');
        await User.findOneAndUpdate(
            { email: 'superadmin@gmail.com' },
            { name: 'Super Admin' }
        );
        res.json({ msg: 'Admin renamed successfully!' });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});
router.get('/update-students', async (req, res) => {
    try {
        const User = require('../models/User');
        const students = [
            'Rahul Verma', 'Neha Reddy', 'Karan Desai', 'Pooja Joshi', 'Aditya Nair',
            'Ananya Iyer', 'Siddharth Rao', 'Kavya Pillai', 'Rohan Mehta', 'Ishita Agarwal',
            'Varun Chauhan', 'Aarohi Sen', 'Tanya Menon', 'Pranav Kadam', 'Shruti Bansal',
            'Yash Bhatia', 'Riya Kapoor', 'Dhruv Malhotra', 'Kriti Jain', 'Arjun Saxena',
            'Megha Tiwari', 'Nikhil Pandey', 'Anjali Yadav', 'Devendra Rajput', 'Sanya Thakur'
        ];
        
        const list = [];
        for (const name of students) {
            const parts = name.toLowerCase().split(' ');
            const email = parts.join('.') + '@digitalbyte.com';
            const plainPass = parts[0] + '@123';
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(plainPass, salt);
            
            await User.findOneAndUpdate(
                { name: name },
                { email: email, password: hashedPassword },
                { new: true }
            );
            
            list.push({ Name: name, Email: email, Password: plainPass });
        }
        
        res.json({ msg: 'Success', list });
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});
module.exports = router;







