import express from 'express';
import multer from 'multer';

import { getProfile, updateStudentProfile, updateStudentPhoto, allCourses, getAllProjects } from '../controllers/studentController.js';

const router = express.Router();

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
router.get('/getProfile', getProfile);
router.post('/updateStudentProfile', updateStudentProfile);
router.post('/updateStudentPhoto', updateStudentPhoto);
router.get('/allCourses', allCourses);
router.get('/getAllProjects', getAllProjects);


export default router;
