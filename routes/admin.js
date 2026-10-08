const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Database connection pool

// 1. GET /api/admin/bookings - Fetch all booking requests for admin review
// 1. GET /api/admin/bookings - Fetch all booking requests for admin review
router.get('/admin/bookings', async (req, res) => {
    try {
        const { status, date } = req.query;

        let query = `
            SELECT 
                b.*,
                v.category,
                v.v_type,
                s.s_name AS student_name,
                s.s_email AS student_email,
                f.f_name AS faculty_name,
                f.f_email AS faculty_email,
                t.starttime,
                t.endtime
            FROM booking b

            LEFT JOIN venue v 
                ON b.v_id = v.v_id

            LEFT JOIN student s 
                ON b.rno = s.rno

            LEFT JOIN faculty f 
                ON b.fno = f.fno

            LEFT JOIN timeslot t 
                ON b.b_id = t.b_id
        `;

        let queryParams = [];
        let conditions = [];

        if (status) {
            queryParams.push(status);
            conditions.push(`b.b_status = $${queryParams.length}`);
        }

        if (date) {
            queryParams.push(date);
            conditions.push(`b.eventdate = $${queryParams.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY b.b_date DESC`;

        const result = await pool.query(query, queryParams);

        return res.status(200).json(result.rows);

    } catch (err) {
        console.error("Error fetching admin bookings:", err.message);
        return res.status(500).json({
            success: false,
            error: "Server error"
        });
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
            'INSERT INTO approval (ap_id, ap_date, decision, b_id, a_id) VALUES ($1, CURRENT_DATE, $2, $3, $4)',
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
// 3. PATCH /api/admin/bookings/:id/reject - Reject a pending booking
router.patch('/admin/bookings/:id/reject', async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const bookingId = req.params.id;
        const { a_id, remark } = req.body;

        // 1. Check whether booking exists and is pending
        const bookingCheck = await client.query(
            `SELECT * 
             FROM booking 
             WHERE b_id = $1 
             FOR UPDATE`,
            [bookingId]
        );

        if (
            bookingCheck.rows.length === 0 ||
            bookingCheck.rows[0].b_status !== 'Pending'
        ) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                error: "Valid pending booking not found."
            });
        }

        // 2. Generate next approval ID
        const idResult = await client.query(
            `SELECT COALESCE(MAX(ap_id), 0) + 1 AS next_id 
             FROM approval`
        );

        const nextApId = idResult.rows[0].next_id;

        // 3. Update booking status
        await client.query(
            `UPDATE booking
             SET b_status = 'Rejected'
             WHERE b_id = $1`,
            [bookingId]
        );

        // 4. Insert rejection record into approval
        await client.query(
            `INSERT INTO approval
                (ap_id, ap_date, remark, decision, a_id, b_id)
             VALUES
                ($1, CURRENT_DATE, $2, $3, $4, $5)`,
            [
                nextApId,
                remark || 'Rejected by admin',
                'Rejected',
                a_id,
                bookingId
            ]
        );

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: "Booking rejected successfully.",
            bookingId: bookingId,
            status: "Rejected"
        });

    } catch (err) {

        await client.query('ROLLBACK');

        console.error("Error rejecting booking:", err.message);

        return res.status(500).json({
            success: false,
            error: "Server error during rejection."
        });

    } finally {
        client.release();
    }
});

module.exports = router;