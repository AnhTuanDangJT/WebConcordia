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
    const remainingSeats = document.getElementById('eventRemainingSeats');
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
    if (remainingSeats) remainingSeats.textContent = `${event.remaining_seats} seats remaining`;
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
