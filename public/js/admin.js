// By Tiago
// Step 6: Connect the frontend to the backend using AJAX calls in admin.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Load Dashboard Stats (if on admin-dashboard.html)
  if (document.getElementById("stat-total-events")) {
    loadDashboardStats();
  }

  // 1a. Load Dashboard Event Summary (if on admin-dashboard.html)
  if (document.getElementById("dashboard-events-body")) {
    loadDashboardEvents();
  }

  // 2. Load Events Table (if on manage-events.html)
  if (document.getElementById("events-table-body")) {
    loadManageEventsTable();
  }

  // 3. Handle Create Event Form Submission (if on create-event.html)
  const createForm = document.getElementById("create-event-form");
  if (createForm) {
    createForm.addEventListener("submit", handleCreateEvent);
  }

  // 4. Load Attendance Management (if on attendance-management.html)
  if (document.getElementById("attendance-table-body")) {
    loadAttendanceEventsDropdown();

    const eventSelect = document.getElementById("attendance-event-select");
    if (eventSelect) {
      eventSelect.addEventListener("change", (e) => {
        const eventId = e.target.value;
        if (eventId) {
          loadAttendanceRegistrations(eventId);
        } else {
          document.getElementById("attendance-table-body").innerHTML = "";
        }
      });
    }
  }
});

function adminFetch(url, options = {}) {
  return fetch(url, { credentials: "include", ...options });
}

// Fetch Real-time Dashboard Analytics
async function loadDashboardStats() {
  try {
    const res = await adminFetch("/api/admin/dashboard");
    const result = await res.json();
    if (!result.success) {
      console.error("Dashboard stats error:", result.message);
      return;
    }

    // CORRECTED: The backend returns everything inside the "data" object
    const stats = result.data;
    if (!stats) return;

    if (document.getElementById("stat-total-events")) {
      document.getElementById("stat-total-events").textContent = stats.totalEvents;
    }
    if (document.getElementById("hero-total-events")) {
      document.getElementById("hero-total-events").textContent = stats.totalEvents;
    }
    if (document.getElementById("stat-total-registrations")) {
      document.getElementById("stat-total-registrations").textContent = stats.totalRegistrations;
    }
    if (document.getElementById("hero-total-registrations")) {
      document.getElementById("hero-total-registrations").textContent = stats.totalRegistrations;
    }
    if (document.getElementById("stat-cancelled-events")) {
      document.getElementById("stat-cancelled-events").textContent = stats.cancelledEvents;
    }
    if (document.getElementById("stat-full-events")) {
      document.getElementById("stat-full-events").textContent = stats.fullEvents;
    }
    if (document.getElementById("stat-attendance-rate")) {
      document.getElementById("stat-attendance-rate").textContent = stats.attendanceRate;
    }
    if (document.getElementById("hero-attendance-rate")) {
      document.getElementById("hero-attendance-rate").textContent = stats.attendanceRate;
    }
    if (document.getElementById("stat-popular-category")) {
      document.getElementById("stat-popular-category").textContent = stats.mostPopularCategory;
    }
  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
  }
}

