/**
 * vAccess — app.js
 * Main application bootstrap.
 * Initializes shared UI components on every page.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  markActiveSidebarLink();
  initModalClose();
  updateNotifBadge();
  updateSidebarUser();
  updateTopbarUser();
});

/** Populate sidebar user info from session */
function updateSidebarUser() {
  const session = getSession();
  if (!session || !session.name) return;
  const nameEl   = document.querySelector('.sidebar-user-name');
  const roleEl   = document.querySelector('.sidebar-user-role');
  const avatarEl = document.querySelector('.sidebar-user-avatar');
  if (nameEl)   nameEl.textContent   = session.name;
  if (roleEl && session.role) roleEl.textContent = session.role.charAt(0).toUpperCase() + session.role.slice(1);
  if (avatarEl) avatarEl.textContent = getInitials(session.name);
}

/** Populate topbar user info if present */
function updateTopbarUser() {
  const session = getSession();
  if (!session || !session.name) return;
  const topbarName = document.querySelector('.topbar-user-name');
  if (topbarName) topbarName.textContent = session.name;
}
