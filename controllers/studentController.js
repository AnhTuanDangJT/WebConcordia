const { db, get } = require('../database/database');
const path = require('path');

const getStudentDashboardSummary = async (req, res, next) => {
    const userId = req.user?.user_id;

    if (!userId || req.user.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Access denied.'
        });
    }

    const userSql = `
        SELECT user_id, full_name
        FROM users
        WHERE user_id = ? AND role = 'student'
    `;

    const summarySql = `
        SELECT
            (SELECT COUNT(*) FROM registrations WHERE user_id = ? AND status = 'Registered') AS registeredEvents,
            (SELECT COUNT(*) FROM events WHERE date(event_date) BETWEEN date('now') AND date('now', '+7 day')) AS eventsThisWeek,
            (SELECT COUNT(DISTINCT category) FROM events) AS eventCategories,
            (SELECT COUNT(*) FROM events) AS campusEvents
    `;

    try {

        const summary = await get(summarySql, [userId]);

        

        res.status(200).json({
            success: true,
            registeredEvents: summary.registeredEvents,
            eventsThisWeek: summary.eventsThisWeek,
            eventCategories: summary.eventCategories,
            campusEvents: summary.campusEvents,
        });
    } catch (err) {
        console.error('Student dashboard summary DB error:', err);

        return res.status(500).json({
            success: false,
            message: 'Unable to load student dashboard summary.'
        });
    }
};

const getStudentDashboardEvents = async (req, res, next) => {
    const userId = req.user?.user_id;

    if (!userId || req.user.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Access denied.'
        });
    }

    const eventsSql = `
        SELECT
            e.event_id,
            e.title,
            e.description,
            e.category,
            e.event_date,
            e.start_time,
            e.end_time,
            e.location,
            e.status,
            r.status AS registration_status
        FROM registrations r
        JOIN events e ON r.event_id = e.event_id
        WHERE r.user_id = ?
        ORDER BY e.event_date ASC, e.start_time ASC
    `;

    db.all(eventsSql, [userId], (err, rows) => {
        if (err) {
            console.error('Student dashboard events DB error:', err);
            return res.status(500).json({
                success: false,
                message: 'Unable to load registered events.'
            });
        }

        res.status(200).json({
            success: true,
            data: rows || []
        });
    });
};

const redirectToDashboard = (req, res) => {
    if (!req.user || req.user.role !== 'student') {
        return res.status(403).send('Access denied.');
    }

    res.sendFile(path.join(__dirname, '..', 'views', 'student-dashboard.html'));
};

module.exports = {
    getStudentDashboardSummary,
    getStudentDashboardEvents,
    redirectToDashboard
};