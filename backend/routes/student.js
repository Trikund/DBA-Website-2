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
        let profile = await StudentProfile.findOne({ user: req.user.id })
            .populate('user', ['name', 'email'])
            .populate('enrolledCourses.courseId', ['title', 'instructor', 'totalFee', 'duration']);

        if (!profile) {
            // For Demo Purposes: Auto-generate a beautiful, detailed mock profile for new users
            // So that the dashboard looks rich and full of data instantly.
            
            // Try to find the Full Stack course to link, or any course
            const defaultCourse = await Course.findOne({ title: /Full Stack/i }) || await Course.findOne();
            
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            
            const mockProfile = new StudentProfile({
                user: req.user.id,
                enrolledCourses: defaultCourse ? [{
                    courseId: defaultCourse._id,
                    progress: 0, // Fresh user, 0% progress
                    assignmentsCompleted: 0,
                    quizzesCompleted: 0
                }] : [],
                feeDetails: {
                    totalFee: defaultCourse ? defaultCourse.totalFee : 45000,
                    amountPaid: 0,
                    nextInstallmentDate: nextMonth
                },
                attendance: {
                    present: 0, // Fresh user, 0 attendance
                    totalClasses: 0
                },
                liveClasses: [
                    {
                        title: "Orientation Session",
                        date: new Date(new Date().setHours(19, 0, 0, 0)), // Today 7 PM
                        instructor: "System Admin",
                        link: "https://zoom.us/orientation"
                    }
                ]
            });
            
            await mockProfile.save();
            
            // Re-fetch to get populated fields
            profile = await StudentProfile.findOne({ user: req.user.id })
                .populate('user', ['name', 'email'])
                .populate('enrolledCourses.courseId', ['title', 'instructor', 'totalFee', 'duration']);
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
