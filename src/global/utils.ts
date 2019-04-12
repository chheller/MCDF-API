import { verify, sign } from "jsonwebtoken";

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

export function createJWToken<T extends Object>(
  payload: T,
  options = {
    maxAge: 3600
  }
): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      sign(
        { ...payload },
        process.env.JWT_SECRET,
        {
          expiresIn: options.maxAge
        },
        (err, signed) => {
          if (err) reject(err);
          else resolve(signed);
        }
      );
    });
  } catch (err) {
    err = { message: err.message, stack: err.stack };
    // logger.error("[auth:createJWToken]", err);
    throw err;
  }
}
