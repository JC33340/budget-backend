import type { transactionLogsType } from '../controllers/transactions/transactions.controllers';

type monthlySplitType = {
  month: number;
  year: number;
  logs: transactionLogsType[];
}[];

type monthItemType = {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
  categories: {};
};

//separate logs into respective months
export const splitMonthly = (logs: transactionLogsType[]): monthlySplitType => {
  //current month and year
  const date = new Date();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  if (logs.length === 0) {
    return [];
  }
  //earliest month and year in the array
  const firstDate = new Date(logs[logs.length - 1].created_at);
  const firstYear = firstDate.getFullYear();

  //generating empty array
  const returnArr: monthlySplitType = [];

  while (year >= firstYear) {
    returnArr.push({ month: month, year: year, logs: [] });
    if (month === 1) {
      month = 12;
      year -= 1;
    } else {
      month -= 1;
    }
  }

  //separate the months and push them into the monthly split array
  let tempStore: transactionLogsType[] = [];
  let currMonth = 0;
  let currYear = 0;
  for (let i = 0; i < logs.length; i++) {
    const itemDate = new Date(logs[i].created_at);
    const itemMonth = itemDate.getMonth();
    const itemYear = itemDate.getFullYear();
    if (i === 0) {
      tempStore.push(logs[i]);
      currMonth = itemMonth;
      currYear = itemYear;
      continue;
    }
    if (itemMonth === currMonth && itemYear === currYear) {
      tempStore.push(logs[i]);
    } else {
      //push into the corresponding object in return array

      const index = returnArr.findIndex(
        (element) =>
          element.month === currMonth + 1 && element.year === currYear
      );
      returnArr[index] = { ...returnArr[index], logs: tempStore };
      tempStore = [logs[i]];
      currMonth = itemMonth;
      currYear = itemYear;
    }
  }

  //pushing final logs into the object
  if (tempStore.length > 0) {
    const index = returnArr.findIndex(
      (element) => element.month === currMonth + 1 && element.year === currYear
    );
    returnArr[index] = { ...returnArr[index], logs: tempStore };
  }

  return returnArr;
};

//formatting into the information the overview will display
export const formatOverview = (
  monthlySplit: monthlySplitType
): monthItemType[] => {
  const returnArr = [];
  //overall budget
  for (let item of monthlySplit) {
    //getting overall balance for the month
    const balance = getBalance(item.logs);
    //getting the income and the expense amounts for the month
    const [income, expense] = getSpending(item.logs);
    //splitting the spending into their categories
    const categories = splitCategories(item.logs);
    //push back intp the return array
    returnArr.push({
      month: item.month,
      year: item.year,
      balance,
      income,
      expense,
      categories
    });
  }
  return returnArr;
};

//getting overall budget
const getBalance = (logs: transactionLogsType[]) => {
  let count = 0;
  for (let item of logs) {
    count += item.value;
  }
  return count;
};

//getting income and expense
const getSpending = (logs: transactionLogsType[]) => {
  let income = 0;
  let expense = 0;
  for (let item of logs) {
    if (item.value > 0) {
      income += item.value;
    } else {
      expense += item.value;
    }
  }
  return [income, expense];
};

//split categories
const splitCategories = (logs: transactionLogsType[]) => {
  //make a deep copy
  const arr: transactionLogsType[] = JSON.parse(JSON.stringify(logs));

  //sort array by categories
  const sorted = arr.sort((a, b) => {
    if (a.tag > b.tag) {
      return 1;
    } else {
      return -1;
    }
  });

  //loop through array getting sum of each category
  let categories = {};
  let tempSum = 0;
  let currCategory = '';
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].tag = sorted[i].tag === '' ? 'Undefined' : sorted[i].tag;
    if (sorted[i].tag === currCategory) {
      tempSum += sorted[i].value;
    } else {
      if (currCategory) {
        categories = { ...categories, [currCategory]: tempSum };
      }
      tempSum = sorted[i].value;
      currCategory = sorted[i].tag;
    }
  }
  //push final value
  if (currCategory || tempSum) {
    categories = { ...categories, [currCategory]: tempSum };
  }

  return categories;
};

//get only the months from the current year
export const splitYearly = (data: monthItemType[]): monthItemType[] => {
  //get current year
  const year = new Date().getFullYear();

  //filter out the current year
  const filteredArr = data.filter((item) => item.year === year);
  return filteredArr;
};
