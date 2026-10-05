const express = require('express');
const router = express.Router();
// const pool = require('../config/db'); // Database connection pool

// 1. GET /api/admin/bookings - Fetch all booking requests for admin review
router.get('/admin/bookings', async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = `
            SELECT b.*, v.Category, v.V_type 
            FROM BOOKING b
            JOIN VENUE v ON b.V_ID = v.V_ID
            WHERE 1=1
        `;
        let queryParams = [];

        if (status) {
            queryParams.push(status);
            query += ` AND b.B_Status = $${queryParams.length}`;
        }
        if (date) {
            queryParams.push(date);
            query += ` AND b.EventDate = $${queryParams.length}`;
        }

        // const result = await pool.query(query, queryParams);
        // return res.status(200).json(result.rows);

        // Placeholder mock response
        return res.status(200).json([
            { B_ID: 42, B_Status: "PENDING", Purpose: "Department Seminar", EventDate: "2026-10-05", V_ID: 1 }
        ]);
    } catch (err) {
        console.error("Error fetching admin bookings:", err.message);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

// 2. PATCH /api/admin/bookings/:id/approve - Approve a pending booking
router.patch('/admin/bookings/:id/approve', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { adminId, remark } = req.body; // Admin ID performing the action

        // Update BOOKING table status to 'APPROVED'
        const updateBookingQuery = `
            UPDATE BOOKING 
            SET B_Status = 'APPROVED' 
            WHERE B_ID = $1 
            RETURNING *;
        `;
        // const bookingResult = await pool.query(updateBookingQuery, [bookingId]);
        // if (bookingResult.rows.length === 0) {
        //     return res.status(404).json({ success: false, error: "Booking not found" });
        // }

        // Insert record into APPROVAL table based on your ER diagram
        const insertApprovalQuery = `
            INSERT INTO APPROVAL (Ap_Date, Remark, Decision, A_ID, B_ID)
            VALUES (CURRENT_DATE, $1, 'Approved', $2, $3);
        `;
        // await pool.query(insertApprovalQuery, [remark || 'Approved by admin', adminId, bookingId]);

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

        // Update BOOKING table status to 'REJECTED'
        const updateBookingQuery = `
            UPDATE BOOKING 
            SET B_Status = 'REJECTED' 
            WHERE B_ID = $1 
            RETURNING *;
        `;
        // await pool.query(updateBookingQuery, [bookingId]);

        // Insert record into APPROVAL table tracking the rejection
        const insertApprovalQuery = `
            INSERT INTO APPROVAL (Ap_Date, Remark, Decision, A_ID, B_ID)
            VALUES (CURRENT_DATE, $1, 'Rejected', $2, $3);
        `;
        // await pool.query(insertApprovalQuery, [remark || 'Rejected by admin', adminId, bookingId]);

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