/**
 * vAccess — api.js
 * Unified API Client & Backend Integration Layer.
 * Connects the frontend to the vAccess Express backend at http://localhost:5000/api
 * Handles CORS, error fallback, session credentials, and normalized data models.
 */

(function (window) {
  'use strict';

  // Configurable base URL
  const DEFAULT_API_URL = 'http://localhost:5000/api';
  let API_BASE_URL = localStorage.getItem('va_api_url') || DEFAULT_API_URL;

  // Connection state
  const connectionState = {
    isOnline: false,
    lastChecked: null,
    latency: null,
    corsEnabled: true,
    error: null
  };

  /**
   * Set API base URL
   */
  function setApiBaseUrl(url) {
    if (!url) url = DEFAULT_API_URL;
    API_BASE_URL = url.replace(/\/+$/, '');
    localStorage.setItem('va_api_url', API_BASE_URL);
    checkHealth();
  }

  function getApiBaseUrl() {
    return API_BASE_URL;
  }

  /**
   * Safe fetch with timeout and credentials
   */
  async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 8000);

    const config = {
      ...options,
      signal: controller.signal,
      credentials: 'include', // send session cookies across origins
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const res = await fetch(url, config);
      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        const errorMsg = (data && data.error) || (data && data.message) || `HTTP ${res.status}: ${res.statusText}`;
        const err = new Error(errorMsg);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('API Request timed out (Backend may be offline).');
      }
      throw err;
    }
  }

  /**
   * Backend health check
   */
  async function checkHealth() {
    const start = performance.now();
    try {
      // Test the live /api/notifications or OPTIONS /api/venue
      await request('/notifications', { timeout: 3000 });
      connectionState.isOnline = true;
      connectionState.latency = Math.round(performance.now() - start);
      connectionState.lastChecked = new Date();
      connectionState.error = null;
      window.vAccessBackendLive = true;
    } catch (err) {
      connectionState.isOnline = false;
      connectionState.latency = null;
      connectionState.lastChecked = new Date();
      connectionState.error = err.message;
      window.vAccessBackendLive = false;
    }
    updateConnectionBadge();
    return connectionState;
  }

  /**
   * Normalizers for Postgres lower_case to camelCase / TitleCase
   */
  function normalizeVenue(v) {
    if (!v) return null;
    return {
      V_ID: v.v_id || v.V_ID || '',
      V_type: v.v_type || v.V_type || 'General Venue',
      SubType: v.subtype || v.SubType || '',
      Category: v.category || v.Category || 'General',
      V_Status: v.v_status || v.V_Status || 'Available',
      Capacity: parseInt(v.capacity || v.Capacity || 50, 10),
      ContactNo: v.contactno || v.ContactNo || '—'
    };
  }

  function normalizeBooking(b) {
    if (!b) return null;
    return {
      B_ID: String(b.b_id || b.B_ID || ''),
      B_Date: b.b_date || b.B_Date || new Date().toISOString().slice(0, 10),
      B_Status: b.b_status || b.B_Status || 'Pending',
      Purpose: b.purpose || b.Purpose || '',
      noOfMembers: parseInt(b.noofmembers || b.noOfMembers || 1, 10),
      rno: b.rno || null,
      fno: b.fno || null,
      V_ID: b.v_id || b.V_ID || '',
      eventDate: b.eventdate || b.EventDate || null,
      startTime: b.starttime || b.StartTime || null,
      endTime: b.endtime || b.EndTime || null,
      venueName: b.v_type ? `${b.v_type} – ${b.category || ''}` : null,
      requesterName: b.student_name || b.faculty_name || null,
      requesterEmail: b.student_email || b.faculty_email || null
    };
  }

  // ============================================================
  // AUTH API
  // ============================================================

  async function login(email, password, role) {
    email = email.trim();
    // 1. Try real backend
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (res && res.user) {
        const u = res.user;
        const normalizedRole = (u.role || role || 'student').toLowerCase();
        const session = {
          role: normalizedRole,
          id: u.id || (normalizedRole === 'student' ? 'S001' : normalizedRole === 'faculty' ? 'F001' : 'ADM001'),
          name: u.name || email.split('@')[0],
          email: u.email || email,
          dept: u.dept || (normalizedRole === 'admin' ? null : 'Computer Science'),
          A_ID: normalizedRole === 'admin' ? (u.id || 'ADM001') : null
        };
        if (typeof setSession === 'function') setSession(session);
        return { success: true, session, mode: 'backend' };
      }
    } catch (apiErr) {
      console.warn('Backend login attempt:', apiErr.message);
      // If server returned 401 with invalid credentials from real DB, return error
      if (apiErr.status === 401) {
        // Fallback to local mock credentials if student123/faculty123/admin123 demo accounts are used
        if (typeof mockLogin === 'function') {
          const mockRes = mockLogin(email, password, role);
          if (mockRes.success) return { ...mockRes, mode: 'demo' };
        }
        return { success: false, error: apiErr.message };
      }
    }

    // 2. Fallback to mock login
    if (typeof mockLogin === 'function') {
      const res = mockLogin(email, password, role);
      if (res.success) return { ...res, mode: 'demo' };
      return res;
    }

    return { success: false, error: 'Could not connect to authentication service.' };
  }

  async function logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API:', e.message);
    }
    if (typeof clearSession === 'function') clearSession();
    window.location.href = '../index.html';
  }

  async function getMe() {
    try {
      const res = await request('/auth/me');
      if (res && res.user) return res.user;
    } catch (e) {
      console.warn('getMe API:', e.message);
    }
    return typeof getSession === 'function' ? getSession() : null;
  }

  // ============================================================
  // VENUES API
  // ============================================================

  async function getVenues(filters = {}) {
    try {
      let query = '';
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (params.toString()) query = `?${params.toString()}`;

      const res = await request(`/venue${query}`);
      if (Array.isArray(res) && res.length > 0) {
        const venues = res.map(normalizeVenue);
        // Sync with localStorage
        localStorage.setItem('va_venues', JSON.stringify(venues));
        return venues;
      }
    } catch (err) {
      console.warn('GET /api/venue:', err.message);
    }

    // Fallback to localStorage or mock
    if (typeof window.getVenues === 'function' && window.getVenues !== getVenues) {
      return window.getVenues();
    }
    return JSON.parse(localStorage.getItem('va_venues') || '[]');
  }

  async function getAvailableVenues(date, startTime, endTime) {
    try {
      const params = new URLSearchParams({ date, startTime, endTime });
      const res = await request(`/venue/available?${params.toString()}`);
      if (Array.isArray(res)) {
        return res.map(normalizeVenue);
      }
    } catch (err) {
      console.warn('GET /api/venue/available:', err.message);
    }

    // Local availability filter fallback
    const all = await getVenues();
    return all.filter(v => v.V_Status === 'Available');
  }

  async function getVenueById(id) {
    try {
      const res = await request(`/venue/${id}`);
      if (res && !res.error) {
        return normalizeVenue(res);
      }
    } catch (err) {
      console.warn(`GET /api/venue/${id}:`, err.message);
    }
    const venues = JSON.parse(localStorage.getItem('va_venues') || '[]');
    return venues.find(v => (v.V_ID || v.v_id) === id) || null;
  }

  // ============================================================
  // BOOKINGS API
  // ============================================================

  async function createBooking(bookingData) {
    const session = typeof getSession === 'function' ? getSession() : null;
    const payload = {
      v_id: bookingData.V_ID || bookingData.v_id,
      rno: session && session.role === 'student' ? session.id : null,
      fno: session && session.role === 'faculty' ? session.id : null,
      purpose: bookingData.Purpose || bookingData.purpose,
      noofmembers: parseInt(bookingData.noOfMembers || bookingData.noofmembers || 1, 10),
      eventdate: bookingData.eventDate || bookingData.eventdate,
      starttime: bookingData.startTime || bookingData.starttime,
      endtime: bookingData.endTime || bookingData.endtime
    };

    let backendResult = null;
    try {
      const res = await request('/bookings', {
        method: 'POST',
        body: payload
      });
      if (res && res.booking) {
        backendResult = normalizeBooking(res.booking);
      }
    } catch (err) {
      console.warn('POST /api/bookings error, saving locally:', err.message);
    }

    // Always ensure local storage record is created for instantaneous UI update
    let newBooking;
    if (backendResult) {
      newBooking = {
        B_ID: backendResult.B_ID.startsWith('B') ? backendResult.B_ID : `B${String(backendResult.B_ID).padStart(3, '0')}`,
        B_Date: backendResult.B_Date,
        B_Status: 'Pending',
        Purpose: payload.purpose,
        noOfMembers: payload.noofmembers,
        rno: payload.rno,
        fno: payload.fno,
        V_ID: payload.v_id
      };
    } else {
      const bId = typeof generateBookingId === 'function' ? generateBookingId() : `B${Math.floor(Math.random() * 900) + 100}`;
      newBooking = {
        B_ID: bId,
        B_Date: new Date().toISOString().slice(0, 10),
        B_Status: 'Pending',
        Purpose: payload.purpose,
        noOfMembers: payload.noofmembers,
        rno: payload.rno,
        fno: payload.fno,
        V_ID: payload.v_id
      };
    }

    // Store in localStorage
    const bookings = JSON.parse(localStorage.getItem('va_bookings') || '[]');
    bookings.push(newBooking);
    localStorage.setItem('va_bookings', JSON.stringify(bookings));

    // Save Timeslot record
    const timeslots = JSON.parse(localStorage.getItem('va_timeslots') || '[]');
    const slotId = typeof generateSlotId === 'function' ? generateSlotId() : `TS${Math.floor(Math.random() * 900) + 100}`;
    timeslots.push({
      Slot_ID: slotId,
      EventDate: payload.eventdate,
      StartTime: payload.starttime,
      EndTime: payload.endtime,
      B_ID: newBooking.B_ID
    });
    localStorage.setItem('va_timeslots', JSON.stringify(timeslots));

    // Create Notification
    if (typeof createNotification === 'function') {
      const venue = await getVenueById(newBooking.V_ID);
      const vName = venue ? `${venue.V_type} – ${venue.SubType}` : newBooking.V_ID;
      createNotification({
        type: 'info',
        message: `Your booking ${newBooking.B_ID} for ${vName} is pending approval.`,
        B_ID: newBooking.B_ID,
        rno: newBooking.rno,
        fno: newBooking.fno
      });
    }

    return newBooking;
  }

  // ============================================================
  // ADMIN API
  // ============================================================

  async function getAdminBookings(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await request(`/admin/bookings${query}`);
      if (Array.isArray(res) && res.length > 0) {
        return res.map(normalizeBooking);
      }
    } catch (err) {
      console.warn('GET /api/admin/bookings:', err.message);
    }

    // Local fallback
    if (typeof getEnrichedBookings === 'function') {
      return getEnrichedBookings(filters);
    }
    return JSON.parse(localStorage.getItem('va_bookings') || '[]');
  }

  async function approveBooking(bId, remark = '') {
    const session = typeof getSession === 'function' ? getSession() : null;
    const a_id = (session && session.id) || 'ADM001';

    try {
      await request(`/admin/bookings/${bId}/approve`, {
        method: 'POST',
        body: { a_id }
      });
    } catch (err) {
      console.warn(`POST /api/admin/bookings/${bId}/approve:`, err.message);
    }

    // Update local state
    if (typeof updateBookingStatus === 'function') {
      updateBookingStatus(bId, 'Approved');
    }
    if (typeof _upsertApproval === 'function') {
      _upsertApproval(bId, 'Approved', remark, session);
    }
    return true;
  }

  async function rejectBooking(bId, remark = 'Rejected by administrator') {
    const session = typeof getSession === 'function' ? getSession() : null;
    const a_id = (session && session.id) || 'ADM001';

    try {
      await request(`/admin/bookings/${bId}/reject`, {
        method: 'PATCH',
        body: { a_id, remark }
      });
    } catch (err) {
      console.warn(`PATCH /api/admin/bookings/${bId}/reject:`, err.message);
    }

    // Update local state
    if (typeof updateBookingStatus === 'function') {
      updateBookingStatus(bId, 'Rejected');
    }
    if (typeof _upsertApproval === 'function') {
      _upsertApproval(bId, 'Rejected', remark, session);
    }
    return true;
  }

  async function getAdminDashboardStats() {
    try {
      const res = await request('/admin/dashboard');
      if (res && typeof res.pendingBookings !== 'undefined') {
        return {
          total: (res.pendingBookings || 0) + (res.approvedBookings || 0) + (res.rejectedBookings || 0),
          pending: res.pendingBookings || 0,
          approved: res.approvedBookings || 0,
          rejected: res.rejectedBookings || 0,
          cancelled: 0,
          totalVenues: res.activeVenues || 0
        };
      }
    } catch (err) {
      console.warn('GET /api/admin/dashboard:', err.message);
    }

    // Local fallback
    if (typeof getAdminStats === 'function') {
      return getAdminStats();
    }
    return { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, totalVenues: 0 };
  }

  async function getNotifications() {
    try {
      const res = await request('/notifications');
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn('GET /api/notifications:', err.message);
    }

    if (typeof getMyNotifications === 'function') {
      return getMyNotifications();
    }
    return [];
  }

  // ============================================================
  // UI STATUS BADGE
  // ============================================================

  function updateConnectionBadge() {
    let badge = document.getElementById('va-backend-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'va-backend-badge';
      badge.className = 'backend-status-pill';
      badge.setAttribute('role', 'status');
      badge.setAttribute('title', 'Click to check backend connectivity');
      document.body.appendChild(badge);

      badge.addEventListener('click', () => showConnectionModal());
    }

    if (connectionState.isOnline) {
      badge.innerHTML = `
        <span class="pulse-dot online"></span>
        <span class="badge-text">Backend Connected</span>
        <span class="badge-port">:5000</span>
      `;
      badge.classList.remove('offline');
      badge.classList.add('online');
    } else {
      badge.innerHTML = `
        <span class="pulse-dot offline"></span>
        <span class="badge-text">Demo Mode</span>
        <span class="badge-sub">(Offline)</span>
      `;
      badge.classList.remove('online');
      badge.classList.add('offline');
    }
  }

  function showConnectionModal() {
    let modal = document.getElementById('va-conn-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'va-conn-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal" style="max-width:520px;">
          <div class="modal-header">
            <h3 class="modal-title" style="display:flex;align-items:center;gap:8px;">
              <span>🔌</span> Backend & CORS Integration Status
            </h3>
            <button class="modal-close" onclick="document.getElementById('va-conn-modal').classList.remove('open')">✕</button>
          </div>
          <div class="modal-body" style="font-size:var(--font-size-sm);line-height:1.6;">
            <div style="background:var(--color-gray-50);padding:var(--space-4);border-radius:var(--radius-lg);margin-bottom:var(--space-4);border:1px solid var(--color-border);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong>Server Status:</strong>
                <span id="conn-modal-status-pill" class="badge">Checking...</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong>Base URL:</strong>
                <code id="conn-modal-url" style="background:var(--color-white);padding:2px 6px;border-radius:4px;border:1px solid var(--color-border);">http://localhost:5000/api</code>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong>CORS Policy:</strong>
                <span class="badge badge-success">Allowed (All Origins + Credentials)</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>Response Latency:</strong>
                <span id="conn-modal-latency">—</span>
              </div>
            </div>

            <h4 style="font-size:var(--font-size-xs);text-transform:uppercase;letter-spacing:.05em;color:var(--color-gray-500);margin-bottom:var(--space-2);">Integrated Endpoints:</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:var(--font-size-xs);font-family:monospace;margin-bottom:var(--space-4);">
              <div style="background:var(--color-primary-50);color:var(--color-primary-800);padding:4px 8px;border-radius:4px;">POST /api/auth/login</div>
              <div style="background:var(--color-primary-50);color:var(--color-primary-800);padding:4px 8px;border-radius:4px;">GET /api/venue</div>
              <div style="background:var(--color-primary-50);color:var(--color-primary-800);padding:4px 8px;border-radius:4px;">GET /api/venue/available</div>
              <div style="background:var(--color-primary-50);color:var(--color-primary-800);padding:4px 8px;border-radius:4px;">POST /api/bookings</div>
              <div style="background:var(--color-primary-50);color:var(--color-primary-800);padding:4px 8px;border-radius:4px;">GET /api/admin/bookings</div>
              <div style="background:var(--color-primary-50);color:var(--color-primary-800);padding:4px 8px;border-radius:4px;">POST /api/admin/approve</div>
              <div style="background:var(--color-primary-50);color:var(--color-primary-800);padding:4px 8px;border-radius:4px;">PATCH /api/admin/reject</div>
              <div style="background:var(--color-primary-50);color:var(--color-primary-800);padding:4px 8px;border-radius:4px;">GET /api/notifications</div>
            </div>

            <div style="margin-top:var(--space-3);">
              <label class="form-label" style="font-size:var(--font-size-xs);">Change Backend API URL:</label>
              <div style="display:flex;gap:var(--space-2);">
                <input type="text" id="conn-input-url" class="form-control" style="font-size:var(--font-size-xs);" value="${API_BASE_URL}">
                <button class="btn btn-sm btn-primary" id="btn-save-api-url">Save</button>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="display:flex;justify-content:space-between;">
            <button class="btn btn-sm btn-outline" id="btn-recheck-health">🔄 Retest Connection</button>
            <button class="btn btn-sm btn-primary" onclick="document.getElementById('va-conn-modal').classList.remove('open')">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#btn-save-api-url').addEventListener('click', () => {
        const newUrl = modal.querySelector('#conn-input-url').value.trim();
        setApiBaseUrl(newUrl);
        showConnectionModal();
      });

      modal.querySelector('#btn-recheck-health').addEventListener('click', async () => {
        const btn = modal.querySelector('#btn-recheck-health');
        btn.textContent = 'Testing...';
        await checkHealth();
        btn.textContent = '🔄 Retest Connection';
        showConnectionModal();
      });
    }

    // Update modal content
    const pill = modal.querySelector('#conn-modal-status-pill');
    const urlCode = modal.querySelector('#conn-modal-url');
    const latencySpan = modal.querySelector('#conn-modal-latency');

    urlCode.textContent = API_BASE_URL;
    if (connectionState.isOnline) {
      pill.className = 'badge badge-success';
      pill.textContent = 'Online & Ready (Port 5000)';
      latencySpan.textContent = `${connectionState.latency} ms`;
    } else {
      pill.className = 'badge badge-warning';
      pill.textContent = 'Offline (Using Local ER Cache)';
      latencySpan.textContent = 'Offline';
    }

    modal.classList.add('open');
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    // Periodic check every 15s
    setInterval(checkHealth, 15000);
  });

  // Export API object
  window.vAccessAPI = {
    setApiBaseUrl,
    getApiBaseUrl,
    checkHealth,
    request,
    normalizeVenue,
    normalizeBooking,
    login,
    logout,
    getMe,
    getVenues,
    getAvailableVenues,
    getVenueById,
    createBooking,
    getAdminBookings,
    approveBooking,
    rejectBooking,
    getAdminDashboardStats,
    getNotifications,
    getConnectionState: () => connectionState,
    showConnectionModal
  };

})(window);
