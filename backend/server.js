const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false, // Disabled for simplicity with external assets like Razorpay/Jitsi
    crossOriginEmbedderPolicy: false
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/certificate', require('./routes/certificate'));
app.use('/api/enquiry', require('./routes/enquiry'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/student', require('./routes/student'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/content', require('./routes/content'));

// Production Setup
if (process.env.NODE_ENV === 'production') {
    // Serve Landing Page first
    app.use(express.static(path.join(__dirname, '../landing_page')));
    
    // Serve React App (Portals)
    app.use('/app', express.static(path.join(__dirname, '../frontend/dist')));
    
    // Catch-all for React Router, but only if they went to /app or specific routes
    // To not break landing page fallback, we will serve React index.html for known React routes:
    const reactRoutes = ['/login', '/register', '/admin', '/student', '/trainer', '/payment-success'];
    app.use((req, res, next) => {
        if (reactRoutes.some(route => req.path.startsWith(route))) {
            res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
        } else {
            // Default fallback to landing page index
            res.sendFile(path.resolve(__dirname, '../landing_page', 'index.html'));
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('Digital Byte Academy Backend is Running!');
    });
}

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital_byte_academy';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });

