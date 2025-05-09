import {
  getFacultyProfile,
  updateFacultyProfile,
  updateFacultyPhoto as updateFacultyPhotoInDB,
  getCoursesAssignedToFaculty,
  getProjectsAssignedToFaculty,
  getAllCourses,
  getAllProjects,
  addProject as addProjectModel,
  getTeachCourseRequests,
  requestTeachCourse as requestTeachCourseModel
} from '../models/facultyModel.js';

import { getConnection } from '../config/db.js';

export async function viewFacultyProfile(req, res) {
  try {
    const profile = await getFacultyProfile(req.params.id);
    res.status(200).json({ profile });
  } catch {
    res.status(500).json({ message: 'Failed to fetch faculty profile' });
  }
}

export async function editFacultyProfile(req, res) {
  const { facultyId, name, email, phone, gender, dob, password } = req.body;
  if (!facultyId || !name || !email || !phone || !gender || !dob || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    await updateFacultyProfile(facultyId, name, email, phone, gender, dob, password);
    res.status(200).json({ message: 'Faculty profile updated successfully' });
  } catch {
    res.status(500).json({ message: 'Failed to update faculty profile' });
  }
}

export async function updateFacultyPhoto(req, res) {
  try {
    const facultyId = req.params.id;

    if (!req.file || !req.file.filename) {
      return res.status(400).json({ error: 'No photo file uploaded' });
    }

    const filename = req.file.filename;

    await updateFacultyPhotoInDB(facultyId, filename);

    res.status(200).json({ message: 'Faculty photo updated successfully' });
  } catch (error) {
    console.error('Error updating faculty photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function viewAssignedCourses(req, res) {
  try {
    const facultyId = req.user?.id;
    if (!facultyId) {
      return res.status(401).json({ message: 'User not logged in' });
    }
    const courses = await getCoursesAssignedToFaculty(facultyId);
    res.status(200).json({ courses });
  } catch {
    res.status(500).json({ message: 'Failed to fetch assigned courses' });
  }
}

export async function viewAssignedProjects(req, res) {
  try {
    const facultyId = req.user?.id;
    if (!facultyId) {
      return res.status(401).json({ message: 'User not logged in' });
    }
    const projects = await getProjectsAssignedToFaculty(facultyId);
    res.status(200).json({ projects });
  } catch {
    res.status(500).json({ message: 'Failed to fetch assigned projects' });
  }
}

export async function viewAllCourses(req, res) {
  try {
    const courses = await getAllCourses();
    if (!courses) {
      return res.status(404).json({ message: 'No courses found' });
    }
    // Convert courses to plain objects if needed to avoid circular references
    const plainCourses = courses.map(course => {
      try {
        return JSON.parse(JSON.stringify(course));
      } catch {
        // If conversion fails, return a shallow copy excluding circular properties
        const copy = {};
        for (const key in course) {
          if (typeof course[key] !== 'object') {
            copy[key] = course[key];
          }
        }
        return copy;
      }
    });
    res.status(200).json({ courses: plainCourses });
  } catch (error) {
    console.error('Error fetching all courses:', error);
    // Avoid sending circular structure error in response
    res.status(500).json({ message: 'Failed to fetch all courses' });
  }
}

export async function viewAllProjects(req, res) {
  try {
    const projects = await getAllProjects();
    res.status(200).json({ projects });
  } catch {
    res.status(500).json({ message: 'Failed to fetch all projects' });
  }
}

export async function addProject(req, res) {
  console.log('Request body:', req.body);
  console.log('User:', req.user);
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing' });
  }
  const { projectId, projectName, description, techStack, status } = req.body;
  // Use id as facultyId from req.user only
  const facultyId = req.user?.id;
  if (!facultyId || !projectId || !projectName || !status) {
    return res.status(400).json({ message: 'Required fields missing: projectId, projectName, status or user not logged in' });
  }

  try {
    await addProjectModel(facultyId, projectId, projectName, description, techStack, status);
    res.status(201).json({ message: 'Project added successfully' });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Failed to add project', error: error.message });
  }
}

// New controller function to return session user data
export function getSessionUser(req, res) {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Unauthorized: No session user found' });
  }
}

export async function requestTeachCourse(req, res) {
  try {
    console.log('requestTeachCourse controller called');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);

    if (req.user?.role !== 'faculty') {
      console.log('User role is not faculty:', req.user?.role);
      return res.status(403).json({ message: 'Forbidden: Only faculty can request to teach courses' });
    }

    const FACULTY_ID = req.user?.id;
    const { COURSE_ID } = req.body;

    if (!FACULTY_ID || !COURSE_ID) {
      console.log('Missing faculty ID or course ID:', { FACULTY_ID, COURSE_ID });
      return res.status(400).json({ message: 'Faculty ID and Course ID are required' });
    }

    // Validate FACULTY_ID exists in FACULTY table
    const connection = await getConnection();
    try {
      const facultyCheck = await connection.execute(
        `SELECT FACULTY_ID FROM FACULTY WHERE FACULTY_ID = :FACULTY_ID`,
        [FACULTY_ID]
      );
      if (facultyCheck.rows.length === 0) {
        console.log('Faculty ID does not exist in FACULTY table:', FACULTY_ID);
        return res.status(400).json({ message: 'Invalid FACULTY_ID: faculty does not exist' });
      }

      // Validate COURSE_ID exists in COURSES table
      const courseCheck = await connection.execute(
        `SELECT COURSE_ID FROM COURSES WHERE COURSE_ID = :COURSE_ID`,
        [COURSE_ID]
      );
      if (courseCheck.rows.length === 0) {
        console.log('Course ID does not exist in COURSES table:', COURSE_ID);
        return res.status(400).json({ message: 'Invalid COURSE_ID: course does not exist' });
      }
    } finally {
      await connection.close();
    }

    console.log(`Inserting teach course request for faculty ${FACULTY_ID} and course ${COURSE_ID}`);
    await requestTeachCourseModel(FACULTY_ID, COURSE_ID);
    res.status(201).json({ message: 'Request to teach course submitted successfully' });
  } catch (error) {
    console.error('Error submitting teach course request:', error.stack || error);
    res.status(500).json({ message: 'Failed to submit teach course request' });
  }
}

export async function fetchTeachCourseRequests(req, res) {
  try {
    const requests = await getTeachCourseRequests();
    res.status(200).json({ requests });
  } catch (error) {
    console.error('Error fetching teach course requests:', error.stack || error);
    res.status(500).json({ message: 'Failed to fetch teach course requests' });
  }
}
