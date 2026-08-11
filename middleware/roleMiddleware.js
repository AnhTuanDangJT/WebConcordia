const { wantsJson } = require("./authMiddleware");

/**
 * Returns status 403 if the role associated with this session's user is not equal to the specified role.
 * Please put this after a validSession middleware.
 * API routes get JSON; HTML page routes redirect to login.
 */
function checkRole(role) {
  return (req, res, next) => {
    try {
      if (!req.user || req.user.role !== role) {
        throw new Error();
      }
      next();
    } catch (error) {
      if (wantsJson(req)) {
        return res.status(403).json({
          success: false,
          message: "Role mismatch.",
        });
      }
      return res.redirect("/login");
    }
  };
}

module.exports = {
  checkRole,
};
