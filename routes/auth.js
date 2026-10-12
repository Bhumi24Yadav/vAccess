const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
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

        // 1. Find the user in the database
        const adminResult = await pool.query(
            `SELECT a_id AS id, a_name AS name,
                    a_email AS email, password_hash
             FROM admin WHERE a_email = $1`,
            [email]
        );

        const facultyResult = await pool.query(
            `SELECT fno AS id, f_name AS name,
                    f_email AS email, password_hash
             FROM faculty WHERE f_email = $1`,
            [email]
        );

        const studentResult = await pool.query(
            `SELECT rno AS id, s_name AS name,
                    s_email AS email, password_hash
             FROM student WHERE s_email = $1`,
            [email]
        );

        let user;
        let role;

        if (adminResult.rows.length > 0) {
            user = adminResult.rows[0];
            role = "ADMIN";
        } else if (facultyResult.rows.length > 0) {
            user = facultyResult.rows[0];
            role = "FACULTY";
        } else if (studentResult.rows.length > 0) {
            user = studentResult.rows[0];
            role = "STUDENT";
        }

        // 2. Reject an unknown user or missing password hash
        if (!user || !user.password_hash) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password."
            });
        }

        // 3. Compare the entered password with the stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password."
            });
        }

        // 4. Return user details without exposing the password hash
        const { password_hash, ...safeUser } = user;

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                ...safeUser,
                role
            }
        });

    } catch (err) {
        console.error("Error during login:", err.message);

        return res.status(500).json({
            success: false,
            error: "Internal server error during login."
        });
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
// POST /api/auth/register - Register a new student
// POST /api/auth/register - Register a new student or faculty
router.post('/auth/register', async (req, res) => {
    try {
        const { name, email, contactNo, dept, role, password } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, error: "All required fields must be filled." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        if (role === 'student') {
            // Check if email exists
            const existing = await pool.query('SELECT * FROM student WHERE s_email = $1', [normalizedEmail]);
            if (existing.rows.length > 0) {
                return res.status(400).json({ success: false, error: 'Email is already registered.' });
            }

            // Generate next rno (e.g., S001, S002...)
            const maxResult = await pool.query(`
                SELECT COALESCE(MAX(CAST(SUBSTRING(rno FROM 2) AS INTEGER)), 0) + 1 AS next_num 
                FROM student 
                WHERE rno ~ '^S[0-9]+$'
            `);
            const nextRno = 'S' + String(maxResult.rows[0].next_num).padStart(3, '0');

            const insertQuery = `
                INSERT INTO student (rno, s_name, s_email, password_hash, dept, contactno)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING rno AS id, s_name AS name, s_email AS email, dept, contactno;
            `;
            const newStudent = await pool.query(insertQuery, [nextRno, name, normalizedEmail, password_hash, dept, contactNo]);

            return res.status(201).json({
                success: true,
                message: "Registration successful!",
                session: { role: 'student', ...newStudent.rows[0], A_ID: null }
            });
        } 
        
        if (role === 'faculty') {
            const existing = await pool.query('SELECT * FROM faculty WHERE f_email = $1', [normalizedEmail]);
            if (existing.rows.length > 0) {
                return res.status(400).json({ success: false, error: 'Email is already registered.' });
            }

            // Generate next fno (e.g., F001, F002...)
            const maxResult = await pool.query(`
                SELECT COALESCE(MAX(CAST(SUBSTRING(fno FROM 2) AS INTEGER)), 0) + 1 AS next_num 
                FROM faculty 
                WHERE fno ~ '^F[0-9]+$'
            `);
            const nextFno = 'F' + String(maxResult.rows[0].next_num).padStart(3, '0');

            const insertQuery = `
                INSERT INTO faculty (fno, f_name, f_email, password_hash, dept, contactno)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING fno AS id, f_name AS name, f_email AS email, dept, contactno;
            `;
            const newFaculty = await pool.query(insertQuery, [nextFno, name, normalizedEmail, password_hash, dept, contactNo]);

            return res.status(201).json({
                success: true,
                message: "Registration successful!",
                session: { role: 'faculty', ...newFaculty.rows[0], A_ID: null }
            });
        }

        return res.status(400).json({ success: false, error: 'Invalid role specified.' });

    } catch (err) {
        console.error("Error during registration:", err.message);
        return res.status(500).json({ success: false, error: "Server error during registration." });
    }
});
module.exports = router;