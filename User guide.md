# CampusConnect — User Guide (Deliverable 1)

**Course:** SOEN 287 — Web Programming  
**Project:** Smart Campus Event Planner  
**Deliverable:** Part I (Frontend only)

---

## 1. Introduction

CampusConnect is a web-based campus event planner that helps students discover events, register for activities, and manage their schedule. Organizers can view event overviews and manage campus events.

**Important:** In Deliverable 1, all data is hard-coded and interactions are simulated in the browser. Login, registration, and event actions do not connect to a backend yet. Real data storage and authentication will be added in Deliverable 2.

---

## 2. Getting Started

1. Open the website using the steps in `Installation guide.md`.
2. Start from the **Home** page (`index.html`).
3. Use the top navigation bar to move between pages.
4. On mobile or smaller screens, tap the **☰** menu button to open navigation.

---

## 3. Public Pages (Before Login)

These pages are available to all visitors.

### Home Page

- View a welcome hero section, featured campus events, and event categories.
- Use **Browse Events** or **Create an Account** to explore further.

### About Page

- Learn about the CampusConnect project and its purpose.

### Contact Page

- Fill out the contact form with your name, email, subject, and message.
- The form validates required fields and email format on the frontend.
- On successful submission, a confirmation message is shown (no email is actually sent in Deliverable 1).

### Events List

- Browse available campus events displayed as cards.
- Use the search and filter controls to explore events by category, date, location, organizer, or status.
- Click **View details →** on an event card to open its full details page.

### Event Details

- View full information about a selected event, including date, time, location, organizer, and description.

---

## 4. Student Users

### 4.1 Creating an Account

1. Go to **Login** → **Create one!**, or open the **Register** page directly.
2. Fill in:
   - Full name
   - Email address
   - Password (minimum 8 characters)
   - Confirm password
   - Role (Student or Admin)
3. Click **Create account**.
4. If validation passes, you are redirected to the **Login** page.

**Validation rules:**

- All fields are required
- Email must be in a valid format
- Password must be at least 8 characters
- Password and confirm password must match

### 4.2 Logging In as a Student

1. Go to the **Login** page.
2. Enter any email and password (simulated login for Deliverable 1).
3. Make sure the **Role** toggle is set to **Student**.
4. Click **Log in**.
5. You are redirected to the **Student Dashboard**.

### 4.3 Student Dashboard

The student dashboard shows:

- A welcome message and events summary
- **Registered Events** — events you have signed up for
- **Attended Events** — events you have already attended

### 4.4 Browsing and Viewing Events

1. Open **Events** from the navigation.
2. Browse the event cards on the page.
3. Click **View details →** to see full event information.

### 4.5 Registering for Events

1. Go to the **Upcoming Events** page (linked from student-related navigation).
2. Find an event with an **Open** status badge.
3. Click the **Register** button on the event card.
4. The button changes to **Registered** to show a simulated registration.

**Note:** Events marked **Full**, **Cancelled**, or **Completed** cannot be registered for. If you try to register again, an alert message is shown.

### 4.6 Viewing My Registrations

1. Open the **My Registrations** page.
2. View your registered events and a participation summary:
   - Number of registered events
   - Number of attended events
3. Use the **Cancel** button on a registration card to simulate cancelling (a confirmation dialog appears first).

### 4.7 Viewing Upcoming Events

1. Open the **Upcoming Events** page.
2. Events are sorted by date automatically.
3. Each event shows a status badge: **Open**, **Full**, **Cancelled**, or **Completed**.

### 4.8 Profile Page

- View sample account details (name, email, user ID, account creation date).
- In Deliverable 1, profile data is hard-coded for demonstration.

---

## 5. Admin / Organizer Users

### 5.1 Logging In as an Admin

1. Go to the **Login** page.
2. Enter any email and password.
3. Toggle the **Role** switch to **Admin**.
4. Click **Log in**.
5. You are redirected to the **Admin Dashboard**.

### 5.2 Admin Dashboard

The admin dashboard shows:

- Campus event overview statistics (total events, registrations, attendance)
- A summary table of recent campus events
- Quick links to create and manage events

### 5.3 Creating an Event

1. From the admin navigation, go to **Create Event**.
2. Fill in the event form:
   - Event title
   - Category
   - Date, start time, and end time
   - Location
   - Capacity
   - Organizer name
   - Status
   - Description
3. Click **Publish Event** or **Reset** to clear the form.

**Note:** In Deliverable 1, the form is displayed for demonstration. Submitted data is not saved to a database.

### 5.4 Managing Events

1. Go to **Manage Events** from the admin navigation.
2. View a table of campus events with status badges.
3. Use the **Edit**, **Cancel**, and **Delete** action buttons (visual demonstration in Deliverable 1).

### 5.5 Logging Out

- Click **Logout** in the admin navigation to return to the Login page.

---

## 6. Event Status Badges

Events may display one of the following statuses:

| Status | Meaning |
|--------|---------|
| **Open** | Registration is available |
| **Full** | Event has reached capacity |
| **Cancelled** | Event has been cancelled |
| **Completed** | Event has already taken place |

---

## 7. Mobile Use

CampusConnect is designed to work on different screen sizes:

- On smaller screens, use the **☰** button in the header to open the navigation menu.
- Tap a navigation link to go to a page; the menu closes automatically.
- Press **Escape** or resize to a wider screen to close the menu.

---

## 8. Deliverable 1 Limitations

The following features are **not yet functional** and are planned for Deliverable 2:

- Real user account storage
- Secure password authentication
- Saving events to a database
- Server-side registration and capacity checks
- Admin edit/delete actions that persist data
- Email notifications

---

## 9. Quick Page Reference

| Page | How to Access |
|------|---------------|
| Home | `index.html` |
| About | Navigation → About |
| Contact | Navigation → Contact |
| Login | Navigation → Login |
| Register | Login page → Create one! |
| Student Dashboard | Login as Student |
| Events | Navigation → Events |
| Event Details | Events page → View details |
| My Registrations | Student navigation |
| Upcoming Events | Student navigation |
| Profile | Footer or account links |
| Admin Dashboard | Login as Admin |
| Create Event | Admin navigation |
| Manage Events | Admin navigation |

---

## 10. Support

For questions about using the website or reporting issues, contact your SOEN 287 course instructor or refer to the course Moodle page.
