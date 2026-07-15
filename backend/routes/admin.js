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
        
        // Fetch total revenue
        const profiles = await StudentProfile.find();
        let totalRevenue = 0;
        profiles.forEach(p => {
            if (p.feeDetails && p.feeDetails.amountPaid) {
                totalRevenue += p.feeDetails.amountPaid;
            }
        });

        // Fetch courses for the admin panel
        const courses = await Course.find();
        const activeCoursesList = courses.map(c => ({
            id: c._id,
            title: c.title,
            students: profiles.filter(p => p.enrolledCourses.some(ec => ec.courseId.toString() === c._id.toString())).length,
            revenue: '₹ ' + (c.totalFee || 0).toLocaleString(), // Mock revenue per course for now
            status: 'Published'
        }));

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

module.exports = router;
