const express = require("express");

const {
    register,
    getMyRegistrations,
    getUpcomingRegistrations,
    getSummary,
    cancel,
    cancelRegistration
} = require("../controllers/registrationController");

const { validSession } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");
const { handleValidation } = require("../middleware/validationMiddleware");
const {
    registerValidation,
    registrationIdParam,
    myRegistrationsQueryValidation
} = require("../validation/registrationValidation");

const router = express.Router();

router.post(
    "/",
    validSession,
    checkRole("student"),
    registerValidation,
    handleValidation,
    register
);

router.get(
    "/my",
    validSession,
    checkRole("student"),
    myRegistrationsQueryValidation,
    handleValidation,
    getMyRegistrations
);

router.get("/upcoming", validSession, checkRole("student"), getUpcomingRegistrations);

router.get("/summary", validSession, checkRole("student"), getSummary);

router.patch(
    "/:registrationId/cancel",
    validSession,
    checkRole("student"),
    registrationIdParam,
    handleValidation,
    cancel
);

router.post("/cancel/:eventId", validSession, checkRole("student"), cancelRegistration);
router.post("/cancel", validSession, checkRole("student"), cancelRegistration);

module.exports = router;
