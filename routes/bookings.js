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

        // 1. Check for time slot conflicts using Title-Case status
        const conflictQuery = `
            SELECT t.* 
            FROM timeslot t
            JOIN booking b ON t.b_id = b.b_id
            WHERE b.v_id = $1 
              AND t.eventdate = $2 
              AND b.b_status != 'Rejected'
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

        // 2. Safely generate the next sequential b_id
        const bookingIdResult = await client.query('SELECT COALESCE(MAX(b_id), 0) + 1 AS next_id FROM booking');
        const nextBId = bookingIdResult.rows[0].next_id;

        // 3. Insert booking with explicit b_id and Title-Case status
        const insertBookingQuery = `
            INSERT INTO booking (b_id, b_date, b_status, purpose, noofmembers, eventdate, rno, fno, v_id)
            VALUES ($1, CURRENT_DATE, 'Pending', $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const bookingValues = [nextBId, purpose, noofmembers || 1, eventdate, rno || null, fno || null, v_id];
        const bookingResult = await client.query(insertBookingQuery, bookingValues);
        const newBooking = bookingResult.rows[0];

        // 4. Safely generate the next sequential slot_id
        const slotIdResult = await client.query('SELECT COALESCE(MAX(slot_id), 0) + 1 AS next_id FROM timeslot');
        const nextSlotId = slotIdResult.rows[0].next_id;

        // 5. Insert timeslot with explicit slot_id and b_id
        const insertTimeslotQuery = `
            INSERT INTO timeslot (slot_id, b_id, eventdate, starttime, endtime)
            VALUES ($1, $2, $3, $4, $5);
        `;

        await client.query(insertTimeslotQuery, [nextSlotId, nextBId, eventdate, starttime, endtime]);

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