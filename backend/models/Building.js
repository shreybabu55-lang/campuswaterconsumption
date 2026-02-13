const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Building name is required'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Building code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['academic', 'residential', 'administrative', 'recreational', 'other'],
        default: 'other'
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    floors: {
        type: Number,
        min: 1,
        default: 1
    },
    capacity: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for meter count
buildingSchema.virtual('meterCount', {
    ref: 'WaterMeter',
    localField: '_id',
    foreignField: 'building',
    count: true
});

// Ensure virtuals are included in JSON
buildingSchema.set('toJSON', { virtuals: true });
buildingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Building', buildingSchema);
