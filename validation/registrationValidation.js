const { body, param, query } = require("express-validator");

const registerValidation = [
  body("eventId")
    .isInt({ min: 1 })
    .withMessage("Event ID must be a positive integer."),
];

const registrationIdParam = param("registrationId")
  .isInt({ min: 1 })
  .withMessage("Registration ID must be a positive integer.");

const myRegistrationsQueryValidation = [
  query("status")
    .optional()
    .isIn(["Registered", "Cancelled", "Attended", "Missed"])
    .withMessage("Invalid registration status filter."),
];

module.exports = {
  registerValidation,
  registrationIdParam,
  myRegistrationsQueryValidation,
};
