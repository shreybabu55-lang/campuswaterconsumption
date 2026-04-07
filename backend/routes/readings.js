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
        const { meter, startDate, endDate, page = 1, limit = 25 } = req.query;
        const filter = {};

        if (meter) filter.meter = meter;
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        // Student data isolation
        if (req.user.role === 'student') {
            if (!req.user.building) {
                return res.json({ success: true, count: 0, total: 0, page: 1, pages: 0, data: [] });
            }
            
            const studentMeters = await WaterMeter.find({ building: req.user.building }).select('_id');
            const meterIds = studentMeters.map(m => m._id);
            if (filter.meter) {
                if (!meterIds.some(id => id.toString() === filter.meter.toString())) {
                    return res.status(403).json({ success: false, message: 'Not authorized to access this meter' });
                }
            } else {
                filter.meter = { $in: meterIds };
            }
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await WaterReading.countDocuments(filter);

        const readings = await WaterReading.find(filter)
            .populate('meter', 'meterId building')
            .populate({
                path: 'meter',
                populate: { path: 'building', select: 'name code' }
            })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            count: readings.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
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

// @route   GET /api/readings/weekly
// @desc    Get weekly consumption pattern
// @access  Private
router.get('/weekly', protect, async (req, res) => {
    try {
        let { building } = req.query;

        // Student data isolation
        if (req.user.role === 'student') {
            if (!req.user.building) {
                return res.json({ success: true, data: [] });
            }
            building = req.user.building.toString();
        }

        // Get past 7 days range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const matchFilter = {
            timestamp: { $gte: startDate, $lte: endDate }
        };

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

        if (building) {
            const mongoose = require('mongoose');
            pipeline.push({
                $match: { 'meterInfo.building': new mongoose.Types.ObjectId(building) }
            });
        }

        pipeline.push({
            $group: {
                _id: { 
                    year: { $year: '$timestamp' }, 
                    month: { $month: '$timestamp' }, 
                    day: { $dayOfMonth: '$timestamp' },
                    dayOfWeek: { $dayOfWeek: '$timestamp' }
                },
                consumption: { $sum: '$consumption' }
            }
        });

        pipeline.push({ $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } });

        const rawStats = await WaterReading.aggregate(pipeline);

        // Map to 7 days, ensuring missing days are 0
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result = [];
        
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const targetYear = d.getFullYear();
            const targetMonth = d.getMonth() + 1;
            const targetDay = d.getDate();
            const targetDayOfWeek = d.getDay();

            // mongoose match
            const match = rawStats.find(s => 
                s._id.year === targetYear && 
                s._id.month === targetMonth && 
                s._id.day === targetDay
            );

            result.push({
                time: days[targetDayOfWeek],
                consumption: match ? match.consumption : 0
            });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Get weekly stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/readings/stats
// @desc    Get consumption statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        let { startDate, endDate, building } = req.query;

        // Student data isolation
        if (req.user.role === 'student') {
            if (!req.user.building) {
                return res.json({
                    success: true,
                    data: {
                        totalConsumption: 0,
                        avgConsumption: 0,
                        maxConsumption: 0,
                        readingCount: 0
                    }
                });
            }
            building = req.user.building.toString();
        }

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
            const mongoose = require('mongoose');
            pipeline.push({
                $match: { 'meterInfo.building': new mongoose.Types.ObjectId(building) }
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
