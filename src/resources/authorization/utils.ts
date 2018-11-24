import { verify, sign } from 'jsonwebtoken';
import { logger } from '../../core/logger';

export function verifyJWToken(token: string) {
  token = token.split(' ')[1];
  return new Promise((resolve, reject) => {
    verify(token, process.env.JWT_SECRET, {}, (err: Error, decodedToken: string) => {
      console.log(decodedToken);
      if (err || !decodedToken) {
        return reject(err);
      }
      return resolve(decodedToken);
    });
  });
}

export function createJWToken(details: {
  payload: { userId: string; role: string };
  maxAge?: number;
}) {
  try {
    if (!details.maxAge || typeof details.maxAge !== 'number') {
      details.maxAge = 3600;
    }
    const { userId, role } = details.payload;
    return new Promise((resolve, reject) => {
      sign(
        { userId, role },
        process.env.JWT_SECRET,
        {
          expiresIn: details.maxAge
        },
        (err, signed) => {
          if (err) reject(err);
          else resolve(signed);
        }
      );
    });
  } catch (err) {
    err = { message: err.message, stack: err.stack };
    logger.error('[auth:createJWToken]', err);
    throw err;
  }
}
