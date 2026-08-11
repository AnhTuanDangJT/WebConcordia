# CampusConnect — User Guide

**Course:** SOEN 287 — Web Programming  
**Project:** Smart Campus Event Planner  
**Deliverables:** Part I (Frontend) and Part II (Full Stack)

---

## 1. Introduction

CampusConnect helps university students discover campus events, register for activities, and manage their personal schedule. Organizers can create events, manage registrations, track attendance, and review participation statistics.

This guide covers how to use the **complete application** (Deliverable 2). The user interface was built in Deliverable 1; Deliverable 2 connected all pages to the backend, database, and authentication system.

Before using the website, complete the setup steps in [INSTALLATION-GUIDE.md](INSTALLATION-GUIDE.md) and open the application at:

```text
http://localhost:3000
```

### Default test accounts

| Role | Email | Password |
|------|-------|----------|
| Student | `student@test.com` | `password123` |
| Admin | `admin@test.com` | `password123` |

---

## 2. Getting Started

1. Start the server using `npm start`.
2. Open `http://localhost:3000` in your browser.
3. Use the top navigation bar to move between pages.
4. On mobile or smaller screens, tap the **☰** menu button to open navigation.
5. Tap a link or press **Escape** to close the menu.

The navigation updates based on your login status and role (guest, student, or admin).

---

## 3. Public Pages (No Login Required)

| Page | URL |
|------|-----|
| Home | `http://localhost:3000/` |
| About | `http://localhost:3000/about` |
| Contact | `http://localhost:3000/contact` |
| Events | `http://localhost:3000/events` |
| Event Details | `http://localhost:3000/event-details` |
| Login | `http://localhost:3000/login` |
| Register | `http://localhost:3000/register` |

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

### Events page (public browsing)

1. Open **Events** from the navigation.
2. Browse event cards or switch to list view.
3. Use search and filters to find events by:
   - Category
   - Date
   - Location
   - Organizer
   - Status
4. Click **View details** to open the full event page.

You can browse events without logging in. Registration requires a student account.

---

## 4. Student Users

### Create an account

1. Go to **Get Started** or open the Register page (`/register`).
2. Fill in:
   - Full name
   - Email address
   - Password (minimum 8 characters)
   - Confirm password
   - Role: **Student**
3. Click **Create account**.
4. After successful registration, you are redirected to the Student Dashboard.

### Log in

1. Open the **Login** page (`/login`).
2. Enter your email and password.
3. Select role **Student** if prompted.
4. After a successful login, you are redirected to the **Student Dashboard** (`/student/dashboard`).

### Browse and filter events

1. Open **Events** from the navigation.
2. Use the search bar and filter dropdowns (category, date, location, organizer, status).
3. Click **Clear filters** to reset all filters.
4. Toggle between **Card** and **List** view.

### View event details

Each event details page shows:

- Title, description, and category
- Date, start time, and end time
- Location and organizer name
- Capacity and current registration count
- Event status (Open, Full, Cancelled, etc.)

### Register for an event

1. Open an event details page.
2. Click **Register** if the event is open and not full.
3. A confirmation message appears and the button updates.

Registration is blocked when:

- The event is full, cancelled, disabled, or completed
- The event date has already passed
- You already have an active registration for that event

### Cancel a registration

1. Open **My Registrations** (`/student/my-registrations`).
2. Find the event with status **Registered**.
3. Click **Cancel Registration** and confirm the action.
4. The registration status changes to **Cancelled** and event capacity may reopen if the event was full.

### Student dashboard

URL: `/student/dashboard`

The dashboard shows:

- A welcome message with your name
- Summary cards: registered events, events this week, event categories, campus events
- A filterable event gallery with views for:
  - **Registered Events** — events you are signed up for
  - **Suggested Events** — recommendations based on your interests
  - **Upcoming Registered Events** — future events you are registered for
  - **Attended Events** — events you attended
  - **Cancelled Events** — registrations you cancelled
- Card and list view toggle

### My registrations

URL: `/student/my-registrations`

- View all your registration records with status badges
- See a participation summary (registered, attended, cancelled counts)
- Cancel active registrations from this page

