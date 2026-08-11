const { db } = require('../database/database');

const selectEventForDetails = async (req, res) => {
    const eventId = req.body?.event_id || req.body?.eventId;

    if (!eventId) {
        return res.status(400).json({
            success: false,
            message: 'Event ID is required.'
        });
    }

    return res.status(200).json({
        success: true,
        event_id: String(eventId)
    });
};

const getEventDetails = (req, res, next) => {
    const eventId = req.params?.eventId || req.query?.eventId || req.query?.id;

    if (!eventId) {
        return res.status(400).json({
            success: false,
            message: 'Event ID is required.'
        });
    }

    const sql = `
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
            u.full_name AS organizer_name,
            COUNT(r.registration_id) AS registration_count
        FROM events e
        JOIN users u ON e.organizer_id = u.user_id
        LEFT JOIN registrations r ON e.event_id = r.event_id
        WHERE e.event_id = ?
        GROUP BY e.event_id
    `;

    db.get(sql, [eventId], (err, row) => {
        if (err) {
            return next(err);
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Event not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: row
        });
    });
};

module.exports = {
    selectEventForDetails,
    getEventDetails
};
