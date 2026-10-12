/**
 * vAccess — api.js
 * Frontend-Only Client Data Service
 *
 * Provides a unified asynchronous interface over browser localStorage,
 * matching all ER Diagram entities:
 * - Student, Faculty, Venue, Booking, TimeSlot, Approval, Admin
 * Pure frontend execution with no external backend server requirement.
 */

(function (window) {
  'use strict';

  const vAccessAPI = {
    // ----------------------------------------------------
    // AUTHENTICATION
    // ----------------------------------------------------
    async login(email, password, role) {
      return new Promise(resolve => {
        setTimeout(() => {
          const res = mockLogin(email, password, role);
          resolve(res);
        }, 150);
      });
    },

    async register(data) {
      return new Promise(resolve => {
        setTimeout(() => {
          const res = mockRegister(data);
          resolve(res);
        }, 150);
      });
    },

    logout() {
      logout();
    },

    getSession() {
      return getSession();
    },

    // ----------------------------------------------------
    // VENUES (Entity: Venue)
    // ----------------------------------------------------
    async getVenues(filters = {}) {
      return new Promise(resolve => {
        resolve(filterVenues(filters));
      });
    },

    async getVenueById(vId) {
      return new Promise(resolve => {
        resolve(getVenueById(vId));
      });
    },

    async addVenue(venueData) {
      return new Promise(resolve => {
        resolve(addVenue(venueData));
      });
    },

    async updateVenue(vId, venueData) {
      return new Promise(resolve => {
        const venues = getVenues();
        const idx = venues.findIndex(v => v.V_ID === vId);
        if (idx !== -1) {
          venues[idx] = { ...venues[idx], ...venueData };
          localStorage.setItem('va_venues', JSON.stringify(venues));
          resolve(venues[idx]);
        } else {
          resolve(null);
        }
      });
    },

    async deleteVenue(vId) {
      return new Promise(resolve => {
        let venues = getVenues();
        venues = venues.filter(v => v.V_ID !== vId);
        localStorage.setItem('va_venues', JSON.stringify(venues));
        resolve(true);
      });
    },

    // ----------------------------------------------------
    // BOOKINGS & TIMESLOTS (Entities: Booking, TimeSlot)
    // ----------------------------------------------------
    async getBookings(filters = {}) {
      return new Promise(resolve => {
        resolve(filterBookings(filters));
      });
    },

    async getMyBookings() {
      return new Promise(resolve => {
        resolve(getMyBookings());
      });
    },

    async getBookingById(bId) {
      return new Promise(resolve => {
        resolve(getBookingById(bId));
      });
    },

    async createBooking(bookingData) {
      return new Promise(resolve => {
        resolve(createBooking(bookingData));
      });
    },

    async cancelBooking(bId) {
      return new Promise(resolve => {
        resolve(cancelBooking(bId));
      });
    },

    // ----------------------------------------------------
    // APPROVALS (Entity: Approval, Admin)
    // ----------------------------------------------------
    async approveBooking(bId, remark = '') {
      return new Promise(resolve => {
        resolve(approveBooking(bId, remark));
      });
    },

    async rejectBooking(bId, remark = '') {
      return new Promise(resolve => {
        resolve(rejectBooking(bId, remark));
      });
    },

    async getApprovals() {
      return new Promise(resolve => {
        resolve(getApprovals());
      });
    },

    // ----------------------------------------------------
    // NOTIFICATIONS
    // ----------------------------------------------------
    async getNotifications() {
      return new Promise(resolve => {
        resolve(getNotificationsForUser());
      });
    },

    // ----------------------------------------------------
    // DASHBOARD STATS
    // ----------------------------------------------------
    async getAdminDashboardStats() {
      return new Promise(resolve => {
        resolve(getAdminStats());
      });
    },

    async getStudentDashboardStats() {
      return new Promise(resolve => {
        resolve(getMyBookingStats());
      });
    }
  };

  window.vAccessAPI = vAccessAPI;

})(window);