async function loadDashboardEvents() {
  try {
    const res = await adminFetch("/api/admin/events");
    const result = await res.json();
    if (!result.success) {
      console.error("Dashboard events error:", result.message);
      return;
    }

    // CORRECTED: Use result.data
    const events = result.data || [];
    const tbody = document.getElementById("dashboard-events-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (events.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No events found.</td></tr>';
      return;
    }

    events.forEach((event) => {
      const status = event.status || 'Unknown';
      const statusClass = status.toLowerCase().replace(/\s+/g, '-');
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${event.title || 'Untitled Event'}</td>
        <td>${event.category_name || 'N/A'}</td>
        <td>${event.date || 'TBD'}</td>
        <td>${event.registration_count || 0} / ${event.capacity || 'N/A'}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td><button type="button" onclick="editEvent(${event.id})">Edit</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load dashboard events:", err);
  }
}

// Fetch and Render Events Table
async function loadManageEventsTable() {
  try {
    const res = await adminFetch("/api/admin/events");
    const result = await res.json();
    if (!result.success) {
      console.error("Manage events error:", result.message);
      return;
    }

    // CORRECTED: Use result.data
    const events = result.data || [];
    const tbody = document.getElementById("events-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (events.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No events found.</td></tr>';
      return;
    }

    events.forEach((event) => {
      const status = event.status || 'Open';
      const statusClass = status.toLowerCase().replace(/\s+/g, '-');
      const remainingSeats = event.remaining_seats !== undefined 
        ? event.remaining_seats 
        : (event.capacity - event.registration_count);
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${event.title || 'Untitled Event'}</td>
        <td>${event.category_name || 'Uncategorized'}</td>
        <td>${event.date || 'TBD'}</td>
        <td>${event.capacity || 'N/A'}</td>
        <td>${event.registration_count || 0}</td>
        <td>${remainingSeats}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>
          <button type="button" onclick="editEvent(${event.id})">Edit</button>
          <button type="button" onclick="toggleStatus(${event.id}, '${status}')">
            ${status === "Cancelled" || status === "Disabled" ? "Enable" : "Cancel"}
          </button>
          <button type="button" onclick="deleteEvent(${event.id})">Delete</button>
          <button type="button" onclick="viewRegistrations(${event.id})">Roster</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load events table:", err);
  }
}

// Submit New Event
async function handleCreateEvent(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());
  
  // Ensure status defaults to Open
  if (!payload.status) {
    payload.status = 'Open';
  }

  try {
    const res = await adminFetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success) {
      alert("Event created successfully!");
      window.location.href = "/views/manage-events.html";
    } else {
      alert("Error: " + (result.message || "Failed to create event"));
    }
  } catch (err) {
    console.error("Create event error:", err);
    alert("Error creating event: " + err.message);
  }
}

// Action Helpers
async function toggleStatus(eventId, currentStatus) {
  const newStatus = currentStatus === "Cancelled" || currentStatus === "Disabled" ? "Open" : "Cancelled";
  if (!confirm(`Change event status to ${newStatus}?`)) return;

  try {
    const res = await adminFetch(`/api/admin/events/${eventId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    const result = await res.json();
    
    if (result.success) {
      alert(result.message);
      loadManageEventsTable();
      loadDashboardEvents();
    } else {
      alert("Error: " + (result.message || "Failed to update status"));
    }
  } catch (err) {
    console.error("Toggle status error:", err);
    alert("Error updating status: " + err.message);
  }
}

async function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  try {
    const res = await adminFetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
    const result = await res.json();
    
    if (result.success) {
      alert("Event deleted successfully!");
      loadManageEventsTable();
    } else {
      alert("Error: " + (result.message || "Failed to delete event"));
    }
  } catch (err) {
    console.error("Delete event error:", err);
    alert("Error deleting event: " + err.message);
  }
}

function editEvent(eventId) {
  window.location.href = `/views/edit-event.html?id=${eventId}`;
}

function viewRegistrations(eventId) {
  window.location.href = `/views/view-registrations.html?id=${eventId}`;
}

// Load Events into Attendance Dropdown
async function loadAttendanceEventsDropdown() {
  try {
    const res = await adminFetch("/api/admin/events");
    const result = await res.json();
    if (!result.success) return;

    // CORRECTED: Use result.data
    const events = result.data || [];
    const select = document.getElementById("attendance-event-select");
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose an event --</option>';
    events.forEach((event) => {
      const option = document.createElement("option");
      option.value = event.id;
      option.textContent = `${event.title} (${event.date})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load events for attendance:", err);
  }
}

// Fetch Registrations for Selected Event
async function loadAttendanceRegistrations(eventId) {
  try {
    const res = await adminFetch(`/api/admin/events/${eventId}/registrations`);
    const result = await res.json();
    if (!result.success) {
      console.error("Registrations error:", result.message);
      return;
    }

    // CORRECTED: Use result.data
    const registrations = result.data || [];
    const tbody = document.getElementById("attendance-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (registrations.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No students registered for this event.</td></tr>';
      return;
    }

    registrations.forEach((reg) => {
      const statusClass = reg.attendance_status ? reg.attendance_status.toLowerCase() : "pending";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${reg.student_name || 'N/A'}</td>
        <td>${reg.student_email || 'N/A'}</td>
        <td>${reg.created_at || 'N/A'}</td>
        <td><span class="status-badge ${statusClass}">${reg.attendance_status || "Pending"}</span></td>
        <td>
          <button type="button" onclick="updateAttendance(${reg.id}, 'Attended', ${eventId})">Attended</button>
          <button type="button" onclick="updateAttendance(${reg.id}, 'Missed', ${eventId})">Missed</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load registrations:", err);
  }
}

// Submit Attendance Status Change
async function updateAttendance(registrationId, status, eventId) {
  try {
    const res = await adminFetch(`/api/admin/registrations/${registrationId}/attendance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceStatus: status })
    });
    const result = await res.json();
    
    if (result.success) {
      loadAttendanceRegistrations(eventId);
      if (window.location.pathname.endsWith('/view-registrations.html')) {
        loadViewRegistrationsPage();
      }
    } else {
      alert("Error: " + (result.message || "Failed to update attendance"));
    }
  } catch (err) {
    console.error("Failed to update attendance:", err);
    alert("Error updating attendance: " + err.message);
  }
}

let currentEditEventTitle = '';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadEventDetails(eventId) {
  if (!eventId) return null;
  try {
    const res = await adminFetch(`/api/admin/events`);
    const result = await res.json();
    if (!result.success) return null;
    
    // CORRECTED: Use result.data
    const events = result.data || [];
    return events.find(e => e.id === parseInt(eventId));
  } catch (err) {
    console.error("Error loading event details:", err);
    return null;
  }
}

async function loadEditEventPage() {
  const eventId = getQueryParam('id');
  if (!eventId) return;

  const event = await loadEventDetails(eventId);
  if (!event) {
    alert("Event not found");
    return;
  }

  currentEditEventTitle = event.title || '';
  const titleElem = document.getElementById('edit-event-title');
  if (titleElem) {
    titleElem.textContent = `Edit: ${currentEditEventTitle}`;
  }

  // Map database fields to form fields
  document.getElementById('title').value = event.title || '';
  document.getElementById('description').value = event.description || '';
  document.getElementById('category').value = event.category_name || '';
  document.getElementById('date').value = event.date || '';
  document.getElementById('startTime').value = event.start_time || '';
  document.getElementById('endTime').value = event.end_time || '';
  document.getElementById('location').value = event.location || '';
  document.getElementById('capacity').value = event.capacity || '';
  document.getElementById('status').value = event.status || 'Open';
}

async function handleEditEvent(e) {
  e.preventDefault();
  const eventId = getQueryParam('id');
  if (!eventId) return;

  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await adminFetch(`/api/admin/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success) {
      alert(`Event "${currentEditEventTitle}" updated successfully!`);
      window.location.href = '/views/manage-events.html';
    } else {
      alert('Error: ' + (result.message || "Failed to update event"));
    }
  } catch (err) {
    console.error('Edit event error:', err);
    alert("Error updating event: " + err.message);
  }
}

async function loadViewRegistrationsPage() {
  const eventId = getQueryParam('id');
  if (!eventId) return;

  const titleElem = document.getElementById('registrations-page-title');
  const event = await loadEventDetails(eventId);
  if (titleElem) {
    titleElem.textContent = event ? `Registrations for: ${event.title}` : 'Event Registration Roster';
  }

  try {
    const res = await adminFetch(`/api/admin/events/${eventId}/registrations`);
    const result = await res.json();
    if (!result.success) {
      console.error("View registrations error:", result.message);
      return;
    }

    // CORRECTED: Use result.data
    const registrations = result.data || [];
    const tbody = document.getElementById('registrations-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (registrations.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No students registered for this event.</td></tr>';
      return;
    }

    registrations.forEach((reg) => {
      const statusClass = reg.attendance_status ? reg.attendance_status.toLowerCase() : 'pending';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${reg.student_name || 'N/A'}</td>
        <td>${reg.student_email || 'N/A'}</td>
        <td>${reg.created_at || 'N/A'}</td>
        <td><span class="status-badge ${statusClass}">${reg.attendance_status || 'Pending'}</span></td>
        <td>
          <button type="button" onclick="updateAttendance(${reg.id}, 'Attended', ${eventId})">Attended</button>
          <button type="button" onclick="updateAttendance(${reg.id}, 'Missed', ${eventId})">Missed</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load registrations:", err);
  }
}

// Page-specific load hooks
const editForm = document.getElementById('edit-event-form');
if (editForm) {
  loadEditEventPage();
  editForm.addEventListener('submit', handleEditEvent);
}

const registrationsTableBody = document.getElementById('registrations-table-body');
if (registrationsTableBody && window.location.pathname.endsWith('/view-registrations.html')) {
  loadViewRegistrationsPage();
}
