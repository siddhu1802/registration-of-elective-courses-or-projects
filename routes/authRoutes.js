import express from 'express';
import { login, logout, signup } from '../controllers/authController.js';


const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);
router.get('/user', logout);


export default router;