const express = require('express');
const router = express.Router();
// const pool = require('../config/db'); // Database connection pool from your friend

// 1. GET /api/notifications - Returns notifications like booking approvals, rejections, or cancellations
router.get('/notifications', async (req, res) => {
    try {
        // const userId = req.user.id; // Derived from authenticated session

        // Placeholder mock response matching the API spec
        return res.status(200).json([
            { id: 8, message: "Your Seminar Hall A booking was approved.", read: false }
        ]);

    } catch (err) {
        console.error("Error fetching notifications:", err.message);
        return res.status(500).json({ success: false, error: "Server error while fetching notifications" });
    }
});

// 2. GET /api/admin/dashboard - Provides aggregated counts and statistics for the admin panel
router.get('/admin/dashboard', async (req, res) => {
    try {
        // In production, you would run SQL aggregate queries here:
        // const pendingQuery = await pool.query("SELECT COUNT(*) FROM BOOKING WHERE B_Status = 'PENDING'");

        // Placeholder mock response matching the API spec
        return res.status(200).json({
            pendingBookings: 8,
            approvedBookings: 21,
            rejectedBookings: 4,
            activeVenues: 15
        });

    } catch (err) {
        console.error("Error fetching admin dashboard stats:", err.message);
        return res.status(500).json({ success: false, error: "Server error while fetching dashboard statistics" });
    }
});

module.exports = router;