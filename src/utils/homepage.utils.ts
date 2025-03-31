import type { transactionLogsType } from '../controllers/transactions/transactions.controllers';

export const separateCategories = (arr: transactionLogsType[]) => {
  //breaking down by category
  const categorySort = [...arr].sort((a, b) => {
    if (a.tag > b.tag) {
      return 1;
    } else {
      return -1;
    }
  });

  //splitting categories into a 2d array
  const categorySplit: transactionLogsType[][] = [];

  let categoryTemp: transactionLogsType[] = [];

  for (let i = 0; i < categorySort.length; i++) {
    if (i === 0 || categorySort[i].tag === categorySort[i - 1].tag) {
      categoryTemp.push(categorySort[i]);
    } else {
      categorySplit.push(categoryTemp);
      categoryTemp = [categorySort[i]];
    }
  }

  if (categoryTemp.length > 0) {
    categorySplit.push(categoryTemp);
  }

  //sum of each category
  const categorySum = [];

  for (let i = 0; i < categorySplit.length; i++) {
    let sum = 0;
    const sameCategory = categorySplit[i];
    for (let j = 0; j < sameCategory.length; j++) {
      sum += sameCategory[j].value;
    }
    categorySum.push([sameCategory[0].tag, sum]);
  }

  return Object.fromEntries(categorySum);
};

export const separateWeekly = (arr: transactionLogsType[]) => {
  //create a copy of array
  const arrCopy = [...arr];

  //get current date
  const currentDate = new Date();

  //getting first and last day
  const first = currentDate.getDate() - currentDate.getDay();

  //getting first and last date
  const firstDay = new Date(currentDate.setDate(first))
    .setHours(0, 0, 0, 0)
    .toString();

  let weekArr = [];

  //splitting only the logs from the current week
  for (let i = 0; i < arrCopy.length; i++) {
    const itemDate = arrCopy[i].created_at;
    if (itemDate >= firstDay) {
      //change the created_at format
      arrCopy[i].created_at = new Date(
        arrCopy[i].created_at
      ).toLocaleDateString('en-GB', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      weekArr.push(arrCopy[i]);
    } else {
      //prevent further loops
      break;
    }
  }

  //reverse the array so it is sorted in ascending order
  weekArr = weekArr.reverse();

  //splitting into a 3d array for each day of the week

  //generate initial 3d array with all the days
  const weekSplitArr: [string, transactionLogsType[]][] = [];

  for (let i = 0; i < 7; i++) {
    //duplicating the date object to manipulate
    const tempDate = new Date(currentDate);

    //manipulating date
    const day = new Date(tempDate.setDate(first + i)).toLocaleDateString(
      'en-GB',
      {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }
    );
    const logArr = [];

    //collecting all the logs with the same date
    for (let j = 0; j < weekArr.length; j++) {
      if (weekArr[j].created_at === day) {
        logArr.push(weekArr[j]);
      }
    }
    weekSplitArr.push([day, logArr]);
  }

  return weekSplitArr;
};

export const separateRecent = (arr: transactionLogsType[]) => {
  //create a copy of array
  let recent_arr = [...arr];
  recent_arr = recent_arr.slice(0, 10);
  return recent_arr;
};
