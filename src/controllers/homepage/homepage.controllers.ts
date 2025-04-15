import { Request, Response, NextFunction } from 'express';
import pool from '../../config/db.config';
import type { transactionLogsType } from '../transactions/transactions.controllers';
import {
  separateCategories,
  separateWeekly,
  separateRecent,
  getWeekly
} from '../../utils/homepage.utils';

export const pageInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    //get all user log information
    const logs_sql = await pool.query(
      'SELECT * FROM user_logs WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    const logs_arr = logs_sql[0] as Array<transactionLogsType>;

    //get overall balance information
    const balance_sql = await pool.query(
      'SELECT balance from overall_balance WHERE user_id = ?',
      [user.id]
    );
    const balance_arr = balance_sql[0] as Array<{ balance: number }>;
    //formatting log data

    //getting current week of information
    const weeklyInfo = getWeekly(logs_arr);

    //splitting into separate categories
    const splitCategories = separateCategories(weeklyInfo);

    //sorting into days of the week
    const splitWeekly = separateWeekly(weeklyInfo);

    //recent transactions
    const recentTransactions = separateRecent(logs_arr);

    return res.status(200).json({
      category: splitCategories,
      week: splitWeekly,
      recentTransactions: recentTransactions,
      balance: balance_arr[0].balance
    });
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
  }
};
