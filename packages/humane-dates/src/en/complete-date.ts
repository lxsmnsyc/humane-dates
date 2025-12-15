import {
  getDate,
  getDaysInMonth,
  getHours,
  getMinutes,
  getMonth,
  getSeconds,
  getYear,
} from 'date-fns';
import type { ExtractedHumaneDate, SpecifiedDateProperty } from './extract';

interface DateInfo {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function convertDateInfo(info: ExtractedHumaneDate): DateInfo {
  return {
    year: getYear(info.date),
    month: getMonth(info.date),
    day: getDate(info.date),
    hours: getHours(info.date),
    minutes: getMinutes(info.date),
    seconds: getSeconds(info.date),
  };
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function dateInfoToString(
  info: DateInfo,
  specified: SpecifiedDateProperty,
): string {
  let result = '';

  if (specified.month) {
    result += 'on ' + MONTHS[info.month];

    if (specified.day) {
      result += ' ' + info.day;
    } else {
      result += ' 1';
    }

    result += ' ';

    if (specified.year) {
      result += info.year;
    }
  }

  if (specified.hours) {
    // format hours
    let hours = info.hours;
    if (hours >= 12) {
      hours -= 12;
    }
    if (hours === 0) {
      hours = 12;
    }
    result += ' at ' + hours;

    if (specified.minutes) {
      if (info.minutes < 10) {
        result += ':0' + info.minutes;
      } else {
        result += ':' + info.minutes;
      }
    } else {
      result += ':00';
    }

    if (specified.seconds) {
      if (info.seconds < 10) {
        result += ':0' + info.seconds;
      } else {
        result += ':' + info.seconds;
      }
    }

    if (info.hours >= 12) {
      result += ' pm';
    } else {
      result += ' am';
    }
  }

  return result;
}

const YEAR_RANGE = 5;
const MONTH_RANGE = 11;
const HOURS_RANGE = 23;
const MINUTES_INTERVAL = 5;
const MAX_MINUTES = 55;

export function completeDate(info: ExtractedHumaneDate): string[] {
  const suggestions: DateInfo[] = [];
  const dateInfo = convertDateInfo(info);
  const specified: SpecifiedDateProperty = { ...info.specified };

  if (!info.specified.year) {
    for (let i = YEAR_RANGE; i > 0; i--) {
      suggestions.push({ ...dateInfo, year: dateInfo.year - i });
    }
    for (let i = 0; i < YEAR_RANGE; i++) {
      suggestions.push({ ...dateInfo, year: dateInfo.year + i });
    }
    specified.year = true;
  } else if (!info.specified.month) {
    for (let i = 0; i < MONTH_RANGE; i++) {
      suggestions.push({ ...dateInfo, month: i });
    }
    specified.month = true;
  } else if (!info.specified.day) {
    for (let i = 1, len = getDaysInMonth(info.date); i <= len; i++) {
      suggestions.push({ ...dateInfo, day: i });
    }
    specified.day = true;
  } else if (!info.specified.hours) {
    for (let i = 0; i <= HOURS_RANGE; i++) {
      suggestions.push({ ...dateInfo, hours: i });
    }
    specified.hours = true;
  } else if (info.specified.minutes) {
    suggestions.push(dateInfo);
  } else {
    for (let i = 0; i <= MAX_MINUTES; i += MINUTES_INTERVAL) {
      suggestions.push({ ...dateInfo, minutes: i });
    }
    specified.minutes = true;
  }
  // else if (!info.specified.seconds) {
  //   for (let i = 0; i <= MAX_SECONDS; i += SECONDS_INTERVAL) {
  //     suggestions.push({ ...dateInfo, seconds: i });
  //   }
  //   specified.seconds = true;
  // }
  return suggestions.map(suggestion => dateInfoToString(suggestion, specified));
}
