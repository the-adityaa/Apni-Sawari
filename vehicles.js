// vehicles.js - Vehicle data and functions

const STORAGE_KEY = 'rideeasy_vehicles_v2';

const defaultData = {
  premiumCars: [
    { id: 1, name: "Audi", price: 5500, image: "images/Cars/Audi.jpeg" },
    { id: 2, name: "Bugatti", price: 8500, image: "images/Cars/Bugatti.jpeg" },
    { id: 3, name: "Lamborghini", price: 7500, image: "images/Cars/Lamborghini.jpeg" },
    { id: 4, name: "Mercedes", price: 6500, image: "images/Cars/Mercedes.jpeg" },
    { id: 5, name: "Volvo", price: 2500, image: "images/Cars/Volvo.jpeg" },
    { id: 6, name: "Bmw", price: 2500, image: "images/Cars/Bmw.jpeg" },
  ],
  normalCars: [
    { id: 101, name: "Mahindra", price: 4500, image: "images/Cars/Mahindra.jpeg" },
    { id: 102, name: "Harrier", price: 4000, image: "images/Cars/Harrier.jpeg" },
    { id: 103, name: "Hyundai", price: 3500, image: "images/Cars/Hyundai.jpeg" },
    { id: 104, name: "Renault", price: 4000, image: "images/Cars/Renault.jpeg" },
    { id: 105, name: "Volkswagen", price: 3000, image: "images/Cars/Volkswagen.jpeg" },
    { id: 106, name: "Swift", price: 2500, image: "images/Cars/swift.jpeg" },
  ],
  premiumBikes: [
    { id: 201, name: "Bmw", price: 4000, image: "images/Bikes/bmw.jpeg" },
    { id: 202, name: "Bullet", price: 2500, image: "images/Bikes/bullet.jpeg" },
    { id: 203, name: "Harley Dividson", price: 3500, image: "images/Bikes/harley.jpeg" },
    { id: 204, name: "Himalyan", price: 3000, image: "images/Bikes/himalyan.jpeg" },
    { id: 205, name: "Hunter", price: 3000, image: "images/Bikes/hunter.jpeg" },
    { id: 206, name: "Ninja H2R", price: 3500, image: "images/Bikes/ninja.jpeg" },
  ],
  normalBikes: [
    { id: 301, name: "Tvs Apache", price: 3000, image: "images/Bikes/apache.jpeg" },
    { id: 302, name: "Honda Cb", price: 2500, image: "images/Bikes/hondacb.jpeg" },
    { id: 303, name: "Platina", price: 2000, image: "images/Bikes/platina.jpeg" },
    { id: 304, name: "Honda Shine", price: 2500, image: "images/Bikes/hondashine.jpeg" },
    { id: 305, name: "Pulsar", price: 2700, image: "images/Bikes/pulsar.jpeg" },
    { id: 306, name: "Tvs Sport", price: 1800, image: "images/Bikes/tvssport.jpeg" },
  ]
};

let vehicles = loadData();
let selectedVehicle = null;

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const list = [];
    for (const [category, arr] of Object.entries(defaultData)) {
      arr.forEach(v => list.push({
        ...v,
        category,
        type: v.id >= 200 && v.id < 400 ? 'bike' : 'car',
        available: true,
        currentRenter: '',
        rentStart: '',
        history: []
      }));
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse vehicles from storage, resetting.', e);
    localStorage.removeItem(STORAGE_KEY);
    return loadData();
  }
}

