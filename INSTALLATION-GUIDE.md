# CampusConnect — Installation Guide

**Course:** SOEN 287 — Web Programming  
**Project:** Smart Campus Event Planner  
**Deliverables:** Part I (Frontend) and Part II (Full Stack)

---

## 1. Overview

CampusConnect is a web-based campus event planner. The project was delivered in two parts:

| Deliverable | Focus | Status |
|-------------|-------|--------|
| **Part I** | HTML/CSS/JS frontend, pages, navigation, responsive design | Completed |
| **Part II** | Node.js backend, SQLite database, authentication, API integration | Completed |

This guide explains how to install and run the **full application** (Deliverable 2). The Deliverable 1 frontend is included in the same codebase and is served through the Express server.

The application must be started through the Express server. Do **not** open `index.html` directly in the browser (`file://` URLs will not load API data or authentication correctly).

---

## 2. Required Software

| Software | Purpose | Required? |
|----------|---------|-----------|
| Node.js 18 or newer | Run the backend server | Yes |
| npm | Install project dependencies | Yes |
| Modern web browser (Chrome, Firefox, Edge, or Safari) | View and interact with the website | Yes |

Check your versions:

```bash
node -v
npm -v
```

---

## 3. Getting the Project Files

1. Download or clone the project repository.
2. Extract the files if you received a compressed (`.zip`) submission.
3. Open a terminal in the project folder (`WebConcordia`).

Confirm the folder contains:

- `app.js`
- `package.json`
- `.env.example`
- `index.html`
- `public/` — CSS, JavaScript, images
- `views/` — HTML pages
- `database/` — schema and setup scripts
- `routes/`, `controllers/`, `models/`, `middleware/`, `validation/`
- `tests/` — API tests
- `README.md`, `USER-GUIDE.md`

---

## 4. Installation Steps

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Configure environment variables

Copy the example environment file:

**Windows (PowerShell):**

```powershell
copy .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
PORT=3000
SESSION_SECRET=change-this-to-a-long-random-string
NODE_ENV=development
```

Change `SESSION_SECRET` to a long random string before deployment.

### Step 3 — Initialize the database

Create the SQLite tables:

```bash
npm run db:init
```

This creates `database/campusconnect.db` and the following tables:

| Table | Purpose |
|-------|---------|
| `users` | Student and admin accounts |
| `categories` | Event category names and descriptions |
| `events` | Campus events |
| `registrations` | Student event registrations and attendance |

### Step 4 — Seed sample data

Insert test accounts, categories, events, and registrations:

```bash
npm run db:seed
```

If seed data already exists, the script skips duplicate inserts and prints a message.

### Step 5 — Start the server

```bash
npm start
```

For development with automatic restart:

```bash
npm run dev
```

### Step 6 — Open the website

Visit:

```text
http://localhost:3000
```

---

## 5. Default Test Accounts

These accounts are created by `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Student | `student@test.com` | `password123` |
| Admin | `admin@test.com` | `password123` |

Use these to test login, student registration flows, and admin event management.

---

## 6. Useful Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm start` | Start the server |
| `npm run dev` | Start the server with nodemon |
| `npm run db:init` | Create database tables |
| `npm run db:seed` | Insert sample data |
| `npm test` | Run API tests |

---

## 7. Verify the Installation

After starting the server, confirm the following:

### Public pages

| URL | Expected result |
|-----|-----------------|
| `http://localhost:3000/` | Home page loads with styles and featured events |
| `http://localhost:3000/about` | About page loads |
| `http://localhost:3000/contact` | Contact page loads |
| `http://localhost:3000/events` | Events list page loads |
| `http://localhost:3000/login` | Login page loads |
| `http://localhost:3000/register` | Registration page loads |

### API health checks

| URL | Expected result |
|-----|-----------------|
| `http://localhost:3000/api/health` | JSON: `{ "success": true, "message": "Server is running" }` |
| `http://localhost:3000/api/public/featured-events` | JSON list of upcoming events |

### Authentication and roles

