import { Request, Response, NextFunction } from 'express';
import pool from '../../config/db.config';

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { emailAddress, password } = req.body;
  //const [row] = await pool.query('CALL get_user_by_email_address (?)',[emailAddress])
  const [row] = await pool.query('SELECT * FROM users');
  console.log(row);
  res
    .status(200)
    .json({
      variables: [
        process.env.DB_USERNAME,
        process.env.DB_PASSWORD,
        process.env.DB_HOST,
        process.env.DB_NAME,
        process.env.PORT
      ]
    });
};
