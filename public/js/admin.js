// Admin frontend — connects admin pages to backend APIs

document.addEventListener("DOMContentLoaded", () => {
  initAdminLogout();

  if (document.getElementById("stat-total-events")) {
    loadDashboardStats();
  }

  if (document.getElementById("dashboard-events-body")) {
    loadDashboardEvents();
  }

  if (document.getElementById("registrations-by-category-body")) {
    loadDashboardStats();
  }

  if (document.getElementById("events-table-body")) {
    loadManageEventsTable();
    initManageEventsFilter();
  }

  const createForm = document.getElementById("create-event-form");
  if (createForm) {
    createForm.addEventListener("submit", handleCreateEvent);
  }

  if (document.getElementById("attendance-table-body")) {
    loadAttendanceEventsDropdown();

    const eventSelect = document.getElementById("attendance-event-select");
    if (eventSelect) {
      eventSelect.addEventListener("change", (e) => {
        const eventId = e.target.value;
        if (eventId) {
          loadAttendanceRegistrations(eventId);
        } else {
          document.getElementById("attendance-table-body").innerHTML =
            '<tr><td colspan="5" style="text-align:center;">Select an event to load attendance records.</td></tr>';
        }
      });
    }
  }

  const editForm = document.getElementById("edit-event-form");
  if (editForm) {
    loadEditEventPage();
    editForm.addEventListener("submit", handleEditEvent);
  }

  if (
    document.getElementById("registrations-table-body") &&
    window.location.pathname.includes("view-registrations")
  ) {
    loadViewRegistrationsPage();
  }
});

function adminFetch(url, options = {}) {
  return fetch(url, { credentials: "include", ...options });
}

function initAdminLogout() {
  document.querySelectorAll(".admin-logout").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await adminFetch("/api/auth/logout", { method: "POST" });
      } catch (err) {
        console.error("Logout error:", err);
      }
      window.location.href = "/login";
    });
  });
}

function statusClass(status) {
  return (status || "unknown").toLowerCase().replace(/\s+/g, "-");
}

function calcRemainingSeats(event) {
  if (event.remaining_seats !== undefined) return event.remaining_seats;
  return (event.capacity || 0) - (event.registration_count || 0);
}

function calcSeatsFilledPercent(event) {
  if (!event.capacity) return "0%";
  const count = event.registration_count || 0;
  return `${Math.round((count / event.capacity) * 100)}%`;
}

function getEventId(event) {
  return event?.id ?? event?.event_id;
}

function isValidEventId(eventId) {
  const parsed = Number(eventId);
  return Number.isInteger(parsed) && parsed > 0;
}

