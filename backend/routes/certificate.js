const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const auth = require('../middleware/auth');

// @route   GET /api/certificate/generate
// @desc    Generate PDF Certificate for student
router.get('/generate', auth, async (req, res) => {
    try {
        const StudentProfile = require('../models/StudentProfile');
        
        let studentName = req.user.name || "Student Name";
        let courseName = "Full Stack Web Development"; // Fallback

        // Fetch user info explicitly to get the real name if req.user.name is undefined
        const User = require('../models/User');
        const userRec = await User.findById(req.user.id);
        if (userRec) studentName = userRec.name || userRec.email.split('@')[0];

        // Fetch course name from profile
        const profile = await StudentProfile.findOne({ user: req.user.id }).populate('enrolledCourses.courseId');
        if (profile && profile.enrolledCourses && profile.enrolledCourses.length > 0) {
            if (profile.enrolledCourses[0].courseId) {
                courseName = profile.enrolledCourses[0].courseId.title;
            }
        }
        
        // Create a document
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
        });

        res.setHeader('Content-disposition', 'attachment; filename="certificate.pdf"');
        res.setHeader('Content-type', 'application/pdf');

        // Pipe its output somewhere, like to a file or HTTP response
        doc.pipe(res);

        // Add background or border
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#1e3a8a');
        doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke('#3b82f6');

        // Title
        doc.fontSize(40).fillColor('#1e3a8a').text('Certificate of Completion', {
            align: 'center'
        });
        doc.moveDown(1);

        // Subtitle
        doc.fontSize(20).fillColor('#4b5563').text('This is proudly presented to', {
            align: 'center'
        });
        doc.moveDown(1);

        // Student Name
        doc.fontSize(35).fillColor('#111827').text(studentName, {
            align: 'center',
            underline: true
        });
        doc.moveDown(1);

        // Description
        doc.fontSize(16).fillColor('#4b5563').text(`For successfully completing the ${courseName} masterclass at Digital Byte Academy.`, {
            align: 'center',
            width: 600
        });
        doc.moveDown(2);

        // Date and Signatures
        doc.fontSize(12).fillColor('#111827').text(`Date: ${new Date().toLocaleDateString()}`, 100, 450);
        doc.text('Instructor Signature: _________________', 500, 450);

        // Finalize PDF file
        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating certificate");
    }
});

module.exports = router;
