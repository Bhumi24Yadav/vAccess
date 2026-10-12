/**
 * vAccess — auth.js
 * Mock authentication module.
 *
 * IMPORTANT: This is DEMO/MOCK authentication only.
 * No real security is implemented here.
 * Replace the functions below with real fetch()/API calls
 * when connecting a backend.
 *
 * Mock credentials:
 *   Student:  any email in MOCK_STUDENTS, password: "student123"
 *   Faculty:  any email in MOCK_FACULTY, password: "faculty123"
 *   Admin:    vijay.patil@college.edu | deepa.nair@college.edu, password: "admin123"
 */

const SESSION_KEY = 'va_session';

// ============================================================
// SESSION MANAGEMENT
// ============================================================

/**
 * Get the currently logged-in user session.
 * Returns null if not logged in.
 *
 * Session object shape:
 * {
 *   role: 'student' | 'faculty' | 'admin',
 *   id: rno | fno | A_ID,
 *   name: string,
 *   email: string,
 *   dept: string | null,
 *   A_ID: string | null  (admin only)
 * }
 */
function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/** Save a session object */
function setSession(sessionObj) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionObj));
}

/** Clear the current session (logout) */
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Check if a user is currently logged in */
function isLoggedIn() {
  return !!getSession();
}

/** Check if the logged-in user is an admin */
function isAdmin() {
  const s = getSession();
  return s && s.role === 'admin';
}

// ============================================================
// REAL API LOGIN (Replaces mockLogin)
// ============================================================

/**
 * Authenticate a user via the backend API.
 * Returns { success: true, session } or { success: false, error: string }
 */
async function mockLogin({ email, password }) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success && result.user) {
            // Format session object to match what the rest of the frontend expects
            const session = {
                role: result.user.role.toLowerCase(), // 'student', 'faculty', or 'admin'
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                dept: result.user.dept || null,
                contactNo: result.user.contactno || null,
                A_ID: result.user.role === 'ADMIN' ? result.user.id : null
            };

            // Save session to frontend storage/state
            setSession(session);
            return { success: true, session };
        } else {
            return { success: false, error: result.error || 'Invalid email or password.' };
        }
    } catch (err) {
        console.error("Network error during login:", err);
        return { success: false, error: 'Unable to connect to the server.' };
    }
}
// ============================================================
// REAL API REGISTER (Replaces mockRegister)
// ============================================================

/**
 * Register a new student or faculty via the backend API.
 * Returns { success: true, session } or { success: false, error: string }
 */
async function mockRegister({ name, email, contactNo, dept, role, password }) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, contactNo, dept, role, password })
        });

        const result = await response.json();

        if (result.success && result.session) {
            // Automatically set session in frontend state/localStorage
            setSession(result.session);
            return { success: true, session: result.session };
        } else {
            return { success: false, error: result.error || 'Registration failed.' };
        }
    } catch (err) {
        console.error("Network error during registration:", err);
        return { success: false, error: 'Unable to connect to the server.' };
    }
}

// ============================================================
// ROUTE GUARDS
// ============================================================

/**
 * Redirect to login if not logged in.
 * Call at the top of protected pages.
 */
function requireLogin(redirectTo = '../pages/login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
  }
}

/**
 * Redirect to admin dashboard if not admin.
 * Call at the top of admin-only pages.
 */
function requireAdmin(redirectTo = '../pages/login.html') {
  const s = getSession();
  if (!s || s.role !== 'admin') {
    window.location.href = redirectTo;
  }
}

/**
 * Redirect admin users away from student pages.
 * Call at the top of student/faculty pages.
 */
function requireUser(redirectTo = '../pages/admin-dashboard.html') {
  const s = getSession();
  if (!s) { window.location.href = '../pages/login.html'; return; }
  if (s.role === 'admin') window.location.href = redirectTo;
}

/** Logout and redirect */
function logout() {
  clearSession();
  window.location.href = '../index.html';
}
