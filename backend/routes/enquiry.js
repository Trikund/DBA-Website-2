const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');

// @route   POST /api/enquiry
// @desc    Submit a new enquiry
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { fullName, phoneNumber, course, email } = req.body;

        if (!fullName || !phoneNumber || !course) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const newEnquiry = new Enquiry({
            fullName,
            phoneNumber,
            course,
            email
        });

        const savedEnquiry = await newEnquiry.save();

        if (email) {
            try {
                const sendEmail = require('../utils/sendEmail');
                await sendEmail({
                    to: email,
                    subject: 'Thank You for your Enquiry - Digital Byte Academy',
                    html: `
                        <h2>Hello ${fullName},</h2>
                        <p>Thank you for expressing your interest in our <b>${course}</b> course!</p>
                        <p>One of our academic counselors will call you shortly at <b>${phoneNumber}</b> to discuss the curriculum and admission process.</p>
                        <br>
                        <p>Best Regards,</p>
                        <p>- Digital Byte Academy Admissions Team</p>
                    `
                });
            } catch (emailErr) {
                console.error("Enquiry email failed:", emailErr);
            }
        }

        res.json({ msg: 'Enquiry submitted successfully', enquiry: savedEnquiry });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/enquiry
// @desc    Get all enquiries
// @access  Public (Should be protected in prod)
router.get('/', async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
