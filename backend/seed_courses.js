const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const StudentProfile = require('./models/StudentProfile');
const User = require('./models/User');

dotenv.config();

const courses = [
    {
        title: "MERN Stack Web Development",
        description: "Master MongoDB, Express, React, and Node.js to build full-stack applications.",
        instructor: "Rahul Sharma",
        duration: "6 Months",
        totalFee: 35000,
        category: "Web Development"
    },
    {
        title: "Python Data Science Mastery",
        description: "Learn Python, Pandas, NumPy, and Machine Learning algorithms.",
        instructor: "Sneha Gupta",
        duration: "4 Months",
        totalFee: 25000,
        category: "Data Science"
    },
    {
        title: "AI & Machine Learning Pro",
        description: "Deep Dive into Deep Learning, Neural Networks, and AI.",
        instructor: "Amit Singh",
        duration: "8 Months",
        totalFee: 45000,
        category: "Artificial Intelligence"
    }
];

async function seedDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/digital_byte_academy');
        console.log('Connected to DB');

        // Clear existing courses
        await Course.deleteMany({});
        console.log('Cleared existing courses');

        // Insert new courses
        const insertedCourses = await Course.insertMany(courses);
        console.log('Inserted courses successfully!');

        // Update all existing students with a default profile
        const students = await User.find({ role: 'student' }); // Assuming role exists or just all users for now
        
        for (let student of students) {
            let profile = await StudentProfile.findOne({ user: student._id });
            if (!profile) {
                // Assign first course randomly or just the first one
                const courseId = insertedCourses[0]._id;
                await StudentProfile.create({
                    user: student._id,
                    enrolledCourses: [{
                        courseId: courseId,
                        progress: 10,
                        assignmentsCompleted: 2,
                        quizzesCompleted: 1
                    }],
                    feeDetails: {
                        totalFee: insertedCourses[0].totalFee,
                        amountPaid: 5000,
                        nextInstallmentDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
                    },
                    attendance: {
                        present: 12,
                        totalClasses: 15
                    },
                    liveClasses: [
                        {
                            title: "React Hooks Masterclass",
                            date: new Date(new Date().setDate(new Date().getDate() + 1)), // tomorrow
                            instructor: "Rahul Sharma",
                            link: "https://zoom.us/mock-link"
                        }
                    ]
                });
                console.log(`Created profile for student: ${student.email}`);
            }
        }

        console.log('Database Seeding Completed!');
        process.exit();
    } catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
}

seedDB();
