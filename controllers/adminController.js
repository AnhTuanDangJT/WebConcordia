// By Tiago
// controllers/adminController.js

const { run, get, all } = require("../database/database");

const validEventStatuses = ['Open', 'Full', 'Cancelled', 'Completed', 'Disabled'];
const validEventCategories = ['Academic', 'Social', 'Workshop', 'Sports', 'Technology', 'Other'];

const normalizeStatus = (status) => {
  if (!status) return null;
  if (status === 'Active') return 'Open';
  return status;
};

const buildAttendancePayload = (attendanceStatus) => {
  if (attendanceStatus === 'Attended') return { status: 'Attended', attended: 'Yes' };
  if (attendanceStatus === 'Missed' || attendanceStatus === 'Absent') return { status: 'Missed', attended: 'No' };
  if (attendanceStatus === 'Pending') return { status: 'Registered', attended: 'No' };
  return null;
};

const parseTimeFields = (body) => ({
  startTime: body.startTime || body.start_time,
  endTime: body.endTime || body.end_time
});

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      location,
      capacity,
      status
    } = req.body;

    const { startTime, endTime } = parseTimeFields(req.body);
    const normalizedStatus = normalizeStatus(status);

    if (!title || !description || !category || !date || !startTime || !endTime || !location || !capacity || !normalizedStatus) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ success: false, message: 'Capacity must be a positive integer.' });
    }

    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Date must use YYYY-MM-DD format.' });
    }

    const eventStart = new Date(`${date}T${startTime}`);
    const eventEnd = new Date(`${date}T${endTime}`);
    const now = new Date();

    if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date or time format.' });
    }

    if (eventStart < now) {
      return res.status(400).json({ success: false, message: 'New event dates cannot be in the past.' });
    }

    if (eventEnd <= eventStart) {
      return res.status(400).json({ success: false, message: 'End time must be strictly after the start time.' });
    }

    if (!validEventStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    if (!validEventCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const organizerId = req.user.user_id;

    const sql = `
      INSERT INTO events
        (title, description, category, event_date, start_time, end_time, location, capacity, status, organizer_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await run(sql, [title, description, category, date, startTime, endTime, location, parsedCapacity, normalizedStatus, organizerId]);

    return res.status(201).json({ success: true, message: 'Event created successfully.' });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
};

const editEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      title,
      description,
      category,
      date,
      location,
      capacity,
      status
    } = req.body;

    const { startTime, endTime } = parseTimeFields(req.body);
    const normalizedStatus = normalizeStatus(status);

    const existingEvent = await get('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (existingEvent.organizer_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this event.' });
    }

    if (!title || !description || !category || !date || !startTime || !endTime || !location || !capacity || !normalizedStatus) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ success: false, message: 'Capacity must be a positive integer.' });
    }

    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Date must use YYYY-MM-DD format.' });
    }

    const eventStart = new Date(`${date}T${startTime}`);
    const eventEnd = new Date(`${date}T${endTime}`);
    if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date or time format.' });
    }

    if (eventEnd <= eventStart) {
      return res.status(400).json({ success: false, message: 'End time must be after the start time.' });
    }

    if (!validEventStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    if (!validEventCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const registrationCountRow = await get(
      'SELECT COUNT(*) AS count FROM registrations WHERE event_id = ? AND status IN ("Registered", "Attended")',
      [eventId]
    );
    const currentRegistrationsCount = registrationCountRow?.count || 0;

    if (parsedCapacity < currentRegistrationsCount) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be lower than the current active registrations (${currentRegistrationsCount}).`
      });
    }

    await run(
      'UPDATE events SET title = ?, description = ?, category = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, capacity = ?, status = ? WHERE event_id = ?',
      [title, description, category, date, startTime, endTime, location, parsedCapacity, normalizedStatus, eventId]
    );

    return res.status(200).json({ success: true, message: 'Event updated successfully.' });
  } catch (error) {
    console.error('Error editing event:', error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
};

const changeEventStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;
    const normalizedStatus = normalizeStatus(status);

    const allowedStatuses = ['Cancelled', 'Disabled', 'Open', 'Full', 'Completed'];
    if (!normalizedStatus || !allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided. Must be Cancelled, Disabled, Open, Full, or Completed.' });
    }

    const existingEvent = await get('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (existingEvent.organizer_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to modify this event.' });
    }

    const affectedRegistrationsRow = await get(
      'SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?',
      [eventId]
    );
    const affectedRegistrations = affectedRegistrationsRow?.count || 0;

    await run('UPDATE events SET status = ? WHERE event_id = ?', [normalizedStatus, eventId]);

    return res.status(200).json({
      success: true,
      message: `Event status successfully updated to ${normalizedStatus}.`,
      affectedRegistrations
    });
  } catch (error) {
    console.error('Error changing event status:', error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const existingEvent = await get('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (existingEvent.organizer_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this event.' });
    }

    const totalRegistrationsRow = await get('SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?', [eventId]);
    const totalRegistrations = totalRegistrationsRow?.count || 0;

    if (totalRegistrations > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete an event that has registrations. Please cancel or disable the event instead to preserve student records.',
        code: 'HAS_REGISTRATIONS'
      });
    }

    await run('DELETE FROM events WHERE event_id = ?', [eventId]);

    return res.status(200).json({ success: true, message: 'Event permanently deleted.' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
};

const getEvents = async (req, res) => {
  try {
    const eventsFromDb = await all(
      `SELECT
         e.event_id AS id,
         e.title,
         e.category,
         e.event_date AS date,
         e.capacity,
         e.status,
         u.full_name AS organizer,
         COUNT(r.registration_id) AS registered_count
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.user_id
       LEFT JOIN registrations r ON e.event_id = r.event_id
       WHERE e.organizer_id = ?
       GROUP BY e.event_id
       ORDER BY e.event_date ASC`,
      [req.user.user_id]
    );

    const formattedEvents = eventsFromDb.map((event) => ({
      id: event.id,
      title: event.title,
      category: event.category,
      date: event.date,
      capacity: event.capacity,
      registered_count: event.registered_count || 0,
      remainingSeats: event.capacity - (event.registered_count || 0),
      status: event.status,
      organizer: event.organizer
    }));

    return res.status(200).json({ success: true, data: formattedEvents });
  } catch (error) {
    console.error('Error fetching events list:', error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred while loading the events table.' });
  }
};

const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await get('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.organizer_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view registrations for this event.' });
    }

    const registrationsFromDb = await all(
      `SELECT
         r.registration_id,
         u.full_name AS studentName,
         u.email AS studentEmail,
         r.registration_date AS registrationDate,
         r.status AS registrationStatus,
         r.attended
       FROM registrations r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.event_id = ?
       ORDER BY r.registration_date ASC`,
      [eventId]
    );

    const formattedRegistrations = registrationsFromDb.map((reg) => ({
      registrationId: reg.registration_id,
      studentName: reg.studentName,
      studentEmail: reg.studentEmail,
      registrationDate: reg.registrationDate,
      registrationStatus: reg.registrationStatus,
      attendanceStatus: reg.registrationStatus === 'Attended' ? 'Attended' : reg.registrationStatus === 'Missed' ? 'Missed' : reg.registrationStatus === 'Cancelled' ? 'Cancelled' : 'Pending'
    }));

    return res.status(200).json({ success: true, data: formattedRegistrations });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred while fetching student registrations.' });
  }
};

