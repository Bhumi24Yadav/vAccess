const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Database connection pool

// 1. GET /api/notifications - Returns notifications (mocked since no notification table exists)
router.get('/notifications', async (req, res) => {
    try {
        return res.status(200).json([
            { id: 8, message: "Your booking request status has been updated.", read: false }
        ]);
    } catch (err) {
        console.error("Error fetching notifications:", err.message);
        return res.status(500).json({ success: false, error: "Server error while fetching notifications" });
    }
});

// 2. GET /api/admin/dashboard - Provides live aggregated counts and statistics for the admin panel
router.get('/admin/dashboard', async (req, res) => {
    try {
        const pendingQuery = pool.query("SELECT COUNT(*) FROM booking WHERE b_status = 'PENDING'");
        const approvedQuery = pool.query("SELECT COUNT(*) FROM booking WHERE b_status = 'APPROVED'");
        const rejectedQuery = pool.query("SELECT COUNT(*) FROM booking WHERE b_status = 'REJECTED'");
        const venuesQuery = pool.query("SELECT COUNT(*) FROM venue");

        const [pending, approved, rejected, venues] = await Promise.all([
            pendingQuery,
            approvedQuery,
            rejectedQuery,
            venuesQuery
        ]);

        return res.status(200).json({
            pendingBookings: parseInt(pending.rows[0].count, 10),
            approvedBookings: parseInt(approved.rows[0].count, 10),
            rejectedBookings: parseInt(rejected.rows[0].count, 10),
            activeVenues: parseInt(venues.rows[0].count, 10)
        });

    } catch (err) {
        console.error("Error fetching admin dashboard stats:", err.message);
        return res.status(500).json({ success: false, error: "Server error while fetching dashboard statistics" });
    }
});

module.exports = router;