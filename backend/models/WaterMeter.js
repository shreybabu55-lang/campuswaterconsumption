const mongoose = require('mongoose');

const waterMeterSchema = new mongoose.Schema({
    meterId: {
        type: String,
        required: [true, 'Meter ID is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    building: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: [true, 'Building reference is required']
    },
    location: {
        floor: Number,
        room: String,
        description: String
    },
    type: {
        type: String,
        enum: ['main', 'sub', 'individual'],
        default: 'sub'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance', 'faulty'],
        default: 'active'
    },
    installDate: {
        type: Date,
        default: Date.now
    },
    lastReading: {
        value: Number,
        timestamp: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
waterMeterSchema.index({ building: 1, status: 1 });
waterMeterSchema.index({ meterId: 1 });

module.exports = mongoose.model('WaterMeter', waterMeterSchema);
