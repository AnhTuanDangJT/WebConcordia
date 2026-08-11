const { run, get, all } = require("../database/database");

async function createEvent(event) {
  const result = await run(
    `INSERT INTO events (
      title,
      description,
      category,
      event_date,
      start_time,
      end_time,
      location,
      capacity,
      organizer_id,
      status,
      created_on
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      event.title,
      event.description,
      event.category,
      event.event_date,
      event.start_time,
      event.end_time,
      event.location,
      event.capacity,
      event.organizer_id,
      event.status,
    ]
  );

  return result.lastID;
}

async function getById(eventId) {
  return await get(
    `SELECT * FROM events WHERE event_id = ?`,
    [eventId]
  );
}

async function updateEvent(eventId, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) {
    return;
  }

  values.push(eventId);

  await run(
    `UPDATE events SET ${fields.join(", ")} WHERE event_id = ?`,
    values
  );
}

async function deleteEvent(eventId) {
  await run(
    `DELETE FROM events WHERE event_id = ?`,
    [eventId]
  );
}

async function countActiveRegistrations(eventId) {
  const result = await get(
    `SELECT COUNT(*) AS count FROM registrations WHERE event_id = ? AND status != 'Cancelled'`,
    [eventId]
  );

  return result?.count || 0;
}

async function countEventRegistrations(eventId) {
  const result = await get(
    `SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?`,
    [eventId]
  );

  return result?.count || 0;
}

async function getAllWithRegistrationCount() {
  return await all(
    `SELECT
       e.event_id AS id,
       e.title,
       e.description,
       e.category AS category_name,
       e.event_date AS date,
       e.start_time,
       e.end_time,
       e.location,
       e.capacity,
       e.status,
       e.organizer_id,
       COUNT(r.registration_id) AS registration_count
     FROM events e
     LEFT JOIN registrations r ON e.event_id = r.event_id
     GROUP BY e.event_id
     ORDER BY e.event_date DESC`
  );
}

async function getRegistrationsForEvent(eventId) {
  return await all(
    `SELECT
       r.registration_id AS id,
       r.user_id,
       r.event_id,
       r.registration_date AS created_at,
       r.status AS attendance_status,
       r.attended,
       u.full_name AS student_name,
       u.email AS student_email
     FROM registrations r
     JOIN users u ON r.user_id = u.user_id
     WHERE r.event_id = ?
     ORDER BY r.registration_date DESC`,
    [eventId]
  );
}

module.exports = {
  createEvent,
  getById,
  updateEvent,
  deleteEvent,
  countActiveRegistrations,
  countEventRegistrations,
  getAllWithRegistrationCount,
  getRegistrationsForEvent,
};
