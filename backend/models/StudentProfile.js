const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    enrolledCourses: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        progress: {
            type: Number,
            default: 0
        },
        assignmentsCompleted: {
            type: Number,
            default: 0
        },
        quizzesCompleted: {
            type: Number,
            default: 0
        }
    }],
    feeDetails: {
        totalFee: {
            type: Number,
            default: 0
        },
        amountPaid: {
            type: Number,
            default: 0
        },
        nextInstallmentDate: {
            type: Date
        }
    },
    attendance: {
        present: {
            type: Number,
            default: 0
        },
        totalClasses: {
            type: Number,
            default: 0
        }
    },
    liveClasses: [{
        title: String,
        date: Date,
        instructor: String,
        link: String
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
