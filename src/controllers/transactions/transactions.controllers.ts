import { Request, Response, NextFunction } from 'express';
import pool from '../../config/db.config';
import { Next } from 'mysql2/typings/mysql/lib/parsers/typeCast';

type transactionLogsType = {
  id: number;
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
    const { email } = req.user;

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
      'SELECT user_logs.id,tag,value,user_logs.created_at,notes FROM user_logs LEFT JOIN users ON user_logs.user_id = users.id WHERE email = ? ORDER BY created_at DESC',
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
      }
      if (i === transaction_logs.length - 1) {
        formatedTransactions.push(tempStorage);
        continue;
      }
      if (tempStorage[0].created_at === transaction_logs[i].created_at) {
        tempStorage.push(transaction_logs[i]);
      } else {
        formatedTransactions.push(tempStorage);
        tempStorage = [];
        tempStorage.push(transaction_logs[i]);
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

export const addTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { value, tag, notes } = req.body;
    const { id } = req.user;
    //insert data into db
    await pool.query(
      'INSERT INTO user_logs (value,tag,notes,user_id) VALUES (?,?,?,?)',
      [value, tag, notes, id]
    );

    //change overall balance

    //get overall balance
    const balance_sql = await pool.query(
      'SELECT balance from overall_balance WHERE user_id = ? LIMIT 1;',
      [id]
    );
    const balance_arr = balance_sql[0] as Array<{ balance: number }>;
    let balance = balance_arr[0].balance;

    //modify it
    balance = balance + value;

    //reinsert back into db
    await pool.query(
      'UPDATE overall_balance SET balance = ? WHERE user_id = ?',
      [balance, id]
    );

    //return new overall balance
    return res.status(200).json({ message: 'item added', newBalance: balance });
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { logId } = req.body;

    //check that this logId matches the user_id of the jwt
    const log_sql = await pool.query(
      'SELECT user_id,value FROM user_logs WHERE id = ? LIMIT 1',
      [logId]
    );
    const log_arr = log_sql[0] as Array<{ user_id: number; value: number }>;
    if (log_arr[0].user_id != req.user.id) {
      return res
        .status(401)
        .json({ message: 'User is not authorized to perform this action' });
    }

    //change overall balance

    //getting old balance
    const balance_sql = await pool.query(
      'SELECT balance FROM overall_balance WHERE user_id = ?',
      [req.user.id]
    );
    const balance_arr = balance_sql[0] as Array<{ balance: number }>;
    const newBalance = balance_arr[0].balance - log_arr[0].value;

    //updating balance
    await pool.query(
      'UPDATE overall_balance SET balance = ? WHERE user_id = ?',
      [newBalance, req.user.id]
    );

    //delete entry
    await pool.query('DELETE FROM user_logs WHERE id = ?', [logId]);

    //return to user
    res.status(200).json({ message: logId, value: log_arr[0].value });
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
  }
};
