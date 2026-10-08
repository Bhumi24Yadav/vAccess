const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Database connection pool

// 1. GET /api/admin/bookings - Fetch all booking requests for admin review
router.get('/admin/bookings', async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = `
            SELECT b.*, v.category, v.v_type , v.v_name,s.s_name AS student_name,
                s.s_email AS student_email,
                f.f_name AS faculty_name,
                f.f_email AS faculty_email,
                t.starttime,
                t.endtime
            FROM booking b
            JOIN venue v ON b.v_id = v.v_id
            JOIN student s ON b.rno = s.s_id
            JOIN faculty f ON b.fno = f.f_id
            JOIN timeslot t ON b.b_id = t.b_id
            ORDER BY b.b_date DESC
        `;
        let queryParams = [];

        if (status) {
            queryParams.push(status);
            query += ` AND b.b_status = $${queryParams.length}`;
        }
        if (date) {
            queryParams.push(date);
            query += ` AND b.eventdate = $${queryParams.length}`;
        }

        const result = await pool.query(query, queryParams);
        return res.status(200).json(result.rows);

    } catch (err) {
        console.error("Error fetching admin bookings:", err.message);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

// 2. PATCH /api/admin/bookings/:id/approve - Approve a pending booking
router.post('/admin/bookings/:id/approve', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const bookingId = req.params.id;
        const { a_id } = req.body; // Admin ID performing the action

        // 1. Verify booking is Pending
        const bookingCheck = await client.query(
            'SELECT * FROM booking WHERE b_id = $1 FOR UPDATE', 
            [bookingId]
        );
        if (bookingCheck.rows.length === 0 || bookingCheck.rows[0].b_status !== 'Pending') {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: "Valid pending booking not found." });
        }

        // 2. Generate next approval ID safely
        const idResult = await client.query('SELECT COALESCE(MAX(ap_id), 0) + 1 AS next_id FROM approval');
        const nextApId = idResult.rows[0].next_id;

        // 3. Update booking status
        await client.query('UPDATE booking SET b_status = $1 WHERE b_id = $2', ['Approved', bookingId]);

        // 4. Insert approval record
        await client.query(
            'INSERT INTO approval (ap_id, ap_date, b_id, a_id) VALUES ($1, CURRENT_DATE, $2, $3)',
            [nextApId, bookingId, a_id]
        );

        await client.query('COMMIT');
        return res.status(200).json({ success: true, message: "Booking approved successfully." });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error approving booking:", err.message);
        return res.status(500).json({ success: false, error: "Server error during approval." });
    } finally {
        client.release();
    }
});

// 3. PATCH /api/admin/bookings/:id/reject - Reject a pending booking
router.patch('/api/admin/bookings/:id/reject', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { adminId, remark } = req.body;

        // Update booking table status to 'REJECTED'
        const updateBookingQuery = `
            UPDATE booking 
            SET b_status = 'REJECTED' 
            WHERE b_id = $1 
            RETURNING *;
        `;
        
        await pool.query(updateBookingQuery, [bookingId]);

        // Insert record into approval table tracking the rejection
        const insertApprovalQuery = `
            INSERT INTO approval (ap_date, remark, decision, a_id, b_id)
            VALUES (CURRENT_DATE, $1, 'Rejected', $2, $3);
        `;
        
        await pool.query(insertApprovalQuery, [remark || 'Rejected by admin', adminId, bookingId]);

        return res.status(200).json({
            message: "Booking rejected successfully",
            bookingId: bookingId,
            status: "REJECTED"
        });

    } catch (err) {
        console.error("Error rejecting booking:", err.message);
        return res.status(500).json({ success: false, error: "Server error during rejection" });
    }
});

module.exports = router;