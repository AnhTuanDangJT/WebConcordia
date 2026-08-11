const express = require("express");

const {
    register,
    getMyRegistrations,
    getUpcomingRegistrations,
    getSummary,
    cancel
} = require("../controllers/registrationController");

const { validSession } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", validSession, register);

router.get("/my", validSession, getMyRegistrations);

router.get("/upcoming", validSession, getUpcomingRegistrations);

router.get("/summary", validSession, getSummary);

router.patch(
    "/:registrationId/cancel",
    validSession,
    cancel
);

module.exports = router;