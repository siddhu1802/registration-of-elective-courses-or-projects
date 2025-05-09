import { getConnection, closeConnection } from '../config/db.js';
import {
  getAdminFromAdminsById,
  updateAdminInProfile,
  updateAdminPhotoInAdmins,
  getAllCourses as dbGetAllCourses,
  getMandatoryCourses as dbGetMandatoryCourses,
  getElectiveCourses as dbGetElectiveCourses,
  addCourse,
  getAllProjects,
  updateCourse as dbUpdateCourse,
  getTeachCourseRequests as dbGetTeachCourseRequests
} from "../models/adminModels.js";

import {
  requestTeachCourse as requestTeachCourseModel,
  getTeachCourseRequests as facultyGetTeachCourseRequests
} from '../models/facultyModel.js';

const PORT = process.env.PORT || 3001;

export async function getAvailableCourses(req, res) {
  try {
    const courses = await dbGetAllCourses();
    res.status(200).json({ courses });
  } catch (err) {
    console.error('Error fetching available courses:', err);
    res.status(500).json({ message: 'Failed to fetch available courses.' });
  }
}

async function getAdminDetailsById(adminId) {
  if (!adminId) {
    throw new Error('Admin ID is required');
  }
  const admin = await getAdminFromAdminsById(adminId);
  if (!admin) {
    throw new Error('Admin not found');
  }
  return {
    adminId: admin[0],
    username: admin[1],
    email: admin[2],
    phoneNumber: admin[3],
    gender: admin[4],
    dob: admin[5],
    role: admin[8],
    photoUrl: admin[6] ? `http://localhost:${PORT}/uploads/${admin[6]}` : ''
  };
}

export async function getAdminProfile(req, res) {
  try {
    if (!req.session || !req.session.user || !req.session.user.ADMIN_ID) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const adminDetails = await getAdminDetailsById(req.session.user.ADMIN_ID);
    res.status(200).json({ adminDetails });
  } catch (err) {
    if (err.message === 'Admin not found') {
      return res.status(404).json({ message: err.message });
    }
    console.error('Error fetching admin profile:', err);
    res.status(500).json({
      message: 'Failed to load admin profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export async function updateAdminProfile(req, res) {
  const {
    ADMIN_ID: adminId,
    USERNAME: name,
    EMAIL: email,
    PHONE_NUMBER: phone,
    GENDER: gender,
    DOB: dob,
    PASSWORD: password
  } = req.body;

  if (!adminId || !name || !email || !phone || !gender || !dob) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    await updateAdminInProfile(adminId, name, email, phone, gender, dob, password || null);
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Error updating admin profile:', err);
    res.status(500).json({ message: 'Failed to save changes.' });
  }
}

async function updateAdminPhoto(filename) {
  try {
    await updateAdminPhotoInAdmins(filename);
  } catch (err) {
    throw err;
  }
}

export async function handleUpdateAdminPhoto(req, res) {
  try {
    const filename = req.file.filename;
    await updateAdminPhoto(filename);
    res.json({ photoUrl: `http://localhost:${PORT}/uploads/${filename}` });
  } catch (err) {
    console.error('Error uploading admin photo:', err);
    res.status(500).json({ message: 'Failed to upload photo.' });
  }
}

export async function getAllCourses(req, res) {
  try {
    const courses = await dbGetAllCourses();
    res.status(200).json({ courses });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Failed to fetch courses.' });
  }
}

export async function getMandatoryCourses(req, res) {
  try {
    const courses = await dbGetMandatoryCourses();
    res.status(200).json({ courses });
  } catch (err) {
    console.error('Error fetching mandatory courses:', err);
    res.status(500).json({ message: 'Failed to fetch mandatory courses.' });
  }
}

export async function getElectiveCourses(req, res) {
  try {
    const courses = await dbGetElectiveCourses();
    res.status(200).json({ courses });
  } catch (err) {
    console.error('Error fetching elective courses:', err);
    res.status(500).json({ message: 'Failed to fetch elective courses.' });
  }
}

export async function addcourse(req, res) {
  const { courseID, courseName, description, syllabus, courseType, branch } = req.body;

  if (!courseID || !courseName || !description || !syllabus || !courseType || !branch) {
    return res.status(400).json({ message: 'All fields are required including branch.' });
  }

  try {
    await addCourse(courseID, courseName, description, syllabus, courseType, branch);
    res.status(200).json({ message: 'Course added successfully.' });
  } catch (err) {
    console.error('Error adding course:', err);
    res.status(500).json({ message: 'Failed to add course.' });
  }
}

export async function viewAllProjects(req, res) {
  try {
    const projects = await getAllProjects();
    res.status(200).json({ projects });
  } catch (err) {
    console.error('Failed to retrieve projects:', err);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
}

export async function updateCourse(req, res) {
  const courseIDRaw = req.params.courseID;
  const courseID = decodeURIComponent(courseIDRaw);
  const { courseName, description, syllabus, courseType, branch } = req.body;

  console.log('updateCourse called with:', { courseIDRaw, courseID, courseName, description, syllabus, courseType, branch });

  if (!courseID || !courseName || !description || !syllabus || !courseType || !branch) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const result = await dbUpdateCourse(courseID, courseName, description, syllabus, courseType, branch);
    console.log('Database update result:', result);
    res.status(200).json({ message: 'Course updated successfully.' });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ message: 'Failed to update course.' });
  }
}

// Refactored controller function name to avoid conflict
export async function fetchTeachCourseRequests(req, res) {
  try {
    const requests = await dbGetTeachCourseRequests();
    res.status(200).json({ requests });
  } catch (err) {
    console.error('Error fetching teach course requests:', err);
    res.status(500).json({ message: 'Failed to fetch teach course requests.' });
  }
}

// Controller function to handle approve/reject teach course request
async function updateTeachCourseRequestStatus(facultyId, courseId, action) {
  // Implement the logic to update the teach course request status in the database
  // This is a placeholder implementation, replace with actual DB update logic
  // For example, call a model function to update the status
  // Example: await adminModel.updateTeachCourseRequestStatus(facultyId, courseId, action);
  // Throw error if update fails

  // Import the model function to update the teach course request status and to add course to faculty
  const { updateTeachCourseRequestStatus: updateStatusInDB, addCourseToFaculty } = await import('../models/adminModels.js');

  try {
    // Update the teach course request status
    await updateStatusInDB(facultyId, courseId, action);

    // If approved, add the course to the faculty's courses
    if (action === 'APPROVED') {
      await addCourseToFaculty(facultyId, courseId);
    }
  } catch (error) {
    console.error('Error updating teach course request status or adding course to faculty:', error);
    throw error;
  }
}

export async function handleTeachCourseRequestAction(req, res) {
  const { facultyId, courseId, action } = req.body;
  if (!facultyId || !courseId || !action) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  if (!['APPROVED', 'REJECTED'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }
  try {
    await updateTeachCourseRequestStatus(facultyId, courseId, action);
    res.status(200).json({ message: `Request ${action.toLowerCase()} successfully.` });
  } catch (err) {
    console.error('Error updating teach course request status:', err);
    res.status(500).json({ message: 'Failed to update request status' });
  }
}

// Admin dashboard details
export async function getDashboardDetails(req, res) {
  try {
    if (!req.session || !req.session.user || !req.session.user.ADMIN_ID) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const adminDetails = await getAdminDetailsById(req.session.user.ADMIN_ID);
    res.status(200).json({ adminDetails });
  } catch (err) {
    console.error('Error fetching dashboard details:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard details.' });
  }
}
