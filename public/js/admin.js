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

// Fetch Real-time Dashboard Analytics
async function loadDashboardStats() {
  try {
    const res = await fetch("/api/admin/dashboard");
    const result = await res.json();
    if (!result.success) return;

    const stats = result.data;
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
    const res = await fetch("/api/admin/events");
    const result = await res.json();
    if (!result.success) return;

    const tbody = document.getElementById("dashboard-events-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (result.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No events found for this organizer.</td></tr>';
      return;
    }

    result.data.forEach((event) => {
      const status = event.status || 'Unknown';
      const statusClass = status.toLowerCase().replace(/\s+/g, '-');
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${event.title || 'Untitled Event'}</td>
        <td>${event.organizer || 'N/A'}</td>
        <td>${event.date || 'TBD'}</td>
        <td>${event.registered_count || 0} / ${event.capacity || 'N/A'}</td>
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
    const res = await fetch("/api/admin/events");
    const result = await res.json();
    if (!result.success) return;

    const tbody = document.getElementById("events-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    result.data.forEach((event) => {
      const status = event.status || 'Unknown';
      const statusClass = status.toLowerCase().replace(/\s+/g, '-');
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${event.title || 'Untitled Event'}</td>
        <td>${event.category || 'Uncategorized'}</td>
        <td>${event.date || 'TBD'}</td>
        <td>${event.registered_count || 0} / ${event.capacity || 'N/A'}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>
          <button type="button" onclick="editEvent(${event.id})">Edit</button>
          <button type="button" onclick="toggleStatus(${event.id}, '${status}')">
            ${status === "Cancelled" ? "Enable" : "Cancel"}
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
  if (!payload.status) {
    payload.status = 'Active';
  }

  try {
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success) {
      alert("Event created successfully!");
      window.location.href = "/views/manage-events.html";
    } else {
      alert("Error: " + result.message);
    }
  } catch (err) {
    console.error("Create event error:", err);
  }
}

// Action Helpers
async function toggleStatus(eventId, currentStatus) {
  const newStatus = currentStatus === "Cancelled" ? "Active" : "Cancelled";
  if (!confirm(`Change event status to ${newStatus}?`)) return;

  const res = await fetch(`/api/admin/events/${eventId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus })
  });
  const result = await res.json();
  if (result.success) {
    loadManageEventsTable();
  } else {
    alert(result.message);
  }
}

async function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  const res = await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
  const result = await res.json();
  if (result.success) {
    loadManageEventsTable();
  } else {
    alert(result.message);
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
    const res = await fetch("/api/admin/events");
    const result = await res.json();
    if (!result.success) return;

    const select = document.getElementById("attendance-event-select");
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose an event --</option>';
    result.data.forEach((event) => {
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
    const res = await fetch(`/api/admin/events/${eventId}/registrations`);
    const result = await res.json();
    if (!result.success) return;

    const tbody = document.getElementById("attendance-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (result.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No students registered for this event.</td></tr>';
      return;
    }

    result.data.forEach((reg) => {
      const statusClass = reg.attendanceStatus ? reg.attendanceStatus.toLowerCase() : "pending";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${reg.studentName}</td>
        <td>${reg.studentEmail}</td>
        <td>${reg.registrationDate}</td>
        <td><span class="status-badge ${statusClass}">${reg.attendanceStatus || "Pending"}</span></td>
        <td>
          <button onclick="updateAttendance('${reg.registrationId}', 'Attended', ${eventId})">Attended</button>
          <button onclick="updateAttendance('${reg.registrationId}', 'Missed', ${eventId})">Missed</button>
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
    const res = await fetch(`/api/admin/registrations/${registrationId}/attendance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceStatus: status })
    });
    const result = await res.json();
    
    if (result.success) {
      loadAttendanceRegistrations(eventId);
      loadViewRegistrationsPage();
    } else {
      alert(result.message);
    }
  } catch (err) {
    console.error("Failed to update attendance:", err);
  }
}

let currentEditEventTitle = '';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadEventDetails(eventId) {
  if (!eventId) return null;
  const res = await fetch(`/api/admin/events/${eventId}`);
  const result = await res.json();
  return result.success ? result.data : null;
}

async function loadEditEventPage() {
  const eventId = getQueryParam('id');
  if (!eventId) return;

  const event = await loadEventDetails(eventId);
  if (!event) return;

  currentEditEventTitle = event.title || '';
  const titleElem = document.getElementById('edit-event-title');
  if (titleElem) {
    titleElem.textContent = `Edit: ${currentEditEventTitle}`;
  }

  document.getElementById('title').value = currentEditEventTitle;
  document.getElementById('description').value = event.description || '';
  document.getElementById('category').value = event.category || '';
  document.getElementById('date').value = event.date || '';
  document.getElementById('startTime').value = event.startTime || '';
  document.getElementById('endTime').value = event.endTime || '';
  document.getElementById('location').value = event.location || '';
  document.getElementById('capacity').value = event.capacity || '';

  const statusValue = event.status === 'Open' ? 'Active' : event.status;
  document.getElementById('status').value = statusValue || 'Active';
}

async function handleEditEvent(e) {
  e.preventDefault();
  const eventId = getQueryParam('id');
  if (!eventId) return;

  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(`/api/admin/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success) {
      alert(`Event "${currentEditEventTitle}" updated successfully!`);
      window.location.href = '/views/manage-events.html';
    } else {
      alert('Error: ' + result.message);
    }
  } catch (err) {
    console.error('Edit event error:', err);
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

  const res = await fetch(`/api/admin/events/${eventId}/registrations`);
  const result = await res.json();
  if (!result.success) return;

  const tbody = document.getElementById('registrations-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (result.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No students registered for this event.</td></tr>';
    return;
  }

  result.data.forEach((reg) => {
    const statusClass = reg.attendanceStatus ? reg.attendanceStatus.toLowerCase() : 'pending';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${reg.studentName}</td>
      <td>${reg.studentEmail}</td>
      <td>${reg.registrationDate}</td>
      <td><span class="status-badge ${statusClass}">${reg.attendanceStatus || 'Pending'}</span></td>
      <td>
        <button onclick="updateAttendance('${reg.registrationId}', 'Attended', ${eventId})">Attended</button>
        <button onclick="updateAttendance('${reg.registrationId}', 'Missed', ${eventId})">Missed</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
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
