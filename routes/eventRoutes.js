const express = require('express');
const router = express.Router();
const path = require('path');

const eventController = require('../controllers/eventController');
const { validSession } = require('../middleware/authMiddleware');

router.get('/filter-options', eventController.getEventFilterOptions);

router.get('/', eventController.getEvents);

router.get('/page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../views/events.html')
    );
});

router.get('/event-details', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../views/event-details.html')
    );
});

router.get('/suggested',validSession,eventController.getSuggestedEvents
);

router.post('/select', eventController.selectEventForDetails);
router.get('/details/:eventId', eventController.getEventDetails);
router.get('/details', eventController.getEventDetails);


module.exports = router;