### Upcoming events

URL: `/student/upcoming-events`

- View future events you are registered for
- See registration status for each event
- Register for additional open events from this page

### Profile

URL: `/profile`

1. View your account information.
2. Update your full name or email address.
3. Change your password (current password required).

### Log out

Click **Logout** from the navigation menu when you are finished.

---

## 5. Admin / Organizer Users

### Log in as admin

1. Open the **Login** page (`/login`).
2. Enter admin credentials.
3. Select role **Admin** if prompted.
4. After login, you are redirected to the **Admin Dashboard** (`/admin/dashboard`).

### Admin dashboard

URL: `/admin/dashboard`

View campus-wide statistics:

- Total events and registrations
- Upcoming events
- Events at full capacity
- Cancelled events
- Attendance summary and rate
- Most popular event category
- Registrations by category table
- Per-event seat-fill percentage

### Create an event

URL: `/admin/create-event`

1. Go to **Create Event** from the admin navigation.
2. Fill in:
   - Event title
   - Category (from the supported list)
   - Date, start time, and end time
   - Location
   - Capacity
   - Status (Open, Full, Disabled, or Cancelled)
   - Description
3. Click **Publish Event**.
4. The organizer is automatically set to your admin account.

**Validation rules:**

- All required fields must be completed
- Event date cannot be in the past
- Capacity must be a positive number
- End time must be after start time
- Category must exist in the database

### Manage events

URL: `/admin/manage-events`

1. View the event table with capacity, registration count, and status.
2. Use the search bar and status filter to find events.
3. Available actions per event:
   - **Edit** — update event details
   - **Cancel / Reopen** — change event status
   - **Disable** — block new registrations
   - **Delete** — remove event (only when no active registrations exist)
   - **View Registrations** — open the student roster for that event

### Edit an event

URL: `/admin/edit-event?id={eventId}`

1. Open from Manage Events or the dashboard.
2. Update any event field.
3. Submit the form to save changes.

Admins can only edit events they created (organizer ownership is enforced).

### View registrations

URL: `/admin/view-registrations?id={eventId}`

1. Open from Manage Events for a specific event.
2. View registered students with:
   - Name and email
   - Registration date
   - Registration status
   - Attendance status
3. Mark students as **Attended** or **Missed** from this page.

### Attendance management

URL: `/admin/attendance-management`

1. Select an event from the dropdown.
2. View all registered students for that event.
3. Mark each student as **Attended** or **Missed**.
4. Attendance updates the registration status and attendance flag in the database.

### Log out

Click **Logout** from the admin navigation when finished.

---

## 6. Event Statuses

| Status | Meaning | Can students register? |
|--------|---------|------------------------|
| Open | Registration is available | Yes |
| Full | Event has reached capacity | No |
| Cancelled | Event was cancelled | No |
| Completed | Event has already taken place | No |
| Disabled | Registration is disabled by admin | No |

---

## 7. Registration Statuses

| Status | Meaning |
|--------|---------|
| Registered | Active registration |
| Cancelled | Student cancelled the registration |
| Attended | Student attended the event |
| Missed | Student did not attend |

Attendance is marked by admins on the View Registrations or Attendance Management pages.

---

## 8. Event Categories

CampusConnect supports the following event categories (stored in the database):

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

### Public and shared

| Page | URL |
|------|-----|
| Home | `/` |
| About | `/about` |
| Contact | `/contact` |
| Events | `/events` |
| Event Details | `/event-details` |
| Login | `/login` |
| Register | `/register` |
| Profile | `/profile` |

### Student (login required)

| Page | URL |
|------|-----|
| Student Dashboard | `/student/dashboard` |
| My Registrations | `/student/my-registrations` |
| Upcoming Events | `/student/upcoming-events` |

### Admin (login required)

| Page | URL |
|------|-----|
| Admin Dashboard | `/admin/dashboard` |
| Create Event | `/admin/create-event` |
| Manage Events | `/admin/manage-events` |
| Edit Event | `/admin/edit-event?id={eventId}` |
| View Registrations | `/admin/view-registrations?id={eventId}` |
| Attendance Management | `/admin/attendance-management` |

