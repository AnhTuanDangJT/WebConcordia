# CampusConnect — Installation Guide (Deliverable 2)

**Course:** SOEN 287 — Web Programming  
**Project:** Smart Campus Event Planner  
**Deliverable:** Part II (Full Stack)

---

## 1. Overview

CampusConnect is a Node.js web application with an Express backend and SQLite database. This guide explains how to install dependencies, set up the database, and run the application from a clean project folder.

---

## 2. Required Software

| Software | Purpose | Required? |
|----------|---------|-----------|
| Node.js 18 or newer | Run the backend server | Yes |
| npm | Install project dependencies | Yes |
| Modern web browser | View and interact with the website | Yes |

---

## 3. Getting the Project Files

1. Download or clone the project repository.
2. Extract the files if you received a compressed (`.zip`) submission.
3. Confirm the project folder contains:
   - `app.js`
   - `package.json`
   - `index.html`
   - `public/` (CSS, JavaScript, images)
   - `views/` (HTML pages)
   - `database/` (schema and setup scripts)
   - `routes/`, `controllers/`, `middleware/`

---

## 4. Setup Instructions

### Step 1 — Install dependencies

Open a terminal in the project folder and run:

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

Edit `.env` if needed:

```env
PORT=3000
SESSION_SECRET=change-this-to-a-long-random-string
NODE_ENV=development
```

### Step 3 — Initialize the database

Create the SQLite tables:

```bash
npm run db:init
```

### Step 4 — Seed sample data

Insert test users, categories, events, and registrations:

```bash
npm run db:seed
```

### Step 5 — Start the server

```bash
npm start
```

For development with auto-restart:

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

| Role | Email | Password |
|------|-------|----------|
| Student | `student@test.com` | `password123` |
| Admin | `admin@test.com` | `password123` |

These accounts are created by `npm run db:seed`.

---

## 6. Useful Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start the production server |
| `npm run dev` | Start the server with nodemon |
| `npm run db:init` | Create database tables |
| `npm run db:seed` | Insert sample data |

---

## 7. Verify the Installation

After starting the server, confirm these URLs work:

| URL | Expected result |
|-----|-----------------|
| `http://localhost:3000/` | Home page loads with styles |
| `http://localhost:3000/about` | About page loads |
| `http://localhost:3000/contact` | Contact page loads |
| `http://localhost:3000/api/health` | JSON response: server is running |
| `http://localhost:3000/api/public/featured-events` | JSON list of featured events |

---

## 8. Troubleshooting

### Port already in use

Change `PORT` in `.env` to another value (for example `3001`), then restart the server.

### Database errors

1. Delete `database/campusconnect.db` if it exists.
2. Run `npm run db:init` again.
3. Run `npm run db:seed` again.

### Seed says data already exists

This is normal. The seed script skips duplicate inserts if test accounts are already present.

### CSS or images not loading

Make sure you are accessing the site through the Express server (`http://localhost:3000`), not by opening `index.html` directly in the browser.

### `npm install` fails

- Confirm Node.js is installed: `node -v`
- Confirm npm is installed: `npm -v`
- Try deleting `node_modules` and running `npm install` again

---

## 9. Project Structure (Backend)

```
WebConcordia/
├── app.js
├── package.json
├── .env.example
├── index.html
├── public/
├── views/
├── routes/
├── controllers/
├── middleware/
├── database/
│   ├── database.js
│   ├── schema.sql
│   ├── initializeDatabase.js
│   ├── seed.js
│   └── campusconnect.db
├── INSTALLATION-GUIDE.md
└── USER-GUIDE.md
```

---

## 10. Known Limitations

- Authentication, events, registrations, and admin APIs are added by other team members.
- Contact form submissions are validated but not stored in the database.
- Some pages in `views/` still use Deliverable 1 paths until teammates complete their integration.

---

**SOEN 287 — Web Programming**  
Concordia University — Summer 2026
