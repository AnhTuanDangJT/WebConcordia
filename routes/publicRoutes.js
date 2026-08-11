const express = require("express");
const publicController = require("../controllers/publicController");
const { handleValidation } = require("../middleware/validationMiddleware");
const { validSession, testUser } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", publicController.getHomePage);
router.get("/about", publicController.getAboutPage);
router.get("/contact", publicController.getContactPage);
router.get("/events", publicController.getEventsPage);
router.get("/event-details", publicController.getEventDetailsPage);
router.get("/upcoming-events", publicController.getUpcomingEventsPage);

router.get("/my-registrations", validSession, checkRole("student"), publicController.getMyRegistrationsPage);

router.get("/profile", async (req, res) => {
  try {
    await testUser(req);
    return publicController.getProfilePage(req, res);
  } catch (error) {
    return res.redirect("/login");
  }
});

// Legacy /views/*.html links (views/ is not static)
router.get("/views/events.html", publicController.getEventsPage);
router.get("/views/event-details.html", publicController.getEventDetailsPage);
router.get("/views/upcoming-events.html", publicController.getUpcomingEventsPage);
router.get("/views/my-registrations.html", validSession, checkRole("student"), publicController.getMyRegistrationsPage);
router.get("/views/login.html", (req, res) => res.redirect("/login"));
router.get("/views/register.html", (req, res) => res.redirect("/register"));
router.get("/views/profile.html", (req, res) => res.redirect("/profile"));
router.get("/views/student-dashboard.html", (req, res) => res.redirect("/student/dashboard"));
router.get("/views/admin-dashboard.html", (req, res) => res.redirect("/admin/dashboard"));

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
