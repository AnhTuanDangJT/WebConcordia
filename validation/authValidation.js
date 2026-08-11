const { body } = require("express-validator");
const userModel = require("../models/User");

async function checkUniqueEmail(email) {
  const exists = await userModel.emailExists(email);
  if (exists) {
    throw new Error("Email already exists.");
  }
}

const emailValidation = () =>
  body("email").trim().isEmail().withMessage("Please enter a valid email address.");

const anyValue = (field) =>
  body(field).trim().notEmpty().withMessage("All fields are required.");

const roleValidation = () =>
  body("role")
    .isIn([userModel.studentRole, userModel.adminRole])
    .withMessage("Invalid role.");

const registrationRoleValidation = () =>
  body("role")
    .optional()
    .isIn([userModel.studentRole])
    .withMessage("Public registration is limited to student accounts.");

const passwordValidation = [
  body("password")
    .notEmpty()
    .withMessage("Please enter a password.")
    .isLength({ min: 8 })
    .withMessage("Password is too short"),
  body("confirmpassword")
    .notEmpty()
    .withMessage("You must confirm your password.")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
];

const loginValidationRules = [
  emailValidation(),
  anyValue("password"),
  roleValidation(),
];

const registrationValidationRules = [
  anyValue("full_name"),
  emailValidation().custom(checkUniqueEmail),
  registrationRoleValidation(),
].concat(passwordValidation);

module.exports = {
  emailValidation,
  anyValue,
  roleValidation,
  registrationRoleValidation,
  passwordValidation,
  loginValidationRules,
  registrationValidationRules,
  checkUniqueEmail,
};
