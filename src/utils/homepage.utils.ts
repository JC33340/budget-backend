import type { transactionLogsType } from '../controllers/transactions/transactions.controllers';

//split array into separate categories
export const separateCategories = (arr: transactionLogsType[]) => {
  //make a deep copy of array
  const arrCopy: transactionLogsType[] = JSON.parse(JSON.stringify(arr));
  //sorting by category
  const sortedCategories = arrCopy.sort((a, b) => {
    if (a.tag > b.tag) {
      return 1;
    } else {
      return -1;
    }
  });

  //separate into income and expense
  const income = [];
  const expense = [];

  for (let item of sortedCategories) {
    if (item.value > 0) {
      income.push(item);
    } else {
      expense.push(item);
    }
  }

  //function to get the sum of each category
  const getSum = (arr: transactionLogsType[]): (string | number)[][] => {
    //if there is nothing in the array then return empty value
    if (arr.length === 0) return [];

    //set initial sum and initial category
    let tempSum = 0;
    let currCategory = arr[0].tag;
    const catSum = [];
    //loop through array to sum the values
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].tag === currCategory) {
        tempSum += arr[i].value;
      } else {
        catSum.push([currCategory, tempSum]);
        currCategory = arr[i].tag;
        tempSum = arr[i].value;
      }
    }

    //push the final category if there is a value there
    if (tempSum) {
      catSum.push([currCategory, tempSum]);
    }
    return catSum;
  };

  //getting the income and expense split
  const incomeSum = getSum(income);
  const expenseSum = getSum(expense);

  //returning an object with income and expense as categories
  return Object.fromEntries([
    ['income', incomeSum],
    ['expense', expenseSum]
  ]);
};

//format weekly array information
export const separateWeekly = (arr: transactionLogsType[]) => {
  //create a copy of the array
  const arrCopy: transactionLogsType[] = JSON.parse(JSON.stringify(arr));

  const weekArr = [];

  //get start of the week day
  const currDate = new Date();
  const date = currDate.getDate();
  const day = currDate.getDay();
  const startDate = date - day;

  //change log array date format
  for (let item of arrCopy) {
    item.created_at = new Date(item.created_at).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  }

  //generate week array
  for (let i = 0; i < 7; i++) {
    const weekDay = new Date();
    weekDay.setDate(startDate + i);
    const dateString = weekDay.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      weekday: 'short'
    });

    //filter arr copy to find matching log arrays
    const filter = arrCopy.filter((log) => log.created_at === dateString);
    weekArr.push([dateString, filter]);
  }

  return weekArr;
};

//get only 10 most recent transactions
export const separateRecent = (arr: transactionLogsType[]) => {
  //create a copy of array
  let recent_arr = JSON.parse(JSON.stringify(arr));
  recent_arr = recent_arr.slice(0, 10);
  return recent_arr;
};

//separating into current week information
export const getWeekly = (arr: transactionLogsType[]) => {
  //get current date
  const currDate = new Date();

  //get date of current day
  const date = currDate.getDate();

  //get day of current day
  const day = currDate.getDay();

  //get start date
  const start = new Date();
  start.setDate(date - day);
  start.setHours(0, 59, 59);

  //deep copy of array
  const arrCopy = JSON.parse(JSON.stringify(arr));
  const weeklyArr = [];

  //separate into current week
  for (let i = 0; i < arrCopy.length; i++) {
    const itemDate = new Date(arrCopy[i].created_at);
    if (itemDate > start) {
      weeklyArr.push(arrCopy[i]);
    } else {
      break;
    }
  }

  //return weekly array
  return weeklyArr;
};
