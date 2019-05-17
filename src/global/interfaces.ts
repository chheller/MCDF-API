export const enum ResponseTypes {
  failure = "FAILURE",
  success = "SUCCESS",
  notFound = "NOT_FOUND",
  notImplemented = "NOT_IMPLEMENTED",
  invalidRequest = "REQUEST_INVALID"
}

export type Response<T, P = T> =
  | SuccessResponse<T>
  | ErrorResponse<P>
  | NotFoundResponse<P>
  | NotImplementedResponse<P>;

export abstract class ServiceResponse<T> {
  public type: ResponseTypes;
  constructor(
    public payload: T = {} as T,
    public status = 500,
    public message = "Internal server error."
  ) {}
}

export class SuccessResponse<T = {}> extends ServiceResponse<T> {
  public type: ResponseTypes.success = ResponseTypes.success;
  constructor(
    public payload = {} as T,
    public status = 200,
    public message = "successful"
  ) {
    super(payload, status, message);
  }
}

export class ErrorResponse<T> extends ServiceResponse<T> {
  public type: ResponseTypes.failure = ResponseTypes.failure;
  constructor(
    public payload = {} as T,
    public status = 500,
    public message = "internal server error"
  ) {
    super(payload, status, message);
  }
}
export class NotFoundResponse<T> extends ServiceResponse<T> {
  public type: ResponseTypes.notFound = ResponseTypes.notFound;
  constructor(
    public payload = {} as T,
    public status = 404,
    public message = "resource not found"
  ) {
    super(payload, status, message);
  }
}

export class NotImplementedResponse<T> extends ServiceResponse<T> {
  public type: ResponseTypes.notImplemented = ResponseTypes.notImplemented;
  constructor(
    public payload = {} as T,
    public status = 501,
    public message = "not_implemented"
  ) {
    super(payload, status, message);
  }
}

export class UnauthorizedResponse<T> extends ServiceResponse<T> {
  public type: ResponseTypes.notImplemented = ResponseTypes.notImplemented;
  constructor(
    public payload = {} as T,
    public status = 401,
    public message = "unauthorized"
  ) {
    super(payload, status, message);
  }
}

export class ValidationErrorResponse<T> extends ServiceResponse<T> {
  public type: ResponseTypes.invalidRequest = ResponseTypes.invalidRequest;
  constructor(
    public payload = {} as T,
    public status = 422,
    public message = "Invalid request parameters"
  ) {
    super(payload, status, message);
  }
}
