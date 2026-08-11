const Registration = require("../models/Registration");
const { get, run } = require("../database/database");

async function register(req, res) {
    try {
        const userId = req.user.user_id;
        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Event ID is required."
            });
        }

        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can register for events."
            });
        }

        const event = await get(
            `SELECT *
             FROM events
             WHERE event_id = ?`,
            [eventId]
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        if (event.status !== "Open") {
            return res.status(400).json({
                success: false,
                message: `Registration is not available. Event status is ${event.status}.`
            });
        }

        const eventDateTime = new Date(
            `${event.event_date}T${event.start_time}`
        );

        if (eventDateTime <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Registration is closed because the event has already started or passed."
            });
        }

        const existing = await Registration.findByStudentAndEvent(
            userId,
            eventId
        );

        if (existing && existing.status !== "Cancelled") {
            return res.status(409).json({
                success: false,
                message: "You are already registered for this event."
            });
        }

        const registrationCount = await Registration.countForEvent(eventId);

        if (registrationCount >= event.capacity) {
            if (event.status === "Open") {
                await run(
                    `UPDATE events SET status = 'Full' WHERE event_id = ? AND status = 'Open'`,
                    [eventId]
                );
            }
            return res.status(400).json({
                success: false,
                message: "This event is full."
            });
        }

        await run("BEGIN IMMEDIATE");
        try {
            const lockedCount = await Registration.countForEvent(eventId);
            if (lockedCount >= event.capacity) {
                await run(
                    `UPDATE events SET status = 'Full' WHERE event_id = ?`,
                    [eventId]
                );
                await run("COMMIT");
                return res.status(400).json({
                    success: false,
                    message: "This event is full."
                });
            }

            const registrationId = await Registration.registerStudent(
                userId,
                eventId
            );

            const updatedCount = await Registration.countForEvent(eventId);
            if (updatedCount >= event.capacity) {
                await run(
                    `UPDATE events SET status = 'Full' WHERE event_id = ?`,
                    [eventId]
                );
            }

            await run("COMMIT");

            return res.status(201).json({
                success: true,
                message: "Successfully registered for the event.",
                registrationId
            });
        } catch (txError) {
            await run("ROLLBACK");
            throw txError;
        }

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to register for the event."
        });
    }
}


async function getMyRegistrations(req, res) {
    try {
        const userId = req.user.user_id;
        const status = req.query.status;

        const registrations = await Registration.getByStudent(userId, status);

        return res.json({
            success: true,
            registrations
        });

    } catch (error) {
        console.error("Get registrations error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load registrations."
        });
    }
}


async function getUpcomingRegistrations(req, res) {
    try {
        const userId = req.user.user_id;

        const registrations =
            await Registration.getUpcomingByStudent(userId);

        return res.json({
            success: true,
            registrations
        });

    } catch (error) {
        console.error("Upcoming registrations error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load upcoming registrations."
        });
    }
}


async function getSummary(req, res) {
    try {
        const userId = req.user.user_id;

        const summary =
            await Registration.getParticipationSummary(userId);

        return res.json({
            success: true,
            summary
        });

    } catch (error) {
        console.error("Summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load participation summary."
        });
    }
}


async function cancel(req, res) {
    try {
        const userId = req.user.user_id;
        const registrationId = req.params.registrationId;

        const registration = await get(
            `SELECT *
             FROM registrations
             WHERE registration_id = ?`,
            [registrationId]
        );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found."
            });
        }

        if (registration.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot cancel another student's registration."
            });
        }

        if (registration.status !== "Registered") {
            return res.status(400).json({
                success: false,
                message: "This registration cannot be cancelled."
            });
        }

        const changes = await Registration.cancelRegistration(
            registrationId,
            userId
        );

        if (changes === 0) {
            return res.status(400).json({
                success: false,
                message: "Registration could not be cancelled."
            });
        }

        const event = await get(
            `SELECT event_id, capacity, status FROM events WHERE event_id = ?`,
            [registration.event_id]
        );

        if (event && event.status === "Full") {
            const activeCount = await Registration.countForEvent(event.event_id);
            if (activeCount < event.capacity) {
                await run(
                    `UPDATE events SET status = 'Open' WHERE event_id = ? AND status = 'Full'`,
                    [event.event_id]
                );
            }
        }

        return res.json({
            success: true,
            message: "Registration cancelled successfully."
        });

    } catch (error) {
        console.error("Cancellation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel registration."
        });
    }
}

async function cancelRegistration(req, res) {
    const userId = req.user?.user_id;
    const eventId = req.params?.eventId || req.body?.event_id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    if (!eventId) {
        return res.status(400).json({
            success: false,
            message: "Event ID is required."
        });
    }

    try {
        const existingRegistration = await get(
            "SELECT registration_id, status FROM registrations WHERE user_id = ? AND event_id = ?",
            [userId, eventId]
        );

        if (!existingRegistration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found."
            });
        }

        if (existingRegistration.status === "Cancelled") {
            return res.status(200).json({
                success: true,
                message: "Registration already cancelled."
            });
        }

        await run(
            "UPDATE registrations SET status = ? WHERE user_id = ? AND event_id = ?",
            ["Cancelled", userId, eventId]
        );

        const event = await get(
            `SELECT event_id, capacity, status FROM events WHERE event_id = ?`,
            [eventId]
        );

        if (event && event.status === "Full") {
            const activeCount = await Registration.countForEvent(event.event_id);
            if (activeCount < event.capacity) {
                await run(
                    `UPDATE events SET status = 'Open' WHERE event_id = ? AND status = 'Full'`,
                    [event.event_id]
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Registration cancelled successfully."
        });
    } catch (error) {
        console.error("Cancel registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to cancel registration."
        });
    }
}

module.exports = {
    register,
    getMyRegistrations,
    getUpcomingRegistrations,
    getSummary,
    cancel,
    cancelRegistration
};
