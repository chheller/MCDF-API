import { verify, sign } from "jsonwebtoken";
import { logger } from './logger";

export function toPOJSO() {
  return this.toObject({
    versionKey: false,
    transform: (doc: any, ret: any) => {
      delete ret._id;
      return ret;
    }
  });
}


export function verifyJWToken<T>(token: string): Promise<T> {
  return new Promise((resolve, reject) => {
    verify(
      token,
      process.env.JWT_SECRET,
      {},
      (err: Error, decodedToken: any) => {
        if (err || !decodedToken) {
          return reject(err);
        }
        return resolve(decodedToken as T);
      }
    );
  });
}

export function createJWToken<T extends Object>(details: {
  payload: T;
  maxAge?: number;
}): Promise<string> {
  try {
    if (!details.maxAge || typeof details.maxAge !== "number") {
      details.maxAge = 3600;
    }

    return new Promise((resolve, reject) => {
      sign(
        { ...details.payload },
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
    logger.error("[auth:createJWToken]", err);
    throw err;
  }
}
