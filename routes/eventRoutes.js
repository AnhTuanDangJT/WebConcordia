const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const { validSession } = require('../middleware/authMiddleware');

router.get('/filter-options', eventController.getEventFilterOptions);

router.get('/', eventController.getEvents);

router.get('/suggested',validSession,eventController.getSuggestedEvents
);

router.post('/select', eventController.selectEventForDetails);
router.get('/details/:eventId', eventController.getEventDetails);
router.get('/details', eventController.getEventDetails);


module.exports = router;
