const userModel = require("../models/User");
const { body } = require("express-validator");
const path = require("path");

const bcrypt = require("bcrypt");

async function checkUniqueEmail (email) 
{
    const exists = await userModel.emailExists(email);
    if (exists) {
        throw new Error(`Email already exists.`);
    }
};

async function checkSamePassword(user_id, password)
{
    const hash = await userModel.getHash(user_id);
    const result = await bcrypt.compare(password, hash);
    return result;
}

// must create a new instance each time so as to not modify existing rules

const emailValidation = () => body("email").trim().isEmail().withMessage("Please enter a valid email address.");

const anyValue = (field) => body(field).trim().notEmpty().withMessage("All fields are required.");

const roleValidation = () => body("role").isIn([userModel.studentRole, userModel.adminRole]).withMessage("Invalid role.");


const passwordValidation = [ 
        body("password")
        .notEmpty()
        .withMessage("Please enter a password.")
        .isLength({min: 8})
        .withMessage("Password is too short"),
    
    body("confirmpassword")
        .notEmpty()
        .withMessage("You must confirm your password.")
        .custom((value, { req }) => { return value === req.body.password; })
        .withMessage("Passwords do not match.")
];

const loginValidationRules = [
    emailValidation(),
    anyValue("password"),
    roleValidation()
];


const registrationValidationRules = [
    anyValue("full_name"),

    emailValidation().custom(checkUniqueEmail),

    roleValidation()
].concat(passwordValidation);

async function registerUser(req, res) {
    const { full_name, email, password, role } = req.body;

    const hash = await bcrypt.hash(password, 10);
    await userModel.createUser(full_name, email, hash, role);
    let id;
    let redirect;

    try
    {
        id = await userModel.getId(email);
        req.session.user_id = id;        

        // currently will result in status 404 because these routes are not implemented yet.
        switch(role)
        {
            case userModel.studentRole:
                    redirect = "/student/dashboard";
                break;
            case userModel.adminRole:
                    redirect = "/admin/dashboard";
                break;
        }
        
    }
    catch(error)
    {
        redirect = "/login";
    }
    res.status(200).json({
        success: true,
        redirect,
    });
}

async function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).send("Error logging out.");
        } else {
            res.status(200).send("Success");
        }
    });
}

// returns this user's data (excluding their hash)
async function me(req, res)
{
    res.status(200).json({
        success: true,
        data:
        {
            full_name: req.user.full_name,
            email: req.user.email,
            role: req.user.role,
            user_id: req.user.user_id,
            created_at: req.user.created_at
        }
    });
}

// the only route to the profile page: middleware will redirect to the login page for invalid sessions
async function getProfile(req, res)
{
    res.sendFile(path.join(__dirname, "..", "views", "profile.html"));
}

async function login(req, res) {
    const { email, password, role } = req.body;
    try
    {
        // throws an error if no user with the email exists
        const user = await userModel.findByEmail(email);
        if(role !== user.role)
        {
            throw new Error();
        }
        const passwordMatch = await checkSamePassword(user.user_id, password);
        if(passwordMatch)
        {
            req.session.user_id = user.user_id;
            let redirect = "/";

            // currently will result in status 404 because these routes are not implemented yet.
            switch(user.role)
            {
                case userModel.studentRole:
                    redirect = "/student/dashboard";
                    break;
                case userModel.adminRole:
                    redirect = "/admin/dashboard";
                    break;
            }
            res.status(200).json({
                success: true,
                redirect,
            });

        }
        else
            throw new Error();
    }
    catch(error)
    {
        res.status(401).json({
            success: false,
            message: "Invalid credentials."
        });
    }
}

// general router for updating profile information: may change neither, one, or both full name AND email
async function updateProfile(req, res) {
    const {full_name, email} = req.body;
    let modified = [];
    let message = "No changes were made.";

    if(full_name !== req.user.full_name)
    {
        await userModel.updateUser(req.user.user_id, "full_name", full_name);
        modified.push("Name");
    }
    if(email !== req.user.email)
    {
        try
        {
            await checkUniqueEmail(email);
            await userModel.updateUser(req.user.user_id, "email", email);
            modified.push("Email");
        }
        catch(error)
        {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }
    }
    if(modified.length > 0)
        message = modified.join(", ") + " updated.";

    res.status(200).json({
        success: true,
        message: message
    });

}

// the frontend prevents a request to this router being made using an identical password, but handling is included in case
// a request was made manually
async function updatePassword(req, res) {
    const {password} = req.body;
    const samePassword = await checkSamePassword(req.user.user_id, password);
    let message = "No changes were made.";
    if(!samePassword)
    {
        const hash = await bcrypt.hash(password, 10);
        await userModel.updateUser(req.user.user_id, "password_hash", hash);
        message = "Password updated.";
    }
    res.status(200).json(
        {
            success: true,
            message: message
        }
    );
}

module.exports = {
    registrationValidationRules,
    registerUser,
    loginValidationRules,
    login,
    logout,
    getProfile,
    me,
    updateProfile,
    updatePassword,
    anyValue,
    emailValidation,
    passwordValidation,
    
};