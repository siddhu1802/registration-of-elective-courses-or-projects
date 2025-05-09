import oracledb from 'oracledb';
import { getConnection } from "../config/db.js";

export async function getFacultyProfile(facultyId) {
    const connection = await getConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM FACULTY WHERE FACULTY_ID = :facultyId`,
        [facultyId]
      );
      return result.rows[0];
    } finally {
      await connection.close();
    }
  }

export async function updateFacultyProfile(facultyId, name, email, phone, gender, dob, password) {
    const connection = await getConnection();
    try {
      await connection.execute(
        `UPDATE FACULTY SET NAME = :name, EMAIL = :email, PHONE = :phone,
        GENDER = :gender, DOB = TO_DATE(:dob, 'YYYY-MM-DD'), PASSWORD = :password
        WHERE FACULTY_ID = :facultyId`,
        [name, email, phone, gender, dob, password, facultyId],
        { autoCommit: true }
      );
    } finally {
      await connection.close();
    }
  }

export async function updateFacultyPhoto(facultyId, filename) {
    const connection = await getConnection();
    try {
      await connection.execute(
        `UPDATE FACULTY SET PHOTO = :photo WHERE FACULTY_ID = :facultyId`
        , [filename, facultyId],
        { autoCommit: true }
      );
    } finally {
      await connection.close();
    }
  }

export async function getCoursesAssignedToFaculty(facultyId) {
    const connection = await getConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM COURSES WHERE FACULTY_ID = :facultyId`
        , [facultyId]
      );
      return result.rows;
    } finally {
      await connection.close();
    }
  }

export async function getProjectsAssignedToFaculty(facultyId) {
    const connection = await getConnection();
    try {
      const result = await connection.execute(
        `SELECT * FROM PROJECTS WHERE SUPERVISOR_ID = :facultyId`
        , [facultyId]
      );
      return result.rows;
    } finally {
      await connection.close();
    }
  }

export  async function getAllCourses() {
    const connection = await getConnection();
    try {
      const result = await connection.execute(`SELECT * FROM COURSES`);
      return result.rows;
    } finally {
      await connection.close();
    }
  }

export async function getAllProjects() {
    const connection = await getConnection();
    try {
      const result = await connection.execute(`SELECT * FROM PROJECTS`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return result.rows;
    } finally {
      await connection.close();
    }
  }

export async function getAvailableCourses() {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `SELECT * FROM COURSES WHERE FACULTY_ID IS NULL`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } finally {
    await connection.close();
  }
}

export async function addProject(facultyId, projectId, projectName, description, techStack, status) {
  const connection = await getConnection();
  try {
    await connection.execute(
      `INSERT INTO projects (  PROJECT_ID, PROJECT_NAME, DESCRIPTION, TECH_STACK,  STATUS,  FACULTY_ID ) VALUES
       (:projectId, :projectName, :description, :techStack, :status, :facultyId)`,
      [projectId, projectName, description, techStack, status, facultyId],
      { autoCommit: true }
    );
  } finally {
    await connection.close();
  }
}

export async function requestTeachCourse(facultyId, courseId) {
  const connection = await getConnection();
  try {
    console.log(`requestTeachCourse called with facultyId: ${facultyId}, courseId: ${courseId}`);

    // Check if request already exists
    const existingRequest = await connection.execute(
      `SELECT 1 FROM TEACH_COURSE_REQUESTS WHERE FACULTY_ID = :facultyId AND COURSE_ID = :courseId`,
      [facultyId, courseId]
    );
    if (existingRequest.rows.length > 0) {
      throw new Error('Request already exists for this faculty and course');
    }

    // Optional: verify facultyId exists in FACULTY table before insert
    const facultyCheck = await connection.execute(
      `SELECT FACULTY_ID FROM FACULTY WHERE FACULTY_ID = :facultyId`,
      [facultyId]
    );
    console.log(`Faculty check result:`, facultyCheck.rows);

    await connection.execute(
      `INSERT INTO TEACH_COURSE_REQUESTS (FACULTY_ID, COURSE_ID, STATUS) VALUES (:facultyId, :courseId, 'PENDING')`,
      [facultyId, courseId],
      { autoCommit: true }
    );
  } finally {
    await connection.close();
  }
}

export async function getTeachCourseRequests() {
  const connection = await getConnection();
  try {
    const query = `
      SELECT r.FACULTY_ID, f.NAME AS FACULTY_NAME, r.COURSE_ID, c.COURSE_NAME, r.STATUS
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
