import { Router, Request, Response, NextFunction } from "express";

import { loginSchema, IUserCredentials } from "../domain/model";
import { validateRequest } from "../../../core/middleware";
import {
  controller,
  post
} from "../../../core/decorators/express-route-decorators";
import { BaseController } from "../../../global/base-controller";
import { AuthService } from "../application/service";
import { ResponseTypes } from "../../../global/interfaces";
import environment from "../../../core/config/environment";

@controller("/auth")
export class AuthController extends BaseController {
  constructor(router?: Router, private authService = new AuthService()) {
    super(router);
  }
  @post("/refresh")
  async refresh(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.signedCookies["authentication-refresh"];
    const serviceResponse = await this.authService.generateClaimToken(
      refreshToken
    );
    const { status, payload } = serviceResponse;

    res.status(status).json({ payload });
  }
  @post("/login", validateRequest<IUserCredentials>(loginSchema))
  async login(req: Request, res: Response, next: NextFunction) {
    const authenticateResponse = await this.authService.authenticateUser(
      req.body
    );
    switch (authenticateResponse.type) {
      case ResponseTypes.success:
        const saveTokenResponse = await this.authService.saveRefreshTokenToUser(
          authenticateResponse.payload.id
        );
        switch (saveTokenResponse.type) {
          case ResponseTypes.success:
            const claimTokenResponse = await this.authService.generateClaimToken(
              saveTokenResponse.payload
            );
            switch (claimTokenResponse.type) {
              case ResponseTypes.success:
                return res
                  .status(200)
                  .cookie("authentication-refresh", saveTokenResponse.payload, {
                    maxAge: 90000,
                    signed: true,
                    httpOnly: true,
                    secure: environment.NODE_ENV === "prod"
                  })
                  .json({ claim: claimTokenResponse.payload });
              default:
                return res
                  .status(claimTokenResponse.status)
                  .json(claimTokenResponse.payload);
            }
          default:
            return res
              .status(saveTokenResponse.status)
              .json(saveTokenResponse.payload);
        }
      default:
        return res
          .status(authenticateResponse.status)
          .json(authenticateResponse.payload);
    }
  }
  @post("/unauthn")
  public async test(req: Request, res: Response, next: NextFunction) {
    res.status(401);
    res.json({ message: "Unauthorized" });
  }
}
