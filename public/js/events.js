// When the student-dashboard.html page is loaded,
// this script fetches the logged-in student's name from the server
// and displays it in the welcome message.
// It uses the Fetch API to call the student dashboard data endpoint.
document.addEventListener("DOMContentLoaded", () => {
    loadStudentDashboard();
    loadStudentEvents();
    setupEventsViewToggle();
    setupEventsTypeSelector();
});

function setupEventsViewToggle() {
    const section = document.getElementById('registeredEventsSection');
    const buttons = document.querySelectorAll('.view-toggle-toolbar .view-toggle-btn');

    if (!section || buttons.length === 0) {
        return;
    }

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const selectedView = button.dataset.view;
            if (!selectedView) {
                return;
            }

            buttons.forEach((btn) => {
                const isActive = btn === button;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', String(isActive));
            });

            section.classList.toggle('list-view', selectedView === 'list');
            section.classList.toggle('card-view', selectedView === 'card');
        });
    });
}

let studentEvents = [];

function setupEventsTypeSelector() {
    const select = document.getElementById('eventsTypeSelect');
    if (!select) {
        return;
    }

    select.addEventListener('change', () => {
        const selectedType = select.value;
        renderStudentEvents(studentEvents, selectedType);
    });
}

async function loadStudentEvents() {
    const registeredEventsGrid = document.getElementById('registeredEventsGrid');
    const registeredEventsListBody = document.querySelector('#registeredEventsList tbody');

    if (!registeredEventsGrid || !registeredEventsListBody) {
        return;
    }

    try {
        const response = await fetch('/api/student/dashboard/events', {
            credentials: 'include'
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to load student events');
        }

        studentEvents = result.data || [];
        const selectedType = document.getElementById('eventsTypeSelect')?.value || 'registered';
        renderStudentEvents(studentEvents, selectedType);
    } catch (error) {
        console.error('Error loading student events:', error);
    }
}

function renderStudentEvents(events, filter = 'registered') {
    const registeredEventsGrid = document.getElementById('registeredEventsGrid');
    const registeredEventsListBody = document.querySelector('#registeredEventsList tbody');

    if (!registeredEventsGrid || !registeredEventsListBody) {
        return;
    }

    const filteredEvents = events.filter((event) => {
        if (filter === 'registered') {
            return event.registration_status === 'Registered';
        }
        if (filter === 'attended') {
            return event.registration_status === 'Attended';
        }
        if (filter === 'cancelled') {
            return event.registration_status === 'Cancelled';
        }
        return true;
    });

    if (filteredEvents.length === 0) {
        registeredEventsGrid.innerHTML = '<p class="card-text">No events to display.</p>';
        registeredEventsListBody.innerHTML = '<tr><td colspan="6">No events to display.</td></tr>';
        return;
    }

    registeredEventsGrid.innerHTML = '';
    registeredEventsListBody.innerHTML = '';

    filteredEvents.forEach((event) => {
        registeredEventsGrid.insertAdjacentHTML('beforeend', createStudentEventCardHtml(event));
        registeredEventsListBody.insertAdjacentHTML('beforeend', createStudentEventTableRow(event));
    });
}

function createStudentEventCardHtml(event) {
    const statusClass = getStatusBadgeClass(event.status);

    return `
        <article class="card event-card">
            <div class="event-card-top">
                <span class="event-category">${escapeHtml(event.category)}</span>
                <span class="badge ${statusClass}">${escapeHtml(event.status)}</span>
            </div>

            <div class="event-card-date">${formatDate(event.event_date)}</div>

            <h3 class="card-title">${escapeHtml(event.title)}</h3>

            <p class="card-text">${escapeHtml(event.description)}</p>

            <div class="event-meta">
                <span>${escapeHtml(event.start_time)} – ${escapeHtml(event.end_time)}</span>
                <span>${escapeHtml(event.location)}</span>
            </div>

            <div class="event-actions">
                <a href="/views/event-details.html?id=${encodeURIComponent(event.event_id)}" class="event-link">
                    View details →
                </a>
                <button type="button" class="cancel-icon-btn">Cancel</button>
            </div>
        </article>
    `;
}

function createStudentEventTableRow(event) {
    const statusClass = getStatusBadgeClass(event.status);

    return `
        <tr>
            <td>${escapeHtml(event.category)}</td>
            <td>${formatDate(event.event_date)}</td>
            <td>${escapeHtml(event.title)}</td>
            <td>${escapeHtml(event.start_time)} – ${escapeHtml(event.end_time)}<br>${escapeHtml(event.location)}</td>
            <td><span class="badge ${statusClass}">${escapeHtml(event.status)}</span></td>
            <td>
                <a href="/views/event-details.html?id=${encodeURIComponent(event.event_id)}" class="event-link">View</a>
                <button type="button" class="cancel-icon-btn">Cancel</button>
            </td>
        </tr>
    `;
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Open':
            return 'badge-open';
        case 'Full':
            return 'badge-full';
        case 'Cancelled':
            return 'badge-cancelled';
        case 'Completed':
            return 'badge-completed';
        default:
            return 'badge-open';
    }
}

function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function escapeHtml(value) {
    if (value == null) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadStudentDashboard() {
    try {
        const response = await fetch('/api/student/dashboard/summary', {
            credentials: 'include'
        });

        const studentName = await getStudentName();

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || 'Failed to load student dashboard'
            );
        }

        const studentNameElement = document.getElementById('studentName');
        const registeredEventsCount = document.getElementById('registeredEventsCount');
        const eventsThisWeekCount = document.getElementById('eventsThisWeekCount');
        const eventCategoriesCount = document.getElementById('eventCategoriesCount');
        const campusEventsCount = document.getElementById('campusEventsCount');

        if (studentNameElement) {
            studentNameElement.textContent = `Hi ${studentName}`;
        }
        if (registeredEventsCount) {
            registeredEventsCount.textContent = result.registeredEvents ?? '0';
        }
        if (eventsThisWeekCount) {
            eventsThisWeekCount.textContent = result.eventsThisWeek ?? '0';
        }
        if (eventCategoriesCount) {
            eventCategoriesCount.textContent = result.eventCategories ?? '0';
        }
        if (campusEventsCount) {
            campusEventsCount.textContent = result.campusEvents ?? '0';
        }

    } catch (error) {
        console.error(
            'Error loading student dashboard:',
            error
        );
    }
}

async function getStudentName() {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load student');
    }
    return result.data.full_name; 
  } catch (error) {
    console.error('Error loading student dashboard:', error);
    // Optional: return null or rethrow so the caller knows it failed
    return null; 
  }
}

