# CampusConnect — User Guide

**Course:** SOEN 287 — Web Programming  
**Project:** Smart Campus Event Planner  
**Deliverable:** Part II (Full Stack)

---

## 1. Introduction

CampusConnect helps university students discover campus events, register for activities, and manage their personal schedule. Organizers can create events, manage registrations, track attendance, and review participation statistics.

Before using the website, complete the setup steps in `INSTALLATION-GUIDE.md` and open the application at:

```text
http://localhost:3000
```

---

## 2. Getting Started

1. Start the server using `npm start`.
2. Open `http://localhost:3000` in your browser.
3. Use the top navigation bar to move between pages.
4. On mobile or smaller screens, tap the **☰** menu button to open navigation.
5. Tap a link or press **Escape** to close the menu.

---

## 3. Public Pages (No Login Required)

| Page | URL |
|------|-----|
| Home | `http://localhost:3000/` |
| About | `http://localhost:3000/about` |
| Contact | `http://localhost:3000/contact` |
| Events | `http://localhost:3000/views/events.html` |
| Login | `http://localhost:3000/views/login.html` |
| Register | `http://localhost:3000/views/register.html` |

### Home page

- View featured upcoming events loaded from the database
- Browse event categories
- Navigate to Events, About, Contact, Login, or Register

### About page

- Learn about the purpose of CampusConnect
- Understand how the platform supports students and organizers

### Contact page

1. Enter your full name, email, subject, and message.
2. Click **Send Message**.
3. A success or error message appears below the form.

**Validation rules:**

- All fields are required
- Email must be in a valid format
- Message must be at least 10 characters (server-side)

---

## 4. Student Users

### Create an account

1. Go to **Get Started** or open the Register page.
2. Fill in:
   - Full name
   - Email address
   - Password (minimum 8 characters)
   - Confirm password
   - Role: Student
3. Click **Create account**.

### Log in

1. Open the **Login** page.
2. Enter your email and password.
3. After a successful login, you are redirected to the **Student Dashboard**.

**Test account:** `student@test.com` / `password123` (see `INSTALLATION-GUIDE.md`)

### Browse events

1. Open **Events** from the navigation.
2. Browse event cards on the page.
3. Use search and filters to find events by category, date, location, organizer, or status.
4. Click **View details →** to open the full event page.

### View event details

Each event details page shows:

- Title, description, and category
- Date, start time, and end time
- Location and organizer
- Capacity and registration count
- Event status

### Register for an event

1. Open an event details page.
2. Click **Register** if the event is open and not full.
3. You cannot register twice for the same event.

Registration is blocked when:

- The event is full, cancelled, disabled, or completed
- The event date has already passed
- You already have an active registration

### Cancel a registration

1. Open **My Registrations**.
2. Find the event you want to cancel.
3. Click **Cancel** and confirm the action.

### View your schedule

| Page | Purpose |
|------|---------|
| Student Dashboard | Summary cards and upcoming registered events |
| My Registrations | All registration records and participation summary |
| Upcoming Events | Future events you are registered for |
| Profile | View and update your account information |

### Log out

Click **Logout** from the navigation menu when you are finished.

---

## 5. Admin / Organizer Users

### Log in as admin

1. Open the **Login** page.
2. Enter admin credentials.
3. After login, you are redirected to the **Admin Dashboard**.

**Test account:** `admin@test.com` / `password123` (see `INSTALLATION-GUIDE.md`)

### Admin dashboard

View campus-wide statistics such as:

- Total events and registrations
- Upcoming events
- Events at full capacity
- Cancelled events
- Attendance summary
- Most popular event categories

### Create an event

1. Go to **Create Event** from the admin navigation.
2. Fill in:
   - Event title
   - Description
   - Category
   - Date, start time, and end time
   - Location
   - Capacity
   - Status
3. Submit the form.

**Validation rules:**

- All required fields must be completed
- Event date cannot be in the past
- Capacity must be a positive number
- End time must be after start time

### Manage events

1. Open **Manage Events**.
2. View the event table with capacity, registration count, and status.
3. Use action buttons to:
   - Edit an event
   - Cancel or disable an event
   - Delete an event (when appropriate)
   - View registered students

### View registrations

1. Select an event from the manage events page.
2. View registered students with:
   - Name and email
   - Registration date
   - Registration status
   - Attendance status

### Mark attendance

1. Open the attendance management page for an event.
2. Mark each student as **Attended** or **Missed**.

### Log out

Click **Logout** when finished.

---

## 6. Event Statuses

| Status | Meaning |
|--------|---------|
| Open | Registration is available |
| Full | Event has reached capacity |
| Cancelled | Event was cancelled |
| Completed | Event has already taken place |
| Disabled | Registration is disabled |

---

## 7. Registration Statuses

| Status | Meaning |
|--------|---------|
| Registered | Active registration |
| Cancelled | Student cancelled the registration |
| Attended | Student attended the event |
| Missed | Student did not attend |

---

## 8. Event Categories

CampusConnect supports the following event categories:

- Academic workshops
- Career events
- Club activities
- Sports events
- Cultural events
- Volunteering events
- Social events
- Guest lectures
- Networking events
- Other

---

## 9. Quick Page Reference

| Page | URL |
|------|-----|
| Home | `/` |
| About | `/about` |
| Contact | `/contact` |
| Login | `/views/login.html` |
| Register | `/views/register.html` |
| Profile | `/views/profile.html` |
| Student Dashboard | `/views/student-dashboard.html` |
| Events | `/views/events.html` |
| Event Details | `/views/event-details.html` |
| My Registrations | `/views/my-registrations.html` |
| Upcoming Events | `/views/upcoming-events.html` |
| Admin Dashboard | `/views/admin-dashboard.html` |
| Create Event | `/views/create-event.html` |
| Manage Events | `/views/manage-events.html` |

---

## 10. Mobile Use

CampusConnect is designed to work on different screen sizes:

- On smaller screens, use the **☰** button in the header to open the navigation menu.
- Tap a navigation link to go to a page; the menu closes automatically.
- Press **Escape** or resize to a wider screen to close the menu.

---

## 11. API Routes (Public — Currently Available)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Home page |
| GET | `/about` | About page |
| GET | `/contact` | Contact page |
| GET | `/api/health` | Server health check |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/public/featured-events` | Featured events for home page |

Additional API routes for authentication, events, registrations, and admin features are documented in `README.md` as teammates complete their work.

---

## 12. Support

For questions about the project, contact your SOEN 287 course instructor or refer to the course Moodle page.

---

**SOEN 287 — Web Programming**  
Concordia University — Summer 2026
