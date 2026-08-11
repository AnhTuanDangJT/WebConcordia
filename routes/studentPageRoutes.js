const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const { validSession } = require('../middleware/authMiddleware');

// Route to navigate to the student dashboard page, which will redirect to the appropriate dashboard based on the user's role
router.get(
    '/dashboard',
    validSession,
    studentController.redirectToDashboard
);

module.exports = router;