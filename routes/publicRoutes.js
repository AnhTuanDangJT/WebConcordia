const express = require("express");
const publicController = require("../controllers/publicController");
const { handleValidation } = require("../middleware/validationMiddleware");

const router = express.Router();

router.get("/", publicController.getHomePage);
router.get("/about", publicController.getAboutPage);
router.get("/contact", publicController.getContactPage);
router.get("/events", publicController.getEventsPage);
// Keep legacy header links working (views/ is not static)
router.get("/views/events.html", publicController.getEventsPage);

// pages must be served manually: these pages may be accessible even by those without a valid session
router.get("/login", publicController.getLoginPage);
router.get("/register", publicController.getRegistrationPage);

router.post(
  "/api/contact",
  publicController.contactValidationRules,
  handleValidation,
  publicController.submitContactForm
);

router.get("/api/health", publicController.healthCheck);
router.get("/api/public/featured-events", publicController.getFeaturedEvents);
router.get("/api/public/events", publicController.getAllEvents);
router.get("/api/public/events/:id", publicController.getEventDetails);
router.get("/api/public/upcoming-events", publicController.getUpcomingEvents);

module.exports = router;