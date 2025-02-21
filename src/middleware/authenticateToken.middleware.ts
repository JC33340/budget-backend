import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../utils/auth.utils';
import pool from '../config/db.config';

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //get token from header
  const token = req.headers.authorization;

  //have to run this check to ensure existance
  if (!token) {
    return res.status(400).json({ message: 'Token is not present' });
  }

  //split value to just get the token
  const value = token.split(' ')[1];

  //run through token validation util to get email
  const isValid = validateToken(value);

  //handle if token isnt valid
  if (!isValid.isValid) {
    return res.status(401).json({ message: 'Token is not valid' });
  }

  //check that email exists
  const email_sql = await pool.query(
    'SELECT email from users WHERE email = ? LIMIT 1',
    [isValid.user]
  );
  const email_arr = email_sql[0] as Array<{ email: string }>;
  if (email_arr.length != 1) {
    return res.status(404).json({ message: 'Email does not exist' });
  }

  //add email into the request if token is valid
  req.user = isValid.user;
  next();
};

export default authenticateToken;
