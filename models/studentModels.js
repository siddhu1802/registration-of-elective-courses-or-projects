import { getConnection } from "../config/db.js";

export async function getStudentProfile(studentId) {
    let connection;
  
    try {
      connection = await oracledb.getConnection(dbConfig);
  
      const result = await connection.execute(
        `SELECT STUDENT_ID, STUDENT_NAME, EMAIL, PHONE_NUMBER, GENDER, YEAR, SEMESTER,
                BRANCH, DATE_OF_BIRTH, PASSWORD, CGPA, PROFILE_PHOTO
           FROM STUDENTS
          WHERE STUDENT_ID = :id`,
        [studentId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      if (result.rows.length === 0) throw new Error('Student not found');
      const student = result.rows[0];
  
      return {
        id: student.STUDENT_ID,
        name: student.STUDENT_NAME,
        email: student.EMAIL,
        phone: student.PHONE_NUMBER,
        gender: student.GENDER,
        year: student.YEAR,
        semester: student.SEMESTER,
        branch: student.BRANCH,
        dob: student.DATE_OF_BIRTH,
        password: student.PASSWORD,
        cgpa: student.CGPA,
        photo: student.PROFILE_PHOTO,
      };
  
    } catch (err) {
      console.error('Error in getStudentProfile:', err);
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }
  
  export async function updateStudentProfile(studentId, name, email, phone, gender, year, semester, branch, dob, password, cgpa) {
    if (!studentId || !name || !email || !dob) {
      throw new Error('Missing required fields: name, email, dob');
    }
  
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      await connection.execute(
        `UPDATE STUDENTS
           SET STUDENT_NAME = :name,
               EMAIL = :email,
               PHONE_NUMBER = :phone,
               GENDER = :gender,
               YEAR = :year,
               SEMESTER = :semester,
               BRANCH = :branch,
               DATE_OF_BIRTH = TO_DATE(:dob, 'YYYY-MM-DD'),
               PASSWORD = :password,
               CGPA = :cgpa
         WHERE STUDENT_ID = :id`,
        { name, email, phone, gender, year, semester, branch, dob, password, cgpa, id: studentId },
        { autoCommit: true }
      );
      return { success: true };
    } catch (err) {
      console.error('Error in updateStudentProfile:', err);
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }
  
  export async function updateStudentPhoto(studentId, photoPath) {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      await connection.execute(
        `UPDATE STUDENTS SET PROFILE_PHOTO = :photo WHERE STUDENT_ID = :id`,
        { photo: photoPath, id: studentId },
        { autoCommit: true }
      );
      return { success: true };
    } catch (err) {
      console.error('Error in updateStudentPhoto:', err);
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }
  
  export async function fetchStudentCourses(studentId) {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
  
      // Fetch all courses for the student, including mandatory ones by default
      const courses = {
        mandatory: await getMandatoryCourses(connection),
        elective: await getCoursesByType(connection, 'elective'),
        applied: await getCoursesByType(connection, 'applied'),
        allCourses: await getAllCourses(connection)
      };
  
      // Combine mandatory courses with 'myCourses' to ensure they are visible by default
      courses.allCourses = [...courses.mandatory, ...courses.allCourses];
  
      return formatCoursesAsTable(courses);
    } catch (err) {
      console.error('Error in fetchStudentCourses:', err);
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }
  
  // Function to format courses as a table
  function formatCoursesAsTable(courses) {
    const table = {
      mandatory: formatCourseList(courses.mandatory),
      elective: formatCourseList(courses.elective),
      applied: formatCourseList(courses.applied),
      allCourses: formatCourseList(courses.allCourses)
    };
    return table;
  }
  
  // Helper function to format list of courses into a table-like structure
  function formatCourseList(courseList) {
    return courseList.map(course => {
      return {
        COURSE_ID: course.COURSE_ID,
        COURSE_NAME: course.COURSE_NAME,
        DESCRIPTION: course.DESCRIPTION,
        SYLLABUS: course.SYLLABUS,
        COURSE_TYPE: course.COURSE_TYPE,
        FACULTY_ID: course.FACULTY_ID,
        CREATED_AT: course.CREATED_AT,
        BRANCH: course.BRANCH,
        CREDITS: course.CREDITS
      };
    });
  }
  
  // Fetch mandatory courses for the student (no enrollments table)
  export  async function getMandatoryCourses(connection) {
    const result = await connection.execute(
      `SELECT COURSE_ID, COURSE_NAME, DESCRIPTION, SYLLABUS, COURSE_TYPE, FACULTY_ID, CREATED_AT, BRANCH, CREDITS
         FROM COURSES
        WHERE COURSE_TYPE = 'mandatory'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
  
    return result.rows;
  }
  
  // Fetch courses by type (available, mandatory, applied) — no enrollments table
  export  async function getCoursesByType(connection, type) {
    const result = await connection.execute(
      `SELECT COURSE_ID, COURSE_NAME, DESCRIPTION, SYLLABUS, COURSE_TYPE, FACULTY_ID, CREATED_AT, BRANCH, CREDITS
         FROM COURSES
        WHERE COURSE_TYPE = :type`,
      [type],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
  
    return result.rows;
  }
  
  // Fetch all courses (no student-specific filter)
  export  async function getAllCourses(connection) {
    const result = await connection.execute(
      `SELECT COURSE_ID, COURSE_NAME, DESCRIPTION, SYLLABUS, COURSE_TYPE, FACULTY_ID, CREATED_AT, BRANCH, CREDITS
         FROM COURSES`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
  
    return result.rows;
  }
  
  export async function getStudentProjects(studentId) {
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      
      // Fetch all columns from the PROJECTS table
      const result = await connection.execute(
        `SELECT PROJECT_ID, PROJECT_NAME, DESCRIPTION, TECH_STACK, STATUS, FACULTY_ID, CREATED_AT
           FROM PROJECTS`,
        [],  // No need for student-specific filter
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
  
      return formatProjectsAsTable(result.rows);
    } catch (err) {
      console.error('Error in fetchStudentProjects:', err);
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }
  
  // Function to format projects as a table
  function formatProjectsAsTable(projects) {
    return projects.map(project => {
      return {
        PROJECT_ID: project.PROJECT_ID,
        PROJECT_NAME: project.PROJECT_NAME,
        DESCRIPTION: project.DESCRIPTION,
        TECH_STACK: project.TECH_STACK,
        STATUS: project.STATUS,
        FACULTY_ID: project.FACULTY_ID,
        CREATED_AT: project.CREATED_AT
      };
    });
  }