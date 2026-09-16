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
        
        // Create a document with no margins so absolute positioning doesn't trigger new pages
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        res.setHeader('Content-disposition', 'attachment; filename="certificate.pdf"');
        res.setHeader('Content-type', 'application/pdf');

        // Pipe its output to HTTP response
        doc.pipe(res);

        // Elegant Borders
        doc.lineWidth(1);
        doc.rect(20, 20, 841.89 - 40, 595.28 - 40).stroke('#d1d5db');
        doc.lineWidth(2);
        doc.rect(25, 25, 841.89 - 50, 595.28 - 50).stroke('#1e3a8a');

        const pageWidth = 841.89;
        const centerParams = { width: pageWidth, align: 'center' };
        
        // 1. Logo (Top Center)
        const logoPath = require('path').join(__dirname, '../logo.png');
        try {
            // Increased logo size for better visibility
            doc.image(logoPath, (pageWidth - 140) / 2, 30, { width: 140 });
        } catch (e) {}

        // 2. Header Text (Y = 175)
        doc.font('Helvetica').fontSize(12).fillColor('#64748b').text('DIGITAL BYTE ACADEMY PRESENTS THIS', 0, 175, { ...centerParams, characterSpacing: 2 });
        doc.font('Helvetica-Bold').fontSize(38).fillColor('#0f172a').text('CERTIFICATE OF COMPLETION', 0, 205, centerParams);

        // 3. Subtitle (Y = 270)
        doc.font('Helvetica-Oblique').fontSize(16).fillColor('#64748b').text('Proudly awarded to', 0, 270, centerParams);

        // 4. Student Name (Y = 300)
        const fontPath = require('path').join(__dirname, '../GreatVibes-Regular.ttf');
        try {
            doc.font(fontPath).fontSize(55).fillColor('#2563eb').text(studentName, 0, 300, centerParams);
        } catch(e) {
            doc.font('Helvetica-Bold').fontSize(40).fillColor('#2563eb').text(studentName.toUpperCase(), 0, 310, centerParams);
        }
        
        // 5. Underline Name (Y = 370)
        doc.moveTo(250, 370).lineTo(591, 370).stroke('#cbd5e1');

        // 6. Description (Y = 400)
        doc.font('Helvetica').fontSize(14).fillColor('#334155').text(`For successfully completing the comprehensive masterclass in`, 0, 400, centerParams);
        doc.font('Helvetica-Bold').fontSize(22).fillColor('#0f172a').text(courseName.toUpperCase(), 0, 425, centerParams);

        // 7. Footer Section
        const footerY = 530; // Push footer very close to bottom border

        // Date (Left)
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 100, footerY - 20, { width: 180, align: 'center' });
        doc.moveTo(100, footerY).lineTo(280, footerY).stroke('#cbd5e1');
        doc.font('Helvetica').fontSize(10).fillColor('#64748b').text('DATE OF ISSUE', 100, footerY + 10, { width: 180, align: 'center' });

        // Stamp (Center)
        const stampPath = require('path').join(__dirname, '../stamp.jpg');
        try {
            doc.image(stampPath, (pageWidth - 70) / 2, footerY - 50, { width: 70 });
        } catch(e) {}

        // Signature (Right)
        const sigFontPath = require('path').join(__dirname, '../GreatVibes-Regular.ttf');
        try {
            // Using GreatVibes font per user request
            doc.font(sigFontPath).fontSize(38).fillColor('#0f172a').text('Sachin Chaudhary', 550, footerY - 45, { lineBreak: false });
        } catch (e) {
            doc.font('Helvetica-Oblique').fontSize(20).fillColor('#0f172a').text('Sachin Chaudhary', 550, footerY - 25, { lineBreak: false });
        }
        doc.moveTo(560, footerY).lineTo(740, footerY).stroke('#cbd5e1');
        doc.font('Helvetica').fontSize(10).fillColor('#64748b').text('AUTHORIZED SIGNATURE', 560, footerY + 10, { width: 180, align: 'center' });

        // Finalize PDF file
        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating certificate");
    }
});

module.exports = router;
