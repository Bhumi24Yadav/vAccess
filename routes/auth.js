const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../config/db');

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required."
            });
        }

        let user = null;

        // 1. Check admin
        const adminResult = await pool.query(
            `SELECT 
                a_id AS id,
                a_name AS name,
                a_email AS email,
                password_hash
             FROM admin
             WHERE a_email = $1`,
            [email]
        );

      if (adminResult.rows.length > 0) {

    const admin = adminResult.rows[0];

    const passwordValid = await bcrypt.compare(
        password,
        admin.password_hash
    );

    if (!passwordValid) {
        return res.status(401).json({
            success: false,
            error: "Invalid email or password."
        });
    }

    return res.status(200).json({
        message: "Login successful",
        user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: "ADMIN"
        }
    });
}

        // 2. Check faculty
        if (!user) {
            const facultyResult = await pool.query(
                `SELECT
                    fno AS id,
                    f_name AS name,
                    f_email AS email,
                    password_hash
                 FROM faculty
                 WHERE f_email = $1`,
                [email]
            );

          if (facultyResult.rows.length > 0) {

    const faculty = facultyResult.rows[0];

    const passwordValid = await bcrypt.compare(
        password,
        faculty.password_hash
    );

    if (!passwordValid) {
        return res.status(401).json({
            success: false,
            error: "Invalid email or password."
        });
    }

    return res.status(200).json({
        message: "Login successful",
        user: {
            id: faculty.id,
            name: faculty.name,
            email: faculty.email,
            role: "FACULTY"
        }
    });
}
        // 3. Check student
        if (!user) {
            const studentResult = await pool.query(
                `SELECT
                    rno AS id,
                    s_name AS name,
                    s_email AS email,
                    password_hash
                 FROM student
                 WHERE s_email = $1`,
                [email]
            );

          if (studentResult.rows.length > 0) {

    const student = studentResult.rows[0];

    const passwordValid = await bcrypt.compare(
        password,
        student.password_hash
    );

    if (!passwordValid) {
        return res.status(401).json({
            success: false,
            error: "Invalid email or password."
        });
    }

    return res.status(200).json({
        message: "Login successful",
        user: {
            id: student.id,
            name: student.name,
            email: student.email,
            role: "STUDENT"
        }
    });
}
        // User not found
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password."
            });
        }

        // 4. Verify password
        const passwordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password."
            });
        }

        // 5. Create authenticated session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: req.session.user
        });

    } catch (err) {
        console.error("Error during login:", err.message);

        return res.status(500).json({
            success: false,
            error: "Internal server error during login"
        });
    }
});


// POST /api/auth/logout
router.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {

        if (err) {
            console.error("Logout error:", err);

            return res.status(500).json({
                success: false,
                error: "Could not log out"
            });
        }

        res.clearCookie('connect.sid');

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    });
});


// GET /api/auth/me
router.get('/auth/me', (req, res) => {

    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized"
        });
    }

    return res.status(200).json({
        success: true,
        user: req.session.user
    });
});


module.exports = router;