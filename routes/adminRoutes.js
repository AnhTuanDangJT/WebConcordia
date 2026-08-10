/* By Tiago */
// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

// 1. Import both middlewares
const { validSession } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// 2. Import your controller
const adminController = require('../controllers/adminController');

// 3. Chain the middlewares on the router. 
// Order matters: validSession (401) MUST run before checkRole (403)
router.use(validSession, checkRole('admin')); 
// Note: If your database stores roles with a capital 'A', use checkRole('Admin') instead.

// 4. Define your protected routes (Tasks 2 - 9)
// Task 9: Admin dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// Task 6: Manage-events table
router.get('/events', adminController.getEvents);

// Task 2: Create events
router.post('/events', adminController.createEvent);

// Task 3: Edit events
router.put('/events/:eventId', adminController.editEvent);

// Task 3a: Fetch a single event for edit form
router.get('/events/:eventId', adminController.getEventById);

// Task 4: Cancel/disable events
router.patch('/events/:eventId/status', adminController.changeEventStatus);

// Task 5: Delete events
router.delete('/events/:eventId', adminController.deleteEvent);

// Task 7: View registered students for an event
router.get('/events/:eventId/registrations', adminController.getEventRegistrations);

// Task 8: Update attendance for a registration
router.patch('/registrations/:registrationId/attendance', adminController.updateAttendance);

module.exports = router;