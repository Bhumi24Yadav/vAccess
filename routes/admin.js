const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Database connection pool

// 1. GET /api/admin/bookings - Fetch all booking requests for admin review
router.get('/admin/bookings', async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = `
            SELECT b.*, v.category, v.v_type 
            FROM booking b
            JOIN venue v ON b.v_id = v.v_id
            WHERE 1=1
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
router.patch('/api/admin/bookings/:id/approve', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { adminId, remark } = req.body; // Admin ID performing the action

        // Update booking table status to 'APPROVED'
        const updateBookingQuery = `
            UPDATE booking 
            SET b_status = 'APPROVED' 
            WHERE b_id = $1 
            RETURNING *;
        `;
        
        const bookingResult = await pool.query(updateBookingQuery, [bookingId]);
        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: "Booking not found" });
        }

        // Insert record into approval table based on your ER diagram
        const insertApprovalQuery = `
            INSERT INTO approval (ap_date, remark, decision, a_id, b_id)
            VALUES (CURRENT_DATE, $1, 'Approved', $2, $3);
        `;
        
        await pool.query(insertApprovalQuery, [remark || 'Approved by admin', adminId, bookingId]);

        return res.status(200).json({
            message: "Booking approved successfully",
            bookingId: bookingId,
            status: "APPROVED"
        });

    } catch (err) {
        console.error("Error approving booking:", err.message);
        return res.status(500).json({ success: false, error: "Server error during approval" });
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