import { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { ObjectSchema, validate, ValidationOptions } from 'joi';
import {
  ServiceResponse,
  ValidationErrorResponse,
  UnauthorizedResponse
} from '../global/interfaces';
import { logger } from '../global/logger';
import { verifyJWToken } from '../global/utils';
import { NODE_ENV } from './config/environment';

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  try {
    const decodedToken: any = await verifyJWToken(token);
    req.user = { id: decodedToken.userId, role: decodedToken.role };
    return next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid Authentication' });
  }
}

// export function isAuthorized(
//   action: CRUDActions,
//   resource: string,
//   checkOwnership?: boolean
// ): RequestHandler {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const { role, id } = req.user;
//     let parsedAction: AccessControlAction;
//     if (!!checkOwnership && id === req.params.resourceOwnerId) {
//       parsedAction = (action + "Own") as AccessControlAction;
//     } else {
//       parsedAction = (action + "Any") as AccessControlAction;
//     }
//     res.locals.permissions = await AccessControlSingleton.permissions(
//       role,
//       parsedAction,
//       resource
//     );
//     return next();
//   };
// }

export function responseTime(req: Request, res: Response, next: NextFunction) {
  var start = new Date().getUTCMilliseconds();
  res.on('header', function() {
    var duration = new Date().getUTCMilliseconds() - start;
    res.setHeader('X-Response-Time', duration + 'ms');
  });
  next();
}

export async function handleResponse(err: any, req: Request, res: Response, next: NextFunction) {
  if (err) {
    if (res.headersSent) return next(err);
    if (err instanceof ServiceResponse) {
      logger.error(
        `[${err.status}] ${err.message} ${err.payload ? JSON.stringify(err.payload) : ''}`
      );
      if (err instanceof UnauthorizedResponse) {
        res
          .status(err.status)
          .clearCookie('authentication-refresh', {
            signed: true,
            httpOnly: true,
            secure: NODE_ENV === 'prod'
          })
          .send();
      } else {
        res.status(err.status).json({ message: err.message, payload: err.payload });
      }
    } else {
      logger.error(`${`[${err.status}] ` || ''}${err.stack || err.message || err.detail}`);
      res.status(500).send({ name: err.name || 'server_error', message: err.message });
    }
  }
}

export function validateRequest<T>(validationSchema: ObjectSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationOptions: ValidationOptions = {
      abortEarly: true,
      stripUnknown: true
    };
    const { error, value } = validate<T>(req.body, validationSchema, validationOptions);
    if (error) {
      const JoiError = new ValidationErrorResponse({
        original: error._object,
        details: error.details.map(({ message, type }) => ({
          message: message.replace(/['"]/g, ''),
          type
        }))
      });
      return next(JoiError);
    }
    req.body = value;
    return next();
  };
}
