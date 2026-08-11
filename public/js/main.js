document.addEventListener("DOMContentLoaded", () => {
    setupMobileNavigation();
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


function attachEventDetailsButtons() {
    document.querySelectorAll('.view-details-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const eventId = button.dataset.eventId;

            if (!eventId) {
                return;
            }

            window.location.href =
                `/event-details?id=${encodeURIComponent(eventId)}`;
        });
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
            <td><button type="button" class="event-link view-details-btn" data-event-id="${escapeHtml(event.event_id)}">View</button></td>
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

        // Attach AFTER all buttons have been created
        attachEventDetailsButtons();
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

            <div class="event-actions">
                <button
                    type="button"
                    class="event-link view-details-btn"
                    data-event-id="${escapeHtml(event.event_id)}"
                >
                    View details →
                </button>
            </div>
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

        <button
            type="button"
            class="btn btn-primary view-details-btn"
            data-event-id="${escapeHtml(event.event_id)}"
        >
            View Event
        </button>
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
        const currentPath = window.location.pathname;

        if (user.role === "admin") {
            authNav.innerHTML = `
                <li><a href="/admin/dashboard"${currentPath === "/admin/dashboard" ? " class=\"active\"" : ""}>Admin Dashboard</a></li>
                <li><a href="/profile"${currentPath === "/profile" ? " class=\"active\"" : ""}>Profile</a></li>
                <li><button type="button" class="btn btn-secondary" id="logout-button">Logout</button></li>
            `;
        } else {
            authNav.innerHTML = `
                <li><a href="/student/dashboard"${currentPath === "/student/dashboard" ? " class=\"active\"" : ""}>Dashboard</a></li>
                <li><a href="/my-registrations"${currentPath === "/my-registrations" ? " class=\"active\"" : ""}>My Registrations</a></li>
                <li><a href="/upcoming-events"${currentPath === "/upcoming-events" ? " class=\"active\"" : ""}>Upcoming</a></li>
                <li><a href="/profile"${currentPath === "/profile" ? " class=\"active\"" : ""}>Profile</a></li>
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