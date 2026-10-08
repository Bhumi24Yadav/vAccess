const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/bookings', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const { 
            v_id, 
            rno, 
            fno, 
            purpose, 
            noofmembers, 
            eventdate, 
            starttime, 
            endtime 
        } = req.body;

        const conflictQuery = `
            SELECT t.* 
            FROM timeslot t
            JOIN booking b ON t.b_id = b.b_id
            WHERE b.v_id = $1 
              AND t.eventdate = $2 
              AND b.b_status != 'REJECTED'
              AND (t.starttime < $4 AND t.endtime > $3)
        `;

        const conflictCheck = await client.query(conflictQuery, [v_id, eventdate, starttime, endtime]);

        if (conflictCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                error: "Conflict detected: This venue is already booked or has a pending request for this time slot." 
            });
        }

        const insertBookingQuery = `
            INSERT INTO booking (b_date, b_status, purpose, noofmembers, eventdate, rno, fno, v_id)
            VALUES (CURRENT_DATE, 'PENDING', $1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const bookingValues = [purpose, noofmembers || 1, eventdate, rno || null, fno || null, v_id];
        const bookingResult = await client.query(insertBookingQuery, bookingValues);
        const newBooking = bookingResult.rows[0];

        const insertTimeslotQuery = `
            INSERT INTO timeslot (b_id, eventdate, starttime, endtime)
            VALUES ($1, $2, $3, $4);
        `;

        await client.query(insertTimeslotQuery, [newBooking.b_id, eventdate, starttime, endtime]);

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: "Booking request submitted successfully and is pending approval.",
            booking: newBooking
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error in POST /api/bookings:", err.message);
        return res.status(500).json({ success: false, error: "Server error while creating booking" });
    } finally {
        client.release();
    }
});

module.exports = router;