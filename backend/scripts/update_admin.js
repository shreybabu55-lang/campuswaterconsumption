const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/water_management');

        const newEmail = 'admin@bitsathy.ac.in';
        const newPassword = 'admin123';

        // Check if user exists
        let admin = await User.findOne({ role: 'admin' });

        if (admin) {
            console.log(`Updating existing admin: ${admin.email}`);
            admin.email = newEmail;
            admin.password = newPassword; // Will be hashed by pre-save middleware
            await admin.save();
            console.log('✓ Admin updated successfully');
        } else {
            console.log('No admin found, creating new one...');
            await User.create({
                name: 'Admin User',
                email: newEmail,
                password: newPassword,
                role: 'admin',
                department: 'Administration'
            });
            console.log('✓ Admin created successfully');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error updating admin:', error);
        process.exit(1);
    }
};

updateAdmin();
