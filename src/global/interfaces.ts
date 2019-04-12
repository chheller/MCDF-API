export const enum ResponseTypes {
  failure = "FAILURE",
  success = "SUCCESS",
  notFound = "NOT_FOUND",
  notImplemented = "NOT_IMPLEMENTED"
}

interface IResponse<T> {
  status: number;
  payload: T;
}

export interface ISuccessResponse<T = {}> extends IResponse<T> {
  type: ResponseTypes.success;
}
export interface IErrorResponse<T> extends IResponse<T> {
  type: ResponseTypes.failure;
  message: string;
}
export interface INotFoundResponse<T> extends IResponse<T> {
  type: ResponseTypes.notFound;
  message: string;
}

export interface INotImplementedResponse<T> extends IResponse<T> {
  type: ResponseTypes.notImplemented;
  message: string;
}

export type Response<T, P = T> =
  | ISuccessResponse<T>
  | IErrorResponse<P>
  | INotFoundResponse<P>
  | INotImplementedResponse<P>;

export class SuccessResponse<T = {}> implements ISuccessResponse<T> {
  public type: ResponseTypes.success = ResponseTypes.success;
  constructor(public payload = {} as T, public status = 200) {}
}

export class ErrorResponse<T> implements IErrorResponse<T> {
  public type: ResponseTypes.failure = ResponseTypes.failure;
  constructor(
    public payload = {} as T,
    public status = 500,
    public message = "internal server error"
  ) {}
}
export class NotFoundResponse<T> implements INotFoundResponse<T> {
  public type: ResponseTypes.notFound = ResponseTypes.notFound;
  constructor(
    public payload = {} as T,
    public status = 404,
    public message = "resource not found"
  ) {}
}

export class NotImplementedResponse<T> implements INotImplementedResponse<T> {
  public type: ResponseTypes.notImplemented = ResponseTypes.notImplemented;
  constructor(
    public payload = {} as T,
    public status = 501,
    public message = "not_implemented"
  ) {}
}
