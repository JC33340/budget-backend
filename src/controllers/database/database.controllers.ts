import { Request, Response, NextFunction } from 'express';
import pool from '../../config/db.config';
import { checkdb } from '../../utils/database.utils';

export const pingdb = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let dbDeployed = false;
  let count = 0;
  //while dbDelpoyed is false continuously send pings to database
  while (!dbDeployed) {
    const result = await checkdb().catch(() => {
      count += 1;
      console.log(count);
    });
    //if there is a result or if the count is too high, just end to process
    if (result || count === 30) {
      dbDeployed = true;
    }
  }
  if (count === 30) {
    return res.status(500).json({ message: 'db not active' });
  }
  return res.status(200).json({ hello: 'hello' });
};
