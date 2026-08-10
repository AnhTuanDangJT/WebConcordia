const express = require("express");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Middleware to check if user is authenticated and has Admin role
const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Please log in",
    });
  }

  if (req.session.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }

  // Attach user to request object for use in controllers
  req.user = req.session.user;
  next();
};

// Apply auth middleware to all admin routes
router.use(authMiddleware);

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