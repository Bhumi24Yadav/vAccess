/**
 * vAccess — admin.js
 * Admin-specific logic: approval workflow, admin data access.
 *
 * REPLACE localStorage calls with fetch() API calls when integrating backend.
 */

// ============================================================
// APPROVAL CRUD
// ============================================================

/**
 * Get all admin approvals.
 * REPLACE: return await fetch('/api/approvals').then(r => r.json())
 */
function getApprovals() {
  return JSON.parse(localStorage.getItem('va_approvals') || '[]');
}

/**
 * Get the approval record for a specific booking.
 * REPLACE: return await fetch(`/api/approvals?bookingId=${bId}`).then(r => r.json())
 */
function getApprovalForBooking(bId) {
  return getApprovals().find(a => a.B_ID === bId) || null;
}

/**
 * Approve a booking.
 * Creates an approval record, updates booking status, and sends notification.
 *
 * REPLACE with:
 *   await fetch(`/api/bookings/${bId}/approve`, { method: 'POST', body: JSON.stringify({ remark }) })
 */
function approveBooking(bId, remark = '') {
  const session = getSession();
  if (!session || session.role !== 'admin') return false;

  const booking = getBookingById(bId);
  if (!booking) return false;

  // Update booking status
  updateBookingStatus(bId, 'Approved');

  // Create/update approval record
  _upsertApproval(bId, 'Approved', remark, session);

  // Notify requester
  const venue = getVenueById(booking.V_ID);
  const remarkNote = remark ? ` Remark: "${remark}"` : '';
  createNotification({
    type:    'success',
    message: `Your booking ${bId} for ${getVenueDisplayName(venue)} has been approved.${remarkNote}`,
    B_ID:    bId,
    rno:     booking.rno,
    fno:     booking.fno,
  });

  return true;
}

/**
 * Reject a booking.
 * Creates an approval record, updates booking status, and sends notification.
 *
 * REPLACE with:
 *   await fetch(`/api/bookings/${bId}/reject`, { method: 'POST', body: JSON.stringify({ remark }) })
 */
function rejectBooking(bId, remark = '') {
  const session = getSession();
  if (!session || session.role !== 'admin') return false;

  const booking = getBookingById(bId);
  if (!booking) return false;

  // Update booking status
  updateBookingStatus(bId, 'Rejected');

  // Create/update approval record
  _upsertApproval(bId, 'Rejected', remark, session);

  // Notify requester
  const venue = getVenueById(booking.V_ID);
  const remarkNote = remark ? ` Reason: "${remark}"` : '';
  createNotification({
    type:    'danger',
    message: `Your booking ${bId} for ${getVenueDisplayName(venue)} was rejected.${remarkNote}`,
    B_ID:    bId,
    rno:     booking.rno,
    fno:     booking.fno,
  });

  return true;
}

/** Internal: create or update an approval record */
function _upsertApproval(bId, decision, remark, session) {
  const approvals = getApprovals();
  const existing  = approvals.findIndex(a => a.B_ID === bId);
  const record = {
    Ap_ID:    existing >= 0 ? approvals[existing].Ap_ID : generateApprovalId(),
    Ap_Date:  today(),
    A_ID:     session.id,
    A_Name:   session.name,
    A_Email:  session.email,
    Decision: decision,
    Remark:   remark,
    B_ID:     bId,
  };
  if (existing >= 0) {
    approvals[existing] = record;
  } else {
    approvals.push(record);
  }
  localStorage.setItem('va_approvals', JSON.stringify(approvals));
}

// ============================================================
// ADMIN STATISTICS
// ============================================================

/** Get dashboard statistics for the admin view */
function getAdminStats() {
  const venues   = getVenues();
  const stats    = getAllBookingStats();
  return {
    ...stats,
    availableVenues: venues.filter(v => v.V_Status === 'Available').length,
    totalVenues:     venues.length,
    bookedVenues:    venues.filter(v => v.V_Status === 'Booked').length,
    maintenanceVenues: venues.filter(v => v.V_Status === 'Maintenance').length,
  };
}

// ============================================================
// ADMIN BOOKING LIST WITH ENRICHED DATA
// ============================================================

/**
 * Get all bookings enriched with requester, venue, and timeslot info.
 * Used by admin booking list page.
 */
function getEnrichedBookings(filters = {}) {
  const bookings = filterBookings({ ...filters });
  return bookings.map(b => {
    const venue    = getVenueById(b.V_ID);
    const requester = getRequesterInfo(b);
    const slots    = getTimeslotsForBooking(b.B_ID);
    const approval = getApprovalForBooking(b.B_ID);
    return {
      ...b,
      venue,
      venueName:    venue ? getVenueDisplayName(venue) : 'Unknown',
      requester,
      slots,
      approval,
      eventDate:    slots.length ? slots[0].EventDate : null,
      timeRange:    slots.length ? `${formatTime(slots[0].StartTime)} – ${formatTime(slots[0].EndTime)}` : '—',
    };
  });
}