1. Log in as **student** (`student@test.com` / `password123`) — you should be redirected to `/student/dashboard`.
2. Log out, then log in as **admin** (`admin@test.com` / `password123`) — you should be redirected to `/admin/dashboard`.
3. Confirm student-only pages (e.g. `/student/my-registrations`) redirect to login when not authenticated.

### Core functionality

1. **Navigation** — header and footer links work; mobile menu (☰) opens and closes.
2. **Contact form** — submit the form and confirm a success or error message appears.
3. **Student flow** — browse events, view details, register for an open event, cancel from My Registrations.
4. **Admin flow** — create an event, view it on Manage Events, view registrations, mark attendance.
5. **Capacity** — register students until an event is full; confirm registration is blocked.

---

## 8. Project Structure

```
WebConcordia/
├── app.js                          # Express server entry point
├── package.json
├── .env.example
├── index.html                      # Home page
├── README.md
├── INSTALLATION-GUIDE.md
├── USER-GUIDE.md
│
├── public/
│   ├── css/                        # Stylesheets (Deliverable 1)
│   ├── js/                         # Frontend scripts (Deliverables 1 & 2)
│   └── images/
│
├── views/                          # HTML pages (Deliverable 1)
│
├── routes/                         # Express route definitions (Deliverable 2)
├── controllers/                    # Request handlers (Deliverable 2)
├── models/                         # Database access (Deliverable 2)
├── middleware/                     # Auth, roles, validation (Deliverable 2)
├── validation/                     # Input validation rules (Deliverable 2)
│
├── database/
│   ├── database.js
│   ├── schema.sql
│   ├── initializeDatabase.js
│   ├── seed.js
│   └── campusconnect.db            # Created after db:init
│
└── tests/                          # API tests (Deliverable 2)
```

---

## 9. Deliverable 1 vs Deliverable 2

### Deliverable 1 (Frontend)

For Deliverable 1, the team built:

- All HTML pages in `views/` and `index.html`
- CSS design system in `public/css/`
- Frontend JavaScript for navigation, forms, and page interactions
- Responsive layout and mobile navigation
- Student and admin page layouts with forms and tables

Deliverable 1 did **not** require a backend or database. Pages could use hard-coded sample data.

### Deliverable 2 (Full Stack)

Deliverable 2 extended the frontend with:

- Node.js + Express server (`app.js`)
- SQLite database (`database/`)
- User authentication and sessions
- Role-based access (student vs admin)
- REST APIs for events, registrations, and admin operations
- Server-side validation and capacity logic
- Integration of all frontend pages with live API data

The current repository is the **integrated full-stack application**. Always run it with `npm start` after database setup.

---

## 10. Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | Change `PORT` in `.env` (e.g. `3001`) and restart |
| CSS or images not loading | Use `http://localhost:3000`, not `file://` |
| Database errors | Delete `database/campusconnect.db`, then run `db:init` and `db:seed` again |
| Seed says data already exists | Normal — test accounts are already present |
| `npm install` fails | Check Node.js/npm versions; delete `node_modules` and retry |
| Featured events empty | Run `npm run db:seed` to insert sample events |
| Page shows "Page not found" | Confirm the server is running and the URL is correct |
| Login does not redirect | Clear browser cookies for `localhost` and try again |
| API returns 403 | Confirm you are logged in with the correct role (student vs admin) |
| Registration blocked | Check event status (must be Open), capacity, and that the event date has not passed |

---

## 11. What Is Not Included in the Repository

The following are **not** committed and must be created locally:

| Item | How to create |
|------|---------------|
| `.env` | Copy from `.env.example` |
| `node_modules/` | Run `npm install` |
| `database/campusconnect.db` | Run `npm run db:init` |

---

## 12. Resetting the Database

To start fresh with a clean database:

```bash
# Delete the database file (Windows PowerShell)
Remove-Item database\campusconnect.db

# Or macOS / Linux
rm database/campusconnect.db

# Recreate and reseed
npm run db:init
npm run db:seed
```

---

See [USER-GUIDE.md](USER-GUIDE.md) for how to use the website after installation.

---

**SOEN 287 — Web Programming**  
Concordia University — Summer 2026
