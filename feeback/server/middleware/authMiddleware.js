import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ message: 'Authorization token not found' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
