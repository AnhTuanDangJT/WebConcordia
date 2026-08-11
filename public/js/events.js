// When the student-dashboard.html page is loaded,
// this script fetches the logged-in student's name from the server
// and displays it in the welcome message.
// It uses the Fetch API to call the student dashboard data endpoint.
let eventPageEvents = [];

document.addEventListener("DOMContentLoaded", () => {
    // events.html
    const eventSearch = document.getElementById('event-search');

    if (eventSearch) {
        setupEventPage();
        setupEventsViewToggle();
    }

    // student-dashboard.html
    const studentName = document.getElementById('studentName');

    if (studentName) {
        loadStudentDashboard();
        loadStudentEvents();
        setupEventsTypeSelector();
        setupEventsViewToggle();
    }

});

function setupEventPage() {
    const eventSection = document.getElementById('registeredEventsSection');
    if (!eventSection) {
        return;
    }

    setupEventFilters();
    loadEventPageEvents();
}

function setupEventFilters() {
    const searchInput = document.querySelector('#event-search');
    const categoryFilter = document.querySelector('#category-filter');
    const dateFilter = document.querySelector('#date-filter');
    const locationFilter = document.querySelector('#location-filter');
    const organizerFilter = document.querySelector('#organizer-filter');
    const statusFilter = document.querySelector('#status-filter');
    const clearFiltersButton = document.querySelector('#clear-filters');

    if (!searchInput || !categoryFilter || !dateFilter || !locationFilter || !organizerFilter || !statusFilter || !clearFiltersButton) {
        return;
    }

    const applyFilters = () => {
        const filtered = filterEventPageEvents();
        renderEventPageEvents(filtered);
    };

    [searchInput, categoryFilter, dateFilter, locationFilter, organizerFilter, statusFilter].forEach((input) => {
        input.addEventListener('input', applyFilters);
    });

    clearFiltersButton.addEventListener('click', () => {
        searchInput.value = '';
        categoryFilter.value = '';
        dateFilter.value = '';
        locationFilter.value = '';
        organizerFilter.value = '';
        statusFilter.value = 'All';
        applyFilters();
    });
}

function filterEventPageEvents() {
    const searchValue = document.querySelector('#event-search')?.value.trim().toLowerCase() || '';
    const categoryValue = document.querySelector('#category-filter')?.value || '';
    const dateValue = document.querySelector('#date-filter')?.value || '';
    const locationValue = document.querySelector('#location-filter')?.value || '';
    const organizerValue = document.querySelector('#organizer-filter')?.value || '';
    const statusValue = document.querySelector('#status-filter')?.value || 'All';

    return eventPageEvents.filter((event) => {
        if (searchValue) {
            const title = String(event.title || '').toLowerCase();
            const description = String(event.description || '').toLowerCase();
            if (!title.includes(searchValue) && !description.includes(searchValue)) {
                return false;
            }
        }

        if (categoryValue && event.category !== categoryValue) {
            return false;
        }

        if (dateValue && event.event_date !== dateValue) {
            return false;
        }

        if (locationValue && event.location !== locationValue) {
            return false;
        }

        if (organizerValue && event.organizer_name !== organizerValue) {
            return false;
        }

        if (statusValue !== 'All' && event.status !== statusValue) {
            return false;
        }

        return true;
    });
}

async function loadEventPageEvents() {
    const grid = document.getElementById('registeredEventsGrid');
    const listBody = document.querySelector('#registeredEventsList tbody');

    if (!grid || !listBody) {
        return;
    }

    try {
        const response = await fetch('/api/public/events');
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to load events');
        }

        eventPageEvents = result.data || [];
        renderEventPageEvents(filterEventPageEvents());
    } catch (error) {
        console.error('Error loading event page data:', error);
        grid.innerHTML = '<p class="card-text">Unable to load events.</p>';
        listBody.innerHTML = '<tr><td colspan="6">Unable to load events.</td></tr>';
    }
}

