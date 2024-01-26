import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  statusCode?: number;
}

export default (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  if (err.statusCode) {
      res.status(err.statusCode).send({ message: err.message });
  } else {
      console.error(err);
      res.status(500).send({ message: 'Internal Server Error' });
  }
};