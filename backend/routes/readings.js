const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const WaterReading = require('../models/WaterReading');
const WaterMeter = require('../models/WaterMeter');
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/readings
// @desc    Get readings with filters
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { meter, startDate, endDate, limit = 100 } = req.query;
        const filter = {};

        if (meter) filter.meter = meter;
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const readings = await WaterReading.find(filter)
            .populate('meter', 'meterId building')
            .populate({
                path: 'meter',
                populate: { path: 'building', select: 'name code' }
            })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: readings.length,
            data: readings
        });
    } catch (error) {
        console.error('Get readings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/readings/meter/:meterId
// @desc    Get readings for specific meter
// @access  Private
router.get('/meter/:meterId', protect, async (req, res) => {
    try {
        const { startDate, endDate, limit = 100 } = req.query;
        const filter = { meter: req.params.meterId };

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const readings = await WaterReading.find(filter)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: readings.length,
            data: readings
        });
    } catch (error) {
        console.error('Get meter readings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/readings
// @desc    Submit new reading
// @access  Private (Staff and Admin)
router.post('/', [
    protect,
    authorize('admin', 'staff'),
    body('meter').notEmpty().withMessage('Meter is required'),
    body('reading').isNumeric().withMessage('Reading must be a number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { meter, reading, notes } = req.body;

        // Get meter info
        const meterDoc = await WaterMeter.findById(meter);
        if (!meterDoc) {
            return res.status(404).json({
                success: false,
                message: 'Meter not found'
            });
        }

        // Calculate consumption
        let consumption = 0;
        if (meterDoc.lastReading && meterDoc.lastReading.value) {
            consumption = reading - meterDoc.lastReading.value;
        }

        // Check for anomalies (spike detection)
        let isAnomaly = false;
        if (consumption > 10000) { // Simple threshold - can be improved
            isAnomaly = true;

            // Create alert
            await Alert.create({
                type: 'high_consumption',
                severity: 'high',
                title: `High consumption detected at ${meterDoc.meterId}`,
                description: `Consumption of ${consumption} liters detected`,
                meter: meterDoc._id,
                building: meterDoc.building,
                data: { consumption, reading }
            });
        }

        // Create reading
        const newReading = await WaterReading.create({
            meter,
            reading,
            consumption,
            recordedBy: req.user._id,
            notes,
            isAnomaly
        });

        // Update meter's last reading
        meterDoc.lastReading = {
            value: reading,
            timestamp: new Date()
        };
        await meterDoc.save();

        res.status(201).json({
            success: true,
            data: newReading
        });
    } catch (error) {
        console.error('Create reading error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/readings/stats
// @desc    Get consumption statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const { startDate, endDate, building } = req.query;

        // Build match filter
        const matchFilter = {};
        if (startDate || endDate) {
            matchFilter.timestamp = {};
            if (startDate) matchFilter.timestamp.$gte = new Date(startDate);
            if (endDate) matchFilter.timestamp.$lte = new Date(endDate);
        }

        // Aggregate pipeline
        const pipeline = [
            { $match: matchFilter },
            {
                $lookup: {
                    from: 'watermeters',
                    localField: 'meter',
                    foreignField: '_id',
                    as: 'meterInfo'
                }
            },
            { $unwind: '$meterInfo' }
        ];

        // Filter by building if specified
        if (building) {
            pipeline.push({
                $match: { 'meterInfo.building': require('mongoose').Types.ObjectId(building) }
            });
        }

        pipeline.push({
            $group: {
                _id: null,
                totalConsumption: { $sum: '$consumption' },
                avgConsumption: { $avg: '$consumption' },
                maxConsumption: { $max: '$consumption' },
                readingCount: { $sum: 1 }
            }
        });

        const stats = await WaterReading.aggregate(pipeline);

        res.json({
            success: true,
            data: stats.length > 0 ? stats[0] : {
                totalConsumption: 0,
                avgConsumption: 0,
                maxConsumption: 0,
                readingCount: 0
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
