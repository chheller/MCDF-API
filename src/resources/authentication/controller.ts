import { Router, Request, Response, NextFunction } from "express";
import {
  controller,
  post
} from "../../core/decorators/express-route-decorators";
import { logger } from "../../core/logger";
import { object, string, validate } from "joi";
import svcAuthentication, { IAuthSvc, AuthModel, IUser } from "./model";
import { MalformedRequestError } from "../../global/errors";
import { BaseController } from "../../global/base-controller";
import environment from "../../core/config/environment";
const loginSchema = object()
  .keys({
    username: string(),
    email: string().email(),
    password: string()
  })
  .or("username", "email");

const signupSchema = object().keys({
  username: string().required(),
  email: string()
    .email()
    .required(),
  password: string().required()
});

@controller("/authn")
export class AuthController extends BaseController {
  constructor(router?: Router, private authSvc: IAuthSvc = svcAuthentication) {
    super(router);
  }
  @post("/refresh")
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshTokenSigned = req.signedCookies["authentication-refresh"];
      if (!refreshTokenSigned) {
        throw "Unauthenticated";
      }
      const claimToken = await this.authSvc.refresh(refreshTokenSigned);
      res.status(200).send({ claimToken });
    } catch (err) {
      res.status(500);
      return next(err);
    }
  }
  @post("/login")
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validate(req.body, loginSchema);
      const user = { ...(value as IUser) };
      if (error) {
        return next(new MalformedRequestError(error.message));
      }
      const { claimToken, refreshToken } = await this.authSvc.login(user);
      console.log(refreshToken);
      res
        .status(200)
        .cookie("authentication-refresh", refreshToken, {
          signed: true,
          maxAge: 900000,
          httpOnly: true,
          secure: environment.NODE_ENV === "prod"
        })
        .send({ claimToken });
    } catch (err) {
      return next(err);
    }
  }
  @post("/unauthn")
  public async test(req: Request, res: Response, next: NextFunction) {
    res.status(401);
    res.json({ message: "Unauthorized" });
  }
  @post("/signup")
  public async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = validate(req.body, signupSchema);
      if (error) {
        return next(new MalformedRequestError(error.message));
      }
      const user = { ...(value as IUser) };

      const newAuthorizedUser = await this.authSvc.createNewUser(user);
      res.status(201);
      res.json({ message: "User successfully created!" });
      logger.notice(
        `[auth.routes.ts:signup] Created new user `,
        newAuthorizedUser.toJSON()
      );
    } catch (err) {
      return next(err);
    }
  }
}
