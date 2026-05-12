import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No authorization header' });
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) return res.status(401).json({ message: 'Token not found' });
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  // Supreme and Super Admin bypass all role checks
  if (req.user?.role === 'supreme' || req.user?.role === 'super_admin') return next();
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  next();
};