Legacy `/views/*.html` URLs redirect to the canonical routes above.

---

## 10. Mobile Use

CampusConnect is designed to work on different screen sizes (Deliverable 1 responsive design):

- On smaller screens, use the **☰** button in the header to open the navigation menu.
- Tap a navigation link to go to a page; the menu closes automatically.
- Press **Escape** or resize to a wider screen to close the menu.
- Event cards, tables, and forms adapt to narrower viewports.

---

## 11. Deliverable 1 vs Deliverable 2 — What Changed

### Deliverable 1 (Frontend)

In Deliverable 1, users could:

- Navigate between all pages using the header and footer
- View page layouts, forms, tables, and status badges
- See frontend form validation on login, register, and contact pages
- Experience responsive design on desktop and mobile

Data on pages could be hard-coded. Login redirected based on role selection without a real backend.

### Deliverable 2 (Full Stack)

In Deliverable 2, the same pages now:

- Load live data from the SQLite database via REST APIs
- Require real authentication (sessions) for protected pages
- Enforce role-based access (students cannot access admin pages)
- Validate input on both frontend and backend
- Calculate event capacity and registration limits on the server
- Persist registrations, attendance, and profile changes

---

## 12. API Reference

All API routes require the server to be running. Protected routes require an active login session (cookie).

### Public

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/public/featured-events` | Featured events for home page |
| GET | `/api/public/events` | List public events |
| GET | `/api/public/events/:id` | Event details |
| GET | `/api/public/upcoming-events` | Upcoming events |

### Authentication

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Current user info |
| PUT | `/api/auth/profile` | Update name or email |
| PUT | `/api/auth/password` | Change password |

### Events

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/events` | No | List events with filters |
| GET | `/api/events/filter-options` | No | Filter dropdown options |
| GET | `/api/events/details/:eventId` | No | Event details |
| GET | `/api/events/suggested` | Student | Suggested events |

### Registrations

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/registrations` | Student | Register for event |
| GET | `/api/registrations/my` | Student | My registrations |
| GET | `/api/registrations/upcoming` | Student | Upcoming registered events |
| GET | `/api/registrations/summary` | Student | Participation summary |
| PATCH | `/api/registrations/:registrationId/cancel` | Student | Cancel registration |

### Student dashboard

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/student/dashboard/summary` | Student | Dashboard statistics |
| GET | `/api/student/dashboard/events` | Student | Registered events |

### Admin

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/dashboard` | Admin | Dashboard statistics |
| GET | `/api/admin/events` | Admin | All events |
| POST | `/api/admin/events` | Admin | Create event |
| PUT | `/api/admin/events/:eventId` | Admin | Edit event |
| PATCH | `/api/admin/events/:eventId/status` | Admin | Change event status |
| DELETE | `/api/admin/events/:eventId` | Admin | Delete event |
| GET | `/api/admin/events/:eventId/registrations` | Admin | Event registrations |
| PATCH | `/api/admin/registrations/:registrationId/attendance` | Admin | Mark attendance |

---

## 13. Demo Checklist

Use this checklist to prepare for the project demo.

### Deliverable 1 (Frontend)

- [ ] Website navigation works across all pages
- [ ] Student interface pages are accessible and styled
- [ ] Admin interface pages are accessible and styled
- [ ] Forms and page layouts are clean and organized
- [ ] Responsive design works on mobile and desktop

### Deliverable 2 (Full Stack)

- [ ] User registration and login work
- [ ] Student can register for an event
- [ ] Admin can create an event
- [ ] Data is stored in and loaded from the database
- [ ] Event capacity validation blocks over-registration
- [ ] Role-based access restricts student and admin pages
- [ ] Student dashboard shows live data
- [ ] Admin statistics and attendance management work
- [ ] Error handling and validation messages appear for invalid input

---

## 14. Support

For questions about the project, contact your SOEN 287 course instructor or refer to the course Moodle page.

---

**SOEN 287 — Web Programming**  
Concordia University — Summer 2026
