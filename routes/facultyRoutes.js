import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/jwtMiddleware.js';
import {
  viewFacultyProfile,
  editFacultyProfile,
  updateFacultyPhoto,
  viewAssignedCourses,
  viewAssignedProjects,
  viewAllCourses,
  viewAllProjects,
  addProject,
  getSessionUser,
  requestTeachCourse,
  fetchTeachCourseRequests
} from '../controllers/facultyController.js';

// Route definitions
router.get('/profile/:id', verifyToken, viewFacultyProfile);
router.put('/profile', verifyToken, editFacultyProfile);
router.put('/photo/:id', verifyToken, updateFacultyPhoto);
router.get('/courses/:id', verifyToken, viewAssignedCourses);
router.get('/projects/:id', verifyToken, viewAssignedProjects);
router.get('/courses', viewAllCourses);       // Removed verifyToken middleware to remove protection
router.get('/projects', viewAllProjects);     // Removed verifyToken middleware to remove protection

router.post('/addProject', verifyToken, addProject);

router.post('/requestTeachCourse', verifyToken, requestTeachCourse);

router.get('/requestTeachCourse', verifyToken, fetchTeachCourseRequests);

// New route to get session user data
router.get('/session-user', verifyToken, getSessionUser);

export default router;
