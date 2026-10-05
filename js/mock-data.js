/**
 * vAccess — mock-data.js
 * Centralized mock data aligned with the ER Model entities:
 * Student, Faculty, Booking, Venue, Timeslot, AdminApproval
 *
 * NOTE: Property names intentionally mirror the ER model for
 * easy backend integration later (just swap these with fetch() calls).
 */

// ============================================================
// STUDENTS
// ============================================================
const MOCK_STUDENTS = [
  { rno: 'S001', S_name: 'Aarav Mehta',    ContactNo: '9876543210', S_Email: 'aarav.mehta@college.edu',    Dept: 'Computer Science' },
  { rno: 'S002', S_name: 'Priya Sharma',   ContactNo: '9765432109', S_Email: 'priya.sharma@college.edu',   Dept: 'Electronics' },
  { rno: 'S003', S_name: 'Rohan Verma',    ContactNo: '9654321098', S_Email: 'rohan.verma@college.edu',    Dept: 'Mechanical' },
  { rno: 'S004', S_name: 'Ananya Patel',   ContactNo: '9543210987', S_Email: 'ananya.patel@college.edu',   Dept: 'Civil' },
  { rno: 'S005', S_name: 'Karan Singh',    ContactNo: '9432109876', S_Email: 'karan.singh@college.edu',    Dept: 'Computer Science' },
  { rno: 'S006', S_name: 'Simran Kaur',    ContactNo: '9321098765', S_Email: 'simran.kaur@college.edu',    Dept: 'Information Technology' },
  { rno: 'S007', S_name: 'Devansh Joshi',  ContactNo: '9210987654', S_Email: 'devansh.joshi@college.edu',  Dept: 'Electronics' },
  { rno: 'S008', S_name: 'Nisha Reddy',    ContactNo: '9109876543', S_Email: 'nisha.reddy@college.edu',    Dept: 'Mechanical' },
];

// ============================================================
// FACULTY
// ============================================================
const MOCK_FACULTY = [
  { fno: 'F001', F_name: 'Dr. Suresh Kumar',   F_Email: 'suresh.kumar@college.edu',   Dept: 'Computer Science' },
  { fno: 'F002', F_name: 'Prof. Meena Iyer',   F_Email: 'meena.iyer@college.edu',     Dept: 'Electronics' },
  { fno: 'F003', F_name: 'Dr. Ramesh Gupta',   F_Email: 'ramesh.gupta@college.edu',   Dept: 'Mechanical' },
  { fno: 'F004', F_name: 'Prof. Sunita Rao',   F_Email: 'sunita.rao@college.edu',     Dept: 'Civil' },
  { fno: 'F005', F_name: 'Dr. Anil Desai',     F_Email: 'anil.desai@college.edu',     Dept: 'Information Technology' },
];

// ============================================================
// VENUES
// ============================================================
const MOCK_VENUES = [
  {
    V_ID: 'V001', V_type: 'Auditorium', SubType: 'Main Hall',
    Category: 'Large Events', V_Status: 'Available',
    Capacity: 500, ContactNo: '022-2456-7890'
  },
  {
    V_ID: 'V002', V_type: 'Seminar Hall', SubType: 'Academic Block A',
    Category: 'Academic', V_Status: 'Available',
    Capacity: 120, ContactNo: '022-2456-7891'
  },
  {
    V_ID: 'V003', V_type: 'Conference Room', SubType: 'Admin Block',
    Category: 'Meeting', V_Status: 'Available',
    Capacity: 30, ContactNo: '022-2456-7892'
  },
  {
    V_ID: 'V004', V_type: 'Seminar Hall', SubType: 'Academic Block B',
    Category: 'Academic', V_Status: 'Booked',
    Capacity: 80, ContactNo: '022-2456-7893'
  },
  {
    V_ID: 'V005', V_type: 'Sports Ground', SubType: 'Football Field',
    Category: 'Sports', V_Status: 'Available',
    Capacity: 1000, ContactNo: '022-2456-7894'
  },
  {
    V_ID: 'V006', V_type: 'Laboratory', SubType: 'Computer Lab 1',
    Category: 'Technical', V_Status: 'Available',
    Capacity: 60, ContactNo: '022-2456-7895'
  },
  {
    V_ID: 'V007', V_type: 'Conference Room', SubType: 'Library Block',
    Category: 'Meeting', V_Status: 'Maintenance',
    Capacity: 20, ContactNo: '022-2456-7896'
  },
  {
    V_ID: 'V008', V_type: 'Auditorium', SubType: 'Mini Theatre',
    Category: 'Large Events', V_Status: 'Available',
    Capacity: 200, ContactNo: '022-2456-7897'
  },
  {
    V_ID: 'V009', V_type: 'Sports Ground', SubType: 'Basketball Court',
    Category: 'Sports', V_Status: 'Available',
    Capacity: 200, ContactNo: '022-2456-7898'
  },
  {
    V_ID: 'V010', V_type: 'Laboratory', SubType: 'Electronics Lab',
    Category: 'Technical', V_Status: 'Available',
    Capacity: 40, ContactNo: '022-2456-7899'
  },
  {
    V_ID: 'V011', V_type: 'Cafeteria', SubType: 'Main Cafeteria',
    Category: 'Social', V_Status: 'Available',
    Capacity: 150, ContactNo: '022-2456-7900'
  },
  {
    V_ID: 'V012', V_type: 'Open Ground', SubType: 'Central Lawn',
    Category: 'Outdoor', V_Status: 'Available',
    Capacity: 2000, ContactNo: '022-2456-7901'
  },
];

