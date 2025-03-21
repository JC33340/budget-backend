import { Request, Response, NextFunction } from 'express';
import pool from '../../config/db.config';

export const wakedb = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await pool.query('SELECT * FROM users WHERE email=?', [
      'demoaccount@demo.com'
    ]);
  } catch (e) {
    return res.status(200).json({ message: 'waking db' });
  }
  return res.status(200).json({ message: 'db awake' });
};
