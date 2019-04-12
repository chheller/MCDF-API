export const enum ResponseTypes {
  failure = 'FAILURE',
  success = 'SUCCESS',
  notFound = 'NOT_FOUND'
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

export type Response<T, P = T> = ISuccessResponse<T> | IErrorResponse<P> | INotFoundResponse<P>;

export class SuccessResponse<T = {}> implements ISuccessResponse<T> {
  public type: ResponseTypes.success = ResponseTypes.success;
  constructor(public status = 200, public payload = {} as T) {}
}

export class ErrorResponse<T> implements IErrorResponse<T> {
  public type: ResponseTypes.failure = ResponseTypes.failure;
  constructor(
    public status = 500,
    public payload = {} as T,
    public message = 'internal server error'
  ) {}
}
export class NotFoundResponse<T> implements INotFoundResponse<T> {
  public type: ResponseTypes.notFound = ResponseTypes.notFound;
  constructor(
    public status = 404,
    public payload = {} as T,
    public message = 'resource not found'
  ) {}
}
