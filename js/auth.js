/**
 * vAccess — auth.js
 * Client-Side Authentication Module (Frontend Only)
 *
 * Implements real user credential validation against localStorage:
 * - Student (rno, S_name, S_Email, Dept, ContactNo.)
 * - Faculty (fno, F_name, F_Email, Dept, ContactNo.)
 * - Admin (A_ID, A_Name, A_Email)
 */

const SESSION_KEY = 'va_session';

// ============================================================
// SESSION MANAGEMENT
// ============================================================

/**
 * Get the currently logged-in user session.
 * Returns null if not logged in.
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
// LOGIN VALIDATION
// ============================================================

/**
 * Authenticate user with email, password, and role against stored credentials.
 */
function mockLogin(email, password, role) {
  if (!email || !password || !role) {
    return { success: false, error: 'Please provide email, password, and select your role.' };
  }
  email = email.trim().toLowerCase();

  if (role === 'admin') {
    const admins = JSON.parse(localStorage.getItem('va_admins') || '[]');
    const admin = admins.find(a => a.A_Email.toLowerCase() === email);
    if (!admin) {
      if (admins.length === 0) {
        return { success: false, error: 'No admin accounts exist yet. Please register an Administrator account first.' };
      }
      return { success: false, error: 'No administrator account found with this email address.' };
    }
    if (admin.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
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
    const student = students.find(s => s.S_Email.toLowerCase() === email);
    if (!student) {
      if (students.length === 0) {
        return { success: false, error: 'No student accounts found. Please register an account first.' };
      }
      return { success: false, error: 'No student account found with this email address.' };
    }
    if (student.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
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
    const f = faculty.find(fc => fc.F_Email.toLowerCase() === email);
    if (!f) {
      if (faculty.length === 0) {
        return { success: false, error: 'No faculty accounts found. Please register an account first.' };
      }
      return { success: false, error: 'No faculty account found with this email address.' };
    }
    if (f.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
    const session = {
      role: 'faculty',
      id: f.fno,
      name: f.F_name,
      email: f.F_Email,
      dept: f.Dept,
      contactNo: f.ContactNo,
      A_ID: null,
    };
    setSession(session);
    return { success: true, session };
  }

  return { success: false, error: 'Please select a valid role.' };
}

// ============================================================
// REGISTRATION
// ============================================================

/**
 * Register a user according to the ER diagram entity specifications.
 * Supports Student, Faculty, and Admin.
 */
function mockRegister({ name, email, contactNo, dept, role, password }) {
  if (!name || !email || !password || !role) {
    return { success: false, error: 'Please fill in all required fields.' };
  }
  email = email.trim().toLowerCase();

  if (role === 'student') {
    const students = JSON.parse(localStorage.getItem('va_students') || '[]');
    if (students.some(s => s.S_Email.toLowerCase() === email)) {
      return { success: false, error: 'Email is already registered as a student.' };
    }
    const nums = students.map(s => parseInt(s.rno.replace('S', ''), 10)).filter(n => !isNaN(n));
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
    const newStudent = {
      rno: 'S' + String(nextNum).padStart(3, '0'),
      S_name: name,
      ContactNo: contactNo || '',
      S_Email: email,
      Dept: dept || 'General',
      password: password
    };
    students.push(newStudent);
    localStorage.setItem('va_students', JSON.stringify(students));

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
    if (faculty.some(f => f.F_Email.toLowerCase() === email)) {
      return { success: false, error: 'Email is already registered as faculty.' };
    }
    const nums = faculty.map(f => parseInt(f.fno.replace('F', ''), 10)).filter(n => !isNaN(n));
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
    const newFaculty = {
      fno: 'F' + String(nextNum).padStart(3, '0'),
      F_name: name,
      F_Email: email,
      Dept: dept || 'General',
      ContactNo: contactNo || '',
      password: password
    };
    faculty.push(newFaculty);
    localStorage.setItem('va_faculty', JSON.stringify(faculty));

    const session = {
      role: 'faculty',
      id: newFaculty.fno,
      name: newFaculty.F_name,
      email: newFaculty.F_Email,
      dept: newFaculty.Dept,
      contactNo: newFaculty.ContactNo,
      A_ID: null,
    };
    setSession(session);
    return { success: true, session };
  }

  if (role === 'admin') {
    const admins = JSON.parse(localStorage.getItem('va_admins') || '[]');
    if (admins.some(a => a.A_Email.toLowerCase() === email)) {
      return { success: false, error: 'Email is already registered as an administrator.' };
    }
    const nums = admins.map(a => parseInt(a.A_ID.replace('ADM', ''), 10)).filter(n => !isNaN(n));
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
    const newAdmin = {
      A_ID: 'ADM' + String(nextNum).padStart(3, '0'),
      A_Name: name,
      A_Email: email,
      password: password,
      role: 'admin'
    };
    admins.push(newAdmin);
    localStorage.setItem('va_admins', JSON.stringify(admins));

    const session = {
      role: 'admin',
      id: newAdmin.A_ID,
      name: newAdmin.A_Name,
      email: newAdmin.A_Email,
      dept: null,
      A_ID: newAdmin.A_ID,
    };
    setSession(session);
    return { success: true, session };
  }

  return { success: false, error: 'Invalid user role selected.' };
}

// ============================================================
// ROUTE GUARDS
// ============================================================

/** Redirect to login if not logged in */
function requireLogin(redirectTo = '../pages/login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
  }
}

/** Redirect to admin login or dashboard */
function requireAdmin(redirectTo = '../pages/login.html') {
  const s = getSession();
  if (!s || s.role !== 'admin') {
    window.location.href = redirectTo;
  }
}

/** Redirect admin users away from student pages */
function requireUser(redirectTo = '../pages/admin-dashboard.html') {
  const s = getSession();
  if (!s) { window.location.href = '../pages/login.html'; return; }
  if (s.role === 'admin') window.location.href = redirectTo;
}

/** Logout and redirect to home */
function logout() {
  clearSession();
  window.location.href = '../index.html';
}
