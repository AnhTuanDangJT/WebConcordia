// By Tiago
// controllers/adminController.js

const { run, get, all } = require("../database/database");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

// ==================== EVENT MANAGEMENT ====================

/**
 * Create a new event
 * POST /api/admin/events
 */
async function createEvent(req, res) {
  try {
    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      location,
      capacity,
      status,
    } = req.body;

    // Server-side validation
    if (!title || !description || !category || !date || !startTime || !endTime || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format",
      });
    }

    // Check date is not in the past
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      return res.status(400).json({
        success: false,
        message: "Event date cannot be in the past",
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Time must be in HH:MM format",
      });
    }

    // Validate end time is after start time
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Validate capacity is positive integer
    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive integer",
      });
    }

    // Validate status
    const validStatuses = ["Open", "Full", "Cancelled", "Disabled"];
    const eventStatus = status || "Open";
    if (!validStatuses.includes(eventStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Validate category exists
    const categoryExists = await get(
      "SELECT category_name FROM categories WHERE category_name = ?",
      [category]
    );
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // Get organizer ID from logged-in admin
    const organizerId = req.user.user_id;

    const eventId = await Event.createEvent({
      title,
      description,
      category,
      event_date: date,
      start_time: startTime,
      end_time: endTime,
      location,
      capacity: capacityNum,
      organizer_id: organizerId,
      status: eventStatus,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      eventId,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
}

/**
 * Edit an existing event
 * PUT /api/admin/events/:eventId
 */
async function editEvent(req, res) {
  try {
    const { eventId } = req.params;
    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      location,
      capacity,
      status,
    } = req.body;

    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own events",
      });
    }

    const updates = {};

    if (capacity !== undefined) {
      const capacityNum = parseInt(capacity, 10);
      if (isNaN(capacityNum) || capacityNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "Capacity must be a positive integer",
        });
      }

      const registrationCount = await Event.countActiveRegistrations(eventId);
      if (capacityNum < registrationCount) {
        return res.status(400).json({
          success: false,
          message: `Capacity cannot be lowered below current registrations (${registrationCount})`,
        });
      }

      updates.capacity = capacityNum;
    }

    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          message: "Date must be in YYYY-MM-DD format",
        });
      }
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        return res.status(400).json({
          success: false,
          message: "Event date cannot be in the past",
        });
      }
      updates.event_date = date;
    }

    if (startTime && endTime) {
      const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          success: false,
          message: "Time must be in HH:MM format",
        });
      }
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      if (endMinutes <= startMinutes) {
        return res.status(400).json({
          success: false,
          message: "End time must be after start time",
        });
      }
      updates.start_time = startTime;
      updates.end_time = endTime;
    }

    if (title) {
      updates.title = title;
    }

    if (description) {
      updates.description = description;
    }

    if (category) {
      const categoryExists = await get(
        "SELECT category_name FROM categories WHERE category_name = ?",
        [category]
      );
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
      updates.category = category;
    }

    if (location) {
      updates.location = location;
    }

    if (status) {
      const validStatuses = ["Open", "Full", "Cancelled", "Disabled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    await Event.updateEvent(eventId, updates);

    res.json({
      success: true,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error editing event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit event",
    });
  }
}

/**
 * Cancel or disable an event
 * PATCH /api/admin/events/:eventId/status
 */
