import { Request, Response, NextFunction } from 'express';
import pool from '../../config/db.config';
import { checkdb } from '../../utils/database.utils';
import { time } from 'console';

const timeout = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
};

export const wakedb = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //logging if db is active and count the number of runs performed
  let dbActive = false;
  let count = 0;
  //query db until either it is active or count is greater than 30
  while (!dbActive && count < 30) {
    try {
      await pool.query('SELECT * FROM users WHERE email=?', [
        'demoaccount@demo.com'
      ]);
      dbActive = true;
    } catch (e) {
      count += 1;
      await timeout();
    }
  }
  if (dbActive) {
    return res.status(200).json({ message: 'db awake' });
  } else {
    return res.status(500).json({ message: 'server issue' });
  }
};

export const pingdb = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let active = false;
  let count = 0;

  while (!active && count < 30) {
    try {
      await checkdb();
    } catch (e) {
      count += 1;
      console.log(count);
      continue;
    }
    active = true;
  }
  if (!active) {
    return res.status(500).json({ message: 'Internal server error' });
  } else {
    return res.status(200).json({ message: 'db awake' });
  }
};
