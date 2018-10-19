import { verify, sign } from 'jsonwebtoken';
import { reduce } from 'lodash';

export function verifyJWToken(token: string) {
  return new Promise((resolve, reject) => {
    verify(token, process.env.JWT_SECRET, (err: Error, decodedToken: string) => {
      if (err || !decodedToken) {
        return reject(err);
      }
      return resolve(decodedToken);
    });
  });
}

export function createJWToken(details: { maxAge?: number; sessionData?: any }) {
  if (typeof details !== 'object') {
    details = {};
  }
  if (!details.maxAge || typeof details.maxAge !== 'number') {
    details.maxAge = 3600;
  }

  details.sessionData = reduce(
    details.sessionData || {},
    (memo: { [key: string]: any }, val: any, key: string) => {
      if (typeof val !== 'function' && key !== 'password') {
        memo[key] = val;
      }
      return memo;
    },
    {}
  );

  const token = sign(
    {
      data: details.sessionData
    },
    process.env.JWT_SECRET,
    {
      expiresIn: details.maxAge,
      algorithm: 'HS256'
    }
  );

  return token;
}
