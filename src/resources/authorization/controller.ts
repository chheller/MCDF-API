import { Router, Request, Response, NextFunction } from 'express';
import { controller, post } from '../../core/decorators/express-route-decorators';
import { logger } from '../../core/logger';
import { object, string, validate } from 'joi';
import svcAuthentication, { IAuthSvc, AuthModel, IUser } from './model';
import { MalformedRequestError } from '../../global/errors';
import { BaseController } from '../../global/base-controller';

const loginSchema = object()
  .keys({
    username: string(),
    email: string().email(),
    password: string()
  })
  .or('username', 'email');

const signupSchema = object().keys({
  username: string().required(),
  email: string()
    .email()
    .required(),
  password: string().required()
});

@controller('/authorization')
export class AuthController extends BaseController {
  constructor(router?: Router, private authSvc: IAuthSvc = svcAuthentication) {
    super(router);
  }
  @post('/login')
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validate(req.body, loginSchema);
      const user = { ...(value as IUser) };
      if (error) {
        return next(new MalformedRequestError(error.message));
      }
      const token = await this.authSvc.login(user);
      res.status(200).send({ token });
    } catch (err) {
      return next(err);
    }
  }

  @post('/signup')
  public async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validate(req.body, signupSchema);
      if (error) {
        return next(new MalformedRequestError(error.message));
      }
      const user = { ...(value as IUser) };

      const newAuthorizedUser = await this.authSvc.createNewUser(user);
      res.status(201);
      res.json({ message: 'User successfully created!' });
      logger.notice(`[auth.routes.ts:signup] Created new user `, newAuthorizedUser.toJSON());
    } catch (err) {
      return next(err);
    }
  }
}
