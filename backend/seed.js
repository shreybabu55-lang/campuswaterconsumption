const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Building = require('./models/Building');
const WaterMeter = require('./models/WaterMeter');
const WaterReading = require('./models/WaterReading');
const Alert = require('./models/Alert');

// Sample data
const users = [
    {
        name: 'Admin User',
        email: 'admin@campus.edu',
        password: 'password123',
        role: 'admin',
        department: 'Administration'
    },
    {
        name: 'Staff Member',
        email: 'staff@campus.edu',
        password: 'password123',
        role: 'staff',
        department: 'Facilities'
    },
    {
        name: 'Student User',
        email: 'student@campus.edu',
        password: 'password123',
        role: 'student',
        department: 'Engineering'
    }
];

const buildings = [
    {
        name: 'Engineering Block',
        code: 'ENG',
        type: 'academic',
        floors: 4,
        capacity: 500,
        location: {
            address: 'North Campus',
            latitude: 28.7041,
            longitude: 77.1025
        },
        description: 'Main engineering building with laboratories'
    },
    {
        name: 'Science Complex',
        code: 'SCI',
        type: 'academic',
        floors: 3,
        capacity: 400,
        location: {
            address: 'Central Campus'
        },
        description: 'Science departments and research labs'
    },
    {
        name: 'Boys Hostel A',
        code: 'BHA',
        type: 'residential',
        floors: 5,
        capacity: 300,
        location: {
            address: 'East Campus'
        },
        description: 'Residential facility for male students'
    },
    {
        name: 'Girls Hostel A',
        code: 'GHA',
        type: 'residential',
        floors: 5,
        capacity: 300,
        location: {
            address: 'West Campus'
        },
        description: 'Residential facility for female students'
    },
    {
        name: 'Administrative Building',
        code: 'ADM',
        type: 'administrative',
        floors: 2,
        capacity: 100,
        location: {
            address: 'Main Entrance'
        },
        description: 'Main administrative offices'
    },
    {
        name: 'Sports Complex',
        code: 'SPT',
        type: 'recreational',
        floors: 2,
        capacity: 200,
        location: {
            address: 'South Campus'
        },
        description: 'Indoor sports facilities and gym'
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✓ Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Building.deleteMany({});
        await WaterMeter.deleteMany({});
        await WaterReading.deleteMany({});
        await Alert.deleteMany({});
        console.log('✓ Cleared existing data');

        // Create users
        console.log('Creating users...');
        const createdUsers = await User.create(users);
        console.log(`✓ Created ${createdUsers.length} users`);

        // Create buildings
        console.log('Creating buildings...');
        const createdBuildings = await Building.create(buildings);
        console.log(`✓ Created ${createdBuildings.length} buildings`);

        // Create meters for each building
        console.log('Creating water meters...');
        const meters = [];
        for (let i = 0; i < createdBuildings.length; i++) {
            const building = createdBuildings[i];
            const meterCount = Math.ceil(building.floors / 2);

            for (let j = 1; j <= meterCount; j++) {
                meters.push({
                    meterId: `${building.code}-M${j}`,
                    building: building._id,
                    location: {
                        floor: j,
                        description: `Floor ${j} main meter`
                    },
                    type: j === 1 ? 'main' : 'sub',
                    status: 'active',
                    installDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
                });
            }
        }
        const createdMeters = await WaterMeter.create(meters);
        console.log(`✓ Created ${createdMeters.length} water meters`);

        // Create readings for the past 30 days
        console.log('Creating water readings...');
        const readings = [];
        const now = new Date();

        for (const meter of createdMeters) {
            let cumulativeReading = Math.floor(Math.random() * 50000) + 10000;

            for (let day = 30; day >= 0; day--) {
                const timestamp = new Date(now);
                timestamp.setDate(timestamp.getDate() - day);
                timestamp.setHours(Math.floor(Math.random() * 24));

                const consumption = Math.floor(Math.random() * 2000) + 500;
                cumulativeReading += consumption;

                readings.push({
                    meter: meter._id,
                    reading: cumulativeReading,
                    consumption: consumption,
                    timestamp: timestamp,
                    recordedBy: createdUsers[1]._id, // Staff member
                    isAnomaly: consumption > 2000
                });
            }

            // Update meter's last reading
            await WaterMeter.findByIdAndUpdate(meter._id, {
                lastReading: {
                    value: cumulativeReading,
                    timestamp: now
                }
            });
        }
        const createdReadings = await WaterReading.create(readings);
        console.log(`✓ Created ${createdReadings.length} water readings`);

        // Create some sample alerts
        console.log('Creating alerts...');
        const alerts = [
            {
                type: 'high_consumption',
                severity: 'high',
                title: 'High water consumption detected',
                description: 'Engineering Block showing unusually high consumption',
                meter: createdMeters[0]._id,
                building: createdBuildings[0]._id,
                status: 'active',
                data: { consumption: 5000, threshold: 3000 }
            },
            {
                type: 'leak_detected',
                severity: 'critical',
                title: 'Possible leak detected',
                description: 'Continuous flow detected in Boys Hostel A',
                meter: createdMeters[4]._id,
                building: createdBuildings[2]._id,
                status: 'acknowledged',
                acknowledgedBy: createdUsers[1]._id,
                acknowledgedAt: new Date()
            },
            {
                type: 'maintenance',
                severity: 'medium',
                title: 'Scheduled maintenance due',
                description: 'Sports Complex meter needs calibration',
                meter: createdMeters[createdMeters.length - 1]._id,
                building: createdBuildings[5]._id,
                status: 'active'
            }
        ];
        const createdAlerts = await Alert.create(alerts);
        console.log(`✓ Created ${createdAlerts.length} alerts`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${createdUsers.length}`);
        console.log(`   Buildings: ${createdBuildings.length}`);
        console.log(`   Water Meters: ${createdMeters.length}`);
        console.log(`   Readings: ${createdReadings.length}`);
        console.log(`   Alerts: ${createdAlerts.length}`);
        console.log('\n👤 Login Credentials:');
        console.log('   Admin:   admin@campus.edu / password123');
        console.log('   Staff:   staff@campus.edu / password123');
        console.log('   Student: student@campus.edu / password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
