const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables - specifying path to .env in backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const WaterMeter = require('../models/WaterMeter');
const WaterReading = require('../models/WaterReading');

const addReadings = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/water_management');
        console.log('✓ Connected to MongoDB');

        // 1. Get all meters
        const meters = await WaterMeter.find({});
        if (meters.length === 0) {
            console.error('❌ No water meters found. Please seed the database first.');
            process.exit(1);
        }
        console.log(`Found ${meters.length} water meters.`);

        // 2. Get an admin user for recordedBy
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.error('❌ No admin user found. Please seed the database first.');
            process.exit(1);
        }

        // 3. Generate 1000 readings
        console.log('Generating 1000 water readings...');
        const readings = [];
        const now = new Date();
        const countToGenerate = 1000;

        for (let i = 0; i < countToGenerate; i++) {
            // Pick a random meter
            const meter = meters[Math.floor(Math.random() * meters.length)];

            // Random date within the last 3 months
            const timestamp = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);

            // Random consumption between 50 and 500 liters
            const consumption = Math.floor(Math.random() * 450) + 50;

            // Reading value (we'll just use a large base + some random growth for simulation)
            // In a real app, this should be incremental per meter, but for bulk data, 
            // we'll just ensure it's a plausible number.
            const baseReading = meter.lastReading?.value || 10000;
            const readingValue = baseReading + Math.floor(Math.random() * 5000);

            readings.push({
                meter: meter._id,
                reading: readingValue,
                consumption: consumption,
                timestamp: timestamp,
                recordedBy: admin._id,
                isAnomaly: consumption > 400 // Arbitrary threshold for anomaly
            });
        }

        // 4. Batch insert for efficiency
        console.log('Inserting readings into database...');
        const result = await WaterReading.insertMany(readings);
        console.log(`✓ Successfully added ${result.length} water readings.`);

        // 5. Update meter's last reading for the meters affected (optional but good for consistency)
        // For simplicity in this bulk script, we'll skip detailed incremental updates 
        // as it might be complex with random timestamps.

        console.log('\n✅ Data addition completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding readings:', error);
        process.exit(1);
    }
};

addReadings();
