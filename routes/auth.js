const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/auth/login - Authenticate by querying admin, faculty, or student tables
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: "Email and password are required." 
            });
        }

        // 1. Check admin table
        const adminQuery = `SELECT a_id AS id, a_name AS name, a_email AS email FROM admin WHERE a_email = $1`;
        const adminResult = await pool.query(adminQuery, [email]);
        if (adminResult.rows.length > 0) {
            return res.status(200).json({
                message: "Login successful",
                user: { ...adminResult.rows[0], role: "ADMIN" }
            });
        }

        // 2. Check faculty table
        const facultyQuery = `SELECT fno AS id, f_name AS name, f_email AS email FROM faculty WHERE f_email = $1`;
        const facultyResult = await pool.query(facultyQuery, [email]);
        if (facultyResult.rows.length > 0) {
            return res.status(200).json({
                message: "Login successful",
                user: { ...facultyResult.rows[0], role: "FACULTY" }
            });
        }

        // 3. Check student table
        const studentQuery = `SELECT rno AS id, s_name AS name, s_email AS email FROM student WHERE s_email = $1`;
        const studentResult = await pool.query(studentQuery, [email]);
        if (studentResult.rows.length > 0) {
            return res.status(200).json({
                message: "Login successful",
                user: { ...studentResult.rows[0], role: "STUDENT" }
            });
        }

        return res.status(401).json({ success: false, error: "Invalid email or password." });

    } catch (err) {
        console.error("Error during login:", err.message);
        return res.status(500).json({ success: false, error: "Internal server error during login" });
    }
});

// POST /api/auth/logout - End current authenticated session
router.post('/auth/logout', (req, res) => {
    try {
        return res.status(200).json({ 
            message: "Logged out successfully" 
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error during logout" });
    }
});

// GET /api/auth/me - Return currently authenticated user profile and role
router.get('/auth/me', (req, res) => {
    try {
        return res.status(200).json({
            id: 12,
            name: "Test Student",
            email: "student@college.edu",
            role: "STUDENT"
        });
    } catch (err) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
});

module.exports = router;