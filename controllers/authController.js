// controllers/authController.js
import { getConnection, closeConnection } from '../config/db.js';
import { insertUser, insertAdmin, insertStudent, getUserByEmail, insertFaculty } from '../models/authModel.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(req, res) {
  const { roll_number, username, email, password, role } = req.body;

  console.log("Signup route hit");
  console.log("Received data:", req.body);

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  let conn;

  try {
    conn = await getConnection();

    const userResult = await insertUser(conn, { roll_number, username, email, password, role });
    console.log("Inserted into users table:", userResult);

    if (role.toLowerCase() === 'admin') {
      const adminResult = await insertAdmin(conn, { roll_number, username, email, password, role });
      console.log("Inserted into admins table:", adminResult);
    }

    if (role.toLowerCase() === 'faculty') {
      const facultyResult = await insertFaculty(conn, { roll_number, username, email, password, role });
      console.log("Inserted into faculty table:", facultyResult);
    }
    

    if (role.toLowerCase() === 'student') {
      const studentResult = await insertStudent(conn, { roll_number, username, email, password, role });
      console.log("Inserted into students table:", studentResult);
    }

    res.status(200).json({ message: "Signup successful!" });
  } catch (err) {
    console.error("❌ Error during signup:", err);
    res.status(500).json({ message: "Signup Failed! User Already Exists or Error in DB" });
  } finally {
    await closeConnection(conn);
  }
}

import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a secure key and store in env variables

export async function login(req, res) {
  const { email, password } = req.body;

  console.log("Login route hit");
  console.log("Received login data:", req.body);

  // Validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const conn = await getConnection();
    const result = await getUserByEmail(conn, email); // Assuming result.rows is correct
    await closeConnection(conn);

    if (result.rows.length > 0) {
      const dbPassword = result.rows[0][1]; // password from DB
      const userRole = result.rows[0][0];   // role from DB
      const adminId = result.rows[0][2];    // assuming admin_id or roll_number is at index 2
      const userName = result.rows[0][3];

      // Plain text password check (use bcrypt in real apps)
      if (password === dbPassword) {
        // Generate JWT token
        const tokenPayload = {
          email: email,
          role: userRole,
          id: adminId,
          name: userName
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ 
          token,
          role: userRole,
          name: userName,
          id: adminId
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password." });
      }
    } else {
      return res.status(401).json({ message: "Invalid email or password." });
    }

  } catch (error) {
    console.error("❌ Database error during login:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
}

export async function logout(req, res) {
  // Since we are not using sessions anymore, logout can be handled on client side by removing token
  res.status(200).json({ message: 'Logged out successfully' });
}
