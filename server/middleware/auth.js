const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer <token>) or cookie
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    const token = tokenFromHeader || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Access denied. Token missing.' });
    }

    // Verify token using JWT secret
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
      }

      // Attach decoded user data to request
      req.user = decoded;
      next();
    });

  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(500).json({ message: 'Server error while verifying token.' });
  }
};

module.exports = authMiddleware;
