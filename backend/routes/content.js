const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Content = require('../models/Content');

// @route   POST /api/content
// @desc    Add new course content (Trainer/Admin)
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to add content' });
        }

        const { courseId, title, description, type, url, moduleName } = req.body;

        const newContent = new Content({
            courseId,
            uploadedBy: req.user.id,
            title,
            description,
            type,
            url,
            moduleName
        });

        const content = await newContent.save();
        res.json(content);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/content/course/:courseId
// @desc    Get all content for a specific course
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
    try {
        const contents = await Content.find({ courseId: req.params.courseId }).sort({ dateUploaded: -1 });
        res.json(contents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const content = await Content.findById(req.params.id);
        if (!content) return res.status(404).json({ msg: 'Content not found' });

        await content.deleteOne();
        res.json({ msg: 'Content removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Content not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
