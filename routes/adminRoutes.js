const express = require("express");
const path = require("path");
const adminController = require("../controllers/adminController");
const { validSession } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply session and role middleware to all admin routes
router.use(validSession, checkRole("admin"));

// ==================== EVENT ENDPOINTS ====================

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 */
router.get("/dashboard", adminController.getDashboardStats);

/**
 * GET /api/admin/events
 * Get all events for management
 */
router.get("/events", adminController.getEvents);

/**
 * POST /api/admin/events
 * Create a new event
 */
router.post("/events", adminController.createEvent);

/**
 * PUT /api/admin/events/:eventId
 * Edit an existing event
 */
router.put("/events/:eventId", adminController.editEvent);

/**
 * PATCH /api/admin/events/:eventId/status
 * Change event status (Cancel, Disable, etc.)
 */
router.patch("/events/:eventId/status", adminController.updateEventStatus);

/**
 * DELETE /api/admin/events/:eventId
 * Delete an event (only if no registrations exist)
 */
router.delete("/events/:eventId", adminController.deleteEvent);

// ==================== REGISTRATION ENDPOINTS ====================

/**
 * GET /api/admin/events/:eventId/registrations
 * Get all registrations for a specific event
 */
router.get("/events/:eventId/registrations", adminController.getRegistrations);

/**
 * PATCH /api/admin/registrations/:registrationId/attendance
 * Mark attendance for a registration
 */
router.patch(
  "/registrations/:registrationId/attendance",
  adminController.markAttendance
);

module.exports = router;