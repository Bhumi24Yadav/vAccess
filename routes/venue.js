const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 1. GET /api/venue - Fetch all venues (with optional category filtering)
router.get('/venue', async (req, res) => {
    try {
        const { category, status } = req.query;
        let query = 'SELECT * FROM venue WHERE 1=1';
        let queryParams = [];

        // Filter by category if provided (e.g., Auditorium, Seminar Hall)
        if (category) {
            queryParams.push(category);
            query += ` AND category = $${queryParams.length}`;
        }

        // Filter by status (defaults to 'Open' if not specified)
        if (status) {
            queryParams.push(status);
            query += ` AND v_status = $${queryParams.length}`;
        } else {
            queryParams.push('Available');
            query += ` AND v_status = $${queryParams.length}`;
        }

        const result = await pool.query(query, queryParams);
        return res.status(200).json(result.rows);

    } catch (err) {
        console.error("Error in GET /api/venue:", err.message);
        return res.status(500).json({ success: false, error: "Server error while fetching venues" });
    }
});

// 2. GET /api/venue/available - Check real-time venue availability
router.get('/venue/available', async (req, res) => {
    try {
        const { date, startTime, endTime } = req.query;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({ 
                success: false, 
                error: "Query parameters 'date', 'startTime', and 'endTime' are required." 
            });
        }

        // Query to find venues that do NOT have overlapping APPROVED or PENDING bookings
        const availableQuery = `
            SELECT v.* 
            FROM venue v
            WHERE v.v_status = 'Open'
              AND v.v_id NOT IN (
                  SELECT b.v_id
                  FROM booking b
                  JOIN timeslot t ON b.b_id = t.b_id
                  WHERE t.eventdate = $1 
                    AND b.b_status IN ('APPROVED', 'PENDING')
                    AND t.starttime < $2 
                    AND t.endtime > $3
              );
        `;

        const result = await pool.query(availableQuery, [date, endTime, startTime]);
        return res.status(200).json(result.rows);

    } catch (err) {
        console.error("Error in GET /api/venue/available:", err.message);
        return res.status(500).json({ success: false, error: "Server error while checking availability" });
    }
});

// 3. GET /api/venue/:id - Fetch complete details for a single venue
router.get('/venue/:id', async (req, res) => {
    try {
        const venueId = req.params.id;

        const result = await pool.query('SELECT * FROM venue WHERE v_id = $1', [venueId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: "Venue not found" });
        }
        return res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error("Error in GET /api/venue/:id:", err.message);
        return res.status(500).json({ success: false, error: "Server error while fetching venue details" });
    }
});

module.exports = router;