// ============================================================
// BOOKINGS
// ============================================================
const MOCK_BOOKINGS = [
  {
    B_ID: 'B001', B_Date: '2026-09-10', B_Status: 'Approved',
    Purpose: 'Annual Cultural Fest Committee Meeting',
    noOfMembers: 45, rno: 'S001', fno: null, V_ID: 'V001'
  },
  {
    B_ID: 'B002', B_Date: '2026-09-15', B_Status: 'Pending',
    Purpose: 'IEEE Student Branch Technical Talk',
    noOfMembers: 80, rno: 'S002', fno: null, V_ID: 'V002'
  },
  {
    B_ID: 'B003', B_Date: '2026-09-18', B_Status: 'Rejected',
    Purpose: 'Department Alumni Meet',
    noOfMembers: 60, rno: null, fno: 'F001', V_ID: 'V004'
  },
  {
    B_ID: 'B004', B_Date: '2026-09-20', B_Status: 'Approved',
    Purpose: 'Workshop on Machine Learning',
    noOfMembers: 55, rno: null, fno: 'F002', V_ID: 'V006'
  },
  {
    B_ID: 'B005', B_Date: '2026-09-22', B_Status: 'Cancelled',
    Purpose: 'Sports Day Practice',
    noOfMembers: 100, rno: 'S003', fno: null, V_ID: 'V005'
  },
  {
    B_ID: 'B006', B_Date: '2026-09-25', B_Status: 'Pending',
    Purpose: 'Robotics Club Showcase Event',
    noOfMembers: 40, rno: 'S005', fno: null, V_ID: 'V008'
  },
  {
    B_ID: 'B007', B_Date: '2026-09-27', B_Status: 'Approved',
    Purpose: 'Faculty Development Program – Teaching Methods',
    noOfMembers: 25, rno: null, fno: 'F003', V_ID: 'V003'
  },
  {
    B_ID: 'B008', B_Date: '2026-09-28', B_Status: 'Pending',
    Purpose: 'National Science Day Celebration',
    noOfMembers: 200, rno: 'S006', fno: null, V_ID: 'V001'
  },
  {
    B_ID: 'B009', B_Date: '2026-10-01', B_Status: 'Pending',
    Purpose: 'Entrepreneurship Bootcamp Day 1',
    noOfMembers: 75, rno: 'S001', fno: null, V_ID: 'V002'
  },
  {
    B_ID: 'B010', B_Date: '2026-10-03', B_Status: 'Rejected',
    Purpose: 'Photography Club Outdoor Shoot',
    noOfMembers: 30, rno: 'S007', fno: null, V_ID: 'V012'
  },
];

// ============================================================
// TIMESLOTS
// ============================================================
const MOCK_TIMESLOTS = [
  { Slot_ID: 'TS001', EventDate: '2026-10-10', StartTime: '09:00', EndTime: '10:00', B_ID: 'B001' },
  { Slot_ID: 'TS002', EventDate: '2026-10-10', StartTime: '10:00', EndTime: '11:00', B_ID: 'B002' },
  { Slot_ID: 'TS003', EventDate: '2026-10-10', StartTime: '14:00', EndTime: '15:00', B_ID: 'B004' },
  { Slot_ID: 'TS004', EventDate: '2026-10-11', StartTime: '09:00', EndTime: '10:00', B_ID: 'B003' },
  { Slot_ID: 'TS005', EventDate: '2026-10-11', StartTime: '11:00', EndTime: '12:00', B_ID: 'B005' },
  { Slot_ID: 'TS006', EventDate: '2026-10-12', StartTime: '15:00', EndTime: '16:00', B_ID: 'B006' },
  { Slot_ID: 'TS007', EventDate: '2026-10-13', StartTime: '09:00', EndTime: '10:00', B_ID: 'B007' },
  { Slot_ID: 'TS008', EventDate: '2026-10-15', StartTime: '10:00', EndTime: '11:00', B_ID: 'B008' },
  { Slot_ID: 'TS009', EventDate: '2026-10-15', StartTime: '13:00', EndTime: '14:00', B_ID: 'B009' },
  { Slot_ID: 'TS010', EventDate: '2026-10-20', StartTime: '09:00', EndTime: '10:00', B_ID: 'B010' },
];

