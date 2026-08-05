const express = require("express");
const publicController = require("../controllers/publicController");
const { handleValidation } = require("../middleware/validationMiddleware");

const router = express.Router();

router.get("/", publicController.getHomePage);
router.get("/about", publicController.getAboutPage);
router.get("/contact", publicController.getContactPage);

router.post(
  "/api/contact",
  publicController.contactValidationRules,
  handleValidation,
  publicController.submitContactForm
);

router.get("/api/health", publicController.healthCheck);
router.get("/api/public/featured-events", publicController.getFeaturedEvents);

module.exports = router;