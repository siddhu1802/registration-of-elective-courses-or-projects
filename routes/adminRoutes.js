import express from 'express';
import multer from 'multer';
import {
  getAdminProfile,
  updateAdminProfile,
  handleUpdateAdminPhoto,
  addcourse,
  viewAllProjects,
  getAllCourses,
  getMandatoryCourses,
  getElectiveCourses,
  updateCourse,
  getDashboardDetails,
  getAvailableCourses,
  fetchTeachCourseRequests,
  handleTeachCourseRequestAction
} from '../controllers/adminController.js';

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

const upload = multer({ storage });

// Routes
router.get('/getAdminProfile', getAdminProfile);
router.post('/updateAdminProfile', updateAdminProfile);
router.post('/updateAdminPhotoInAdmins', upload.single('photo'), handleUpdateAdminPhoto);
router.get('/getAllCourses', getAllCourses);
router.get('/getMandatoryCourses', getMandatoryCourses);
router.get('/getElectiveCourses',getElectiveCourses);
router.post('/addcourse', addcourse);
router.put('/updateCourse/:courseID', updateCourse);
router.get('/viewAllProjects', viewAllProjects);
router.get('/dashboardDetails', getDashboardDetails);

router.get('/getAvailableCourses', getAvailableCourses);
router.get('/getTeachCourseRequests', fetchTeachCourseRequests);
router.post('/teachCourseRequestAction', handleTeachCourseRequestAction);

export default router;
