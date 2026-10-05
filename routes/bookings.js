const express = require('express');
const router = express.Router();
// const pool = require('../config/db'); // Database connection pool from your friend
// const authenticateToken = require('../middleware/auth'); // Middleware to get logged-in user
const pool = require('../config/db'); // Import your live database pool
// POST /api/bookings - Submit a new booking request
// POST /api/bookings - Create a new booking request with live conflict checking
router.post('/bookings', async (req, res) => {
    const { venue_id, user_id, booking_date, start_time, end_time, purpose } = req.body;

    try {
        // Step 1: Check if there's already an active/pending booking overlapping this time slot
        const conflictQuery = `
            SELECT * FROM BOOKING 
            WHERE V_ID = $1 
              AND booking_date = $2 
              AND booking_status != 'REJECTED'
              AND (start_time < $4 AND end_time > $3)
        `;

        const conflictCheck = await pool.query(conflictQuery, [venue_id, booking_date, start_time, end_time]);

        if (conflictCheck.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: "Conflict detected: This venue is already booked or has a pending request for this time slot." 
            });
        }

        // Step 2: Insert the new booking into the cloud database with a 'PENDING' status
        const insertQuery = `
            INSERT INTO BOOKING (V_ID, user_id, booking_date, start_time, end_time, purpose, booking_status)
            VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
            RETURNING *;
        `;

        const newBooking = await pool.query(insertQuery, [venue_id, user_id, booking_date, start_time, end_time, purpose]);

        // Step 3: Send the newly created booking back to the frontend
        return res.status(201).json({
            success: true,
            message: "Booking request submitted successfully and is pending approval.",
            booking: newBooking.rows[0]
        });

    } catch (err) {
        console.error("Error in POST /api/bookings:", err.message);
        return res.status(500).json({ success: false, error: "Server error while creating booking" });
    }
});

module.exports = router;