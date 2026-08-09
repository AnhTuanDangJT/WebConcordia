const { db } = require("../database/database");
const path = require("path");
const { body } = require("express-validator");

// --- Page routes ---

function getHomePage(req, res) {
  res.sendFile(path.join(__dirname, "..", "index.html"));
}

function getAboutPage(req, res) {
  res.sendFile(path.join(__dirname, "..", "views", "about.html"));
}

function getContactPage(req, res) {
  res.sendFile(path.join(__dirname, "..", "views", "contact.html"));
}


// controllers for public auth pages
function getLoginPage(req, res) {
  res.sendFile(path.join(__dirname, "..", "views", "login.html"));
}

function getRegistrationPage(req, res) {
  res.sendFile(path.join(__dirname, "..", "views", "register.html"));
}

// --- API routes ---

function healthCheck(req, res) {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
}

// Validation rules for contact form
const contactValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required."),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required.")
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters."),
];

function submitContactForm(req, res) {
  // For now: validate and return success.
  // Storing contact messages in DB is optional for your project.
  const { name, email, subject, message } = req.body;

  console.log("Contact form submission:", { name, email, subject, message });

  res.status(200).json({
    success: true,
    message: "Your message has been submitted successfully.",
  });
}

function getFeaturedEvents(req, res, next) {
    const sql = `
      SELECT
        e.event_id,
        e.title,
        e.description,
        e.category,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.capacity,
        e.status,
        u.full_name AS organizer_name,
        COUNT(
          CASE
            WHEN r.status = 'Registered' THEN 1
            ELSE NULL
          END
        ) AS registration_count
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      LEFT JOIN registrations r ON e.event_id = r.event_id
      WHERE e.status IN ('Open', 'Full')
        AND e.event_date >= date('now')
      GROUP BY e.event_id
      ORDER BY e.event_date ASC, e.start_time ASC
      LIMIT 3
    `;
    db.all(sql, [], (err, rows) => {
      if (err) {
        return next(err);
      }
  
      res.status(200).json({
        success: true,
        data: rows,
      });
    });
  }

  function getAllEvents(req, res, next) {
    const sql = `
      SELECT
        e.event_id,
        e.title,
        e.description,
        e.category,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.capacity,
        e.status,
        u.full_name AS organizer_name
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      WHERE e.event_date >= date('now')
      ORDER BY e.event_date ASC, e.start_time ASC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        return next(err);
      }

      res.status(200).json({
        success: true,
        data: rows,
      });
    });
  }

  module.exports = {
    getHomePage,
    getAboutPage,
    getContactPage,
    healthCheck,
    contactValidationRules,
    submitContactForm,
    getFeaturedEvents,
    getAllEvents,
    getLoginPage,
    getRegistrationPage
  };