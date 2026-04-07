const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/queries
// @desc    Submit a new query
// @access  Private (Student)
router.post('/', protect, async (req, res) => {
    try {
        const { subject, description } = req.body;

        const query = await Query.create({
            student: req.user._id,
            subject,
            description
        });

        res.status(201).json({
            success: true,
            data: query
        });
    } catch (error) {
        console.error('Error submitting query:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting query'
        });
    }
});

// @route   GET /api/queries
// @desc    Get all queries (Admin) or user's queries (Student)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let filter = {};

        // Students only see their own queries
        if (req.user.role === 'student') {
            filter.student = req.user._id;
        }

        const queries = await Query.find(filter)
            .populate('student', 'name email department')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: queries.length,
            data: queries
        });
    } catch (error) {
        console.error('Error fetching queries:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching queries'
        });
    }
});

// @route   PUT /api/queries/:id
// @desc    Respond to a query
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { adminResponse } = req.body;

        let query = await Query.findById(req.params.id);

        if (!query) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        query = await Query.findByIdAndUpdate(req.params.id, {
            adminResponse,
            status: 'replied',
            repliedAt: Date.now(),
            repliedBy: req.user._id
        }, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: query
        });
    } catch (error) {
        console.error('Error updating query:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating query'
        });
    }
});

module.exports = router;
