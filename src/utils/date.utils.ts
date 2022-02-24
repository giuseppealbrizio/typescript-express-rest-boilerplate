import moment from 'moment';

/**
 * Return an array of dates passing two dates
 * @param startDate
 * @param endDate
 * @returns {*[]}
 */
export const getDatesBetweenDates = (startDate: Date, endDate: Date) => {
  let dates: Date[] = [];

  if (!startDate || !endDate) {
    return dates;
  }

  // to avoid modifying the original date
  const currentDate = new Date(startDate);

  while (currentDate < new Date(endDate)) {
    dates = [...dates, new Date(currentDate)];
    currentDate.setDate(currentDate.getDate() + 1);
  }
  dates = [...dates, new Date(endDate)];
  return dates;
};

/**
 * Month in JavaScript is 0-indexed (January is 0, February is 1, etc),
 * but by using 0 as the day it will give us the last day of the prior
 * month. So passing in 1 as the month number will return the last day
 * of January, not February
 * @param month
 * @param year
 * @returns {number}
 */
export const getDaysInMonth = (month: any, year: any) => {
  return new Date(year, month, 0).getDate();
};

/**
 * This function return the days between two dates
 * @param date1
 * @param date2
 * @return {number}
 */
export const calculateDays = (date1: Date, date2: Date) => {
  const oneDay = 24 * 60 * 60 * 1000;

  const startDate: any = new Date(date1);
  const endDate: any = new Date(date2);
  return Math.round(Math.abs(startDate - endDate) / oneDay) + 1;
};

/**
 * This function format date to IT locale
 * @param date
 * @return {string}
 */
export const formatDateToItLocale = (date: Date) => {
  return new Intl.DateTimeFormat('it-IT').format(date);
};

/**
 * Checks if the passed date is today
 * @param date
 * @returns {boolean}
 */
export const isToday = (date: Date) => {
  const today = new Date();
  return (
    /* eslint-disable operator-linebreak */
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    /* eslint-enable */
  );
};

/**
 * Get Formatted Date
 * @param date
 * @param format
 * @returns {string}
 */
export const getFormattedDate = (date: Date, format = 'YYYY-MM-DD') => {
  if (moment(date, 'YYYY-MM-DD').isValid()) {
    return moment(date).format(format);
  }

  return '';
};

/**
 * Get how many months between two dates
 * @param date1
 * @param date2
 * @returns {number}
 */
export const getMonthsDifference = (date1: Date, date2: Date) => {
  const startDate: any = new Date(date1);
  const endDate: any = new Date(date2);
  return Math.round(Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24 * 30));
};