function renderEventPageEvents(events) {
    const grid = document.getElementById('registeredEventsGrid');
    const listBody = document.querySelector('#registeredEventsList tbody');

    if (!grid || !listBody) {
        return;
    }

    if (!events.length) {
        grid.innerHTML = '<p class="card-text">No events found.</p>';
        listBody.innerHTML = '<tr><td colspan="6">No events found.</td></tr>';
        return;
    }

    grid.innerHTML = '';
    listBody.innerHTML = '';

    events.forEach((event) => {
        grid.insertAdjacentHTML('beforeend', createEventCardHtml(event));
        listBody.insertAdjacentHTML('beforeend', createEventListRow(event));
    });

    attachEventDetailsButtons();
}

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

    attachCancelButtons();
    attachViewDetailsButtons();
}

function attachViewDetailsButtons() {
    document.querySelectorAll('.view-details-btn').forEach((button) => {
        button.addEventListener('click', async () => {
            const eventId = button.dataset.eventId;

            if (!eventId) {
                return;
            }

            try {
                const response = await fetch('/api/events/select', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ event_id: eventId })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Unable to open event details');
                }

                const detailsResponse = await fetch(`/api/events/details/${encodeURIComponent(eventId)}`, {
                    credentials: 'include'
                });

                const detailsResult = await detailsResponse.json();

                if (!detailsResponse.ok || !detailsResult.success) {
                    throw new Error(detailsResult.message || 'Unable to load event details');
                }

                sessionStorage.setItem('selectedEvent', JSON.stringify(detailsResult.data));
                window.location.href = '/views/event-details.html';
            } catch (error) {
                console.error('Error navigating to event details:', error);
                window.alert(error.message || 'Unable to open event details.');
            }
        });
    });
}

function attachCancelButtons() {
    document.querySelectorAll('.cancel-icon-btn').forEach((button) => {
        button.addEventListener('click', async () => {
            const eventId = button.dataset.eventId;

            if (!eventId) {
                return;
            }

            const confirmed = window.confirm('Cancel this registration?');
            if (!confirmed) {
                return;
            }

            button.disabled = true;
            button.textContent = 'Cancelling...';

            try {
                const response = await fetch(`/api/registrations/cancel/${encodeURIComponent(eventId)}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Unable to cancel registration');
                }

                button.textContent = 'Cancelled';
                button.classList.add('is-cancelled');

                await loadStudentEvents();
            } catch (error) {
                console.error('Error cancelling registration:', error);
                button.disabled = false;
                button.textContent = 'Cancel';
                window.alert(error.message || 'Unable to cancel registration.');
            }
        });
    });
}

function createStudentEventCardHtml(event) {
    const statusClass = getStatusBadgeClass(event.status);
    const showCancelButton = event.registration_status !== 'Cancelled';

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
                <button type="button" class="event-link view-details-btn" data-event-id="${escapeHtml(event.event_id)}">
                    View details →
                </button>
                ${showCancelButton ? `<button type="button" class="cancel-icon-btn" data-event-id="${escapeHtml(event.event_id)}">Cancel</button>` : ''}
            </div>
        </article>
    `;
}

function createStudentEventTableRow(event) {
    const statusClass = getStatusBadgeClass(event.status);
    const showCancelButton = event.registration_status !== 'Cancelled';

    return `
        <tr>
            <td>${escapeHtml(event.category)}</td>
            <td>${formatDate(event.event_date)}</td>
            <td>${escapeHtml(event.title)}</td>
            <td>${escapeHtml(event.start_time)} – ${escapeHtml(event.end_time)}<br>${escapeHtml(event.location)}</td>
            <td><span class="badge ${statusClass}">${escapeHtml(event.status)}</span></td>
            <td>
                <button type="button" class="event-link view-details-btn" data-event-id="${escapeHtml(event.event_id)}">View</button>
                ${showCancelButton ? `<button type="button" class="cancel-icon-btn" data-event-id="${escapeHtml(event.event_id)}">Cancel</button>` : ''}
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

