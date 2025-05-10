import { Request, Response, NextFunction } from 'express';
import pool from '../../config/db.config';
import type { transactionLogsType } from '../transactions/transactions.controllers';
import {
  splitMonthly,
  formatOverview,
  splitYearly
} from '../../utils/reports.utils';

export const pageInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //getting user
  const user = req.user;

  try {
    //getting all user logs for this user
    const all_logs = await pool.query(
      'SELECT * FROM user_logs WHERE user_id=? ORDER BY created_at DESC',
      [user.id]
    );

    //monthly split
    const monthlySplit = splitMonthly(all_logs[0] as transactionLogsType[]);

    //format it into the information the overview requires
    const overview = formatOverview(monthlySplit);

    //format into spending trends
    const spendingTrends = splitYearly(overview);

    return res
      .status(200)
      .json({ data: overview, filteredData: spendingTrends });
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      return next(e);
    }
  }
};
