import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import { initialize } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import studentRouter from './routes/studentRoutes.js';
import facultyRouter from './routes/facultyRoutes.js';
import EventEmitter from 'events';

EventEmitter.defaultMaxListeners = 20; // Set the limit to a higher number if necessary

dotenv.config({ path: './Backend/.env' });

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '********' : undefined);
console.log('DB_CONNECT_STRING:', process.env.DB_CONNECT_STRING);

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://127.0.0.1:5501',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Serve frontend static files
app.use(express.static('frontend'));

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.message);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next();
});

app.use(session({
  cookie: { maxAge: 86400000, secure: false, httpOnly: true, sameSite: 'lax' }, // 1 day
  secret: 'yourSecretKey', // use env variable in real project
  resave: false,
  saveUninitialized: false
}));

// Routes
app.use('/user', authRouter);
app.use('/admin', adminRouter);
app.use('/uploads', express.static('uploads'));
app.use('/student', studentRouter);
app.use('/logout', authRouter);
app.use('/faculty', facultyRouter);

// Connect to the database and start the server
initialize().then(() => {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
