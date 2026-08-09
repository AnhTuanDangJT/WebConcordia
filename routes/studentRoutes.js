const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const { validSession } = require('../middleware/authMiddleware');

router.get('/dashboard', validSession, studentController.redirectToDashboard);

// API route for retrieving student dashboard summary statistics
router.get('/dashboard/summary', validSession, studentController.getStudentDashboardSummary);
router.get('/dashboard/events', validSession, studentController.getStudentDashboardEvents);

module.exports = router;