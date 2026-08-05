# CampusConnect — Installation Guide

**Course:** SOEN 287 — Web Programming  
**Project:** Smart Campus Event Planner  
**Deliverable:** Part II (Full Stack)

---

## 1. Overview

CampusConnect is a web-based campus event planner built with **Node.js**, **Express**, and **SQLite**. This guide explains how to install the project, set up the database, and run the application from a clean project folder.

The application must be started through the Express server. Do **not** open `index.html` directly in the browser.

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
- `routes/`, `controllers/`, `middleware/`

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

- `users`
- `events`
- `registrations`
- `categories`

### Step 4 — Seed sample data

Insert test accounts, categories, events, and registrations:

```bash
npm run db:seed
```

If seed data already exists, the script skips duplicate inserts.

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

Use these accounts to test login once authentication is integrated by the team.

---

## 6. Useful Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm start` | Start the server |
| `npm run dev` | Start the server with nodemon |
| `npm run db:init` | Create database tables |
| `npm run db:seed` | Insert sample data |

---

## 7. Verify the Installation

After starting the server, confirm the following:

| URL | Expected result |
|-----|-----------------|
| `http://localhost:3000/` | Home page loads with styles and featured events |
| `http://localhost:3000/about` | About page loads |
| `http://localhost:3000/contact` | Contact page loads |
| `http://localhost:3000/views/login.html` | Login page loads |
| `http://localhost:3000/api/health` | JSON: `{ "success": true, "message": "Server is running" }` |
| `http://localhost:3000/api/public/featured-events` | JSON list of upcoming events |

Also confirm:

1. Navigation links work in the header and footer.
2. The mobile menu button (☰) opens and closes on smaller screens.
3. The contact form shows a success or error message after submission.

---

## 8. Project Structure

```
WebConcordia/
├── app.js                      # Express server entry point
├── package.json
├── .env.example
├── index.html                  # Home page
├── README.md
├── INSTALLATION-GUIDE.md
├── USER-GUIDE.md
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│
├── views/                      # HTML pages (served at /views/...)
│
├── routes/
│   └── publicRoutes.js
│
├── controllers/
│   └── publicController.js
│
├── middleware/
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
│
└── database/
    ├── database.js
    ├── schema.sql
    ├── initializeDatabase.js
    ├── seed.js
    └── campusconnect.db        # Created after db:init
```

---

## 9. Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | Change `PORT` in `.env` (e.g. `3001`) and restart |
| CSS or images not loading | Use `http://localhost:3000`, not `file://` |
| Database errors | Delete `database/campusconnect.db`, then run `db:init` and `db:seed` again |
| Seed says data already exists | Normal — test accounts are already present |
| `npm install` fails | Check Node.js/npm versions; delete `node_modules` and retry |
| Featured events empty | Run `npm run db:seed` to insert sample events |
| Page shows "Page not found" | Confirm the server is running and the URL is correct |

---

## 10. What Is Not Included in the Project Folder

The following are **not** committed to the repository and must be created locally:

- `.env` — copy from `.env.example`
- `node_modules/` — created by `npm install`
- `database/campusconnect.db` — created by `npm run db:init`

---

## 11. Current Project Status

**Currently implemented (Member 1):**

- Express server and SQLite database foundation
- Public pages: home, about, contact
- Contact form API with server-side validation
- Featured events loaded from the database on the home page
- Installation and user documentation

**In progress (other team members):**

- Authentication and user profiles
- Event browsing, filtering, and student dashboard APIs
- Registration and cancellation workflows
- Admin event management, attendance, and statistics

See `USER-GUIDE.md` for how to use the website once all features are integrated.

---

**SOEN 287 — Web Programming**  
Concordia University — Summer 2026
