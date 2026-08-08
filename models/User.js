const { db, run, get } = require("./../database/database");

const studentRole = "student";
const adminRole = "admin";

const findUserQuery_template = "SELECT user_id, full_name, email, role, created_at FROM users ";

async function getHash(user_id)
{
    const { password_hash } = await get(`SELECT password_hash FROM users WHERE user_id = ?`, [user_id]);
    if(!password_hash)
    {
        throw new Error(`User with user_id ${user_id} not found.`);
    }
    return password_hash;
}

/**
 * Yields a specific user's information (excluding their hash) based on a certain attribute
 */
async function findByQuery(attribute, value)
{
    const userfound = await get(findUserQuery_template + `WHERE ${attribute} = ?`, [value]);
    if(!userfound)
    {
        throw new Error(`User with ${attribute} ${value} not found.`);
    }
    return { 
        user_id: userfound.user_id, 
        full_name: userfound.full_name, 
        email: userfound.email, 
        role: userfound.role, 
        created_at: userfound.created_at 
    };
}
async function findByEmail(email) 
{
    return await findByQuery("email", email);
}
async function findById(user_id)
{
    return await findByQuery("user_id", user_id);
}

/**
 * Returns true only if a user exists in the database with the specified email
 */
async function emailExists(email)
{
    try {
        await findByEmail(email);
        return true;
    } catch (error) {
        return false;
    }
}
async function createUser(full_name, email, password_hash, role)
{
    await run(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `,
    [full_name, email, password_hash, role]
  );
}
async function getId(email)
{
    const user = await findByEmail(email);
    return user.user_id;
}

/**
 * Only the fields 'full_name', 'email', and 'password_hash' may be modified
 */
async function updateUser(user_id, field, newValue)
{
    const validFields = ["full_name", "email", "password_hash"];
    if (!validFields.includes(field)) {
        throw new Error(`Invalid field: ${field}`);
    }
    const sql = `UPDATE users SET ${field} = ? WHERE user_id = ?`;
    await run(sql, [newValue, user_id]);
}

module.exports = {
    findByEmail,
    findById,
    emailExists,
    createUser,
    studentRole,
    adminRole,
    getId,
    updateUser,
    getHash
};
