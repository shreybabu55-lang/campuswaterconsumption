const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['high_consumption', 'leak_detected', 'meter_offline', 'anomaly', 'maintenance', 'other'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    title: {
        type: String,
        required: [true, 'Alert title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    meter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WaterMeter'
    },
    building: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building'
    },
    status: {
        type: String,
        enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
        default: 'active'
    },
    acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    acknowledgedAt: {
        type: Date
    },
    resolvedAt: {
        type: Date
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for efficient querying
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ meter: 1 });

module.exports = mongoose.model('Alert', alertSchema);
