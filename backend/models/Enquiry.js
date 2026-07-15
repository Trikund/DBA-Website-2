const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Contacted', 'Resolved']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
