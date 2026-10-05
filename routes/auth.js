const express = require('express');
const router = express.Router();
// const pool = require('../config/db'); // Database connection pool

// 1. POST /api/auth/login - Authenticate a user (Student, Faculty, or Admin)
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: "Email and password are required." 
            });
        }

        // TODO: When database is connected, query STUDENT, FACULTY, or ADMIN tables by email,
        // verify password hash, and determine their role.

        // Placeholder mock response for testing login
        // If the email contains 'admin', treat them as an admin, otherwise a student
        const role = email.includes('admin') ? 'ADMIN' : (email.includes('faculty') ? 'FACULTY' : 'STUDENT');

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: 12,
                name: "Test User",
                email: email,
                role: role // 'STUDENT', 'FACULTY', or 'ADMIN'
            }
        });

    } catch (err) {
        console.error("Error during login:", err.message);
        return res.status(500).json({ success: false, error: "Internal server error during login" });
    }
});

// 2. POST /api/auth/logout - End current authenticated session
router.post('/auth/logout', (req, res) => {
    try {
        // If using sessions or tokens, clear them here
        return res.status(200).json({ 
            message: "Logged out successfully" 
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error during logout" });
    }
});

// 3. GET /api/auth/me - Return currently authenticated user profile and role
router.get('/auth/me', (req, res) => {
    try {
        // This would typically read from an active session or decoded JWT token
        // Placeholder mock response
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