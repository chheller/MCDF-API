import { verifyJWToken } from '../auth/auth';
import { Request, Response, NextFunction } from 'express';
import { AccessControlService, AccessControlAction, CRUDActions } from '../auth/access-control';
import { RequestHandler } from 'express-serve-static-core';

export interface IMiddleware {
  isAuthenticated(req: Request, res: Response, next: NextFunction): Promise<void>;
  isAuthorized(
    action: AccessControlAction,
    resource: string,
    checkOwnership?: boolean
  ): RequestHandler;
}

export class Middleware implements IMiddleware {
  constructor(private ac: AccessControlService) {}

  public async isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    try {
      const decodedToken: any = await verifyJWToken(token);
      req.user = { id: decodedToken.userId, role: decodedToken.role };
      return next();
    } catch (err) {
      res.status(403).json({ message: 'Invalid Authentication' });
    }
  }

  public isAuthorized(
    action: CRUDActions,
    resource: string,
    checkOwnership?: boolean
  ): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const { role, id } = req.user;
      let parsedAction: AccessControlAction;
      console.log(id === req.params.resourceOwnerId);
      if (!!checkOwnership && id === req.params.resourceOwnerId) {
        parsedAction = (action + 'Own') as AccessControlAction;
      } else {
        parsedAction = (action + 'Any') as AccessControlAction;
      }
      res.locals.permissions = this.ac.permissions(role, parsedAction, resource);
      return next();
    };
  }
}
