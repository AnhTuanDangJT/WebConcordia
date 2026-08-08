const db = require('../database/database');

const getStudentDashboard = (req, res, next) => {
    const userId = 1; // *****Temporary test user until session/auth is completed*****

    // SQL query to retrieve the student's name based on the user ID
    //verify that the user is a student by checking the role in the users table
    const sql = `
    SELECT   user_id, full_name
    FROM users
    WHERE user_id = ? AND role = 'student'
    `
    db.get(sql, [userId], (err, user) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        //on successful retrieval of student data, 
        // send the response with the student's name
        // **can potentially add more data to the response in the future**
        res.status(200).json({
            success: true,
            studentName: user.full_name
        });
    });
};

module.exports = {
    getStudentDashboard
};