async function loadDashboardStats() {
  try {
    const res = await adminFetch("/api/admin/dashboard");
    const result = await res.json();
    if (!result.success) {
      console.error("Dashboard stats error:", result.message);
      return;
    }

    const stats = result.data;
    if (!stats) return;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setText("stat-total-events", stats.totalEvents);
    setText("hero-total-events", stats.totalEvents);
    setText("stat-total-registrations", stats.totalRegistrations);
    setText("hero-total-registrations", stats.totalRegistrations);
    setText("stat-cancelled-events", stats.cancelledEvents);
    setText("stat-full-events", stats.fullEvents);
    setText("stat-upcoming-events", stats.upcomingEvents);
    setText("stat-attended-students", stats.attendedStudents);
    setText("stat-attendance-rate", stats.attendanceRate);
    setText("hero-attendance-rate", stats.attendanceRate);
    setText("stat-popular-category", stats.mostPopularCategory);

    const categoryBody = document.getElementById("registrations-by-category-body");
    if (categoryBody && stats.registrationsByCategory) {
      categoryBody.innerHTML = "";
      if (stats.registrationsByCategory.length === 0) {
        categoryBody.innerHTML =
          '<tr><td colspan="2" style="text-align:center;">No registration data yet.</td></tr>';
      } else {
        stats.registrationsByCategory.forEach((row) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${row.category}</td>
            <td>${row.registration_count}</td>
          `;
          categoryBody.appendChild(tr);
        });
      }
    }
  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
  }
}

async function loadDashboardEvents() {
  try {
    const res = await adminFetch("/api/admin/dashboard");
    const dashResult = await res.json();
    const seatFillMap = {};
    if (dashResult.success && dashResult.data?.eventSeatFill) {
      dashResult.data.eventSeatFill.forEach((e) => {
        seatFillMap[e.id] = e.seats_filled_percent;
      });
    }

    const eventsRes = await adminFetch("/api/admin/events");
    const result = await eventsRes.json();
    if (!result.success) {
      console.error("Dashboard events error:", result.message);
      return;
    }

    const events = result.data || [];
    const tbody = document.getElementById("dashboard-events-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (events.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;">No events found.</td></tr>';
      return;
    }

    events.forEach((event) => {
      const status = event.status || "Unknown";
      const fillPercent =
        seatFillMap[getEventId(event)] !== undefined
          ? `${seatFillMap[getEventId(event)]}%`
          : calcSeatsFilledPercent(event);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${event.title || "Untitled Event"}</td>
        <td>${event.category_name || "N/A"}</td>
        <td>${event.date || "TBD"}</td>
        <td>${event.registration_count || 0} / ${event.capacity || "N/A"}</td>
        <td>${fillPercent}</td>
        <td><span class="status-badge ${statusClass(status)}">${status}</span></td>
        <td><button type="button" onclick="editEvent(${getEventId(event)})">Edit</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load dashboard events:", err);
  }
}

let allManageEvents = [];

async function loadManageEventsTable(filterText = "", statusFilter = "all") {
  try {
    const res = await adminFetch("/api/admin/events");
    const result = await res.json();
    if (!result.success) {
      console.error("Manage events error:", result.message);
      return;
    }

    allManageEvents = result.data || [];
    renderManageEventsTable(filterText, statusFilter);
  } catch (err) {
    console.error("Failed to load events table:", err);
  }
}

function renderManageEventsTable(filterText = "", statusFilter = "all") {
  const tbody = document.getElementById("events-table-body");
  if (!tbody) return;

  const query = filterText.trim().toLowerCase();
  let events = allManageEvents;

  if (query) {
    events = events.filter(
      (e) =>
        (e.title || "").toLowerCase().includes(query) ||
        (e.organizer_name || "").toLowerCase().includes(query) ||
        (e.category_name || "").toLowerCase().includes(query)
    );
  }

  if (statusFilter !== "all") {
    events = events.filter(
      (e) => (e.status || "").toLowerCase() === statusFilter.toLowerCase()
    );
  }

  tbody.innerHTML = "";

  if (events.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" style="text-align:center;">No events found.</td></tr>';
    return;
  }

  events.forEach((event) => {
    const status = event.status || "Open";
    const remainingSeats = calcRemainingSeats(event);
    const eventId = getEventId(event);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${event.title || "Untitled Event"}</td>
      <td>${event.category_name || "Uncategorized"}</td>
      <td>${event.date || "TBD"}</td>
      <td>${event.capacity || "N/A"}</td>
      <td>${event.registration_count || 0}</td>
      <td>${remainingSeats}</td>
      <td>${calcSeatsFilledPercent(event)}</td>
      <td><span class="status-badge ${statusClass(status)}">${status}</span></td>
      <td>${event.organizer_name || "N/A"}</td>
      <td>
        <button type="button" onclick="editEvent(${eventId})">Edit</button>
        <button type="button" onclick="toggleStatus(${eventId}, '${status}')">
          ${status === "Cancelled" || status === "Disabled" ? "Enable" : "Cancel"}
        </button>
        <button type="button" onclick="disableEvent(${eventId}, '${status}')">
          ${status === "Disabled" ? "Already Disabled" : "Disable"}
        </button>
        <button type="button" onclick="deleteEvent(${eventId})">Delete</button>
        <button type="button" onclick="viewRegistrations(${eventId})">Roster</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function initManageEventsFilter() {
  const searchInput = document.getElementById("manage-events-search");
  const statusSelect = document.getElementById("manage-events-status-filter");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderManageEventsTable(
        searchInput.value,
        statusSelect ? statusSelect.value : "all"
      );
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener("change", () => {
      renderManageEventsTable(
        searchInput ? searchInput.value : "",
        statusSelect.value
      );
    });
  }
}

async function handleCreateEvent(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());

  if (!payload.status) {
    payload.status = "Open";
  }

  try {
    const res = await adminFetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.success) {
      alert("Event created successfully!");
      window.location.href = "/admin/manage-events";
    } else {
      alert("Error: " + (result.message || "Failed to create event"));
    }
  } catch (err) {
    console.error("Create event error:", err);
    alert("Error creating event: " + err.message);
  }
}

async function updateEventStatus(eventId, newStatus) {
  const res = await adminFetch(`/api/admin/events/${eventId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
  return res.json();
}

async function toggleStatus(eventId, currentStatus) {
  const newStatus =
    currentStatus === "Cancelled" || currentStatus === "Disabled"
      ? "Open"
      : "Cancelled";
  if (!confirm(`Change event status to ${newStatus}?`)) return;

  try {
    const result = await updateEventStatus(eventId, newStatus);
    if (result.success) {
      alert(result.message);
      loadManageEventsTable();
      loadDashboardEvents();
      loadDashboardStats();
    } else {
      alert("Error: " + (result.message || "Failed to update status"));
    }
  } catch (err) {
    console.error("Toggle status error:", err);
    alert("Error updating status: " + err.message);
  }
}

async function disableEvent(eventId, currentStatus) {
  if (currentStatus === "Disabled") return;
  if (!confirm("Disable this event? New registrations will be blocked.")) return;

  try {
    const result = await updateEventStatus(eventId, "Disabled");
    if (result.success) {
      alert(result.message);
      loadManageEventsTable();
      loadDashboardEvents();
    } else {
      alert("Error: " + (result.message || "Failed to disable event"));
    }
  } catch (err) {
    console.error("Disable event error:", err);
    alert("Error disabling event: " + err.message);
  }
}

async function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  try {
    const res = await adminFetch(`/api/admin/events/${eventId}`, {
      method: "DELETE",
    });
    const result = await res.json();

    if (result.success) {
      alert("Event deleted successfully!");
      loadManageEventsTable();
      loadDashboardEvents();
      loadDashboardStats();
    } else {
      alert("Error: " + (result.message || "Failed to delete event"));
    }
  } catch (err) {
    console.error("Delete event error:", err);
    alert("Error deleting event: " + err.message);
  }
}

function editEvent(eventId) {
  window.location.href = `/admin/edit-event?id=${eventId}`;
}

function viewRegistrations(eventId) {
  if (!isValidEventId(eventId)) {
    alert("Unable to open roster for this event. Refresh Manage Events and try again.");
    return;
  }
  window.location.href = `/admin/view-registrations?id=${eventId}`;
}

async function loadAttendanceEventsDropdown() {
  try {
    const res = await adminFetch("/api/admin/events");
    const result = await res.json();
    if (!result.success) return;

    const events = result.data || [];
    const select = document.getElementById("attendance-event-select");
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose an event --</option>';
    events.forEach((event) => {
      const option = document.createElement("option");
      option.value = getEventId(event);
      option.textContent = `${event.title} (${event.date})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load events for attendance:", err);
  }
}

async function loadAttendanceRegistrations(eventId) {
  try {
    const res = await adminFetch(`/api/admin/events/${eventId}/registrations`);
    const result = await res.json();
    if (!result.success) {
      console.error("Registrations error:", result.message);
      return;
    }

    const registrations = result.data || [];
    const tbody = document.getElementById("attendance-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (registrations.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">No students registered for this event.</td></tr>';
      return;
    }

    registrations.forEach((reg) => {
      const registrationStatus = reg.registration_status || "Registered";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${reg.student_name || "N/A"}</td>
        <td>${reg.student_email || "N/A"}</td>
        <td>${reg.created_at || "N/A"}</td>
        <td><span class="status-badge ${statusClass(registrationStatus)}">${registrationStatus}</span></td>
        <td>
          ${
            registrationStatus === "Registered"
              ? `<button type="button" onclick="updateAttendance(${reg.id}, 'Attended', ${eventId})">Attended</button>
                 <button type="button" onclick="updateAttendance(${reg.id}, 'Missed', ${eventId})">Missed</button>`
              : ""
          }
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load registrations:", err);
  }
}

async function updateAttendance(registrationId, status, eventId) {
  try {
    const res = await adminFetch(
      `/api/admin/registrations/${registrationId}/attendance`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceStatus: status }),
      }
    );
    const result = await res.json();

    if (result.success) {
      loadAttendanceRegistrations(eventId);
      if (window.location.pathname.includes("view-registrations")) {
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

let currentEditEventTitle = "";

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadEventDetails(eventId) {
  if (!eventId) return null;
  try {
    const res = await adminFetch("/api/admin/events");
    const result = await res.json();
    if (!result.success) return null;

    const events = result.data || [];
    return events.find(
      (e) =>
        e.id === parseInt(eventId, 10) ||
        e.event_id === parseInt(eventId, 10)
    );
  } catch (err) {
    console.error("Error loading event details:", err);
    return null;
  }
}

async function loadEditEventPage() {
  const eventId = getQueryParam("id");
  if (!eventId) return;

  const event = await loadEventDetails(eventId);
  if (!event) {
    alert("Event not found");
    return;
  }

  currentEditEventTitle = event.title || "";
  const titleElem = document.getElementById("edit-event-title");
  if (titleElem) {
    titleElem.textContent = `Edit: ${currentEditEventTitle}`;
  }

  document.getElementById("title").value = event.title || "";
  document.getElementById("description").value = event.description || "";
  document.getElementById("category").value = event.category_name || "";
  document.getElementById("date").value = event.date || "";
  document.getElementById("startTime").value = event.start_time || "";
  document.getElementById("endTime").value = event.end_time || "";
  document.getElementById("location").value = event.location || "";
  document.getElementById("capacity").value = event.capacity || "";
  document.getElementById("status").value = event.status || "Open";
}

async function handleEditEvent(e) {
  e.preventDefault();
  const eventId = getQueryParam("id");
  if (!eventId) return;

  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await adminFetch(`/api/admin/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.success) {
      alert(`Event "${currentEditEventTitle}" updated successfully!`);
      window.location.href = "/admin/manage-events";
    } else {
      alert("Error: " + (result.message || "Failed to update event"));
    }
  } catch (err) {
    console.error("Edit event error:", err);
    alert("Error updating event: " + err.message);
  }
}

async function loadViewRegistrationsPage() {
  const eventId = getQueryParam("id");
  const tbody = document.getElementById("registrations-table-body");
  const titleElem = document.getElementById("registrations-page-title");

  if (!tbody) return;

  if (!isValidEventId(eventId)) {
    if (titleElem) {
      titleElem.textContent = "Event Registration Roster";
    }
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;">Invalid event. Return to Manage Events and open Roster again.</td></tr>';
    return;
  }

  const event = await loadEventDetails(eventId);
  if (titleElem) {
    titleElem.textContent = event
      ? `Registrations for: ${event.title}`
      : "Event Registration Roster";
  }

  try {
    const res = await adminFetch(`/api/admin/events/${eventId}/registrations`);
    const result = await res.json();

    if (!res.ok || !result.success) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${result.message || "Unable to load registrations."}</td></tr>`;
      return;
    }

    if (titleElem && result.eventTitle) {
      titleElem.textContent = `Registrations for: ${result.eventTitle}`;
    }

    const registrations = result.data || [];
    tbody.innerHTML = "";

    if (registrations.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">No students registered for this event.</td></tr>';
      return;
    }

    registrations.forEach((reg) => {
      const registrationStatus = reg.registration_status || "Registered";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${reg.student_name || "N/A"}</td>
        <td>${reg.student_email || "N/A"}</td>
        <td>${reg.created_at || "N/A"}</td>
        <td><span class="status-badge ${statusClass(registrationStatus)}">${registrationStatus}</span></td>
        <td>
          ${
            registrationStatus === "Registered"
              ? `<button type="button" onclick="updateAttendance(${reg.id}, 'Attended', ${eventId})">Attended</button>
                 <button type="button" onclick="updateAttendance(${reg.id}, 'Missed', ${eventId})">Missed</button>`
              : ""
          }
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load registrations:", err);
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;">Unable to load registrations.</td></tr>';
  }
}
