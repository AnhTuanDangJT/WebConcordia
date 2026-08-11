const express = require('express');
const path = require('path');
const router = express.Router();

const studentController = require('../controllers/studentController');
const { validSession } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get(
    '/dashboard',
    validSession,
    checkRole('student'),
    studentController.redirectToDashboard
);

router.get('/my-registrations', validSession, checkRole('student'), (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'my-registrations.html'));
});

router.get('/upcoming-events', validSession, checkRole('student'), (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'upcoming-events.html'));
});

module.exports = router;
