import { NextFunction, Request, Response } from "express";
import { ObjectSchema, validate, ValidationOptions } from "joi";
import {
  ApiError,
  NotFoundError,
  UnauthorizedAccessError,
  UnauthorizedApiError
} from "../global/errors";
import { logger } from "../global/logger";
import { verifyJWToken } from "../global/utils";

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization;
  try {
    const decodedToken: any = await verifyJWToken(token);
    req.user = { id: decodedToken.userId, role: decodedToken.role };
    return next();
  } catch (err) {
    res.status(403).json({ message: "Invalid Authentication" });
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

export async function handleResponse(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err) {
    logger.error(`${err.status || ""}${err.stack}`);
    if (res.headersSent) return next(err);
    if (err instanceof UnauthorizedApiError) {
      res.status(500).send({
        name: "server_error",
        message: "Server encountered an unexpected error"
      });
    } else if (err instanceof ApiError) {
      res
        .status(err.apiError.status)
        .send({ name: err.apiError.name, message: err.apiError.message });
    } else {
      if (err instanceof UnauthorizedAccessError) {
        res
          .status(401)
          .send({ name: err.name || "server_error", message: err.message });
      }
      if (err instanceof NotFoundError) {
        res.status(404).send({ name: err.name, message: err.message });
      } else {
        res
          .status(500)
          .send({ name: err.name || "server_error", message: err.message });
      }
    }
  }
}

export function validateRequest<T>(validationSchema: ObjectSchema) {
  const validationOptions: ValidationOptions = {
    abortEarly: true,
    stripUnknown: true
  };

  return (err: any, req: Request, res: Response, next: NextFunction) => {
    const { error, value } = validate<T>(
      req.body,
      validationSchema,
      validationOptions
    );
    if (error) {
      const JoiError = {
        status: "failed",
        error: {
          original: err._object,
          details: err.details.map(
            ({ message, type }: { [key: string]: string }) => ({
              message: message.replace(/['"]/g, ""),
              type
            })
          )
        }
      };
      return res.status(422).json(JoiError);
    }
    req.body = value;
    return next();
  };
}
