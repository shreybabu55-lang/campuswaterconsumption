const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Building = require('../models/Building');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/buildings
// @desc    Get all buildings
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { type, isActive } = req.query;
        const filter = {};

        if (type) filter.type = type;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        // Student data isolation
        if (req.user.role === 'student') {
            if (!req.user.building) {
                return res.json({ success: true, count: 0, data: [] }); // If student has no hostel, they see nothing
            }
            filter._id = req.user.building;
        }

        const buildings = await Building.find(filter)
            .populate('meterCount')
            .sort({ name: 1 });

        res.json({
            success: true,
            count: buildings.length,
            data: buildings
        });
    } catch (error) {
        console.error('Get buildings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/buildings/list
// @desc    Get buildings list for registration/selection
// @access  Public
router.get('/list', async (req, res) => {
    try {
        const type = req.query.type;
        const filter = { isActive: true };
        if (type) filter.type = type;
        
        const buildings = await Building.find(filter)
            .select('name code type')
            .sort({ name: 1 });

        res.json({
            success: true,
            count: buildings.length,
            data: buildings
        });
    } catch (error) {
        console.error('Get buildings list error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/buildings/:id
// @desc    Get single building
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const building = await Building.findById(req.params.id).populate('meterCount');

        if (!building) {
            return res.status(404).json({
                success: false,
                message: 'Building not found'
            });
        }

        res.json({
            success: true,
            data: building
        });
    } catch (error) {
        console.error('Get building error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/buildings
// @desc    Create building
// @access  Private (Admin only)
router.post('/', [
    protect,
    authorize('admin'),
    body('name').trim().notEmpty().withMessage('Building name is required'),
    body('code').trim().notEmpty().withMessage('Building code is required'),
    body('type').optional().isIn(['academic', 'residential', 'administrative', 'recreational', 'other'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const building = await Building.create(req.body);

        res.status(201).json({
            success: true,
            data: building
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Building code already exists'
            });
        }
        console.error('Create building error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/buildings/:id
// @desc    Update building
// @access  Private (Admin only)
router.put('/:id', [protect, authorize('admin')], async (req, res) => {
    try {
        const building = await Building.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!building) {
            return res.status(404).json({
                success: false,
                message: 'Building not found'
            });
        }

        res.json({
            success: true,
            data: building
        });
    } catch (error) {
        console.error('Update building error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/buildings/:id
// @desc    Delete building
// @access  Private (Admin only)
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
    try {
        const building = await Building.findByIdAndDelete(req.params.id);

        if (!building) {
            return res.status(404).json({
                success: false,
                message: 'Building not found'
            });
        }

        res.json({
            success: true,
            message: 'Building deleted successfully'
        });
    } catch (error) {
        console.error('Delete building error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
