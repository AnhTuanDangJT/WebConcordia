const test = require('node:test');
const assert = require('node:assert/strict');

const { run, get } = require('../database/database');
const { cancelRegistration } = require('../controllers/registrationController');

test('cancelRegistration updates an active registration to cancelled', async () => {
  const userId = (await run(
    `INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    ['Test Student', 'test-student-cancel@example.com', 'hash', 'student']
  )).lastID;

  const eventId = (await run(
    `INSERT INTO events (title, description, category, event_date, start_time, end_time, location, capacity, status, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Test Event', 'Test description', 'Academic', '2026-08-20', '10:00', '11:00', 'Room 1', 50, 'Open', userId]
  )).lastID;

  await run(
    `INSERT INTO registrations (user_id, event_id, status, attended) VALUES (?, ?, ?, ?)`,
    [userId, eventId, 'Registered', 'No']
  );

  const req = {
    user: { user_id: userId },
    params: { eventId: String(eventId) }
  };
  const res = createMockResponse();

  await cancelRegistration(req, res, () => {});

  const registration = await get(
    'SELECT status FROM registrations WHERE user_id = ? AND event_id = ?',
    [userId, eventId]
  );

  assert.equal(res.statusCode, 200);
  assert.equal(registration.status, 'Cancelled');
});

function createMockResponse() {
  return {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
    send(payload) {
      this.payload = payload;
      return this;
    }
  };
}
