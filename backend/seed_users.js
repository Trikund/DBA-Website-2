const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const users = [
    // Admin
    { name: 'Super Admin', email: 'admin@digitalbyte.com', role: 'admin' },
    
    // 5 Trainers
    { name: 'Amit Kumar', email: 'amit@digitalbyte.com', role: 'trainer' },
    { name: 'Vikram Singh', email: 'vikram@digitalbyte.com', role: 'trainer' },
    { name: 'Neha Reddy', email: 'neha@digitalbyte.com', role: 'trainer' },
    { name: 'Ravi Desai', email: 'ravi@digitalbyte.com', role: 'trainer' },
    { name: 'Kavita Iyer', email: 'kavita@digitalbyte.com', role: 'trainer' },
    
    // 25 Students
    { name: 'Rahul Sharma', email: 'rahul.s@example.com', role: 'student' },
    { name: 'Priya Patel', email: 'priya.p@example.com', role: 'student' },
    { name: 'Sneha Gupta', email: 'sneha.g@example.com', role: 'student' },
    { name: 'Aarav Mehta', email: 'aarav.m@example.com', role: 'student' },
    { name: 'Rohan Verma', email: 'rohan.v@example.com', role: 'student' },
    { name: 'Ananya Joshi', email: 'ananya.j@example.com', role: 'student' },
    { name: 'Arjun Das', email: 'arjun.d@example.com', role: 'student' },
    { name: 'Pooja Tiwari', email: 'pooja.t@example.com', role: 'student' },
    { name: 'Karan Malhotra', email: 'karan.m@example.com', role: 'student' },
    { name: 'Divya Nair', email: 'divya.n@example.com', role: 'student' },
    { name: 'Siddharth Rao', email: 'siddharth.r@example.com', role: 'student' },
    { name: 'Ishita Kapoor', email: 'ishita.k@example.com', role: 'student' },
    { name: 'Gaurav Bhatia', email: 'gaurav.b@example.com', role: 'student' },
    { name: 'Megha Chawla', email: 'megha.c@example.com', role: 'student' },
    { name: 'Saurabh Jha', email: 'saurabh.j@example.com', role: 'student' },
    { name: 'Riya Singhal', email: 'riya.s@example.com', role: 'student' },
    { name: 'Yash Agarwal', email: 'yash.a@example.com', role: 'student' },
    { name: 'Swati Bansal', email: 'swati.b@example.com', role: 'student' },
    { name: 'Nikhil Saxena', email: 'nikhil.s@example.com', role: 'student' },
    { name: 'Tanya Ahuja', email: 'tanya.a@example.com', role: 'student' },
    { name: 'Rishabh Jain', email: 'rishabh.j@example.com', role: 'student' },
    { name: 'Akansha Mishra', email: 'akansha.m@example.com', role: 'student' },
    { name: 'Aditya Mathur', email: 'aditya.m@example.com', role: 'student' },
    { name: 'Shreya Pandey', email: 'shreya.p@example.com', role: 'student' },
    { name: 'Kabir Khurana', email: 'kabir.k@example.com', role: 'student' }
];

async function seedDB() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital_byte_academy';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        const salt = await bcrypt.genSalt(10);
        
        for (let user of users) {
            // Password for everyone is 'password123', except admin who is 'admin123'
            const pwd = user.role === 'admin' ? 'admin123' : 'password123';
            const hashedPassword = await bcrypt.hash(pwd, salt);
            
            const newUser = new User({
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role
            });
            await newUser.save();
        }

        console.log(`Successfully seeded ${users.length} users into the database.`);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding DB:', error);
        mongoose.connection.close();
    }
}

seedDB();
