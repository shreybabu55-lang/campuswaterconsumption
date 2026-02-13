const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/alerts
// @desc    Get all alerts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status, severity, type } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (severity) filter.severity = severity;
        if (type) filter.type = type;

        const alerts = await Alert.find(filter)
            .populate('meter', 'meterId')
            .populate('building', 'name code')
            .populate('acknowledgedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/alerts/:id
// @desc    Get single alert
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id)
            .populate('meter', 'meterId')
            .populate('building', 'name code')
            .populate('acknowledgedBy', 'name email');

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        console.error('Get alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/alerts
// @desc    Create alert
// @access  Private (Admin and Staff)
router.post('/', [
    protect,
    authorize('admin', 'staff'),
    body('type').isIn(['high_consumption', 'leak_detected', 'meter_offline', 'anomaly', 'maintenance', 'other']),
    body('title').trim().notEmpty().withMessage('Title is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const alert = await Alert.create(req.body);
        await alert.populate('meter', 'meterId');
        await alert.populate('building', 'name code');

        res.status(201).json({
            success: true,
            data: alert
        });
    } catch (error) {
        console.error('Create alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/alerts/:id
// @desc    Update alert status
// @access  Private (Admin and Staff)
router.put('/:id', [protect, authorize('admin', 'staff')], async (req, res) => {
    try {
        const { status } = req.body;
        const updateData = { ...req.body };

        // Set timestamps based on status
        if (status === 'acknowledged' && !updateData.acknowledgedAt) {
            updateData.acknowledgedBy = req.user._id;
            updateData.acknowledgedAt = new Date();
        }
        if (status === 'resolved' && !updateData.resolvedAt) {
            updateData.resolvedAt = new Date();
        }

        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('meter', 'meterId')
            .populate('building', 'name code')
            .populate('acknowledgedBy', 'name email');

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        console.error('Update alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete alert
// @access  Private (Admin only)
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({
            success: true,
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        console.error('Delete alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
