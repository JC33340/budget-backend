import { Request, Response, NextFunction } from 'express';
import pool from '../../config/db.config';
import { generateJWT, validateToken } from '../../utils/auth.utils';
import { FieldPacket } from 'mysql2';

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  //querying database for password using email
  const [row] = (await pool.query('CALL get_user_by_email_address (?)', [
    email
  ])) as [{ id: number; password: string }[][], FieldPacket[]];

  //handling if there are no results
  if (row.length < 1) {
    return res.status(404).json({ message: 'email does not exist' });
  }

  //check password
  if (row[0][0].password != password) {
    return res.status(401).json({ message: 'incorrect password' });
  }

  //if no errors
  const jwt = generateJWT(email);

  res.status(200).json({ message: 'login success', jwt: jwt });
};

export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, name, password, passwordConfirmation } = req.body;
  try {
    //password validation
    if (password != passwordConfirmation)
      throw new Error('Passwords do not match');

    //sending query
    await pool.query('CALL add_new_user (?,?,?)', [email, name, password]);

    //creating jwt
    const jwt = generateJWT(email);

    //response to user
    res.status(201).json({
      message: 'Successfully created user',
      jwt: jwt
    });
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      if (e.message.includes('Duplicate entry')) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      res.status(400).json({ message: e.message, error: e });
    }
  }
};

export const checkAuthController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //getting token from request
  let token = req.headers['authorization'];

  //checking if token exists
  if (!token) {
    return res.status(400).json({ message: 'token missing' });
  }

  //manipulating returned information to return only the token
  token = token.split(' ')[1];

  //validating token and getting email address tied to it
  const { isValid, user } = validateToken(token);

  //handling if token is not valid
  if (!isValid) {
    return res.status(403).json({ message: 'token is invalid' });
  }

  res.status(200).json({ message: user });
};
