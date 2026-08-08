const express = require("express");
const authController = require("../controllers/authController");
const { handleValidation } = require("../middleware/validationMiddleware");
const { validSession, testUser } = require("../middleware/authMiddleware");

const authRouter = express.Router();

authRouter.post(
    "/register", 
    authController.registrationValidationRules, 
    handleValidation, 
    authController.registerUser
);

authRouter.post(
    "/login",
    authController.loginValidationRules,
    handleValidation,
    authController.login
);

authRouter.post("/logout", validSession, authController.logout);

authRouter.get("/me", validSession, authController.me);

// uses a custom middleware, since 'validSession' will just return a status 400 for an invalid session:
// this router should redirect (status 300) for an invalid session
authRouter.get("/profile", async (req, res, next) => 
    {
        try
        {
            await testUser(req, next);
        }
        catch (error)
        {
            res.redirect("/login");
        }
    }, 
authController.getProfile);

// updates user information: frontend validation prevents blank values from being provided, but a request may be made manually
authRouter.put("/profile", 
    validSession, 
    [authController.anyValue("full_name"), authController.emailValidation()], 
    handleValidation, 
    authController.updateProfile
);

authRouter.put("/password", 
    validSession, 
    authController.passwordValidation, 
    handleValidation,
    authController.updatePassword
)

module.exports = { authRouter };