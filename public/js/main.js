let eventPageEvents = [];

document.addEventListener("DOMContentLoaded", () => {
    setupMobileNavigation();
    setupEventsViewToggle();
    setupEventPage();
    setupContactForm();
    loadFeaturedEvents();
    updateNavigationForAuth();
});

function setupMobileNavigation() {
    const navToggle = document.querySelector(".nav-toggle");
    const navigation = document.querySelector(".primary-navigation");
    const navigationLinks = document.querySelectorAll(".nav-links a");

    if (!navToggle || !navigation) {
        return;
    }

    function closeMenu() {
        navigation.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "☰";
    }

    navToggle.addEventListener("click", () => {
        const menuIsOpen = navigation.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(menuIsOpen));
        navToggle.textContent = menuIsOpen ? "✕" : "☰";
    });

    navigationLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}

function setupEventsViewToggle() {
    const sections = document.querySelectorAll('.registered-events-section');
    if (!sections.length) {
        return;
    }

    sections.forEach((section) => {
        const buttons = section.querySelectorAll('.view-toggle-toolbar .view-toggle-btn');
        if (!buttons.length) {
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
    });
}

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
        renderEventPageEvents(eventPageEvents);
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
}

function createEventListRow(event) {
    const statusClass = getStatusBadgeClass(event.status);

    return `
        <tr>
            <td>${escapeHtml(event.category)}</td>
            <td>${escapeHtml(formatDate(event.event_date))}</td>
            <td>${escapeHtml(event.title)}</td>
            <td>${escapeHtml(event.start_time)} – ${escapeHtml(event.end_time)}<br>${escapeHtml(event.location)}</td>
            <td><span class="badge ${statusClass}">${escapeHtml(event.status)}</span></td>
            <td><a href="/views/event-details.html?id=${encodeURIComponent(event.event_id)}" class="event-link">View</a></td>
        </tr>
    `;
}

function setupContactForm() {
    const contactForm = document.querySelector("#contact-form");
    const contactFormMessage = document.querySelector("#contact-form-message");

    if (!contactForm || !contactFormMessage) {
        return;
    }

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nameInput = document.querySelector("#contact-name");
        const emailInput = document.querySelector("#contact-email");
        const subjectInput = document.querySelector("#contact-subject");
        const messageInput = document.querySelector("#contact-message");

        const payload = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            subject: subjectInput.value.trim(),
            message: messageInput.value.trim(),
        };

        contactFormMessage.classList.remove("error", "success");
        contactFormMessage.textContent = "";

        if (
            !payload.name ||
            !payload.email ||
            !payload.subject ||
            !payload.message
        ) {
            contactFormMessage.textContent =
                "Please complete all required fields.";
            contactFormMessage.classList.add("error");
            return;
        }

        if (!emailInput.checkValidity()) {
            contactFormMessage.textContent =
                "Please enter a valid email address.";
            contactFormMessage.classList.add("error");
            return;
        }

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage =
                    data.errors?.[0]?.msg ||
                    data.message ||
                    "Unable to submit your message.";

                contactFormMessage.textContent = errorMessage;
                contactFormMessage.classList.add("error");
                return;
            }

            contactFormMessage.textContent = data.message;
            contactFormMessage.classList.add("success");
            contactForm.reset();
        } catch (error) {
            contactFormMessage.textContent =
                "Network error. Please try again later.";
            contactFormMessage.classList.add("error");
        }
    });
}

async function loadFeaturedEvents() {
    const featuredGrid = document.querySelector("#featured-events-grid");
    const heroCard = document.querySelector("#hero-featured-event");

    if (!featuredGrid && !heroCard) {
        return;
    }

    try {
        const response = await fetch("/api/public/featured-events");
        const result = await response.json();

        if (!response.ok || !result.success) {
            return;
        }

        const events = result.data || [];

        if (featuredGrid) {
            featuredGrid.innerHTML = "";

            if (events.length === 0) {
                featuredGrid.innerHTML =
                    '<p class="card-text">No featured events available right now.</p>';
            } else {
                events.forEach((event) => {
                    featuredGrid.insertAdjacentHTML(
                        "beforeend",
                        createEventCardHtml(event)
                    );
                });
            }
        }

        if (heroCard && events[0]) {
            heroCard.innerHTML = createHeroEventHtml(events[0]);
        }
    } catch (error) {
        console.error("Failed to load featured events:", error);
    }
}

function createEventCardHtml(event) {
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

            <a href="/views/event-details.html?id=${event.event_id}" class="event-link">
                View details →
            </a>
        </article>
    `;
}

function createHeroEventHtml(event) {
    const statusClass = getStatusBadgeClass(event.status);
    const dateParts = formatHeroDate(event.event_date);

    return `
        <div class="hero-card-heading">
            <span class="badge ${statusClass}">${escapeHtml(event.status)}</span>
            <span>Featured this week</span>
        </div>

        <div class="hero-date">
            <span class="hero-date-month">${dateParts.month}</span>
            <strong>${dateParts.day}</strong>
        </div>

        <h2>${escapeHtml(event.title)}</h2>

        <p>${escapeHtml(event.description)}</p>

        <ul class="event-information">
            <li><strong>Time:</strong> ${escapeHtml(event.start_time)} – ${escapeHtml(event.end_time)}</li>
            <li><strong>Location:</strong> ${escapeHtml(event.location)}</li>
            <li><strong>Organizer:</strong> ${escapeHtml(event.organizer_name || "Campus Organizer")}</li>
        </ul>

        <a href="/views/event-details.html?id=${event.event_id}" class="btn btn-primary">
            View Event
        </a>
    `;
}

function getStatusBadgeClass(status) {
    switch (status) {
        case "Open":
            return "badge-open";
        case "Full":
            return "badge-full";
        case "Cancelled":
            return "badge-cancelled";
        case "Completed":
            return "badge-completed";
        default:
            return "badge-open";
    }
}

function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatHeroDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return {
        month: date
            .toLocaleDateString("en-US", { month: "short" })
            .toUpperCase(),
        day: date.getDate().toString().padStart(2, "0"),
    };
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function updateNavigationForAuth() {
    const authNav = document.querySelector("#auth-nav");

    if (!authNav) {
        return;
    }
        const defaultButtons = `
                <li><a href="/login">Login</a></li>
                <li>
                    <a href="/register" class="btn btn-primary">
                        Get Started
                    </a>
                </li>
            `;
    try {

        const response = await fetch("/api/auth/me");
        const result = await response.json();

        if (!response.ok || !result.success || !result.data) {
            authNav.innerHTML = defaultButtons;
            return;
        }

        const user = result.data;

        if (user.role === "admin") {
            authNav.innerHTML = `
                <li><a href="/views/admin-dashboard.html">Admin Dashboard</a></li>
                <li><a href="/api/auth/profile">Profile</a></li>
                <li><button type="button" class="btn btn-secondary" id="logout-button">Logout</button></li>
            `;
        } else {
            authNav.innerHTML = `
                <li><a href="/views/student-dashboard.html">Dashboard</a></li>
                <li><a href="/api/auth/profile">Profile</a></li>
                <li><button type="button" class="btn btn-secondary" id="logout-button">Logout</button></li>
            `;
        }

        const logoutButton = document.querySelector("#logout-button");

        if (logoutButton) {
            logoutButton.addEventListener("click", async () => {
                await fetch("/api/auth/logout", {
                    method: "POST",
                });

                window.location.href = "/login";
            });
        }
    } catch (error) {
        authNav.innerHTML = defaultButtons;
    }
}