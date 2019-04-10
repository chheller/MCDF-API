import { verifyJWToken } from "../resources/authentication/utils";
import { Request, Response, NextFunction } from "express";
import accessControlSignleton, {
  AccessControlAction,
  CRUDActions
} from "../resources/access_control/access-control";
import { RequestHandler } from "express-serve-static-core";
import { logger } from "./logger";
import {
  ApiError,
  UnauthorizedAccessError,
  UnauthorizedApiError,
  NotFoundError
} from "../global/errors";
import { ValidationError } from "joi";

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

export function isAuthorized(
  action: CRUDActions,
  resource: string,
  checkOwnership?: boolean
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { role, id } = req.user;
    let parsedAction: AccessControlAction;
    if (!!checkOwnership && id === req.params.resourceOwnerId) {
      parsedAction = (action + "Own") as AccessControlAction;
    } else {
      parsedAction = (action + "Any") as AccessControlAction;
    }
    res.locals.permissions = await accessControlSignleton.permissions(
      role,
      parsedAction,
      resource
    );
    return next();
  };
}

export async function handleResponse(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err) {
    console.log(err.stack);
    logger.error(`${err.status || ""}${err.stack}`);
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

function handleJoiError(err: ValidationError) {
  if (Array.isArray(err.details) && err.details.length > 0) {
    const invalidItem = err.details[0];
    return `[${err.name}] ${invalidItem.message}`;
  }
}
