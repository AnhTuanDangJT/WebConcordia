# CampusConnect — Smart Campus Event Planner

A web-based campus event planning application for **SOEN 287: Web Programming (Summer 2026)**. CampusConnect helps students discover campus events, register for activities, and manage their event schedule, while giving organizers tools to create and manage events.

This repository contains **Deliverable 2 (Full Stack)** — Node.js, Express, SQLite, authentication, and database-driven features built on the Deliverable 1 frontend.

![CampusConnect home page](public/images/homepage-screenshot.png)

## Project Overview

University students often miss workshops, career fairs, club activities, and networking events because information is spread across emails, posters, and social media. CampusConnect centralizes event discovery, registration, and management in one place.

### User Roles

- **Student** — browse events, register, view dashboard, manage registrations
- **Admin / Organizer** — create events, manage events, view campus event overview

## Features Implemented (Deliverable 1)

### Public Pages
- Home page with hero section, featured events, and event categories
- About page
- Contact page with frontend form validation
- Shared header, navigation bar, footer, and mobile menu

### Authentication (Frontend Simulation)
- Login page with email, password, and role selection
- Registration page with full name, email, password, confirm password, and role
- Profile page
- Frontend validation for required fields, email format, and password rules
- Simulated login redirect:
  - Student → `views/student-dashboard.html`
  - Admin → `views/admin-dashboard.html`

### Student Pages
- Student dashboard with registered and attended event sections
- Events list page with search and filter controls
- Event details page
- My registrations page with participation summary
- Upcoming events page with registration status badges

### Admin Pages
- Admin dashboard with event statistics and summary table
- Create event page with event form
- Manage events page with event table and action buttons

### Shared Design System
- Colour variables, typography, buttons, cards, forms, badges, and tables in `global.css`
- Responsive layout for desktop and mobile

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| About | `views/about.html` |
| Contact | `views/contact.html` |
| Login | `views/login.html` |
| Register | `views/register.html` |
| Profile | `views/profile.html` |
| Student Dashboard | `views/student-dashboard.html` |
| Events | `views/events.html` |
| Event Details | `views/event-details.html` |
| My Registrations | `views/my-registrations.html` |
| Upcoming Events | `views/upcoming-events.html` |
| Admin Dashboard | `views/admin-dashboard.html` |
| Create Event | `views/create-event.html` |
| Manage Events | `views/manage-events.html` |

## Project Structure

```
WebConcordia/
├── index.html
├── README.md
│
├── public/
│   ├── css/
│   │   ├── global.css          # Shared styles (all pages)
│   │   ├── public-pages.css    # Home, About, Contact
│   │   ├── auth.css            # Login, Register, Profile
│   │   ├── student.css         # Student dashboard & events
│   │   ├── registrations.css   # My registrations & upcoming events
│   │   └── admin.css           # Admin pages
│   │
│   ├── js/
│   │   ├── main.js             # Mobile navigation & contact form
│   │   ├── auth.js             # Login & registration validation
│   │   └── registrations.js    # Registration page interactions
│   │
│   └── images/
│
└── views/
    ├── about.html
    ├── contact.html
    ├── login.html
    ├── register.html
    ├── profile.html
    ├── student-dashboard.html
    ├── events.html
    ├── event-details.html
    ├── my-registrations.html
    ├── upcoming-events.html
    ├── admin-dashboard.html
    ├── create-event.html
    └── manage-events.html
```

## How to Run

### Deliverable 2 (recommended)

```bash
npm install
npm run db:init
npm run db:seed
npm start
```

Open `http://localhost:3000` in your browser.

See [INSTALLATION-GUIDE.md](INSTALLATION-GUIDE.md) for full setup instructions and [USER-GUIDE.md](USER-GUIDE.md) for usage instructions.

### Default Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | `student@test.com` | `password123` |
| Admin | `admin@test.com` | `password123` |

### Member 1 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Home page |
| GET | `/about` | About page |
| GET | `/contact` | Contact page |
| GET | `/api/health` | Server health check |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/public/featured-events` | Featured events for home page |

## Technologies

- HTML5, CSS3, JavaScript (vanilla)
- Node.js, Express
- SQLite
- bcrypt, express-session, express-validator

## Team Work Distribution

| Member | Responsibility |
|--------|----------------|
| Member 1 — Anh Tuan Dang | Common layout, public pages, `global.css`, navigation, footer |
| Member 2 — Mehran Bordbar | Login, registration, profile, `auth.css`, `auth.js` |
| Member 3 — Najum Avur Mammu | Student dashboard, events list, event details, `student.css` |
| Member 4 — Disha | My registrations, upcoming events, `registrations.css`, `registrations.js` |
| Member 5 — Tiago | Admin pages, integration, testing, `admin.css` |

## Notes

- Public pages (home, about, contact) are served through Express with database-driven featured events.
- Authentication, events, registrations, and admin features are implemented by team members in Deliverable 2.
- See `INSTALLATION-GUIDE.md` and `USER-GUIDE.md` for setup and usage details.

## Course

**SOEN 287 — Web Programming**  
Concordia University — Summer 2026
