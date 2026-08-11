const { db } = require('../database/database');

const Event = require('../models/Event');

const getEvents = async (req, res, next) => {
    try {
        const filters = {
            search: req.query.search,
            category: req.query.category,
            date: req.query.date,
            location: req.query.location,
            organizer: req.query.organizer,
            status: req.query.status
        };

        const events = await Event.getAllWithRegistrationCount(filters);

        return res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        next(error);
    }
};

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
            COUNT(r.registration_id) AS registration_count,
            CASE
                WHEN e.capacity - COUNT(r.registration_id) < 0 THEN 0
                ELSE e.capacity - COUNT(r.registration_id)
            END AS remaining_seats
        FROM events e
        JOIN users u ON e.organizer_id = u.user_id
        LEFT JOIN registrations r 
            ON e.event_id = r.event_id
            AND r.status != 'Cancelled'
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

        const userId = req.session?.user_id;
        if (!userId) {
            row.is_registered = false;
            return res.status(200).json({
                success: true,
                data: row
            });
        }

        db.get(
            `SELECT registration_id, status
             FROM registrations
             WHERE user_id = ? AND event_id = ? AND status != 'Cancelled'`,
            [userId, eventId],
            (regErr, registration) => {
                if (regErr) {
                    return next(regErr);
                }

                row.is_registered = Boolean(registration);
                return res.status(200).json({
                    success: true,
                    data: row
                });
            }
        );
    });
};

const getSuggestedEvents = async (req, res, next) => {
    try {
        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const events = await Event.getSuggestedEvents(userId);

        return res.status(200).json({
            success: true,
            data: events
        });

    } catch (error) {
        next(error);
    }
};

const getEventFilterOptions = async (req, res, next) => {
    try {
        const options = await Event.getFilterOptions();

        return res.status(200).json({
            success: true,
            data: options
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEvents,
    selectEventForDetails,
    getEventDetails,
    getSuggestedEvents,
    getEventFilterOptions
};
