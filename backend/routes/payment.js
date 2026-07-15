const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');

// @route   POST /api/payment/create-order
// @desc    Create Razorpay Order
router.post('/create-order', auth, async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY',
            key_secret: process.env.RAZORPAY_SECRET || 'YOUR_RAZORPAY_SECRET',
        });

        const options = {
            amount: req.body.amount * 100, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: "receipt_order_" + Math.random().toString(36).substring(7),
        };

        const order = await instance.orders.create(options);
        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay Payment
router.post('/verify', auth, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET || 'YOUR_RAZORPAY_SECRET')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment is verified
            // Update the user's fee status in MongoDB
            const StudentProfile = require('../models/StudentProfile');
            
            // Assume the request body includes the amount paid in rupees
            const amountPaid = req.body.amount ? Number(req.body.amount) : 0; 

            if(amountPaid > 0) {
                // Find profile and update
                const profile = await StudentProfile.findOne({ user: req.user.id });
                if (profile) {
                    profile.feeDetails.amountPaid += amountPaid;
                    // Set next installment date to 1 month from now
                    profile.feeDetails.nextInstallmentDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
                    await profile.save();
                }
            }

            return res.status(200).json({ message: "Payment verified successfully", amountPaid });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
