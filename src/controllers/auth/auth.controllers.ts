import { Request, Response, NextFunction } from 'express';
import pool from '../../config/db.config';
import { generateJWT, validateToken } from '../../utils/auth.utils';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    //querying database for password using email
    const sqlInfo = await pool.query(
      `SELECT id,password from users WHERE email = ? LIMIT 1;`,
      [email]
    );
    const row = sqlInfo[0] as Array<{ id: number; password: string }>;

    //handling if there are no results
    if (row.length < 1) {
      return res.status(404).json({ message: 'email does not exist' });
    }

    //check password
    const passwordsMatched = await bcrypt.compare(password, row[0].password);
    if (!passwordsMatched) {
      return res.status(401).json({ message: 'incorrect password' });
    }

    //if no errors
    const jwt = generateJWT(email);

    res.status(200).json({ message: 'login success', jwt: jwt });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e);
      res.status(500).json({ message: e.message });
    }
  }
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

    //password hashing
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    //sending query
    await pool.query('INSERT INTO users (email,name,password) VALUES (?,?,?)', [
      email,
      name,
      hashedPassword
    ]);
    //generate inital overall balance count
    const user_id = await pool.query(
      'SELECT id FROM users WHERE email=? LIMIT 1',
      [email]
    );
    const user_id_arr = user_id[0] as Array<{ id: number }>;

    await pool.query(
      'INSERT INTO overall_balance (balance,user_id) VALUES (0,?)',
      [user_id_arr[0].id]
    );

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

export const checkAuthController = async (
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
  const { isValid } = validateToken(token);

  //handling if token is not valid
  if (!isValid) {
    return res.status(403).json({ message: 'token is invalid' });
  }

  res.status(200).json({ message: 'token valid' });
};

export const forgotPasswordController = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { email } = req.body;

    //check that email exists

    const x = await pool.query(
      'SELECT id,password FROM users WHERE email=? LIMIT 1',
      [email]
    );
    const row = x[0] as Array<{ id: number; password: string }>;

    if (row.length < 1) {
      return res.status(404).json({ message: 'email does not exist' });
    }

    const userId = row[0].id;

    //generate token
    const buf = crypto.randomBytes(20).toString('hex');

    //store token into database
    await pool.query(
      'INSERT INTO forgot_password (token, user_id) VALUES (?,?)',
      [buf, userId]
    );

    //send email to user
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    const msg = {
      to: email, // Change to your recipient
      from: 'budgeterappexpress@gmail.com', // Change to your verified sender
      subject: 'Reset password link',
      html: `<div><p>Click <a href='${process.env.FRONTEND_URL}/auth/reset-password/${buf}?email=${email}'>here</a> to reset your password</p></div>`
    };

    const response = await sgMail.send(msg);
    if (response[0].statusCode != 202) {
      console.log(response);
      return res.status(500).json({ message: 'Error with sendgrid' });
    }

    //return successful response
    res.status(200).json({ message: `email sent to ${email}` });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      if (e.message.includes('Duplicate entry')) {
        return res.status(400).json({ message: 'entry already exists' });
      }
      res.status(500).json({ message: e.message });
    }
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { email, token, password, passwordConfirmation } = req.body;

    //check passwords match
    if (password != passwordConfirmation) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    //check email exists in reset password db
    const dbToken = await pool.query(
      `SELECT forgot_password.id, forgot_password.token FROM forgot_password INNER JOIN users ON forgot_password.user_id = users.id WHERE email=? LIMIT 1;`,
      [email]
    );

    //converting data into an array
    const tokenArr = dbToken[0] as Array<{ id: number; token: string }>;

    //handle is email does not exist in db
    if (tokenArr.length < 1) {
      return res
        .status(404)
        .json({ message: 'Email has not requested a password reset' });
    }

    //check that token matches
    if (tokenArr[0].token != token) {
      return res.status(400).json({ message: 'Token is not valid' });
    }

    //generate new hashed password
    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(password, salt);

    //change password in db
    await pool.query(`UPDATE users SET password=? WHERE email=?;`, [
      hashedNewPassword,
      email
    ]);

    //delete row for email in forgot password db
    await pool.query(`DELETE FROM forgot_password WHERE id=?`, [
      tokenArr[0].id
    ]);

    //return
    res.status(200).json({ message: 'connected' });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e);
      res.status(500).json({ message: e.message });
    }
  }
};