// ============================================================
// ADMIN APPROVALS
// ============================================================
const MOCK_APPROVALS = [
  {
    Ap_ID: 'AP001', Ap_Date: '2026-09-11',
    A_ID: 'ADM001', A_Name: 'Mr. Vijay Patil',
    A_Email: 'vijay.patil@college.edu',
    Decision: 'Approved',
    Remark: 'Approved. Please coordinate with the AV team 30 minutes before the event and ensure the hall is left clean after use.',
    B_ID: 'B001'
  },
  {
    Ap_ID: 'AP002', Ap_Date: '2026-09-19',
    A_ID: 'ADM001', A_Name: 'Mr. Vijay Patil',
    A_Email: 'vijay.patil@college.edu',
    Decision: 'Rejected',
    Remark: 'Venue is reserved for the Board of Studies meeting during this period. Please select an alternative date or venue.',
    B_ID: 'B003'
  },
  {
    Ap_ID: 'AP003', Ap_Date: '2026-09-21',
    A_ID: 'ADM002', A_Name: 'Ms. Deepa Nair',
    A_Email: 'deepa.nair@college.edu',
    Decision: 'Approved',
    Remark: 'Approved. Ensure all lab equipment is handled carefully and returned to its original position after the workshop.',
    B_ID: 'B004'
  },
  {
    Ap_ID: 'AP004', Ap_Date: '2026-09-28',
    A_ID: 'ADM001', A_Name: 'Mr. Vijay Patil',
    A_Email: 'vijay.patil@college.edu',
    Decision: 'Approved',
    Remark: 'Approved. Please report to the venue coordinator 15 minutes before the session.',
    B_ID: 'B007'
  },
  {
    Ap_ID: 'AP005', Ap_Date: '2026-09-29',
    A_ID: 'ADM002', A_Name: 'Ms. Deepa Nair',
    A_Email: 'deepa.nair@college.edu',
    Decision: 'Rejected',
    Remark: 'Outdoor venues require special permission from the Dean\'s office for events involving more than 25 participants. Please submit the Dean\'s approval form first.',
    B_ID: 'B010'
  },
];

// ============================================================
// NOTIFICATIONS
// ============================================================
const MOCK_NOTIFICATIONS = [
  {
    id: 'N001', type: 'success',
    message: 'Your booking B001 for Auditorium – Main Hall has been approved.',
    time: '2026-09-11T10:30:00', read: true, B_ID: 'B001', rno: 'S001', fno: null
  },
  {
    id: 'N002', type: 'info',
    message: 'Your booking B002 for Seminar Hall – Academic Block A is pending approval.',
    time: '2026-09-15T09:00:00', read: false, B_ID: 'B002', rno: 'S002', fno: null
  },
  {
    id: 'N003', type: 'danger',
    message: 'Your booking B003 for Seminar Hall – Academic Block B was rejected. Reason: Venue reserved for Board of Studies meeting.',
    time: '2026-09-19T14:00:00', read: false, B_ID: 'B003', rno: null, fno: 'F001'
  },
  {
    id: 'N004', type: 'success',
    message: 'Your booking B004 for Computer Lab 1 has been approved.',
    time: '2026-09-21T11:00:00', read: true, B_ID: 'B004', rno: null, fno: 'F002'
  },
  {
    id: 'N005', type: 'warning',
    message: 'Your booking B005 for Football Field has been cancelled.',
    time: '2026-09-22T16:00:00', read: true, B_ID: 'B005', rno: 'S003', fno: null
  },
  {
    id: 'N006', type: 'info',
    message: 'Your booking B006 for Mini Theatre is pending approval.',
    time: '2026-09-25T10:00:00', read: false, B_ID: 'B006', rno: 'S005', fno: null
  },
  {
    id: 'N007', type: 'success',
    message: 'Your booking B007 for Conference Room – Admin Block has been approved.',
    time: '2026-09-28T15:00:00', read: false, B_ID: 'B007', rno: null, fno: 'F003'
  },
  {
    id: 'N008', type: 'info',
    message: 'Your booking B008 for Auditorium – Main Hall is pending approval.',
    time: '2026-09-28T10:00:00', read: false, B_ID: 'B008', rno: 'S006', fno: null
  },
  {
    id: 'N009', type: 'info',
    message: 'Your booking B009 for Seminar Hall – Academic Block A is pending approval.',
    time: '2026-10-01T09:00:00', read: false, B_ID: 'B009', rno: 'S001', fno: null
  },
  {
    id: 'N010', type: 'danger',
    message: 'Your booking B010 was rejected. Reason: Outdoor venues require Dean\'s approval for large groups.',
    time: '2026-09-29T17:00:00', read: false, B_ID: 'B010', rno: 'S007', fno: null
  },
];

