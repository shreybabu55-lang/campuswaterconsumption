const mongoose = require('mongoose');

const waterReadingSchema = new mongoose.Schema({
    meter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WaterMeter',
        required: [true, 'Meter reference is required']
    },
    reading: {
        type: Number,
        required: [true, 'Reading value is required'],
        min: 0
    },
    consumption: {
        type: Number,
        min: 0,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true
    },
    isAnomaly: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient time-based queries
waterReadingSchema.index({ meter: 1, timestamp: -1 });
waterReadingSchema.index({ timestamp: -1 });
waterReadingSchema.index({ isAnomaly: 1 });

module.exports = mongoose.model('WaterReading', waterReadingSchema);
