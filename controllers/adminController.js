// By Tiago
// controllers/adminController.js

const { run, get, all } = require("../database/database");

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
      "SELECT id FROM categories WHERE name = ?",
      [category]
    );
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // Get organizer ID from logged-in admin
    const organizerId = req.user.id;

    // Insert into database
    const result = await run(
      `INSERT INTO events (title, description, category_id, date, start_time, end_time, location, capacity, organizer_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [title, description, categoryExists.id, date, startTime, endTime, location, capacityNum, organizerId, eventStatus]
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      eventId: result.lastID,
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

    // Check event exists
    const event = await get("SELECT * FROM events WHERE id = ?", [eventId]);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check ownership (optional - only if supporting multiple organizers)
    if (event.organizer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own events",
      });
    }

    // Validate capacity not lowered below current registrations
    if (capacity) {
      const capacityNum = parseInt(capacity, 10);
      const registrationCount = await get(
        "SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = 'Active'",
        [eventId]
      );
      if (capacityNum < registrationCount.count) {
        return res.status(400).json({
          success: false,
          message: `Capacity cannot be lowered below current registrations (${registrationCount.count})`,
        });
      }
    }

    // Validate all fields if provided
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
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (title) {
      updates.push("title = ?");
      params.push(title);
    }
    if (description) {
      updates.push("description = ?");
      params.push(description);
    }
    if (category) {
      const categoryExists = await get(
        "SELECT id FROM categories WHERE name = ?",
        [category]
      );
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
      updates.push("category_id = ?");
      params.push(categoryExists.id);
    }
    if (date) {
      updates.push("date = ?");
      params.push(date);
    }
    if (startTime) {
      updates.push("start_time = ?");
      params.push(startTime);
    }
    if (endTime) {
      updates.push("end_time = ?");
      params.push(endTime);
    }
    if (location) {
      updates.push("location = ?");
      params.push(location);
    }
    if (capacity) {
      updates.push("capacity = ?");
      params.push(parseInt(capacity, 10));
    }
    if (status) {
      const validStatuses = ["Open", "Full", "Cancelled", "Disabled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }
      updates.push("status = ?");
      params.push(status);
    }

    updates.push("updated_at = datetime('now')");
    params.push(eventId);

    if (updates.length === 1) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    await run(
      `UPDATE events SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

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

    const event = await get("SELECT * FROM events WHERE id = ?", [eventId]);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Get affected registration count
    const registrationCount = await get(
      "SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = 'Active'",
      [eventId]
    );

    await run(
      "UPDATE events SET status = ?, updated_at = datetime('now') WHERE id = ?",
      [status, eventId]
    );

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

    const event = await get("SELECT * FROM events WHERE id = ?", [eventId]);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if registrations exist
    const registrationCount = await get(
      "SELECT COUNT(*) as count FROM registrations WHERE event_id = ?",
      [eventId]
    );

    if (registrationCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event with active registrations. Use disable/cancel instead. (${registrationCount.count} registrations)`,
        registrationCount: registrationCount.count,
      });
    }

    await run("DELETE FROM events WHERE id = ?", [eventId]);

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
    const events = await all(
      `SELECT e.*, c.name as category_name, COUNT(DISTINCT r.id) as registration_count
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN registrations r ON e.id = r.event_id
       GROUP BY e.id
       ORDER BY e.date DESC`
    );

    const eventsWithCalculations = events.map((event) => ({
      ...event,
      remaining_seats: event.capacity - event.registration_count,
    }));

    res.json({
      success: true,
      events: eventsWithCalculations,
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

    const event = await get("SELECT * FROM events WHERE id = ?", [eventId]);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const registrations = await all(
      `SELECT r.*, u.name as student_name, u.email as student_email
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ?
       ORDER BY r.created_at DESC`,
      [eventId]
    );

    res.json({
      success: true,
      eventTitle: event.title,
      totalRegistrations: registrations.length,
      registrations,
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

    const validStatuses = ["Attended", "Missed", "Absent"];
    if (!validStatuses.includes(attendanceStatus)) {
      return res.status(400).json({
        success: false,
        message: `Attendance status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const registration = await get(
      "SELECT * FROM registrations WHERE id = ?",
      [registrationId]
    );
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    await run(
      "UPDATE registrations SET attendance_status = ?, updated_at = datetime('now') WHERE id = ?",
      [attendanceStatus, registrationId]
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
    // Total events
    const totalEvents = await get(
      "SELECT COUNT(*) as count FROM events"
    );

    // Total registrations
    const totalRegistrations = await get(
      "SELECT COUNT(*) as count FROM registrations WHERE status = 'Active'"
    );

    // Upcoming events
    const upcomingEvents = await get(
      "SELECT COUNT(*) as count FROM events WHERE date >= date('now') AND status != 'Cancelled'"
    );

    // Full events
    const fullEvents = await get(
      "SELECT COUNT(*) as count FROM events WHERE status = 'Full'"
    );

    // Cancelled events
    const cancelledEvents = await get(
      "SELECT COUNT(*) as count FROM events WHERE status = 'Cancelled'"
    );

    // Most popular category
    const mostPopularCategory = await get(
      `SELECT c.name, COUNT(e.id) as event_count
       FROM categories c
       LEFT JOIN events e ON c.id = e.category_id
       GROUP BY c.id
       ORDER BY event_count DESC
       LIMIT 1`
    );

    // Attended students
    const attendedStudents = await get(
      "SELECT COUNT(*) as count FROM registrations WHERE attendance_status = 'Attended'"
    );

    // Attendance rate
    const totalWithAttendance = await get(
      "SELECT COUNT(*) as count FROM registrations WHERE attendance_status IS NOT NULL"
    );
    const attendanceRate = totalWithAttendance.count > 0
      ? ((attendedStudents.count / totalWithAttendance.count) * 100).toFixed(2)
      : "0.00";

    // Registration totals by category
    const registrationsByCategory = await all(
      `SELECT c.name, COUNT(r.id) as registration_count
       FROM categories c
       LEFT JOIN events e ON c.id = e.category_id
       LEFT JOIN registrations r ON e.id = r.event_id
       GROUP BY c.id
       ORDER BY registration_count DESC`
    );

    res.json({
      success: true,
      statistics: {
        totalEvents: totalEvents.count,
        totalRegistrations: totalRegistrations.count,
        upcomingEvents: upcomingEvents.count,
        fullEvents: fullEvents.count,
        cancelledEvents: cancelledEvents.count,
        mostPopularCategory: mostPopularCategory?.name || "N/A",
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
