const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Allow CORS for all requests and origins
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

// Middleware to parse incoming JSON payloads from the frontend
app.use(express.json());

// Session configuration with database store or fallback
let sessionStore;
try {
    const pgSession = require('connect-pg-simple')(session);
    const pool = require('./config/db');
    sessionStore = new pgSession({ pool });
} catch (e) {
    console.warn("Using default memory session store:", e.message);
}

app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'vaccess_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

const venueRoutes = require('./routes/venue');
app.use('/api', venueRoutes);

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const notificationRoutes = require('./routes/notifications');
app.use('/api', notificationRoutes);

// Import your booking routes file
const bookingRoutes = require('./routes/bookings');
// Register the routes with a base path of /api
app.use('/api', bookingRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`vAccess backend running on port ${PORT}`);
});