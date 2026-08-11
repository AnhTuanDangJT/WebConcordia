const { findById } = require("../models/User");

/**
 * Attaches a 'user' object to the request if the session is valid
 */
async function testUser(req, next) {
  const { user_id } = req.session;
  if (!user_id) {
    throw new Error();
  }
  const user = await findById(user_id);
  req.user = user;
  if (next) {
    next();
  }
}

function wantsJson(req) {
  return req.originalUrl.startsWith("/api/");
}

/**
 * Attaches a 'user' object to the request if the session is valid (otherwise returns status 401).
 * API routes get JSON; HTML page routes redirect to login.
 */
async function validSession(req, res, next) {
  try {
    await testUser(req, next);
  } catch (error) {
    if (wantsJson(req)) {
      return res.status(401).json({
        success: false,
        message: "Invalid session.",
      });
    }
    return res.redirect("/login");
  }
}

module.exports = { validSession, testUser, wantsJson };
