import type { Token } from '../core/matcher';
import {
  type AST,
  alternation,
  createTokenFeed,
  either,
  literal,
  optional,
  regex,
  sequence,
  tag,
} from '../core/token';

const WHITESPACE = tag('whitespace');
const OPT_WHITESPACE = optional(WHITESPACE);

const NUMBER = tag('number');
const ORDINAL = regex('ident', /^(st|nd|rd|th)$/i);
const SINGULAR = regex('ident', /^an?$/i);

const SECONDS = regex('number', /^[0-5]?[0-9]$/);
const MINUTES = regex('number', /^[0-5]?[0-9]$/);
const HOUR_12 = regex('number', /^(0?[1-9])|(2[0-3])$/);
const HOUR_24 = regex('number', /^([0-1]?[1-9])|(2[0-3])$/);

// Symbols
const COLON = literal('op', ':');

// Keywords
const AGO = regex('ident', /^ago$/i);
const ON = regex('ident', /^on$/i);
const IN = regex('ident', /^in$/i);
const AT = regex('ident', /^at$/i);
// const OF = regex('ident', /^of$/i);
const YEAR = regex('ident', /^year$/i);

const MERIDIEM = regex('ident', /^(a|p)\.?m\.?/i);
const TIME_UNIT = alternation('time-unit', [
  regex('ident', /^hours?|minutes?|seconds?$/i),
  regex('ident', /^(hrs?|mins?|secs?)\.?$/i),
]);
const DATE_UNIT = alternation('date-unit', [
  regex('ident', /^days?|weeks?|months?|years?$/i),
  regex('ident', /^(wks?|mos?|yrs?)\.?$/i),
]);

const COMPLETE = regex('ident', /^(now)$/i);
const COMPLETE_TIME = regex('ident', /^(midnight)$/i);
const COMPLETE_DATE = regex('ident', /^(tomorrow|today|yesterday)$/i);

const PARTIAL_RELATIONAL = regex('ident', /^(before|after|until|from|past)$/i);
const PARTIAL_COMPLETE = regex('ident', /^(last|next|this)$/i);

// const ORDER = regex('ident', /^(start|end|first|last)$/i);

const MONTHS = alternation('months', [
  regex(
    'ident',
    /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i,
  ),
  regex('ident', /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?$/i),
]);
const DAYS = alternation('days', [
  regex(
    'ident',
    /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/i,
  ),
  regex('ident', /^(sun|mon|tue|wed|thu|fri|sat)\.?$/i),
]);
const YEARS = regex('number', /^[1-9][0-9][0-9][0-9]+$/i);

const ORDINAL_NUMBER = sequence('ordinal-number', [NUMBER, ORDINAL]);

const TIME_VALUE = sequence('time-value', [
  either(NUMBER, SINGULAR),
  WHITESPACE,
  TIME_UNIT,
]);
const DATE_VALUE = sequence('date-value', [
  either(NUMBER, SINGULAR),
  WHITESPACE,
  DATE_UNIT,
]);

// const TIME_PROPERTY = alternation('time-property', [
//   sequence('time-ordinal', [ORDINAL_NUMBER, SINGULAR_TIME_UNIT]),
//   sequence('time-order', [ORDER, SINGULAR_TIME_UNIT]),
// ]);

// const DATE_PROPERTY = alternation('date-property', [
//   sequence('date-ordinal', [ORDINAL_NUMBER, SINGULAR_DATE_UNIT]),
//   sequence('date-order', [ORDER, SINGULAR_DATE_UNIT]),
// ]);

const YEAR_PART = alternation('year-part', [
  sequence('year-1', [YEAR, WHITESPACE, NUMBER]),
  YEARS,
]);

const DAY_PART = alternation('day-part', [ORDINAL_NUMBER, NUMBER]);

const MONTH_PART = alternation('month-part', [
  // Match {month} {number}
  sequence('month-part-1', [MONTHS, WHITESPACE, DAY_PART]),
  sequence('month-part-2', [DAY_PART, WHITESPACE, MONTHS]),
  MONTHS,
]);

