const express = require('express');
const router = express.Router();
const StudentProfile = require('../models/StudentProfile');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// @route   GET /api/student/profile
// @desc    Get current student's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.user.id })
            .populate('user', ['name', 'email'])
            .populate('enrolledCourses.courseId', ['title', 'instructor', 'totalFee', 'duration']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
