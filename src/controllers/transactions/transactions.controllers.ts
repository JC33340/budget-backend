import { Request, Response, NextFunction } from 'express';
import pool from '../../config/db.config';

type transactionLogsType = {
  id: number;
  action: 'add' | 'minus';
  value: number;
  created_at: Date | string;
  tag: string;
  notes: string;
  display_id: number;
};

export const pageInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get email from request object
    const email = req.user;

    //if email field is empty
    if (!email) {
      return res.status(404).json({ message: 'Email does not exist' });
    }

    //get overll balance information
    const overall_balance_sql = await pool.query(
      'SELECT balance FROM overall_balance LEFT JOIN users ON overall_balance.user_id = users.id WHERE email = ? ',
      [email]
    );
    const overall_balance_arr = overall_balance_sql[0] as Array<{
      balance: number;
    }>;
    const overall_balance = overall_balance_arr[0].balance;

    //get transaction log information
    const transaction_logs_sql = await pool.query(
      'SELECT user_logs.id,tag,action,value,user_logs.created_at,notes FROM user_logs LEFT JOIN users ON user_logs.user_id = users.id WHERE email = ? ',
      [email]
    );
    const transaction_logs_arr =
      transaction_logs_sql[0] as Array<transactionLogsType>;

    const transaction_logs = transaction_logs_arr.map((item, i) => {
      //changing date
      return {
        ...item,
        created_at: new Date(item.created_at).toLocaleDateString('en-GB', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        display_id: i + 1
      };
    });

    //formatting dates
    //separating them into arrays, separated by their dates
    const formatedTransactions: transactionLogsType[][] = [];

    let tempStorage = [];

    for (let i = 0; i < transaction_logs.length; i++) {
      if (i === 0) {
        tempStorage.push(transaction_logs[i]);
        continue;
      }
      if (tempStorage[0].created_at === transaction_logs[i].created_at) {
        tempStorage.push(transaction_logs[i]);
      } else {
        formatedTransactions.push(tempStorage);
        tempStorage = [];
        tempStorage.push(transaction_logs[i]);
      }
      if (i === transaction_logs.length - 1) {
        formatedTransactions.push(tempStorage);
      }
    }
    //return information
    return res
      .status(200)
      .json({ overall_balance, transaction_logs: formatedTransactions });
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
  }
};
