const { run, get } = require('../database/database');

const cancelRegistration = async (req, res, next) => {
    const userId = req.user?.user_id;
    const eventId = req.params?.eventId || req.body?.event_id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (!eventId) {
        return res.status(400).json({
            success: false,
            message: 'Event ID is required.'
        });
    }

    try {
        const existingRegistration = await get(
            'SELECT registration_id, status FROM registrations WHERE user_id = ? AND event_id = ?',
            [userId, eventId]
        );

        if (!existingRegistration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found.'
            });
        }

        if (existingRegistration.status === 'Cancelled') {
            return res.status(200).json({
                success: true,
                message: 'Registration already cancelled.'
            });
        }

        await run(
            'UPDATE registrations SET status = ? WHERE user_id = ? AND event_id = ?',
            ['Cancelled', userId, eventId]
        );

        return res.status(200).json({
            success: true,
            message: 'Registration cancelled successfully.'
        });
    } catch (error) {
        console.error('Cancel registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to cancel registration.'
        });
    }
};

module.exports = {
    cancelRegistration
};
