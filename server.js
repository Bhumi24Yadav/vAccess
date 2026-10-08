const express = require('express');
const cors = require('cors');
const app = express();

// Middleware to parse incoming JSON payloads from the frontend
app.use(cors());
app.use(express.json());
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
app.use('/api', adminRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`vAccess backend running on port ${PORT}`);
});