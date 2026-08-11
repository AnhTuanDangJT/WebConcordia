const { run, get } = require("./../database/database");

async function registerStudent(userId, eventId) {
    const existing = await findByStudentAndEvent(userId, eventId);

    if (existing) { 
        // If the previous registration was cancelled, 
        // reactivate that registration instead of inserting 
        // a duplicate row. 
        if (existing.status === "Cancelled") { 
            const result = await run(
    `UPDATE registrations 
     SET status = 'Registered', 
     attended = 'No', 
     registration_date = datetime('now') 
     WHERE registration_id = ?`, 
    [existing.registration_id]
);
             return existing.registration_id;
             } 
             // Registered, Attended, or Missed registrations 
             // cannot be registered again. 
             throw new Error("Student is already registered for this event."); 
            } 
            const result = await run( 
                `INSERT INTO registrations 
                (user_id, event_id, status, attended) 
                VALUES (?, ?, 'Registered', 'No')`, 
                [userId, eventId] 
            ); 
            
            return result.lastID; 
        }

async function findByStudentAndEvent(userId, eventId) {
    return await get(
        `SELECT *
         FROM registrations
         WHERE user_id = ? AND event_id = ?`,
        [userId, eventId]
    );
}

async function getByStudent(userId, status = null) {
    let sql = `
        SELECT
            r.registration_id,
            r.user_id,
            r.event_id,
            r.registration_date,
            r.status,
            r.attended,
            e.title,
            e.description,
            e.category,
            e.event_date,
            e.start_time,
            e.end_time,
            e.location,
            e.capacity,
            e.status AS event_status
        FROM registrations r
        JOIN events e ON r.event_id = e.event_id
        WHERE r.user_id = ?
    `;

    const params = [userId];

    if (status) {
        sql += ` AND r.status = ?`;
        params.push(status);
    }

    sql += ` ORDER BY e.event_date ASC, e.start_time ASC`;

    return await getAll(sql, params);
}

async function getUpcomingByStudent(userId) {
    return await getAll(
        `SELECT
            r.registration_id,
            r.registration_date,
            r.status,
            r.attended,
            e.event_id,
            e.title,
            e.category,
            e.event_date,
            e.start_time,
            e.end_time,
            e.location,
            e.status AS event_status
         FROM registrations r
         JOIN events e ON r.event_id = e.event_id
         WHERE r.user_id = ?
         AND r.status = 'Registered'
         AND e.event_date >= date('now')
         ORDER BY e.event_date ASC, e.start_time ASC`,
        [userId]
    );
}

async function cancelRegistration(registrationId, userId) {
    const result = await run(
        `UPDATE registrations
         SET status = 'Cancelled'
         WHERE registration_id = ?
         AND user_id = ?
         AND status = 'Registered'`,
        [registrationId, userId]
    );

    return result.changes;
}

async function countForEvent(eventId) {
    const result = await get(
        `SELECT COUNT(*) AS count
         FROM registrations
         WHERE event_id = ?
         AND status IN ('Registered', 'Attended')`,
        [eventId]
    );

    return result.count;
}

async function countByStatus(userId, status) {
    const result = await get(
        `SELECT COUNT(*) AS count
         FROM registrations
         WHERE user_id = ?
         AND status = ?`,
        [userId, status]
    );

    return result.count;
}

async function getAttendedEvents(userId) {
    return await getAll(
        `SELECT
            r.registration_id,
            e.event_id,
            e.title,
            e.category,
            e.event_date
         FROM registrations r
         JOIN events e ON r.event_id = e.event_id
         WHERE r.user_id = ?
         AND r.status = 'Attended'
         ORDER BY e.event_date DESC`,
        [userId]
    );
}

async function getMissedEvents(userId) {
    return await getAll(
        `SELECT
            r.registration_id,
            e.event_id,
            e.title,
            e.category,
            e.event_date
         FROM registrations r
         JOIN events e ON r.event_id = e.event_id
         WHERE r.user_id = ?
         AND r.status = 'Missed'
         ORDER BY e.event_date DESC`,
        [userId]
    );
}

async function getCancelledRegistrations(userId) {
    return await getAll(
        `SELECT
            r.registration_id,
            r.registration_date,
            e.event_id,
            e.title,
            e.category,
            e.event_date
         FROM registrations r
         JOIN events e ON r.event_id = e.event_id
         WHERE r.user_id = ?
         AND r.status = 'Cancelled'
         ORDER BY r.registration_date DESC`,
        [userId]
    );
}

async function getAll(sql, params = []) {
    const { db } = require("./../database/database");

    return await new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(rows);
        });
    });
}

async function getParticipationSummary(userId) {
    const total = await countByStatus(userId, "Registered");
    const attended = await countByStatus(userId, "Attended");
    const cancelled = await countByStatus(userId, "Cancelled");
    const missed = await countByStatus(userId, "Missed");

    const upcomingResult = await get(
        `SELECT COUNT(*) AS count
         FROM registrations r
         JOIN events e ON r.event_id = e.event_id
         WHERE r.user_id = ?
         AND r.status = 'Registered'
         AND e.event_date >= date('now')`,
        [userId]
    );

    const participationBase = attended + missed;
    const participationPercentage =
        participationBase > 0
            ? Math.round((attended / participationBase) * 100)
            : 0;

    const categoryRows = await getAll(
        `SELECT
            e.category,
            COUNT(*) AS count
         FROM registrations r
         JOIN events e ON r.event_id = e.event_id
         WHERE r.user_id = ?
         AND r.status IN ('Registered', 'Attended', 'Missed')
         GROUP BY e.category
         ORDER BY count DESC`,
        [userId]
    );

    return {
        totalRegistered: total,
        upcoming: upcomingResult.count,
        attended,
        missed,
        cancelled,
        participationPercentage,
        byCategory: categoryRows
    };
}

module.exports = {
    registerStudent,
    findByStudentAndEvent,
    getByStudent,
    getUpcomingByStudent,
    cancelRegistration,
    countForEvent,
    countByStatus,
    getAttendedEvents,
    getMissedEvents,
    getCancelledRegistrations,
    getParticipationSummary
};