const SECONDS_PART = optional(
  sequence('seconds-part', [OPT_WHITESPACE, COLON, OPT_WHITESPACE, SECONDS]),
);
const MINUTES_PART = sequence('minutes-part', [
  OPT_WHITESPACE,
  COLON,
  OPT_WHITESPACE,
  MINUTES,
  SECONDS_PART,
]);

const FULL_TIME = alternation('full-time', [
  // Match 12-hour clock
  sequence('hour-12', [
    HOUR_12,
    optional(MINUTES_PART),
    OPT_WHITESPACE,
    MERIDIEM,
  ]),
  // Match 24-hour clock
  sequence('hour-24', [HOUR_24, MINUTES_PART]),
  // Match partial complete
  sequence('partial-time', [PARTIAL_COMPLETE, WHITESPACE, TIME_UNIT]),
  // Match complete,
  COMPLETE_TIME,
]);

const RELATIONAL_TIME = alternation('relational-time', [
  // Match at (time)
  sequence('at-time', [AT, WHITESPACE, FULL_TIME]),
]);

const TIME = alternation('time', [FULL_TIME, RELATIONAL_TIME]);

const SPECIFIC_DATE = alternation('specific-date', [
  sequence('date-format-1', [MONTH_PART, WHITESPACE, YEAR_PART]),
  sequence('date-format-2', [MONTH_PART, WHITESPACE, NUMBER]),
  sequence('date-format-3', [YEAR_PART, WHITESPACE, MONTH_PART]),
]);

const FULL_DATE = alternation('full-date', [
  SPECIFIC_DATE,
  // Match partial complete
  sequence('partial-date', [
    PARTIAL_COMPLETE,
    WHITESPACE,
    alternation('partial-date-target', [
      // Next January 1
      MONTH_PART,
      // Next week/month
      DATE_UNIT,
      // Next Sunday
      DAYS,
      // Next January
      MONTHS,
      // Next midnight
      COMPLETE_TIME,
    ]),
  ]),
  // Months
  MONTH_PART,
  // Match complete,
  COMPLETE_DATE,
]);

const RELATIONAL_DATE = alternation('relational-date', [
  sequence('on-date', [ON, WHITESPACE, FULL_DATE]),
]);

const DATE = alternation('date', [FULL_DATE, RELATIONAL_DATE]);

const INDEPENDENT_DATETIME = alternation('independent-date-time', [
  DATE,
  TIME,
  COMPLETE,
]);

const INDEPENDENT_FULL = alternation('independent-full-date-time', [
  FULL_TIME,
  FULL_DATE,
  COMPLETE,
]);

const DATE_TIME = alternation('date-time', [
  sequence('date-time-1-1', [MONTH_PART, WHITESPACE, TIME]),
  sequence('date-time-1-2', [TIME, WHITESPACE, MONTH_PART]),
  sequence('date-time-2-1', [DATE, WHITESPACE, TIME]),
  sequence('date-time-2-2', [TIME, WHITESPACE, DATE]),
  // Match {number} {unit} ago
  sequence('date-time-ago', [
    NUMBER,
    WHITESPACE,
    either(TIME_UNIT, DATE_UNIT),
    WHITESPACE,
    AGO,
  ]),
  // Match in {number} {unit}
  sequence('in-date-time', [
    IN,
    WHITESPACE,
    NUMBER,
    WHITESPACE,
    either(TIME_UNIT, DATE_UNIT),
  ]),
  // Match x {unit} before/after/from/until/past (date)
  sequence('relational-date-time', [
    either(TIME_VALUE, DATE_VALUE),
    WHITESPACE,
    PARTIAL_RELATIONAL,
    WHITESPACE,
    INDEPENDENT_FULL,
  ]),
  INDEPENDENT_DATETIME,
]);

export function parseDateTime(token: Token[]): (AST | Token)[] {
  const results: (AST | Token)[] = [];

  const feed = createTokenFeed(token);
  while (feed.cursor < feed.size) {
    const result = DATE_TIME(feed);
    if (result) {
      results.push(result);
    } else {
      console.log('whut', feed.source[feed.cursor]);
      feed.cursor++;
    }
  }

  return results;
}
