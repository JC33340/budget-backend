import { NextFunction, Request, Response } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';

const inputValidation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result: Result<ValidationError> = validationResult(req);

    if (!result.isEmpty())
      return res.status(400).json({ errors: result.array() });

    next();
  } catch (e) {
    next(e);
  }
};

export default inputValidation;
