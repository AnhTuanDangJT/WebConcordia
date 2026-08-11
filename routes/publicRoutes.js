const express = require("express");
const publicController = require("../controllers/publicController");
const { handleValidation } = require("../middleware/validationMiddleware");

const router = express.Router();

router.get("/", publicController.getHomePage);
router.get("/about", publicController.getAboutPage);
router.get("/contact", publicController.getContactPage);

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
<<<<<<< HEAD
router.get("/api/public/events", publicController.getAllEvents);
=======
router.get("/api/public/events/:id", publicController.getEventDetails);
router.get("/api/public/upcoming-events", publicController.getUpcomingEvents);
>>>>>>> 42d6043 (Complete registration and upcoming events integration)

module.exports = router;