const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get all admin dashboard stats
// @access  Private (Should add Admin role check in prod)
router.get('/dashboard', auth, async (req, res) => {
    try {
        // Fetch all recent users
        const users = await User.find().sort({ date: -1 }).select('-password');
        
        // Fetch total revenue dynamically based on student count (Demo logic)
        // Assuming average course fee is ₹25,000 per student
        const profiles = await StudentProfile.find();
        const studentsCount = users.filter(u => u.role === 'student').length;
        const totalRevenue = studentsCount * 25000;

        // Fetch courses for the admin panel
        const courses = await Course.find();
        const activeCoursesList = courses.map(c => {
            const courseStudents = profiles.filter(p => p.enrolledCourses.some(ec => ec.courseId.toString() === c._id.toString())).length;
            return {
                id: c._id,
                title: c.title,
                description: c.description,
                instructor: c.instructor,
                duration: c.duration,
                totalFee: c.totalFee,
                category: c.category,
                students: courseStudents,
                revenue: '₹ ' + ((c.totalFee || 0) * courseStudents).toLocaleString(),
                status: 'Published',
                createdAt: c.createdAt
            };
        });

        res.json({
            recentUsers: users,
            totalRevenue,
            activeCoursesList
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private
router.delete('/users/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change a user's role
// @access  Private
router.put('/users/:id/role', auth, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['student', 'trainer', 'admin'].includes(role)) {
            return res.status(400).json({ msg: 'Invalid role' });
        }
        
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/users/:id/suspend
// @desc    Toggle user suspension status
// @access  Private
router.put('/users/:id/suspend', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.isSuspended = !user.isSuspended;
        await user.save();
        
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/admin/courses
// @desc    Create a new course
// @access  Private
router.post('/courses', auth, async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/courses/:id
// @desc    Update a course
// @access  Private
router.put('/courses/:id', auth, async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
