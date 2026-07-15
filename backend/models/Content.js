const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['Video', 'PDF', 'Link', 'Assignment'],
        required: true
    },
    url: {
        type: String, // Can be YouTube link, Drive link, or hosted file URL
        required: true
    },
    moduleName: {
        type: String,
        default: 'General'
    },
    dateUploaded: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Content', ContentSchema);
