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
// MOCK LOGIN
// ============================================================

/**
 * Attempt login with email, password, and role.
 * Returns { success: true, session } or { success: false, error: string }
 *
 * REPLACE THIS with a fetch() POST to your API when integrating backend.
 */
function mockLogin(email, password, role) {
  email = email.trim().toLowerCase();

  if (role === 'admin') {
    const admins = JSON.parse(localStorage.getItem('va_admins') || '[]');
    const admin = admins.find(a => a.A_Email.toLowerCase() === email && a.password === password);
    if (!admin) return { success: false, error: 'Invalid admin credentials.' };
    const session = {
      role: 'admin',
      id: admin.A_ID,
      name: admin.A_Name,
      email: admin.A_Email,
      dept: null,
      A_ID: admin.A_ID,
    };
    setSession(session);
    return { success: true, session };
  }

  if (role === 'student') {
    const students = JSON.parse(localStorage.getItem('va_students') || '[]');
    const student = students.find(s => s.S_Email.toLowerCase() === email && password === 'student123');
    if (!student) return { success: false, error: 'Invalid student credentials. (password: student123)' };
    const session = {
      role: 'student',
      id: student.rno,
      name: student.S_name,
      email: student.S_Email,
      dept: student.Dept,
      contactNo: student.ContactNo,
      A_ID: null,
    };
    setSession(session);
    return { success: true, session };
  }

  if (role === 'faculty') {
    const faculty = JSON.parse(localStorage.getItem('va_faculty') || '[]');
    const f = faculty.find(f => f.F_Email.toLowerCase() === email && password === 'faculty123');
    if (!f) return { success: false, error: 'Invalid faculty credentials. (password: faculty123)' };
    const session = {
      role: 'faculty',
      id: f.fno,
      name: f.F_name,
      email: f.F_Email,
      dept: f.Dept,
      A_ID: null,
    };
    setSession(session);
    return { success: true, session };
  }

  return { success: false, error: 'Please select a valid role.' };
}

// ============================================================
// MOCK REGISTER
// ============================================================

/**
 * Register a new student.
 * Returns { success: true } or { success: false, error: string }
 *
 * REPLACE with API call when integrating backend.
 */
function mockRegister({ name, email, contactNo, dept, role, password }) {
  email = email.trim().toLowerCase();

  if (role === 'student') {
    const students = JSON.parse(localStorage.getItem('va_students') || '[]');
    if (students.find(s => s.S_Email.toLowerCase() === email)) {
      return { success: false, error: 'Email is already registered.' };
    }
    // Generate next rno
    const nums = students.map(s => parseInt(s.rno.replace('S', ''), 10)).filter(n => !isNaN(n));
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
    const newStudent = {
      rno: 'S' + String(nextNum).padStart(3, '0'),
      S_name: name,
      ContactNo: contactNo,
      S_Email: email,
      Dept: dept,
    };
    students.push(newStudent);
    localStorage.setItem('va_students', JSON.stringify(students));

    // Auto login after registration
    const session = {
      role: 'student',
      id: newStudent.rno,
      name: newStudent.S_name,
      email: newStudent.S_Email,
      dept: newStudent.Dept,
      contactNo: newStudent.ContactNo,
      A_ID: null,
    };
    setSession(session);
    return { success: true, session };
  }

  if (role === 'faculty') {
    const faculty = JSON.parse(localStorage.getItem('va_faculty') || '[]');
    if (faculty.find(f => f.F_Email.toLowerCase() === email)) {
      return { success: false, error: 'Email is already registered.' };
    }
    const nums = faculty.map(f => parseInt(f.fno.replace('F', ''), 10)).filter(n => !isNaN(n));
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
    const newFaculty = {
      fno: 'F' + String(nextNum).padStart(3, '0'),
      F_name: name,
      F_Email: email,
      Dept: dept,
    };
    faculty.push(newFaculty);
    localStorage.setItem('va_faculty', JSON.stringify(faculty));

    const session = {
      role: 'faculty',
      id: newFaculty.fno,
      name: newFaculty.F_name,
      email: newFaculty.F_Email,
      dept: newFaculty.Dept,
      A_ID: null,
    };
    setSession(session);
    return { success: true, session };
  }

  return { success: false, error: 'Registration for admin is not available.' };
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
