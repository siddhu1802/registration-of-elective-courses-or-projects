import { getConnection } from "../config/db.js";

// Insert user into users table
export async function insertUser(conn, { roll_number, username, email, password, role }) {
  const result = await conn.execute(
    `INSERT INTO users (roll_number, username, email, password, role)
     VALUES (:roll_number, :username, :email, :password, :role)`,
    { roll_number, username, email, password, role },
    { autoCommit: true }
  );
  return result;
}

// Insert admin into admins table
export async function insertAdmin(conn, { roll_number, username, email, password, role }) {
  const result = await conn.execute(
    `INSERT INTO admins (admin_id, username, email, password, role)
     VALUES (:roll_number, :username, :email, :password, :role)`,
    { roll_number, username, email, password, role },
    { autoCommit: true }
  );
  return result;
}

export async function insertFaculty(conn, { roll_number, username, email, password, role }) {
  const result = await conn.execute(
    `INSERT INTO faculty (faculty_id, username, email, password, role)
     VALUES (:roll_number, :username, :email, :password, :role)`,
    { roll_number, username, email, password, role },
    { autoCommit: true }
  );
  return result;
}

// Insert student into the students table (only required fields)
export async function insertStudent(conn, { roll_number, username, email, password, role }) {
  const result = await conn.execute(
    `INSERT INTO students (STUDENT_ID, NAME, EMAIL, PASSWORD, ROLE)
     VALUES (:roll_number, :username, :email, :password, :role)`,
    { roll_number, username, email, password, role },
    { autoCommit: true }
  );
  return result;
}

export async function getUserByEmail(conn, email) {
  const result = await conn.execute(
    `SELECT role, password, Roll_number, username FROM users WHERE email = :email`,
    { email }
  );
  console.log(result);
  return result;
}

