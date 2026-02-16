const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  try {
    return jwt.verify(header.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: 'No autorizado' });
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' });
    return null;
  }
  return user;
}

module.exports = { signToken, verifyToken, requireAuth, requireAdmin };
