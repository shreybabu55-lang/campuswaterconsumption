const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'C:\\Users\\shrey\\Desktop\\water\\backend\\.env' });

const User = require('C:\\Users\\shrey\\Desktop\\water\\backend\\models\\User');
const Building = require('C:\\Users\\shrey\\Desktop\\water\\backend\\models\\Building');
const WaterMeter = require('C:\\Users\\shrey\\Desktop\\water\\backend\\models\\WaterMeter');
const WaterReading = require('C:\\Users\\shrey\\Desktop\\water\\backend\\models\\WaterReading');
const Alert = require('C:\\Users\\shrey\\Desktop\\water\\backend\\models\\Alert');

async function countData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const userCount = await User.countDocuments();
        const buildingCount = await Building.countDocuments();
        const meterCount = await WaterMeter.countDocuments();
        const readingCount = await WaterReading.countDocuments();
        const alertCount = await Alert.countDocuments();
        
        const total = userCount + buildingCount + meterCount + readingCount + alertCount;
        
        console.log(`Users: ${userCount}`);
        console.log(`Buildings: ${buildingCount}`);
        console.log(`Meters: ${meterCount}`);
        console.log(`Readings: ${readingCount}`);
        console.log(`Alerts: ${alertCount}`);
        console.log(`\nTotal Data Points: ${total}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

countData();
