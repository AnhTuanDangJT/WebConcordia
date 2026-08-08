const { findById } = require("../models/User");

/**
 * Returns status 403 if the role associated with this session's user is not equal to the specified role.
 * Please put this after a validSession middleware
 */
function checkRole(role)
{
    return (req, res, next) => {
        try
        {
            if(req.user.role !== role)
            {
                throw new Error();
            }
            next();
        }
        catch(error)
        {
            res.status(403).json({
                success: false,
                message: "Role mismatch.",
            });
        }
    }
}

module.exports = {
    checkRole
};