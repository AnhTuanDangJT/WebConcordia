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

async function getAllWithRegistrationCount(filters = {}) {
  const {
    search,
    category,
    date,
    location,
    organizer,
    status
  } = filters;

  const conditions = [];
  const values = [];

  if (search) {
    conditions.push("(e.title LIKE ? OR e.description LIKE ?)");
    values.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    conditions.push("e.category = ?");
    values.push(category);
  }

  if (date) {
    conditions.push("e.event_date = ?");
    values.push(date);
  }

  if (location) {
    conditions.push("e.location = ?");
    values.push(location);
  }

  if (organizer) {
    conditions.push("e.organizer_id = ?");
    values.push(organizer);
  }

  if (status) {
    conditions.push("e.status = ?");
    values.push(status);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  return await all(
    `SELECT
       e.event_id,
       e.title,
       e.description,
       e.category,
       e.event_date,
       e.start_time,
       e.end_time,
       e.location,
       e.capacity,
       e.status,
       e.organizer_id,
       u.full_name AS organizer_name,
       COUNT(r.registration_id) AS registration_count,
       CASE
          WHEN e.capacity - COUNT(r.registration_id) < 0 THEN 0
          ELSE e.capacity - COUNT(r.registration_id)
        END AS remaining_seats
     FROM events e
     LEFT JOIN users u ON e.organizer_id = u.user_id
     LEFT JOIN registrations r
       ON e.event_id = r.event_id
       AND r.status != 'Cancelled'
     ${whereClause}
     GROUP BY e.event_id
     ORDER BY e.event_date DESC`,
    values
  );
}

async function getRegistrationsForEvent(eventId) {
  return await all(
    `SELECT
       r.registration_id AS id,
       r.user_id,
       r.event_id,
       r.registration_date AS created_at,
       r.status AS registration_status,
       r.attended,
       CASE
         WHEN r.status IN ('Attended', 'Missed') THEN r.status
         WHEN r.attended = 'Yes' THEN 'Attended'
         ELSE 'Pending'
       END AS attendance_status,
       u.full_name AS student_name,
       u.email AS student_email
     FROM registrations r
     LEFT JOIN users u ON r.user_id = u.user_id
     WHERE r.event_id = ? AND r.status != 'Cancelled'
     ORDER BY r.registration_date DESC`,
    [eventId]
  );
}

async function getSuggestedEvents(userId) {
    return await all(
        `
        SELECT
            e.event_id,
            e.title,
            e.description,
            e.category,
            e.event_date,
            e.start_time,
            e.end_time,
            e.location,
            e.capacity,
            e.status,
            e.organizer_id,
            u.full_name AS organizer_name,
            COUNT(r.registration_id) AS registration_count,
            CASE
                WHEN e.capacity - COUNT(r.registration_id) < 0 THEN 0
                ELSE e.capacity - COUNT(r.registration_id)
            END AS remaining_seats
        FROM events e

        LEFT JOIN users u
            ON e.organizer_id = u.user_id

        LEFT JOIN registrations r
            ON e.event_id = r.event_id
            AND r.status != 'Cancelled'

        WHERE date(e.event_date) >= date('now')
          AND e.status = 'Open'

          AND NOT EXISTS (
              SELECT 1
              FROM registrations student_registration
              WHERE student_registration.event_id = e.event_id
                AND student_registration.user_id = ?
                AND student_registration.status = 'Registered'
          )

        GROUP BY e.event_id

        HAVING remaining_seats > 0

        ORDER BY e.event_date ASC, e.start_time ASC
        `,
        [userId]
    );
}

const getFilterOptions = async () => {
    const sql = `
        SELECT
            e.category,
            e.location,
            e.status,
            e.organizer_id,
            u.full_name AS organizer_name
        FROM events e
        JOIN users u ON e.organizer_id = u.user_id
    `;

    const rows = await all(sql);

    const organizers = Array.from(
      new Map(
          rows
              .filter(row => row.organizer_id && row.organizer_name)
              .map(row => [
                  row.organizer_id,
                  {
                      id: row.organizer_id,
                      name: row.organizer_name
                  }
              ])
      ).values()
    );

    return {
        categories: [...new Set(
            rows
                .map(row => row.category)
                .filter(Boolean)
        )].sort(),

        locations: [...new Set(
            rows
                .map(row => row.location)
                .filter(Boolean)
        )].sort(),

        organizers: organizers.sort(
          (a, b) => a.name.localeCompare(b.name)
        ),

        statuses: [...new Set(
            rows
                .map(row => row.status)
                .filter(Boolean)
        )].sort()
    };
};

module.exports = {
  createEvent,
  getById,
  updateEvent,
  deleteEvent,
  countActiveRegistrations,
  countEventRegistrations,
  getAllWithRegistrationCount,
  getRegistrationsForEvent,
  getFilterOptions,
  getSuggestedEvents
};
