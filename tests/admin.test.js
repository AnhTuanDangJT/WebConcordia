const request = require("supertest");
const express = require("express");

jest.mock("../models/User", () => ({
  findById: jest.fn(async (user_id) => {
    if (user_id === 1) {
      return {
        user_id: 1,
        full_name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      };
    }
    if (user_id === 2) {
      return {
        user_id: 2,
        full_name: "Student User",
        email: "student@test.com",
        role: "student",
      };
    }
    throw new Error("User not found");
  }),
}));

jest.mock("../models/Event", () => ({
  createEvent: jest.fn(async () => 99),
  getById: jest.fn(async (eventId) => {
    if (String(eventId) === "1") {
      return {
        event_id: 1,
        title: "Test Event",
        organizer_id: 1,
        capacity: 50,
      };
    }
    if (String(eventId) === "2") {
      return {
        event_id: 2,
        title: "Registered Event",
        organizer_id: 1,
        capacity: 30,
      };
    }
    return null;
  }),
  updateEvent: jest.fn(async () => {}),
  deleteEvent: jest.fn(async () => {}),
  countActiveRegistrations: jest.fn(async (eventId) => (eventId === "1" ? 5 : 0)),
  countEventRegistrations: jest.fn(async (eventId) => (eventId === "2" ? 3 : 0)),
  getAllWithRegistrationCount: jest.fn(async () => [
    {
      id: 1,
      title: "Test Event",
      category_name: "Academic workshops",
      date: "2026-12-01",
      capacity: 50,
      registration_count: 5,
      status: "Open",
      organizer_name: "Admin User",
    },
  ]),
  getRegistrationsForEvent: jest.fn(async () => [
    {
      id: 10,
      student_name: "Student User",
      student_email: "student@test.com",
      created_at: "2026-08-01",
      registration_status: "Registered",
      attendance_status: "Pending",
    },
  ]),
}));

jest.mock("../database/database", () => ({
  get: jest.fn(async (sql, params) => {
    if (sql.includes("category_name")) {
      return { category_name: params[0] };
    }
    if (sql.includes("registrations WHERE registration_id")) {
      if (String(params[0]) === "10") {
        return { registration_id: 10, status: "Registered", event_id: 1 };
      }
      if (String(params[0]) === "11") {
        return { registration_id: 11, status: "Cancelled", event_id: 1 };
      }
      return null;
    }
    if (sql.includes("COUNT(*) as count FROM events")) {
      return { count: 4 };
    }
    if (sql.includes("COUNT(*) as count FROM registrations WHERE status != 'Cancelled'")) {
      return { count: 12 };
    }
    if (sql.includes("event_date >=")) {
      return { count: 2 };
    }
    if (sql.includes("status = 'Full'")) {
      return { count: 1 };
    }
    if (sql.includes("status = 'Cancelled'")) {
      return { count: 1 };
    }
    if (sql.includes("GROUP BY category")) {
      return { category: "Academic workshops" };
    }
    if (sql.includes("status = 'Attended'")) {
      return { count: 3 };
    }
    if (sql.includes("IN ('Attended', 'Missed')")) {
      return { count: 5 };
    }
    if (sql.includes("COUNT(*) as count FROM registrations WHERE event_id")) {
      return { count: 2 };
    }
    return { count: 0 };
  }),
  all: jest.fn(async () => [
    { category: "Academic workshops", registration_count: 5 },
    {
      id: 1,
      title: "Test Event",
      capacity: 50,
      registration_count: 5,
      seats_filled_percent: 10,
    },
  ]),
  run: jest.fn(async () => ({ changes: 1 })),
}));

const adminRoutes = require("../routes/adminRoutes");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  if (req.headers["x-test-role"] === "admin") {
    req.session = { user_id: 1 };
    req.user = {
      user_id: 1,
      full_name: "Admin User",
      email: "admin@test.com",
      role: "admin",
    };
  } else if (req.headers["x-test-role"] === "student") {
    req.session = { user_id: 2 };
    req.user = {
      user_id: 2,
      full_name: "Student User",
      email: "student@test.com",
      role: "student",
    };
  } else {
    req.session = {};
  }
  next();
});

