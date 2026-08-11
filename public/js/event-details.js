<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    renderEventDetails();
});

function renderEventDetails() {
    const storedEvent = sessionStorage.getItem('selectedEvent');

    if (!storedEvent) {
        window.location.href = '/views/events.html';
        return;
    }

    const event = JSON.parse(storedEvent);
    const title = document.querySelector('h2');
    const category = document.getElementById('eventCategory');
    const description = document.getElementById('eventDescriptionShort');
    const organizer = document.getElementById('eventOrganizer');
    const location = document.getElementById('eventLocation');
    const date = document.getElementById('eventDate');
    const time = document.getElementById('eventTime');
    const capacity = document.getElementById('eventCapacity');
    const registeredCount = document.getElementById('eventRegisteredCount');
    const status = document.getElementById('eventStatus');
    const descriptionSection = document.getElementById('eventDescriptionLong');

    if (title) title.textContent = event.title;
    if (category) category.textContent = event.category;
    if (description) description.textContent = event.description;
    if (organizer) organizer.textContent = `Organized by ${event.organizer_name}`;
    if (location) {location.textContent = `Location: ${event.location}`;}
    if (date) date.textContent = formatDate(event.event_date);
    if (time) time.textContent = `${event.start_time} – ${event.end_time}`;
    if (capacity) capacity.textContent = `${event.capacity} capacity`;
    if (registeredCount) registeredCount.textContent = `${event.registration_count} people registered`;
    if (status) status.textContent = event.status;
    if (descriptionSection) descriptionSection.textContent = event.description;
}

function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
=======
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");

    if (!eventId) {
        console.error("No event ID in URL.");
        return;
    }

    try {
        const response = await fetch(`/api/public/events/${eventId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error(result.message || "Unable to load event.");
            return;
        }

        const event = result.data;

        // Title
        document.querySelector(".page-header h2").textContent =
            event.title;

        // Category
        document.querySelector(".event-category").textContent =
            event.category;

        // Short description
        document.querySelector(".page-header .card-text").textContent =
            event.description;

        // Organizer
        const cardTexts =
            document.querySelectorAll(".page-header .card-text");

        if (cardTexts.length >= 2) {
            cardTexts[1].textContent =
                `Organized by ${event.organizer_name}`;
        }

        // Date
        document.querySelector(".event-card-date").textContent =
            event.event_date;

        // Time and location
        const detailContainer =
            document.querySelector(".page-header div[style*='margin-bottom']");

        if (detailContainer) {
            const paragraphs =
                detailContainer.querySelectorAll("p");

            if (paragraphs.length >= 5) {
                paragraphs[1].textContent =
                    `${event.start_time} – ${event.end_time}`;

                paragraphs[2].textContent =
                    event.location;

                paragraphs[3].textContent =
                    `${event.capacity} capacity`;

                paragraphs[4].textContent =
                    `${event.registration_count} people registered`;
            }
        }

        // Status
        const statusBadge =
            document.querySelector(".page-header .badge");

        if (statusBadge) {
            statusBadge.textContent = event.status;
            statusBadge.className =
                `badge badge-${event.status.toLowerCase()}`;
        }

        // Registration button
        const registerButton =
            document.getElementById("register-event-btn");

        if (registerButton) {
            registerButton.dataset.eventId = event.event_id;

            if (event.status !== "Open") {
                registerButton.disabled = true;
                registerButton.textContent = event.status;
            }
        }

        // Full event description
        const descriptionSection =
            document.querySelector("section[style*='padding-top'] p");

        if (descriptionSection) {
            descriptionSection.textContent = event.description;
        }

    } catch (error) {
        console.error("Error loading event:", error);
    }
});
>>>>>>> 42d6043 (Complete registration and upcoming events integration)
