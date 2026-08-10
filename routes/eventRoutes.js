const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');

router.post('/select', eventController.selectEventForDetails);
router.get('/details/:eventId', eventController.getEventDetails);
router.get('/details', eventController.getEventDetails);

module.exports = router;
