import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    // payload: { email, tier }
    req.user = { email: payload.email, tier: payload.tier };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
