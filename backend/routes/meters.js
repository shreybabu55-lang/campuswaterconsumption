const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const WaterMeter = require('../models/WaterMeter');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/meters
// @desc    Get all meters
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { building, status, type } = req.query;
        const filter = {};

        if (building) filter.building = building;
        if (status) filter.status = status;
        if (type) filter.type = type;

        const meters = await WaterMeter.find(filter)
            .populate('building', 'name code type')
            .sort({ meterId: 1 });

        res.json({
            success: true,
            count: meters.length,
            data: meters
        });
    } catch (error) {
        console.error('Get meters error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/meters/:id
// @desc    Get single meter
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const meter = await WaterMeter.findById(req.params.id)
            .populate('building', 'name code type');

        if (!meter) {
            return res.status(404).json({
                success: false,
                message: 'Meter not found'
            });
        }

        res.json({
            success: true,
            data: meter
        });
    } catch (error) {
        console.error('Get meter error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/meters
// @desc    Create meter
// @access  Private (Admin only)
router.post('/', [
    protect,
    authorize('admin'),
    body('meterId').trim().notEmpty().withMessage('Meter ID is required'),
    body('building').notEmpty().withMessage('Building is required'),
    body('type').optional().isIn(['main', 'sub', 'individual'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const meter = await WaterMeter.create(req.body);
        await meter.populate('building', 'name code type');

        res.status(201).json({
            success: true,
            data: meter
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Meter ID already exists'
            });
        }
        console.error('Create meter error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/meters/:id
// @desc    Update meter
// @access  Private (Admin and Staff)
router.put('/:id', [protect, authorize('admin', 'staff')], async (req, res) => {
    try {
        const meter = await WaterMeter.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('building', 'name code type');

        if (!meter) {
            return res.status(404).json({
                success: false,
                message: 'Meter not found'
            });
        }

        res.json({
            success: true,
            data: meter
        });
    } catch (error) {
        console.error('Update meter error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/meters/:id
// @desc    Delete meter
// @access  Private (Admin only)
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
    try {
        const meter = await WaterMeter.findByIdAndDelete(req.params.id);

        if (!meter) {
            return res.status(404).json({
                success: false,
                message: 'Meter not found'
            });
        }

        res.json({
            success: true,
            message: 'Meter deleted successfully'
        });
    } catch (error) {
        console.error('Delete meter error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
