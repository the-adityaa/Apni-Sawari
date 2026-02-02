function showAdminPanel() {
  if (!currentUser || userType !== 'admin') {
    openLoginModal();
    return;
  }
  
  const totalBookings = vehicles.reduce((sum, v) => sum + (v.history?.length || 0), 0);
  const currentRentals = vehicles.filter(v => !v.available).length;
  const totalRevenue = vehicles.reduce((sum, v) => {
    return sum + (v.history?.reduce((rev, h) => rev + (h.total || 0), 0) || 0);
  }, 0);
  
  let adminHTML = `
    <div class="modal active" style="display: block; z-index: 10000;">
      <div class="modal-content" style="max-width: 600px;">
        <button class="close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        
        <h2>🚗 Admin Control Panel</h2>
        
        <div class="admin-panel">
          <h3>📊 Statistics</h3>
          <p><strong>Total Vehicles:</strong> ${vehicles.length}</p>
          <p><strong>Current Rentals:</strong> ${currentRentals}</p>
          <p><strong>Total Bookings:</strong> ${totalBookings}</p>
          <p><strong>Total Revenue:</strong> ₹${totalRevenue}</p>
        </div>
        
        <div class="admin-panel">
          <h3>⚙️ Management Actions</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
            <button class="book-btn" onclick="deleteAllHistory()" style="background: #ff4444;">
              🗑️ Clear All History
            </button>
            <button class="book-btn" onclick="deleteSpecificVehicleHistory()" style="background: #ff8800;">
              🚗 Clear Vehicle History
            </button>
            <button class="book-btn" onclick="showAllBookings()" style="background: #0099cc;">
              📋 View All Bookings
            </button>
            <button class="book-btn" onclick="exportData()" style="background: #00aa00;">
              📤 Export Data
            </button>
          </div>
        </div>
        
        <div class="admin-panel">
          <h3>🎯 Quick Vehicle Management</h3>
          <div style="max-height: 200px; overflow-y: auto; margin: 10px 0;">
            ${vehicles.map((v, index) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #ddd;">
                <span>${v.name} - ${v.available ? '✅ Available' : '❌ Rented by ' + v.currentRenter}</span>
                <button onclick="forceReturnVehicle(${v.id})" class="book-btn" style="padding: 4px 8px; font-size: 0.8rem; ${v.available ? 'display: none;' : ''}">
                  Force Return
                </button>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="modal-buttons" style="display:flex;gap:12px;margin-top:20px;">
          <button onclick="logout()" class="cancel-btn" style="background: #666;">
            🚪 Logout
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="confirm-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', adminHTML);
}

function showAdminHistory(vehicleId) {
  if (!currentUser || userType !== 'admin') {
    openLoginModal();
    return;
  }

  const v = findVehicleById(vehicleId);
  if (!v) return alert('Vehicle not found');

  const hist = v.history || [];
  if (!hist.length) return alert('No history available for this vehicle.');

  let msg = `🔧 ADMIN - Complete History for ${v.name}:\n\n`;
  hist.forEach((h, idx) => {
    const returnStatus = h.rentEnd ? `✅ Returned on: ${h.rentEnd}` : '🟢 Currently Rented';
    
    msg += `${idx + 1}) Renter: ${h.renter} (${h.contact || '-'})\n`;
    msg += `   Booking Date: ${h.bookingDate || h.rentStart}\n`;
    msg += `   Rental Period: ${h.fromDate} to ${h.toDate}\n`;
    msg += `   ${returnStatus}\n`;
    msg += `   Days: ${h.days || '-'}\n`;
    msg += `   Total: ₹${h.total || '-'}\n`;
    msg += `   [DELETE: Type ${idx + 1}]\n\n`;
  });

  const userInput = prompt(msg + "Enter number to delete (or Cancel):");
  if (userInput) {
    const indexToDelete = parseInt(userInput) - 1;
    if (indexToDelete >= 0 && indexToDelete < hist.length) {
      deleteBookingHistory(vehicleId, indexToDelete);
    }
  }
}

function deleteBookingHistory(vehicleId, historyIndex) {
  const v = findVehicleById(vehicleId);
  if (!v) return alert('Vehicle not found');
  
  if (v.history && v.history[historyIndex]) {
    if (confirm('Delete this booking record?')) {
      v.history.splice(historyIndex, 1);
      saveData(vehicles);
      alert('Booking record deleted!');
      showAdminPanel();
    }
  }
}

function forceReturnVehicle(vehicleId) {
  const v = findVehicleById(vehicleId);
  if (!v) return;
  
  if (confirm(`Force return ${v.name}? Current renter: ${v.currentRenter}`)) {
    const hist = v.history || [];
    let foundActive = false;
    
    for (let i = hist.length - 1; i >= 0; i--) {
      if (!hist[i].rentEnd) {
        hist[i].rentEnd = new Date().toLocaleString();
        hist[i].notes = '(Force returned by admin)';
        foundActive = true;
        break;
      }
    }
    
    if (!foundActive) {
      alert('No active booking found!');
      return;
    }
    
    v.available = true;
    v.currentRenter = '';
    v.rentStart = '';
    
    saveData(vehicles);
    populateVehicles();
    alert('Vehicle force returned!');
    showAdminPanel();
  }
}

function deleteAllHistory() {
  if (confirm('DELETE ALL booking history? This cannot be undone!')) {
    vehicles.forEach(vehicle => {
      vehicle.history = [];
      vehicle.available = true;
      vehicle.currentRenter = '';
      vehicle.rentStart = '';
    });
    saveData(vehicles);
    populateVehicles();
    alert('All history deleted!');
    showAdminPanel();
  }
}

function deleteSpecificVehicleHistory() {
  let vehicleList = 'Select vehicle to clear history:\n\n';
  vehicles.forEach((v, index) => {
    vehicleList += `${index + 1}. ${v.name} (${v.history?.length || 0} bookings)\n`;
  });
  
  const choice = prompt(vehicleList + '\nEnter number:');
  const index = parseInt(choice) - 1;
  
  if (index >= 0 && index < vehicles.length) {
    if (confirm(`Clear all history of ${vehicles[index].name}?`)) {
      vehicles[index].history = [];
      vehicles[index].available = true;
      vehicles[index].currentRenter = '';
      vehicles[index].rentStart = '';
      saveData(vehicles);
      populateVehicles();
      alert('Vehicle history cleared!');
      showAdminPanel();
    }
  }
}

function showAllBookings() {
  let allBookings = [];
  vehicles.forEach(vehicle => {
    if (vehicle.history) {
      vehicle.history.forEach(booking => {
        allBookings.push({
          vehicle: vehicle.name,
          vehicleType: vehicle.type,
          ...booking
        });
      });
    }
  });
  
  if (allBookings.length === 0) {
    alert('No bookings found!');
    return;
  }
  
  allBookings.sort((a, b) => new Date(b.bookingDate || b.rentStart) - new Date(a.bookingDate || a.rentStart));
  
  let message = `📋 ALL BOOKINGS (${allBookings.length})\n\n`;
  allBookings.forEach((booking, index) => {
    const status = booking.rentEnd ? '✅ RETURNED' : '🟢 ACTIVE';
    message += `${index + 1}. ${booking.vehicle} (${booking.vehicleType})\n`;
    message += `   👤 ${booking.renter} (${booking.contact || 'No contact'})\n`;
    message += `   📅 ${booking.fromDate} to ${booking.toDate}\n`;
    message += `   📋 Booked: ${booking.bookingDate || booking.rentStart}\n`;
    message += `   ${status} ${booking.rentEnd ? `on ${booking.rentEnd}` : ''}\n`;
    message += `   💰 ₹${booking.total || 'N/A'}\n\n`;
  });
  
  console.log('All Bookings:', allBookings);
  alert(message);
}

function exportData() {
  const dataStr = JSON.stringify({
    vehicles: vehicles,
    users: CREDENTIALS.users,
    exportDate: new Date().toLocaleString()
  }, null, 2);
  
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `apni-sawari-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  alert('Data exported successfully!');
}