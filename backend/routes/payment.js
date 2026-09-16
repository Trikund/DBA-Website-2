const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const StudentProfile = require('../models/StudentProfile');

// Dummy Razorpay Keys for Testing
// In production, these should come from process.env
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_YourDummyKeyId';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'YourDummyKeySecret123';

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

// @route   POST /api/payment/create-order
// @desc    Create a Razorpay order for fee payment
// @access  Private (Student)
router.post('/create-order', auth, async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR

        if (!amount) {
            return res.status(400).json({ msg: 'Amount is required' });
        }

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
            currency: 'INR',
            receipt: `receipt_order_${new Date().getTime()}`
        };

        const order = await razorpayInstance.orders.create(options);
        
        res.json({
            success: true,
            order,
            key_id: RAZORPAY_KEY_ID // Send key to frontend for checkout
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during order creation');
    }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment signature and update student ledger
// @access  Private (Student)
router.post('/verify', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amountPaid } = req.body;

        // Verify Signature (or bypass if mocked for local testing without real keys)
        if (razorpay_signature !== "mocked") {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ success: false, msg: 'Invalid payment signature' });
            }
        }

        // Signature is valid. Payment successful. Update Student Ledger.
        const profile = await StudentProfile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ msg: 'Student profile not found' });
        }

        // Add paid amount to total amount paid
        if (!profile.feeDetails) {
            profile.feeDetails = { totalFee: amountPaid, amountPaid: 0 };
        }
        
        // Don't let it exceed totalFee just in case
        const remaining = profile.feeDetails.totalFee - profile.feeDetails.amountPaid;
        profile.feeDetails.amountPaid += Math.min(amountPaid, remaining);

        await profile.save();

        res.json({
            success: true,
            msg: 'Payment verified successfully',
            feeDetails: profile.feeDetails
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during payment verification');
    }
});

// @route   GET /api/payment/invoice
// @desc    Download payment invoice as PDF
// @access  Private
router.get('/invoice', auth, async (req, res) => {
    try {
        const PDFDocument = require('pdfkit');
        
        const profile = await StudentProfile.findOne({ user: req.user.id })
            .populate('user', ['name', 'email'])
            .populate('enrolledCourses.courseId', ['title']);
            
        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }

        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${profile.user.name.replace(/\s+/g, '_')}.pdf`);
        
        doc.pipe(res);

        // Header
        doc.fillColor('#2563eb')
           .fontSize(28)
           .text('DIGITAL BYTE ACADEMY', { align: 'center' });
           
        doc.moveDown();
        doc.fillColor('#4b5563')
           .fontSize(12)
           .text('123 Tech Park, Innovation Hub', { align: 'center' })
           .text('Contact: support@digitalbyte.com | +91 9876543210', { align: 'center' });
           
        doc.moveDown(2);
        
        // Invoice Title & Date
        doc.fillColor('#1f2937')
           .fontSize(20)
           .text('FEE INVOICE / RECEIPT', { align: 'center', underline: true });
           
        doc.moveDown(2);
        
        // Student Details
        doc.fontSize(12).fillColor('#374151');
        doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.text(`Receipt No: REC-${Math.floor(Math.random() * 90000) + 10000}`, { align: 'right' });
        
        doc.moveUp(2);
        doc.font('Helvetica-Bold').text('Billed To:');
        doc.font('Helvetica').text(`Student Name: ${profile.user.name}`);
        doc.text(`Email ID: ${profile.user.email}`);
        
        const courseTitle = profile.enrolledCourses[0]?.courseId?.title || 'General Enrollment';
        doc.text(`Course: ${courseTitle}`);

        doc.moveDown(3);

        // Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Description', 50, tableTop);
        doc.text('Amount', 400, tableTop, { align: 'right' });
        
        doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.moveDown(1);
        
        // Table Content
        doc.font('Helvetica');
        const totalFee = profile.feeDetails?.totalFee || 0;
        const amountPaid = profile.feeDetails?.amountPaid || 0;
        const balance = totalFee - amountPaid;
        
        let y = doc.y;
        doc.text(`Tuition Fee for ${courseTitle}`, 50, y);
        doc.text(`Rs. ${totalFee.toLocaleString()}`, 400, y, { align: 'right' });
        
        doc.moveDown(1);
        y = doc.y;
        doc.fillColor('#059669').text('Total Amount Paid', 50, y);
        doc.text(`Rs. ${amountPaid.toLocaleString()}`, 400, y, { align: 'right' });
        
        doc.moveDown(1);
        y = doc.y;
        doc.fillColor('#dc2626').text('Remaining Balance Due', 50, y);
        doc.text(`Rs. ${balance.toLocaleString()}`, 400, y, { align: 'right' });
        
        doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();
        
        doc.moveDown(4);
        doc.fillColor('#6b7280').fontSize(10)
           .text('This is a computer generated invoice and does not require a physical signature.', { align: 'center' });

        doc.end();

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during invoice generation');
    }
});

module.exports = router;
