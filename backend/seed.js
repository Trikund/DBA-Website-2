const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/digital_byte_academy';

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@digitalbyte.com' });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        // Create new admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new User({
            name: 'Super Admin',
            email: 'admin@digitalbyte.com',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        
        const student = new User({
            name: 'Rahul Student',
            email: 'student@digitalbyte.com',
            password: hashedPassword,
            role: 'student'
        });
        
        await student.save();

        console.log('Successfully seeded admin and student users.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
};

seedAdmin();
