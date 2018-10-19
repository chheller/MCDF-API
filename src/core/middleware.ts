import { verifyJWToken } from '../auth/auth';
import { Request, Response, NextFunction } from 'express';

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  try {
    const decodedToken = await verifyJWToken(token);
    req.user = decodedToken.data;
  } catch (err) {
    res.status(403).json({ message: 'Invalid authorization' });
  }
}
