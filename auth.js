// auth.js - Authentication functions

const CREDENTIALS = {
  admin: {
    username: "admin",
    password: "admin123"
  },
  users: JSON.parse(localStorage.getItem('apni_sawari_users')) || {}
};

let currentUser = null;
let userType = null;

function toggleLoginFields() {
  const loginType = document.getElementById('login-type').value;
  const userFields = document.getElementById('user-fields');
  const adminFields = document.getElementById('admin-fields');
  const registerLink = document.getElementById('register-link');
  
  if (loginType === 'user') {
    userFields.style.display = 'block';
    adminFields.style.display = 'none';
    registerLink.style.display = 'block';
  } else {
    userFields.style.display = 'none';
    adminFields.style.display = 'block';
    registerLink.style.display = 'none';
  }
}

function showRegistration() {
  closeLoginModal();
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.add('active');
    modal.classList.remove('hidden');
  }
}

function closeRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  }
}

function registerUser() {
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  
  if (!name || !phone) {
    alert('Please enter name and phone number');
    return;
  }
  
  if (!/^[6-9]\d{9}$/.test(phone)) {
    alert('Please enter valid Indian phone number');
    return;
  }
  
  if (CREDENTIALS.users[phone]) {
    alert('User already registered with this phone number!');
    return;
  }
  
  CREDENTIALS.users[phone] = {
    name: name,
    email: email,
    phone: phone,
    registrationDate: new Date().toLocaleString(),
    bookings: []
  };
  
  localStorage.setItem('apni_sawari_users', JSON.stringify(CREDENTIALS.users));
  alert(`Registration successful! Welcome ${name}`);
  closeRegisterModal();
  openLoginModal();
}

function login() {
  const loginType = document.getElementById('login-type').value;
  
  if (loginType === 'user') {
    userLogin();
  } else {
    adminLogin();
  }
}

function userLogin() {
  const phone = document.getElementById('user-phone').value.trim();
  
  if (!phone) {
    alert('Please enter phone number');
    return;
  }
  
  const user = CREDENTIALS.users[phone];
  if (!user) {
    alert('User not found! Please register first.');
    return;
  }
  
  currentUser = user;
  userType = 'user';
  localStorage.setItem('current_user', JSON.stringify({ user, userType }));
  
  closeLoginModal();
  updateUI();
  
  populateVehicles();
  addMyBookingsButton();
  
  alert(`Welcome back ${user.name}!`);
}

function adminLogin() {
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value.trim();
  
  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }
  
  if (username === CREDENTIALS.admin.username && password === CREDENTIALS.admin.password) {
    currentUser = { name: 'Administrator', type: 'admin' };
    userType = 'admin';
    localStorage.setItem('current_user', JSON.stringify({ user: currentUser, userType }));
    
    closeLoginModal();
    updateUI();

    populateVehicles();
    addMyBookingsButton();
    
    alert('Admin login successful!');
  } else {
    alert('Invalid admin credentials!');
  }
}

function logout() {
  currentUser = null;
  userType = null;
  localStorage.removeItem('current_user');
  updateUI();
  
  populateVehicles();
  
  alert('Logged out successfully!');
}

function updateUI() {
  const loginBtn = document.getElementById('loginBtnHeader');
  
  if (currentUser) {
    if (userType === 'admin') {
      loginBtn.innerHTML = '🔓 Admin Panel';
      loginBtn.onclick = showAdminPanel; 
    } else {
      loginBtn.innerHTML = '👤 ' + currentUser.name;
      loginBtn.onclick = logout;
    }
    
    document.body.classList.remove('user-logged-in', 'admin-logged-in');
    if (userType === 'user') {
      document.body.classList.add('user-logged-in');
    } else {
      document.body.classList.add('admin-logged-in');
    }
    
  } else {
    loginBtn.innerHTML = '👤 Login';
    loginBtn.onclick = openLoginModal;
    document.body.classList.remove('user-logged-in', 'admin-logged-in');
  }
}

function checkExistingLogin() {
  const saved = localStorage.getItem('current_user');
  if (saved) {
    try {
      const { user, userType } = JSON.parse(saved);
      currentUser = user;
      userType = userType;
    } catch (e) {
      localStorage.removeItem('current_user');
    }
  }
  updateUI();
}

// Modal functions
function openLoginModal() {
  const modal = document.getElementById('loginModal');
  const overlay = document.getElementById('overlay');
  
  if (modal) {
    modal.classList.add('active');
    modal.classList.remove('hidden');
  }
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  const overlay = document.getElementById('overlay');
  
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  }
  if (overlay) {
    overlay.classList.add('hidden');
  }
  
  document.getElementById('user-phone').value = '';
  document.getElementById('admin-username').value = '';
  document.getElementById('admin-password').value = '';
}