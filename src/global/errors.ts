import { BaseError } from 'make-error';
import { string } from 'joi';

export class TypedError extends BaseError {
  constructor(public readonly type: string, message: string) {
    super(message);
    this.name = type;
  }
}

export class UnauthorizedAccessError extends TypedError {
  constructor(message: string, public readonly type: string = 'UnauthorizedAccess') {
    super(type, message);
  }
}

export class NotFoundError extends TypedError {
  constructor(message: string, public readonly type: string = 'Resource Not Found') {
    super(type, message);
  }
}
export class ApiError extends BaseError {
  public readonly apiError: {
    name: string;
    status: number;
    message: string;
  };
  constructor(err: { statusCode: number; error: { name: string; message: string } }) {
    super('Error calling API');
    this.name = 'api_error';
    this.apiError = {
      name: err.error.name,
      message: err.error.message,
      status: err.statusCode
    };
  }
  toString() {}
}

export class MalformedRequestError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = 'malformed_request';
  }
}

export class UnauthorizedApiError extends ApiError {}
