document.addEventListener('DOMContentLoaded', () => {
    renderEventDetails();
});

async function renderEventDetails() {
    try {
        // Get the event ID from the URL
        const params = new URLSearchParams(window.location.search);
        const eventId = params.get('id');

        // If there is no event ID, return to the events page
        if (!eventId) {
            window.location.href = '/views/events.html';
            return;
        }

        // Get the event details from the API
        const response = await fetch(
            `/api/events/details/${encodeURIComponent(eventId)}`,
            {
                credentials: 'include'
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Unable to load event details');
        }

        const event = result.data;

        // Get HTML elements
        const title = document.getElementById('eventTitle');
        const category = document.getElementById('eventCategory');
        const description = document.getElementById('eventDescriptionShort');
        const organizer = document.getElementById('eventOrganizer');
        const location = document.getElementById('eventLocation');
        const date = document.getElementById('eventDate');
        const time = document.getElementById('eventTime');
        const capacity = document.getElementById('eventCapacity');
        const registeredCount = document.getElementById('eventRegisteredCount');
        const remainingSeats = document.getElementById('eventRemainingSeats');
        const status = document.getElementById('eventStatus');

        // Display event data
        if (title) {
            title.textContent = event.title;
        }

        if (category) {
            category.textContent = event.category;
        }

        if (description) {
            description.textContent = event.description;
        }

        if (organizer) {
            organizer.textContent = `Organized by ${event.organizer_name}`;
        }

        if (location) {
            location.textContent = `Location: ${event.location}`;
        }

        if (date) {
            date.textContent = formatDate(event.event_date);
        }

        if (time) {
            time.textContent = `${event.start_time} – ${event.end_time}`;
        }

        if (capacity) {
            capacity.textContent = `${event.capacity} capacity`;
        }

        if (registeredCount) {
            registeredCount.textContent =
                `${event.registration_count} people registered`;
        }

        if (remainingSeats) {
            remainingSeats.textContent =
                `${event.remaining_seats} seats remaining`;
        }

        if (status) {
            status.textContent = event.status;
            status.className =
                `badge ${getStatusBadgeClass(event.status)}`;
        }

    } catch (error) {
        console.error('Error loading event details:', error);
        window.alert(error.message || 'Unable to load event details.');
        window.location.href = '/views/events.html';
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