const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await get(
      `SELECT
         event_id AS id,
         title,
         description,
         category,
         event_date AS date,
         start_time AS startTime,
         end_time AS endTime,
         location,
         capacity,
         status
       FROM events
       WHERE event_id = ? AND organizer_id = ?`,
      [eventId, req.user.user_id]
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or access denied.' });
    }

    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event details:', error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred while fetching the event details.' });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { attendanceStatus } = req.body;

    const attendancePayload = buildAttendancePayload(attendanceStatus);
    if (!attendancePayload) {
      return res.status(400).json({ success: false, message: 'Invalid attendance status provided.' });
    }

    const registration = await get(
      `SELECT r.*, e.organizer_id
       FROM registrations r
       JOIN events e ON r.event_id = e.event_id
       WHERE r.registration_id = ?`,
      [registrationId]
    );

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    if (registration.organizer_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update attendance for this registration.' });
    }

    await run(
      'UPDATE registrations SET status = ?, attended = ? WHERE registration_id = ?',
      [attendancePayload.status, attendancePayload.attended, registrationId]
    );

    return res.status(200).json({ success: true, message: `Student marked as ${attendancePayload.status} successfully.` });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred while updating attendance.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.user.user_id;

    const totalEventsRow = await get('SELECT COUNT(*) AS total FROM events WHERE organizer_id = ?', [adminId]);
    const totalRegistrationsRow = await get(
      `SELECT COUNT(*) AS total FROM registrations r
       JOIN events e ON r.event_id = e.event_id
       WHERE e.organizer_id = ?`,
      [adminId]
    );
    const upcomingEventsRow = await get('SELECT COUNT(*) AS total FROM events WHERE organizer_id = ? AND event_date >= date("now")', [adminId]);
    const fullEventsRow = await get('SELECT COUNT(*) AS total FROM events WHERE organizer_id = ? AND status = ?', [adminId, 'Full']);
    const cancelledEventsRow = await get('SELECT COUNT(*) AS total FROM events WHERE organizer_id = ? AND status = ?', [adminId, 'Cancelled']);
    const mostPopularCategoryRow = await get(
      `SELECT e.category AS category, COUNT(r.registration_id) AS count
       FROM events e
       LEFT JOIN registrations r ON e.event_id = r.event_id
       WHERE e.organizer_id = ?
       GROUP BY e.category
       ORDER BY count DESC
       LIMIT 1`,
      [adminId]
    );
    const attendedStudentsRow = await get(
      `SELECT COUNT(*) AS total FROM registrations r
       JOIN events e ON r.event_id = e.event_id
       WHERE e.organizer_id = ? AND r.status = 'Attended'`,
      [adminId]
    );
    const registrationsByCategoryRows = await all(
      `SELECT e.category AS category, COUNT(r.registration_id) AS count
       FROM events e
       LEFT JOIN registrations r ON e.event_id = r.event_id
       WHERE e.organizer_id = ?
       GROUP BY e.category`,
      [adminId]
    );

    const totalEvents = totalEventsRow?.total || 0;
    const totalRegistrations = totalRegistrationsRow?.total || 0;
    const upcomingEvents = upcomingEventsRow?.total || 0;
    const fullEvents = fullEventsRow?.total || 0;
    const cancelledEvents = cancelledEventsRow?.total || 0;
    const mostPopularCategory = mostPopularCategoryRow?.category || 'N/A';
    const attendedStudents = attendedStudentsRow?.total || 0;

    let attendanceRate = '0%';
    if (totalRegistrations > 0) {
      attendanceRate = ((attendedStudents / totalRegistrations) * 100).toFixed(1) + '%';
    }

    const registrationsByCategory = registrationsByCategoryRows.reduce((acc, row) => {
      acc[row.category] = row.count;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        totalEvents,
        totalRegistrations,
        upcomingEvents,
        fullEvents,
        cancelledEvents,
        mostPopularCategory,
        attendedStudents,
        attendanceRate,
        registrationsByCategory
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred while loading dashboard statistics.' });
  }
};

module.exports = {
  createEvent,
  editEvent,
  changeEventStatus,
  deleteEvent,
  getEvents,
  getEventRegistrations,
  getEventById,
  updateAttendance,
  getDashboardStats
};
