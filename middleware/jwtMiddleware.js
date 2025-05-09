import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a secure key and store in env variables

export function verifyToken(req, res, next) {
  console.log('Authorization header:', req.headers['authorization']);
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.log('Authorization header missing');
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
  if (!token) {
    console.log('Token missing in authorization header');
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    console.log('User set in req:', req.user);
    next();
  });
}