// ============================================================
// MOCK ADMIN USERS
// ============================================================
const MOCK_ADMINS = [
  {
    A_ID: 'ADM001', A_Name: 'Mr. Vijay Patil',
    A_Email: 'vijay.patil@college.edu',
    password: 'admin123', role: 'admin'
  },
  {
    A_ID: 'ADM002', A_Name: 'Ms. Deepa Nair',
    A_Email: 'deepa.nair@college.edu',
    password: 'admin123', role: 'admin'
  },
];

// ============================================================
// STANDARD TIME SLOTS (available for any booking)
// ============================================================
const STANDARD_TIMESLOTS = [
  { StartTime: '08:00', EndTime: '09:00', label: '08:00 – 09:00' },
  { StartTime: '09:00', EndTime: '10:00', label: '09:00 – 10:00' },
  { StartTime: '10:00', EndTime: '11:00', label: '10:00 – 11:00' },
  { StartTime: '11:00', EndTime: '12:00', label: '11:00 – 12:00' },
  { StartTime: '12:00', EndTime: '13:00', label: '12:00 – 13:00' },
  { StartTime: '13:00', EndTime: '14:00', label: '13:00 – 14:00' },
  { StartTime: '14:00', EndTime: '15:00', label: '14:00 – 15:00' },
  { StartTime: '15:00', EndTime: '16:00', label: '15:00 – 16:00' },
  { StartTime: '16:00', EndTime: '17:00', label: '16:00 – 17:00' },
  { StartTime: '17:00', EndTime: '18:00', label: '17:00 – 18:00' },
];

/**
 * Initialize localStorage with mock data if not already set.
 * This allows runtime modifications (new bookings, approvals, etc.)
 * to persist across page reloads during a demo session.
 */
function initMockData() {
  if (!localStorage.getItem('va_students'))     localStorage.setItem('va_students',     JSON.stringify(MOCK_STUDENTS));
  if (!localStorage.getItem('va_faculty'))      localStorage.setItem('va_faculty',      JSON.stringify(MOCK_FACULTY));
  if (!localStorage.getItem('va_venues'))       localStorage.setItem('va_venues',       JSON.stringify(MOCK_VENUES));
  if (!localStorage.getItem('va_bookings'))     localStorage.setItem('va_bookings',     JSON.stringify(MOCK_BOOKINGS));
  if (!localStorage.getItem('va_timeslots'))    localStorage.setItem('va_timeslots',    JSON.stringify(MOCK_TIMESLOTS));
  if (!localStorage.getItem('va_approvals'))    localStorage.setItem('va_approvals',    JSON.stringify(MOCK_APPROVALS));
  if (!localStorage.getItem('va_notifications'))localStorage.setItem('va_notifications',JSON.stringify(MOCK_NOTIFICATIONS));
  if (!localStorage.getItem('va_admins'))       localStorage.setItem('va_admins',       JSON.stringify(MOCK_ADMINS));
}

/** Reset all mock data back to defaults (useful for demo reset) */
function resetMockData() {
  localStorage.setItem('va_students',      JSON.stringify(MOCK_STUDENTS));
  localStorage.setItem('va_faculty',       JSON.stringify(MOCK_FACULTY));
  localStorage.setItem('va_venues',        JSON.stringify(MOCK_VENUES));
  localStorage.setItem('va_bookings',      JSON.stringify(MOCK_BOOKINGS));
  localStorage.setItem('va_timeslots',     JSON.stringify(MOCK_TIMESLOTS));
  localStorage.setItem('va_approvals',     JSON.stringify(MOCK_APPROVALS));
  localStorage.setItem('va_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
  localStorage.setItem('va_admins',        JSON.stringify(MOCK_ADMINS));
}

// Auto-initialize when this script loads
initMockData();