function saveData(list) {
  try {
    const compressedList = list.map(vehicle => ({
      ...vehicle,
      history: vehicle.history.slice(-10)
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compressedList));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      alert('Storage full! Old bookings will be cleared.');
      const trimmedList = list.map(vehicle => ({
        ...vehicle,
        history: vehicle.history.slice(-5)
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedList));
    }
  }
}

function findVehicleById(id) {
  id = Number(id);
  return vehicles.find(v => v.id === id) || null;
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

function generateVehicleCard(v) {
  const statusText = v.available ? 'Available' : `Rented by ${escapeHtml(v.currentRenter)}`;
  const rentBtnDisabled = v.available ? '' : 'disabled';
  const returnBtnDisabled = v.available ? 'disabled' : '';
  
  // ✅ Check if user is logged in for booking
  const canBook = currentUser && v.available;
  const bookButtonText = currentUser ? 'Book Now' : 'Login to Book';

  return `
    <div class="vehicle-card">
      <div class="card-top">
        <div>
          <img src="${escapeHtml(v.image)}" alt="${escapeHtml(v.name)}" class="vehicle-image" 
               onerror="this.src='https://via.placeholder.com/300x200/667eea/white?text=${escapeHtml(v.name)}'"/>
        </div>
      </div>
      <div class="vehicle-info">
        <h3 class="vehicle-name">${escapeHtml(v.name)}</h3>
        <span class="vehicle-type">${escapeHtml(v.type)}</span>
        <p class="vehicle-price">₹${v.price}/day</p>
        <p>Status: <strong>${statusText}</strong></p>
        
        <div class="card-actions">
          <!-- ✅ Updated Book Now button -->
          <button class="book-btn" onclick="openBookingModal(${v.id})" 
                  ${!canBook ? 'disabled' : ''} 
                  style="${!currentUser ? 'background: #ff9800;' : ''}">
            ${bookButtonText}
          </button>
          
          <button class="book-btn" onclick="returnVehicle(${v.id})" ${returnBtnDisabled}>
            Return
          </button>
          
          <!-- Public History Button -->
          <button class="book-btn" onclick="showVehicleHistory(${v.id})" style="background: #666;">
            📊 History
          </button>
          
          <!-- Admin History Button -->
          ${userType === 'admin' ? `
            <button class="book-btn admin-feature" onclick="showAdminHistory(${v.id})" style="background: #ff4444;">
              🔧 Admin History
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function updateVehicleButtons() {
  document.querySelectorAll('.vehicle-card .book-btn').forEach(btn => {
    if (btn.textContent.includes('Book')) {
      if (currentUser) {
        btn.disabled = false;
        btn.textContent = 'Book Now';
        btn.style.background = '';
      } else {
        btn.disabled = true;
        btn.textContent = 'Login to Book';
        btn.style.background = '#ff9800';
      }
    }
  });
}

function populateVehicles() {
  vehicles = loadData();
  const premiumCarsGrid = document.getElementById('premium-cars-grid');
  const normalCarsGrid = document.getElementById('normal-cars-grid');
  const premiumBikesGrid = document.getElementById('premium-bikes-grid');
  const normalBikesGrid = document.getElementById('normal-bikes-grid');

  if (!premiumCarsGrid || !normalCarsGrid || !premiumBikesGrid || !normalBikesGrid) {
    console.warn('One or more grid containers not found in DOM.');
    return;
  }

  premiumCarsGrid.innerHTML = vehicles.filter(v => v.category === 'premiumCars').map(generateVehicleCard).join('');
  normalCarsGrid.innerHTML = vehicles.filter(v => v.category === 'normalCars').map(generateVehicleCard).join('');
  premiumBikesGrid.innerHTML = vehicles.filter(v => v.category === 'premiumBikes').map(generateVehicleCard).join('');
  normalBikesGrid.innerHTML = vehicles.filter(v => v.category === 'normalBikes').map(generateVehicleCard).join('');
  
  // ✅ YEH NAYI LINE ADD KARO - Login status ke hisaab se buttons update karne ke liye
  updateVehicleButtons();
}

// Vehicle history for normal users (without personal info)
function showVehicleHistory(vehicleId) {
  const v = findVehicleById(vehicleId);
  if (!v) return alert('Vehicle not found');

  const hist = v.history || [];
  if (!hist.length) return alert('No booking history available for this vehicle.');

  let msg = `📊 Booking History for ${v.name}:\n\n`;
  
  // Statistics
  const totalBookings = hist.length;
  const completedBookings = hist.filter(h => h.rentEnd).length;
  const totalDaysRented = hist.reduce((sum, h) => sum + (h.days || 0), 0);
  
  msg += `📈 Statistics:\n`;
  msg += `• Total Times Rented: ${totalBookings}\n`;
  msg += `• Completed Bookings: ${completedBookings}\n`;
  msg += `• Total Days Rented: ${totalDaysRented} days\n\n`;
  
  // Recent activity (without personal info)
  const recent = hist.slice(-5).reverse();
  msg += `Recent Activity:\n`;
  recent.forEach((h, idx) => {
    const status = h.rentEnd ? '✅ Completed' : '🟢 Currently Rented';
    const duration = h.days ? `${h.days} days` : 'N/A';
    msg += `${idx + 1}. ${status} - ${duration}\n`;
  });

  alert(msg);
}

// User ke liye personal history function
function showUserHistory() {
  if (!currentUser || userType !== 'user') {
    alert('Please login as user to view your history');
    openLoginModal();
    return;
  }
  
  const userBookings = currentUser.bookings || [];
  
  if (userBookings.length === 0) {
    alert('You have no booking history yet!');
    return;
  }
  
  let historyHTML = `
    <div class="modal active" style="display: block; z-index: 10000;">
      <div class="modal-content" style="max-width: 600px;">
        <button class="close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        
        <h2>📋 My Booking History</h2>
        <p><strong>User:</strong> ${currentUser.name} (${currentUser.phone})</p>
        
        <div style="max-height: 400px; overflow-y: auto; margin: 15px 0;">
  `;
  
  userBookings.forEach((booking, index) => {
    const status = booking.returned ? '✅ Completed' : '🟢 Active';
    historyHTML += `
      <div class="user-history">
        <h4>${index + 1}. ${booking.vehicleName}</h4>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Booking Date:</strong> ${booking.bookingDate}</p>
        <p><strong>From:</strong> ${booking.fromDate} <strong>To:</strong> ${booking.toDate}</p>
        <p><strong>Duration:</strong> ${booking.days} days</p>
        <p><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
        ${booking.returnDate ? `<p><strong>Returned on:</strong> ${booking.returnDate}</p>` : ''}
      </div>
    `;
  });
  
  historyHTML += `
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="confirm-btn">
          Close
        </button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', historyHTML);
}

function addMyBookingsButton() {
  if (userType === 'user') {
    // Remove existing button if any
    const existingBtn = document.querySelector('.my-bookings-btn');
    if (existingBtn) existingBtn.remove();
    
    const header = document.querySelector('.header .nav');
    const myBookingsBtn = document.createElement('button');
    myBookingsBtn.className = 'theme-toggle my-bookings-btn';
    myBookingsBtn.innerHTML = '📋 My Bookings';
    myBookingsBtn.onclick = showUserHistory;
    myBookingsBtn.style.marginLeft = '10px';
    
    header.appendChild(myBookingsBtn);
  }
}

// Booking Modal Functions
function openBookingModal(vehicleId) {
  // ✅ Check if user is logged in
  if (!currentUser) {
    alert('Please login first to book a vehicle!');
    openLoginModal();
    return;
  }

  selectedVehicle = findVehicleById(vehicleId);
  if (!selectedVehicle) return alert('Vehicle not found');

  // Set minimum dates to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('rent-from').min = today;
  document.getElementById('rent-to').min = today;

  // Populate modal fields - Auto-fill user data if available
  document.getElementById('selected-vehicle').textContent = `${selectedVehicle.name} (${selectedVehicle.type})`;
  document.getElementById('price-per-day').textContent = selectedVehicle.price;
  document.getElementById('total-amount').textContent = '0';
  
  // ✅ Auto-fill user data if logged in as user
  if (userType === 'user') {
    document.getElementById('customer-name').value = currentUser.name;
    document.getElementById('contact-number').value = currentUser.phone;
  } else {
    document.getElementById('customer-name').value = '';
    document.getElementById('contact-number').value = '';
  }
  
  document.getElementById('rent-from').value = '';
  document.getElementById('rent-to').value = '';

  setupDateListeners();

  // Show modal
  const modal = document.getElementById('bookingModal');
  const overlay = document.getElementById('overlay');
  if (modal) {
    modal.classList.add('active');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

function closeModal() {
  selectedVehicle = null;
  const modal = document.getElementById('bookingModal');
  const overlay = document.getElementById('overlay');

  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

function setupDateListeners() {
  const from = document.getElementById('rent-from');
  const to = document.getElementById('rent-to');
  const totalEl = document.getElementById('total-amount');
  if (!from || !to || !totalEl) return;

  function updateTotal() {
    if (!selectedVehicle) return;
    const start = new Date(from.value);
    const end = new Date(to.value);

    if (!isNaN(start) && !isNaN(end) && end >= start) {
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const days = diff === 0 ? 1 : diff;
      totalEl.textContent = selectedVehicle.price * days;
    } else {
      totalEl.textContent = '0';
    }
  }

  from.onchange = updateTotal;
  to.onchange = updateTotal;
}

function confirmBooking() {
  // ✅ Double check if user is logged in
  if (!currentUser) {
    alert('Session expired! Please login again.');
    openLoginModal();
    return;
  }

  if (!selectedVehicle) return alert('No vehicle selected for booking.');

  // Loading state
  const confirmBtn = document.getElementById('confirmBtn');
  const originalText = confirmBtn.innerHTML;
  confirmBtn.innerHTML = 'Booking...';
  confirmBtn.disabled = true;

  setTimeout(() => {
    // Get form values
    const customerName = document.getElementById('customer-name').value.trim();
    const contact = document.getElementById('contact-number').value.trim();
    const fromDate = document.getElementById('rent-from').value;
    const toDate = document.getElementById('rent-to').value;

    // Validation
    if (!customerName) {
      alert('Please enter your name');
      confirmBtn.innerHTML = originalText;
      confirmBtn.disabled = false;
      return;
    }

    if (!/^[6-9]\d{9}$/.test(contact)) {
      alert('Please enter valid Indian phone number');
      confirmBtn.innerHTML = originalText;
      confirmBtn.disabled = false;
      return;
    }

    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (!fromDate || !toDate || d2 < d1 || d1 < today) {
      alert("Please select valid dates. 'From' date cannot be in past.");
      confirmBtn.innerHTML = originalText;
      confirmBtn.disabled = false;
      return;
    }

    // Find the actual vehicle
    const v = findVehicleById(selectedVehicle.id);
    if (!v) {
      alert('Vehicle not found');
      confirmBtn.innerHTML = originalText;
      confirmBtn.disabled = false;
      return;
    }
    if (!v.available) {
      alert('Vehicle already rented');
      confirmBtn.innerHTML = originalText;
      confirmBtn.disabled = false;
      return;
    }

    // Calculate rental days
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    const rentalDays = diff === 0 ? 1 : diff;
    const totalAmount = v.price * rentalDays;
    const rentStart = new Date().toLocaleString();

    // Update Vehicle State
    v.available = false;
    v.currentRenter = customerName;
    v.rentStart = rentStart;
    v.history = v.history || [];
    
    // ✅ FIX: Complete booking record create karo with return date as null
    const bookingRecord = {
      renter: customerName,
      contact: contact,
      rentStart: rentStart,
      rentEnd: null, // ✅ Yeh null rahega jab tak return na kare
      days: rentalDays,
      total: totalAmount,
      bookingDate: new Date().toLocaleString(), // ✅ Extra: Booking date bhi add karo
      fromDate: fromDate,
      toDate: toDate
    };
    
    v.history.push(bookingRecord);

    // Update user bookings if user is logged in
    if (currentUser && userType === 'user') {
      currentUser.bookings = currentUser.bookings || [];
      currentUser.bookings.push({
        vehicleName: v.name,
        vehicleType: v.type,
        bookingDate: rentStart,
        fromDate: fromDate,
        toDate: toDate,
        days: rentalDays,
        totalAmount: totalAmount,
        returned: false
      });
      // Update user in storage
      CREDENTIALS.users[currentUser.phone] = currentUser;
      localStorage.setItem('apni_sawari_users', JSON.stringify(CREDENTIALS.users));
    }

    saveData(vehicles);
    populateVehicles();
    closeModal();

    // Show Confirmation
    const confirmationDiv = document.getElementById('confirmation-message');
    if (confirmationDiv) {
      confirmationDiv.innerHTML = `
        <h3>🎉 Booking Confirmed!</h3>
        <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
        <p><strong>Vehicle:</strong> ${escapeHtml(v.name)}</p>
        <p><strong>Duration:</strong> ${rentalDays} day${rentalDays > 1 ? 's' : ''}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
        <p>Thank you for choosing Apni Sawari! We'll contact you shortly.</p>
      `;
      confirmationDiv.style.display = 'block';
      confirmationDiv.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => { confirmationDiv.style.display = 'none'; }, 10000);
    }

    confirmBtn.innerHTML = originalText;
    confirmBtn.disabled = false;
  }, 1000);
}

function returnVehicle(id) {
  const v = findVehicleById(id);
  if (!v) return alert('Vehicle not found');
  if (v.available) return alert('Vehicle not currently rented');

  // Find the last entry in history and mark it as returned
  const hist = v.history || [];
  let foundActiveBooking = false;
  
  for (let i = hist.length - 1; i >= 0; i--) {
    if (!hist[i].rentEnd) {
      // ✅ FIX: Proper return date set karo
      hist[i].rentEnd = new Date().toLocaleString();
      hist[i].actualReturnDate = new Date().toISOString().split('T')[0]; // ✅ Extra: Actual return date
      foundActiveBooking = true;
      
      // Update user booking if user is logged in
      if (currentUser && userType === 'user') {
        const userBooking = currentUser.bookings?.find(b => 
          b.vehicleName === v.name && !b.returned
        );
        if (userBooking) {
          userBooking.returned = true;
          userBooking.returnDate = new Date().toLocaleString();
          CREDENTIALS.users[currentUser.phone] = currentUser;
          localStorage.setItem('apni_sawari_users', JSON.stringify(CREDENTIALS.users));
        }
      }
      break;
    }
  }

  if (!foundActiveBooking) {
    alert('No active booking found to return!');
    return;
  }

  // Update vehicle state
  v.available = true;
  v.currentRenter = '';
  v.rentStart = '';

  saveData(vehicles);
  populateVehicles();

  // Show confirmation
  const confirmationDiv = document.getElementById('confirmation-message');
  if (confirmationDiv) {
    confirmationDiv.innerHTML = `<h3>Returned ${escapeHtml(v.name)} successfully.</h3>`;
    confirmationDiv.style.display = 'block';
    setTimeout(() => { 
      confirmationDiv.style.display = 'none'; 
      confirmationDiv.innerHTML = ''; 
    }, 4000);
  }
}