const express = require('express');
const router = express.Router();

const registrationController = require('../controllers/registrationController');
const { validSession } = require('../middleware/authMiddleware');

router.post('/cancel/:eventId', validSession, registrationController.cancelRegistration);
router.post('/cancel', validSession, registrationController.cancelRegistration);

module.exports = router;
