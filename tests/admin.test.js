//By Tiago
const request = require("supertest");
const express = require("express");
const session = require("express-session");
const adminRoutes = require("../routes/adminRoutes");

// Create an isolated Express app for testing
const app = express();
app.use(express.json());

// Mock session setup for tests
app.use((req, res, next) => {
  if (req.headers["x-test-role"] === "admin") {
    req.session = { user: { id: 1, role: "admin" } };
  } else if (req.headers["x-test-role"] === "student") {
    req.session = { user: { id: 2, role: "student" } };
  } else {
    req.session = {};
  }
  next();
});

app.use("/api/admin", adminRoutes);

describe("Admin Route Protection & Validation Tests", () => {
  // Test 1: Block unauthenticated users
  test("GET /api/admin/dashboard should return 401 if not logged in", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  // Test 2: Block non-admin users (Students)
  test("GET /api/admin/dashboard should return 403 for student role", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("x-test-role", "student");
    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
  });

  // Test 3: Allow authenticated Admins
  test("GET /api/admin/dashboard should return 200 for admin role", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("x-test-role", "admin");
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  // Test 4: Reject invalid event capacity
  test("POST /api/admin/events should return 400 for invalid capacity", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .set("x-test-role", "admin")
      .send({
        title: "Test Event",
        category: "Workshop",
        date: "2026-12-01",
        start_time: "10:00",
        end_time: "12:00",
        location: "Hall H",
        capacity: -5
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain("positive integer");
  });
});