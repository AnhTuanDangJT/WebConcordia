const express = require("express");
const path = require("path");
const { validSession } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(validSession, checkRole("admin"));

router.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "admin-dashboard.html"));
});

router.get("/create-event", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "create-event.html"));
});

router.get("/manage-events", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "manage-events.html"));
});

router.get("/edit-event", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "edit-event.html"));
});

router.get("/view-registrations", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "view-registrations.html"));
});

router.get("/attendance-management", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "attendance-management.html"));
});

module.exports = router;
