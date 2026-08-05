# CampusConnect — User Guide

**Course:** SOEN 287 — Web Programming  
**Project:** Smart Campus Event Planner  
**Deliverable:** Part II

---

## 1. Overview

CampusConnect helps students discover campus events, register for activities, and manage their schedule. Organizers can create events, manage registrations, track attendance, and view statistics.

---

## 2. Public Pages

These pages are available without logging in:

| Page | URL |
|------|-----|
| Home | `http://localhost:3000/` |
| About | `http://localhost:3000/about` |
| Contact | `http://localhost:3000/contact` |

### Home page

- View featured upcoming events loaded from the database
- Browse event categories
- Navigate to Events, About, Contact, Login, or Register

### About page

- Learn about the purpose of CampusConnect
- Understand how the platform works for students and organizers

### Contact page

1. Enter your full name, email, subject, and message.
2. Click **Send Message**.
3. A success or error message appears below the form.

All contact fields are required. The email must be in a valid format.

---

## 3. Student Users

### Register

1. Go to **Get Started** or open `/views/register.html`.
2. Enter your full name, email, password, confirm password, and role.
3. Submit the form to create your account.

### Log in

1. Open the **Login** page.
2. Enter your email and password.
3. After login, you are redirected to the student dashboard.

### Browse events

1. Open the **Events** page.
2. Use search and filters to find events by category, date, location, or organizer.
3. Click an event to view full details.

### Register for an event

1. Open an event details page.
2. Click **Register** if the event is open and not full.
3. You cannot register twice for the same event.

### Cancel a registration

1. Open **My Registrations**.
2. Find the event you want to cancel.
3. Confirm the cancellation.

### View your schedule

- **Student Dashboard** — summary cards and upcoming registered events
- **My Registrations** — all registration records
- **Upcoming Events** — future events you are registered for
- **Profile** — update your account information

### Log out

Click **Logout** from the navigation menu when you are finished.

---

## 4. Admin / Organizer Users

### Log in as admin

Use an admin account (see `INSTALLATION-GUIDE.md` for default test credentials).

### Admin dashboard

View summary statistics such as:

- Total events
- Total registrations
- Upcoming events
- Full events
- Cancelled events
- Attendance summary

### Create an event

1. Open **Create Event**.
2. Enter title, description, category, date, start time, end time, location, and capacity.
3. Submit the form.

### Manage events

1. Open **Manage Events**.
2. View the event table with capacity and registration counts.
3. Edit, cancel, disable, or delete events as needed.

### View registrations

1. Select an event from the manage events page.
2. View the list of registered students with registration and attendance status.

### Mark attendance

1. Open the attendance management page for an event.
2. Mark each student as **Attended** or **Missed**.

### Log out

Click **Logout** when finished.

---

## 5. Event Statuses

| Status | Meaning |
|--------|---------|
| Open | Registration is available |
| Full | Event has reached capacity |
| Cancelled | Event was cancelled |
| Completed | Event has finished |
| Disabled | Registration is disabled |

---

## 6. Registration Statuses

| Status | Meaning |
|--------|---------|
| Registered | Active registration |
| Cancelled | Student cancelled the registration |
| Attended | Student attended the event |
| Missed | Student did not attend |

---

## 7. Member 1 API Routes (Public)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Home page |
| GET | `/about` | About page |
| GET | `/contact` | Contact page |
| GET | `/api/health` | Server health check |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/public/featured-events` | Featured events for home page |

Additional API routes are documented in `README.md` as teammates complete their features.

---

**SOEN 287 — Web Programming**  
Concordia University — Summer 2026
