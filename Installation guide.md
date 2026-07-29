# CampusConnect — Installation Guide (Deliverable 1)

**Course:** SOEN 287 — Web Programming  
**Project:** Smart Campus Event Planner  
**Deliverable:** Part I (Frontend only)

---

## 1. Overview

Deliverable 1 is a **frontend-only** website built with HTML, CSS, and JavaScript. It does **not** require Node.js, npm, or a database. All event data and user interactions are hard-coded or simulated in the browser.

Deliverable 2 will add a Node.js backend, database, and real authentication.

---

## 2. Required Software

| Software | Purpose | Required? |
|----------|---------|-----------|
| Modern web browser (Chrome, Firefox, Edge, or Safari) | View and interact with the website | Yes |
| Python 3.x **or** Node.js | Optional local development server | Recommended |

No other dependencies need to be installed for Deliverable 1.

---

## 3. Getting the Project Files

1. Download or clone the project repository.
2. Extract the files if you received a compressed (`.zip`) submission.
3. Confirm the project folder contains:
   - `index.html` (home page)
   - `README.md`
   - `public/` (CSS, JavaScript, images)
   - `views/` (all other HTML pages)

---

## 4. Running the Website

### Option A — Open directly in a browser (quickest)

1. Open the project folder on your computer.
2. Double-click `index.html`, or right-click it and choose **Open with** your preferred browser.

The home page should load at a `file://` address in the address bar.

### Option B — Local development server (recommended)

Using a local server helps ensure file paths and navigation behave consistently across all pages.

**Using Python:**

```bash
cd path/to/WebConcordia
python -m http.server 8000
```

**Using Node.js (npx, no install required):**

```bash
cd path/to/WebConcordia
npx serve .
```

Then open your browser and go to:

```
http://localhost:8000
```

---

## 5. Verifying the Installation

After opening the site, confirm the following:

1. The **CampusConnect** home page loads with the hero section and featured events.
2. Navigation links in the header work (Home, Events, About, Contact, Login).
3. The mobile menu button (☰) opens and closes the navigation on smaller screens.
4. Pages under `views/` load correctly when clicked from the navigation.

---

## 6. Project File Structure

```
WebConcordia/
├── index.html                  # Home page
├── README.md
├── Installation guide.md       # This file
├── User guide.md
│
├── public/
│   ├── css/                    # Stylesheets
│   ├── js/                     # Frontend JavaScript
│   └── images/                 # Images and favicon
│
└── views/                      # All other HTML pages
```

---

## 7. Default Test Accounts

Deliverable 1 does **not** use a real database. Login is simulated on the frontend.

- You may enter **any valid email format** and **any password** on the login page.
- Use the **Role** toggle on the login page to choose where you are redirected:
  - **Student** → Student Dashboard
  - **Admin** → Admin Dashboard

No account is permanently stored after registration in Deliverable 1.

---

## 8. Troubleshooting

| Problem | Solution |
|---------|----------|
| Styles or images do not load | Use Option B (local server) instead of opening `index.html` directly |
| A page shows a blank or broken layout | Make sure the full `public/` folder is present and was not moved |
| Mobile menu does not open | Confirm JavaScript is enabled in your browser |
| Login does not redirect | Fill in both email and password fields with valid values, then submit |

---

## 9. What Is Not Required for Deliverable 1

The following are **not** needed to run Deliverable 1:

- `npm install`
- Database setup (MySQL, MongoDB, etc.)
- Environment variables (`.env`)
- Backend server (`node app.js`)

These will be required for Deliverable 2.

---

## 10. Support

For questions about the project, contact your SOEN 287 course instructor or refer to the course Moodle page.
