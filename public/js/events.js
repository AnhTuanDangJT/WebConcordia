//When the student-dashboard.html page is loaded,
// this script will fetch the student's name from the server and display it in the welcome message.
// It uses the Fetch API to make a GET request to the /api/students/dashboard endpoint,
document.addEventListener("DOMContentLoaded", () => {
    loadStudentDashboard();
    setupEventsViewToggle();
    // Note: `setupEventsTabSwitcher()` removed to keep the events type select purely visual
});



async function loadStudentDashboard() {
    try {
        const response = await fetch('/api/students/dashboard');
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to load student dashboard');
        }

        const studentNameElement = document.getElementById('studentName');

        if (studentNameElement) {
            studentNameElement.textContent = `Hi ${result.studentName}`;
        }
    } catch (error) {
        console.error('Error loading student dashboard:', error);
    }
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

function setupEventsTabSwitcher() {
    const select = document.getElementById('eventsTypeSelect');
    const registeredSection = document.getElementById('registeredEventsSection');
    const attendedSection = document.getElementById('attendedEventsSection');
    const cancelledSection = document.getElementById('cancelledEventsSection');

    if (!select) return;

    function showTab(tabName) {
        // Show/hide sections
        if (registeredSection) registeredSection.style.display = tabName === 'registered' ? '' : 'none';
        if (attendedSection) attendedSection.style.display = tabName === 'attended' ? '' : 'none';
        if (cancelledSection) cancelledSection.style.display = tabName === 'cancelled' ? '' : 'none';
    }

    select.addEventListener('change', () => {
        const tabName = select.value;
        showTab(tabName);
    });

    // default
    showTab(select.value || 'registered');
}
