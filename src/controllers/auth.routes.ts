import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import Auth, { AuthDocument } from '../models/auth/auth';
import { hash, compare } from 'bcrypt';
import * as v4 from 'uuid/v4';
import { logger } from '../core/logger';
import { object, string, validate, ValidationError } from 'joi';
import { createJWToken } from '../auth/auth';
const router = express.Router();

const loginSchema = object()
  .keys({
    username: string(),
    email: string().email(),
    password: string()
  })
  .or('username', 'email');

router.post('/authorization/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = validate(req.body, loginSchema);
    const { email, password, username } = value;
    if (error) {
      logger.notice(error);
      res.status(401);
      res.json({ error: handleJoiError(error) });
      return next();
    }
    try {
      let user = (await Auth.findOne((email && { email }) || { username })) as AuthDocument;
      const isAuthorized = compare(password, user.password);
      if (isAuthorized) {
        try {
          const token = await createJWToken({ payload: { userId: user.id, role: user.role } });
          res.status(200).json({ token });
        } catch (err) {
          // JWT could not be verified
        }
      }
    } catch (err) {
      // user is not found
    }
  } catch (err) {
    logger.error('[auth.routes.ts:login] ', err);
    res.status(500);
    res.json({ error: 'Internal server error' });
  } finally {
    return next();
  }
});

const signupSchema = object().keys({
  username: string().required(),
  email: string()
    .email()
    .required(),
  password: string().required()
});

router.post('/authorization/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = validate(req.body, signupSchema);
    if (error) {
      logger.notice(error);
      res.status(400).json(handleJoiError(error));
      return next();
    }
    let { username, password, email } = value;
    let unique = (await Auth.count({ email })) === 0;
    if (!unique) {
      res.status(409).json({ error: 'User with email already exists' });
      logger.notice('[auth.routes.ts:signup] User already exists');
      return next();
    }

    password = await hash(password, 15);
    const newAuthorizedUser = new Auth({ username, email, password, id: v4() });
    await newAuthorizedUser.save();
    res.status(201);
    res.json({ message: 'User successfully created!' });
    logger.notice(`[auth.routes.ts:signup] Created new user `, newAuthorizedUser.toJSON());
  } catch (err) {
    res.status(500);
    res.json({ error: 'Internal server error' });
    logger.error(`[auth.routes.ts:signup] Failed to create user`, err.toJSON());
  } finally {
    return next();
  }
});

export default router;

function handleJoiError(err: ValidationError) {
  if (Array.isArray(err.details) && err.details.length > 0) {
    const invalidItem = err.details[0];
    return `[${err.name}] ${invalidItem.message}`;
  }
}