app.use("/api/admin", adminRoutes);

const validEvent = {
  title: "Test Event",
  description: "A test event",
  category: "Academic workshops",
  date: "2026-12-01",
  startTime: "10:00",
  endTime: "12:00",
  location: "Hall Building",
  capacity: 50,
  status: "Open",
};

describe("Admin Route Protection", () => {
  test("GET /api/admin/dashboard returns 401 when not logged in", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/admin/dashboard returns 403 for student role", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("x-test-role", "student");
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/admin/dashboard returns 200 for admin role", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("x-test-role", "admin");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("eventSeatFill");
    expect(res.body.data).toHaveProperty("upcomingEvents");
  });
});

describe("Admin Event Management", () => {
  test("POST /api/admin/events returns 400 for invalid capacity", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .set("x-test-role", "admin")
      .send({ ...validEvent, capacity: -5 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("positive integer");
  });

  test("POST /api/admin/events returns 400 for invalid category", async () => {
    const { get } = require("../database/database");
    get.mockImplementationOnce(async () => null);

    const res = await request(app)
      .post("/api/admin/events")
      .set("x-test-role", "admin")
      .send({ ...validEvent, category: "Invalid Category" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Invalid category");
  });

  test("POST /api/admin/events returns 201 for valid data", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .set("x-test-role", "admin")
      .send(validEvent);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.eventId).toBe(99);
  });

  test("PUT /api/admin/events/:eventId returns 404 for missing event", async () => {
    const res = await request(app)
      .put("/api/admin/events/999")
      .set("x-test-role", "admin")
      .send({ capacity: 40 });
    expect(res.statusCode).toBe(404);
  });

  test("PUT /api/admin/events/:eventId returns 400 when capacity is too low", async () => {
    const res = await request(app)
      .put("/api/admin/events/1")
      .set("x-test-role", "admin")
      .send({ capacity: 2 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("cannot be lowered");
  });

  test("PATCH /api/admin/events/:eventId/status updates event status", async () => {
    const res = await request(app)
      .patch("/api/admin/events/1/status")
      .set("x-test-role", "admin")
      .send({ status: "Disabled" });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/admin/events/:eventId blocks delete when registrations exist", async () => {
    const res = await request(app)
      .delete("/api/admin/events/2")
      .set("x-test-role", "admin");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Cannot delete event");
  });

  test("DELETE /api/admin/events/:eventId succeeds with no registrations", async () => {
    const res = await request(app)
      .delete("/api/admin/events/1")
      .set("x-test-role", "admin");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/admin/events returns event list for admin", async () => {
    const res = await request(app)
      .get("/api/admin/events")
      .set("x-test-role", "admin");
    expect(res.statusCode).toBe(200);
    expect(res.body.data[0]).toHaveProperty("remaining_seats");
  });
});

describe("Admin Registrations and Attendance", () => {
  test("GET /api/admin/events/:eventId/registrations returns roster", async () => {
    const res = await request(app)
      .get("/api/admin/events/1/registrations")
      .set("x-test-role", "admin");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test("PATCH /api/admin/registrations/:registrationId/attendance marks attendance", async () => {
    const res = await request(app)
      .patch("/api/admin/registrations/10/attendance")
      .set("x-test-role", "admin")
      .send({ attendanceStatus: "Attended" });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PATCH attendance rejects invalid status", async () => {
    const res = await request(app)
      .patch("/api/admin/registrations/10/attendance")
      .set("x-test-role", "admin")
      .send({ attendanceStatus: "Invalid" });
    expect(res.statusCode).toBe(400);
  });

  test("PATCH attendance rejects cancelled registration", async () => {
    const res = await request(app)
      .patch("/api/admin/registrations/11/attendance")
      .set("x-test-role", "admin")
      .send({ attendanceStatus: "Attended" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("cancelled");
  });
});
