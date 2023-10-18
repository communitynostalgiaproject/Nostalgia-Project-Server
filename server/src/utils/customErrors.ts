export class NotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
      super(message);
      this.statusCode = 404;
      this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string) {
      super(message);
      this.statusCode = 400;
      this.name = "ValidationError";
  }
}

export class InternalServerError extends Error {
  statusCode: number;

  constructor(message = "Internal Server Error") {
      super(message);
      this.statusCode = 500;
      this.name = "InternalServerError";
  }
}