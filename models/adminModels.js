import oracledb from 'oracledb';
import { getConnection } from "../config/db.js";

export async function getUserByEmail(conn, email) {
  const result = await conn.execute(
    `SELECT role, password, Roll_number, username FROM users WHERE email = :email`,
    { email }
  );
  console.log(result);
  return result;
}

export async function getAdminFromAdmins(email) {
  console.log(email);
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `SELECT *
       FROM ADMINS
       WHERE ROLE = 'admin' AND EMAIL = :email`,
      { email }
    );
    console.log('Admin profile fetched successfully');
    console.log(result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('Error fetching admin profile from ADMINS:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

export async function getAdminFromAdminsById(adminId) {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `SELECT *
       FROM ADMINS
       WHERE ROLE = 'admin' AND ADMIN_ID = :adminId`,
      { adminId }
    );
    console.log('Admin profile fetched successfully by ID');
    console.log(result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('Error fetching admin profile from ADMINS by ID:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

// Update admin profile in ADMINS table
export async function updateAdminInProfile(adminId, name, email, phone, gender, dob, password) {
  const connection = await getConnection();
  try {
    let sql, binds;

    if (password) {
      sql = `UPDATE ADMINS
             SET USERNAME = :name,
                 EMAIL = :email,
                 PHONE = :phone,
                 GENDER = :gender,
                 DOB = TO_DATE(:dob, 'DD-MM-YYYY'),
                 PASSWORD = :password
             WHERE ADMIN_ID = :adminId`;
      binds = [name, email, phone, gender, dob, password, adminId];
    } else {
      sql = `UPDATE ADMINS
             SET USERNAME = :name,
                 EMAIL = :email,
                 PHONE = :phone,
                 GENDER = :gender,
                 DOB = TO_DATE(:dob, 'DD-MM-YYYY')
             WHERE ADMIN_ID = :adminId`;
      binds = [name, email, phone, gender, dob, adminId];
    }

    const result = await connection.execute(sql, binds, { autoCommit: true });
    console.log('Admin profile updated successfully');
    return result;
  } catch (err) {
    console.error('Error updating admin profile in ADMINS:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

export async function updateAdminPhotoInAdmins(filename) {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `UPDATE ADMINS
       SET PHOTO = :photo
       WHERE ROLE = 'admin'`,
      [filename],
      { autoCommit: true }
    );
    console.log('Admin photo updated successfully');
    return result;
  } catch (err) {
    console.error('Error updating admin photo in ADMINS:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

async function lobToString(lob) {
  return new Promise((resolve, reject) => {
    if (lob === null) {
      resolve(null);
      return;
    }
    let clobData = '';
    lob.setEncoding('utf8');
    lob.on('data', (chunk) => {
      clobData += chunk;
    });
    lob.on('end', () => {
      resolve(clobData);
    });
    lob.on('error', (err) => {
      reject(err);
    });
  });
}

export async function getAllCourses() {
  const connection = await getConnection();
  try {
    const result = await connection.execute(`SELECT * FROM COURSES`);
    console.log('Courses fetched successfully');
    const columns = result.metaData.map(col => col.name);
    const courses = [];
    for (const row of result.rows) {
      const obj = {};
      for (let idx = 0; idx < columns.length; idx++) {
        let value = row[idx];
        if (value && typeof value === 'object' && value.constructor.name === 'Lob') {
          value = await lobToString(value);
        }
        obj[columns[idx]] = value;
      }
      courses.push(obj);
    }
    return courses;
  } catch (err) {
    console.error('Error fetching courses:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

export async function getMandatoryCourses() {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `SELECT * FROM COURSES WHERE COURSE_TYPE = 'Mandatory'`
    );
    console.log('Mandatory courses fetched successfully');
    const columns = result.metaData.map(col => col.name);
    const courses = [];
    for (const row of result.rows) {
      const obj = {};
      for (let idx = 0; idx < columns.length; idx++) {
        let value = row[idx];
        if (value && typeof value === 'object' && value.constructor.name === 'Lob') {
          value = await lobToString(value);
        }
        obj[columns[idx]] = value;
      }
      courses.push(obj);
    }
    return courses;
  } catch (err) {
    console.error('Error fetching mandatory courses:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

export async function getElectiveCourses() {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `SELECT * FROM COURSES WHERE COURSE_TYPE = 'Elective'`
    );
    console.log('Elective courses fetched successfully');
    const columns = result.metaData.map(col => col.name);
    const courses = [];
    for (const row of result.rows) {
      const obj = {};
      for (let idx = 0; idx < columns.length; idx++) {
        let value = row[idx];
        if (value && typeof value === 'object' && value.constructor.name === 'Lob') {
          value = await lobToString(value);
        }
        obj[columns[idx]] = value;
      }
      courses.push(obj);
    }
    return courses;
  } catch (err) {
    console.error('Error fetching elective courses:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

export async function addCourse(courseID, courseName, description, syllabus, courseType, branch) {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `INSERT INTO COURSES (COURSE_ID, COURSE_NAME, DESCRIPTION, SYLLABUS, COURSE_TYPE, BRANCH)
       VALUES (:courseID, :courseName, :description, :syllabus, :courseType, :branch)`,
      { courseID, courseName, description, syllabus, courseType, branch },
      { autoCommit: true }
    );
    console.log('✅ Course added successfully to DB');
    return result;
  } catch (err) {
    console.error('❌ Error adding course to DB:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

export async function updateCourse(courseID, courseName, description, syllabus, courseType, branch) {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `UPDATE COURSES
       SET COURSE_NAME = :courseName,
           DESCRIPTION = :description,
           SYLLABUS = :syllabus,
           COURSE_TYPE = :courseType,
           BRANCH = :branch
       WHERE COURSE_ID = :courseID`,
      { courseID, courseName, description, syllabus, courseType, branch },
      { autoCommit: true }
    );
    console.log('✅ Course updated successfully in DB');
    return result;
  } catch (err) {
    console.error('❌ Error updating course in DB:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

export async function getAllProjects() {
  const connection = await getConnection();
  try {
    // Use uppercase table name as Oracle stores table names in uppercase by default
    // Replace SCHEMA_NAME with your actual schema name if needed
    const schemaName = process.env.DB_SCHEMA || '';
    const projectsTable = schemaName ? `${schemaName}.PROJECTS` : 'PROJECTS';

    // Select all columns and rows from projects table
    const query = `
      SELECT * FROM ${projectsTable}
    `;

    const result = await connection.execute(query);
    console.log('Projects query result:', result);
    const columns = result.metaData.map(col => col.name);
    const projects = [];
    for (const row of result.rows) {
      const obj = {};
      for (let idx = 0; idx < columns.length; idx++) {
        const colName = columns[idx];
        obj[colName] = row[idx];
      }
      projects.push(obj);
    }
    console.log('Mapped projects:', projects);
    return projects;
  } catch (err) {
    console.error('Error fetching projects:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

// New function to get teach course requests with faculty and course details
export async function getTeachCourseRequests() {
  const connection = await getConnection();
  try {
    const query = `
      SELECT r.FACULTY_ID, f.USERNAME AS FACULTY_NAME, r.COURSE_ID, c.COURSE_NAME, r.STATUS
      FROM TEACH_COURSE_REQUESTS r
      JOIN FACULTY f ON r.FACULTY_ID = f.FACULTY_ID
      JOIN COURSES c ON r.COURSE_ID = c.COURSE_ID
      WHERE r.STATUS = 'PENDING'
      ORDER BY r.FACULTY_ID, r.COURSE_ID
    `;
    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows;
  } finally {
    await connection.close();
  }
}

// New function to update teach course request status
export async function updateTeachCourseRequestStatus(facultyId, courseId, status) {
  const connection = await getConnection();
  try {
    const query = `
      UPDATE TEACH_COURSE_REQUESTS
      SET STATUS = :status
      WHERE FACULTY_ID = :facultyId AND COURSE_ID = :courseId
    `;
    const binds = { status, facultyId, courseId };
    const result = await connection.execute(query, binds, { autoCommit: true });
    return result;
  } catch (err) {
    console.error('Error updating teach course request status in DB:', err);
    throw err;
  } finally {
    await connection.close();
  }
}

// New function to add course to faculty's assigned courses
export async function addCourseToFaculty(facultyId, courseId) {
  const connection = await getConnection();
  try {
    const query = `
      INSERT INTO FACULTY_COURSES (FACULTY_ID, COURSE_ID)
      VALUES (:facultyId, :courseId)
    `;
    const binds = { facultyId, courseId };
    const result = await connection.execute(query, binds, { autoCommit: true });
    return result;
  } catch (err) {
    console.error('Error adding course to faculty in DB:', err);
    throw err;
  } finally {
    await connection.close();
  }
}
