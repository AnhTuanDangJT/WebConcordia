const { findById } = require("../models/User");
const path = require("path");

/**
 * Attaches a 'user' object to the request if the session is valid
 */
async function testUser(req, next)
{
    const { user_id } = req.session;
    if(!user_id)
        throw new Error();
    const user = await findById(user_id);
    req.user = user;
    if(next)
        next();
}


/**
 * Attaches a 'user' object to the request if the session is valid (otherwise returns status 401). 
 * This object can be accessed from the request itself in controllers.
 * Please put before all other handlers.
 */
async function validSession(req, res, next)
{
        try
        {
            await testUser(req, next);
        }
        catch(error)
        {
                res.status(401).json({
                success: false,
                message: "Invalid session.",
                });

        }
}


module.exports = { validSession, testUser };