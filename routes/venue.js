const express = require('express');
const router = express.Router();
const pool = require('../config/db');
// const pool = require('../config/db'); // Database connection pool from your friend

// 1. GET /api/venue - Fetch all venues (with optional category filtering)
router.get('/venue', async (req, res) => {
    try {
        const { category, status } = req.query;
        let query = 'SELECT * FROM venue WHERE 1=1';
        let queryParams = [];

        // Filter by category if provided (e.g., Auditorium, Seminar Hall)
        if (category) {
            queryParams.push(category);
            query += ` AND Category = $${queryParams.length}`;
        }

        // Filter by status (defaults to 'Open' if not specified)
        if (status) {
            queryParams.push(status);
            query += ` AND V_status = $${queryParams.length}`;
        } else {
            queryParams.push('Open');
            query += ` AND V_status = $${queryParams.length}`;
        }

        // UNCOMMENT THESE LINES TO USE THE LIVE DATABASE:
        const result = await pool.query(query, queryParams);
        return res.status(200).json(result.rows);

    } catch (err) {
        console.error("Error in GET /api/venue:", err.message);
        return res.status(500).json({ success: false, error: "Server error while fetching venues" });
    }
});

// 2. GET /api/venue/available - Check real-time venue availability
// Example: /api/venue/available?date=2026-10-05&startTime=10:00&endTime=12:00
router.get('/venue/available', async (req, res) => {
    try {
        const { date, startTime, endTime } = req.query;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({ 
                success: false, 
                error: "Query parameters 'date', 'startTime', and 'endTime' are required." 
            });
        }

        // Query to find venues that do NOT have overlapping APPROVED or PENDING bookings for the requested slot
        const availableQuery = `
            SELECT v.* 
            FROM venue v
            WHERE v.V_status = 'Open'
              AND v.V_ID NOT IN (
                  SELECT b.V_ID 
                  FROM BOOKING b
                  JOIN TIMESLOT t ON b.B_ID = t.B_ID
                  WHERE t.EventDate = $1 
                    AND b.B_Status IN ('APPROVED', 'PENDING')
                    AND t.StartTime < $2 
                    AND t.EndTime > $3
              );
        `;

        // const result = await pool.query(availableQuery, [date, endTime, startTime]);
        // return res.status(200).json(result.rows);

        return res.status(200).json({
            message: "Available venues retrieved successfully",
            date,
            startTime,
            endTime,
            availableVenues: [
                { V_ID: 1, Category: "Seminar Hall", Capacity: 100, V_status: "Open" }
            ]
        });

    } catch (err) {
        console.error("Error in GET /api/venue/available:", err.message);
        return res.status(500).json({ success: false, error: "Server error while checking availability" });
    }
});

// 3. GET /api/venue/:id - Fetch complete details for a single venue
router.get('/venue/:id', async (req, res) => {
    try {
        const venueId = req.params.id;

        // const result = await pool.query('SELECT * FROM VENUE WHERE V_ID = $1', [venueId]);
        // if (result.rows.length === 0) {
        //     return res.status(404).json({ success: false, error: "Venue not found" });
        // }
        // return res.status(200).json(result.rows[0]);

        return res.status(200).json({
            V_ID: venueId,
            Category: "Seminar Hall",
            Capacity: 100,
            V_type: "Indoor",
            Subtype: "AC",
            V_status: "Open"
        });

    } catch (err) {
        console.error("Error in GET /api/venue/:id:", err.message);
        return res.status(500).json({ success: false, error: "Server error while fetching venue details" });
    }
});

module.exports = router;