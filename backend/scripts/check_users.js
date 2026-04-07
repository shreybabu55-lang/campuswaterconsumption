const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the correct location
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const checkUsers = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI || 'mongodb://localhost:27017/water_management');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/water_management');
        const users = await User.find({}, { password: 0 });
        console.log('--- Current users in DB ---');
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.table(users.map(u => ({ name: u.name, email: u.email, role: u.role })));
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
};

checkUsers();
