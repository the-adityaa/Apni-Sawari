// script.js - Main application logic

// Theme functionality
function loadTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateThemeButtonIcon();
}

function toggleTheme() {
  const isDark = document.documentElement.hasAttribute('data-theme');
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
  updateThemeButtonIcon();
}

function updateThemeButtonIcon() {
  const themeToggleBtn = document.getElementById('themeToggle');
  if (!themeToggleBtn) return;
  const isDark = document.documentElement.hasAttribute('data-theme');
  themeToggleBtn.innerHTML = isDark ? `☀️ Light Mode` : `🌙 Dark Mode`;
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize everything
  loadTheme();
  checkExistingLogin();
  populateVehicles();  
  updateUI();
  addMyBookingsButton();

  // Event listeners
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('registerBtn').addEventListener('click', registerUser);
  document.getElementById('login-type').addEventListener('change', toggleLoginFields);
  
  // Theme toggle
  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Booking modal buttons
  const confirmBtn = document.getElementById('confirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmBooking);
  }

  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  // Modal close events
  document.querySelectorAll('.modal .close').forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        modal.classList.add('hidden');
      }
    });
  });

  // Overlay close
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', function() {
      document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
        modal.classList.add('hidden');
      });
      this.classList.add('hidden');
    });
  }

  const loginBtnHeader = document.getElementById('loginBtnHeader');
  if (loginBtnHeader) {

    loginBtnHeader.replaceWith(loginBtnHeader.cloneNode(true));
    

    document.getElementById('loginBtnHeader').addEventListener('click', function() {
      if (currentUser && userType === 'admin') {
        showAdminPanel(); 
      } else if (currentUser) {
        logout(); 
      } else {
        openLoginModal();
      }
    });
  }
});

// Make functions global for HTML onclick
window.openBookingModal = openBookingModal;
window.returnVehicle = returnVehicle;
window.showVehicleHistory = showVehicleHistory;
window.showAdminHistory = showAdminHistory;
window.showUserHistory = showUserHistory;
window.showAdminPanel = showAdminPanel;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.showRegistration = showRegistration;
window.closeRegisterModal = closeRegisterModal;
window.toggleLoginFields = toggleLoginFields;
window.logout = logout;