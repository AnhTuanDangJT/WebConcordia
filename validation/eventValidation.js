const { body, param, query } = require("express-validator");

const eventIdParam = param("eventId")
  .isInt({ min: 1 })
  .withMessage("Event ID must be a positive integer.");

const eventListQueryValidation = [
  query("search").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  query("category").optional({ values: "falsy" }).trim().isLength({ max: 100 }),
  query("date")
    .optional({ values: "falsy" })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be YYYY-MM-DD."),
  query("location").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  query("organizer").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  query("status")
    .optional({ values: "falsy" })
    .isIn(["Open", "Full", "Cancelled", "Disabled", "Completed"])
    .withMessage("Invalid event status filter."),
];

const createEventValidation = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("category").trim().notEmpty().withMessage("Category is required."),
  body("event_date")
    .isISO8601()
    .withMessage("Event date must be a valid date."),
  body("start_time").trim().notEmpty().withMessage("Start time is required."),
  body("end_time").trim().notEmpty().withMessage("End time is required."),
  body("location").trim().notEmpty().withMessage("Location is required."),
  body("capacity")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer."),
  body("status")
    .optional()
    .isIn(["Open", "Full", "Cancelled", "Disabled", "Completed"])
    .withMessage("Invalid event status."),
];

module.exports = {
  eventIdParam,
  eventListQueryValidation,
  createEventValidation,
};