async function updateEventStatus(req, res) {
  try {
    const { eventId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["Open", "Full", "Cancelled", "Disabled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const registrationCount = await get(
      "SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != 'Cancelled'",
      [eventId]
    );

    await Event.updateEvent(eventId, { status });

    res.json({
      success: true,
      message: `Event status changed to ${status}`,
      affectedRegistrations: registrationCount.count,
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event status",
    });
  }
}

/**
 * Delete an event
 * DELETE /api/admin/events/:eventId
 */
async function deleteEvent(req, res) {
  try {
    const { eventId } = req.params;

    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const registrationCount = await Event.countEventRegistrations(eventId);

    if (registrationCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event with active registrations. Use disable/cancel instead. (${registrationCount} registrations)`,
        registrationCount,
      });
    }

    await Event.deleteEvent(eventId);

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
}

/**
 * Get all events for admin management
 * GET /api/admin/events
 */
async function getEvents(req, res) {
  try {
    const events = await Event.getAllWithRegistrationCount();

    const eventsWithCalculations = events.map((event) => ({
      ...event,
      remaining_seats: event.capacity - (event.registration_count || 0),
    }));

    res.json({
      success: true,
      data: eventsWithCalculations,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
}

// ==================== REGISTRATION MANAGEMENT ====================

/**
 * Get all registrations for a specific event
 * GET /api/admin/events/:eventId/registrations
 */
async function getRegistrations(req, res) {
  try {
    const { eventId } = req.params;

    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const registrations = await Event.getRegistrationsForEvent(eventId);

    res.json({
      success: true,
      eventTitle: event.title,
      totalRegistrations: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
    });
  }
}

/**
 * Mark attendance for a registration
 * PATCH /api/admin/registrations/:registrationId/attendance
 */
async function markAttendance(req, res) {
  try {
    const { registrationId } = req.params;
    const { attendanceStatus } = req.body;

    if (!attendanceStatus) {
      return res.status(400).json({
        success: false,
        message: "Attendance status is required",
      });
    }

    const validStatuses = ["Attended", "Missed"];
    if (!validStatuses.includes(attendanceStatus)) {
      return res.status(400).json({
        success: false,
        message: `Attendance status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const registration = await get(
      "SELECT * FROM registrations WHERE registration_id = ?",
      [registrationId]
    );
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const attended = attendanceStatus === "Attended" ? "Yes" : "No";

    await run(
      "UPDATE registrations SET status = ?, attended = ? WHERE registration_id = ?",
      [attendanceStatus, attended, registrationId]
    );

    res.json({
      success: true,
      message: `Attendance marked as ${attendanceStatus}`,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
    });
  }
}

// ==================== DASHBOARD STATISTICS ====================

/**
 * Get admin dashboard statistics
 * GET /api/admin/dashboard
 */
async function getDashboardStats(req, res) {
  try {
    const totalEvents = await get("SELECT COUNT(*) as count FROM events");
    const totalRegistrations = await get(
      "SELECT COUNT(*) as count FROM registrations WHERE status != 'Cancelled'"
    );
    const upcomingEvents = await get(
      "SELECT COUNT(*) as count FROM events WHERE event_date >= date('now') AND status != 'Cancelled'"
    );
    const fullEvents = await get(
      "SELECT COUNT(*) as count FROM events WHERE status = 'Full'"
    );
    const cancelledEvents = await get(
      "SELECT COUNT(*) as count FROM events WHERE status = 'Cancelled'"
    );
    const mostPopularCategory = await get(
      `SELECT category, COUNT(*) as event_count
       FROM events
       GROUP BY category
       ORDER BY event_count DESC
       LIMIT 1`
    );
    const attendedStudents = await get(
      "SELECT COUNT(*) as count FROM registrations WHERE status = 'Attended'"
    );
    const totalWithAttendance = await get(
      "SELECT COUNT(*) as count FROM registrations WHERE status IN ('Attended', 'Missed')"
    );
    const attendanceRate = totalWithAttendance.count > 0
      ? ((attendedStudents.count / totalWithAttendance.count) * 100).toFixed(2)
      : "0.00";

    const registrationsByCategory = await all(
      `SELECT e.category, COUNT(r.registration_id) as registration_count
       FROM events e
       LEFT JOIN registrations r ON e.event_id = r.event_id
       GROUP BY e.category
       ORDER BY registration_count DESC`
    );

    res.json({
      success: true,
      data: {
        totalEvents: totalEvents.count,
        totalRegistrations: totalRegistrations.count,
        upcomingEvents: upcomingEvents.count,
        fullEvents: fullEvents.count,
        cancelledEvents: cancelledEvents.count,
        mostPopularCategory: mostPopularCategory?.category || "N/A",
        attendedStudents: attendedStudents.count,
        attendanceRate: `${attendanceRate}%`,
        registrationsByCategory,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
}

module.exports = {
  createEvent,
  editEvent,
  updateEventStatus,
  deleteEvent,
  getEvents,
  getRegistrations,
  markAttendance,
  getDashboardStats,
};
