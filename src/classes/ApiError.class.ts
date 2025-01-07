export default class ApiError extends Error {
  status: number;
  stack: any;

  constructor(status: number, message: string, stack?: any) {
    super(message);
    this.status = status;
    this.stack = stack;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
