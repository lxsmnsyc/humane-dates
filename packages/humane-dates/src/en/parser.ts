import type { Token } from '../core/matcher';
import {
  type AST,
  alternation,
  createTokenFeed,
  literal,
  optional,
  regex,
  sequence,
  tag,
} from '../core/token';

const NUMBER = tag('number');

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
const MERIDIEM = regex('ident', /^(a|p)\.?m\.?$/i);
const TIME_UNIT = alternation('time-unit', [
  regex('ident', /^(hours?|minutes?|seconds?)$/i),
  regex('ident', /^((hrs?|mins?|secs?)\.?)$/i),
]);
const COMPLETE = regex('ident', /^(now)$/i);
const COMPLETE_TIME = regex('ident', /^(midnight)$/i);
const COMPLETE_DATE = regex('ident', /^(today|tomorrow|yesterday)$/i);

const PARTIAL_RELATIONAL = regex('ident', /^(before|after|until|from|past)$/i);
const PARTIAL_COMPLETE = regex('ident', /^(last|next|this)$/i);

const FULL_TIME = alternation('full-time', [
  // Match 12-hour clock
  sequence('12-hour', [
    HOUR_12,
    optional(
      'minutes-part',
      sequence('minutes-part', [
        COLON,
        MINUTES,
        optional('seconds-part', sequence('seconds-part', [COLON, SECONDS])),
      ]),
    ),
    MERIDIEM,
  ]),
  // Match 24-hour clock
  sequence('24-hour', [
    HOUR_24,
    COLON,
    MINUTES,
    optional('seconds-part', sequence('seconds-part', [COLON, SECONDS])),
  ]),
  // Match partial complete
  sequence('date-partial', [PARTIAL_COMPLETE, TIME_UNIT]),
  // Match complete,
  COMPLETE_TIME,
]);

const RELATIONAL_TIME = alternation('relational-time', [
  // Match at (time)
  sequence('time-6', [AT, FULL_TIME]),
]);

const TIME = alternation('time', [FULL_TIME, RELATIONAL_TIME]);

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
const DATE_UNIT = alternation('date-unit', [
  regex('ident', /^(days?|weeks?|months?|years?|decades?)$/i),
  regex('ident', /^(wks?|yrs?)\.?$/i),
]);
const SINGULAR_DATE_UNIT = alternation('date-unit', [
  regex('ident', /^(day|week|month|year|decade)$/i),
  regex('ident', /^(wk?|yr)\.?$/i),
]);
const ORDINAL = regex('ident', /^(st|nd|rd|th)$/i);

const DAY_PART = alternation('day-part', [
  sequence('day-1', [NUMBER, ORDINAL]),
  NUMBER,
]);

const MONTH_PART = alternation('month-part', [
  // Match {month} {number}
  sequence('month-1', [MONTHS, DAY_PART]),
  sequence('month-2', [DAY_PART, MONTHS]),
]);

const FULL_DATE = alternation('full-date', [
  // Match {month} {day}, {year}
  // TODO year format like
  sequence('date-format-1', [MONTH_PART, NUMBER]),
  //
  sequence('date-format-no-year', [MONTH_PART]),
  // Match partial complete
  sequence('date-partial', [
    PARTIAL_COMPLETE,
    alternation('target', [
      MONTH_PART,
      SINGULAR_DATE_UNIT,
      DAYS,
      MONTHS,
      COMPLETE_TIME,
    ]),
  ]),
  // Match complete,
  COMPLETE_DATE,
]);

const RELATIONAL_DATE = alternation('relational-date', [
  sequence('on-date', [ON, FULL_DATE]),
]);

const DATE = alternation('date', [FULL_DATE, RELATIONAL_DATE]);

const INDEPENDENT_DATETIME = alternation('independent', [DATE, TIME, COMPLETE]);

const INDEPENDENT_FULL = alternation('independent-full', [
  FULL_TIME,
  FULL_DATE,
  COMPLETE,
]);

const DATE_TIME = alternation('datetime', [
  sequence('date-time-1', [DATE, TIME]),
  sequence('date-time-2', [TIME, DATE]),
  // TODO
  // YYYY {month} {day}
  // YYYY {day} {month}
  // Match {number} {unit} ago
  sequence('date-time-ago', [NUMBER, DATE_UNIT, AGO]),
  sequence('date-time-ago', [NUMBER, TIME_UNIT, AGO]),
  // Match in {number} {unit}
  sequence('in-date-time', [IN, NUMBER, TIME_UNIT]),
  sequence('in-date-time', [IN, NUMBER, DATE_UNIT]),
  // Match x {unit} before/after/from/until/past (date)
  sequence('date-time-relational', [
    NUMBER,
    TIME_UNIT,
    PARTIAL_RELATIONAL,
    INDEPENDENT_FULL,
  ]),
  sequence('date-time-relational', [
    NUMBER,
    DATE_UNIT,
    PARTIAL_RELATIONAL,
    INDEPENDENT_FULL,
  ]),
  // TODO Match this/next/last {number} {unit}
  // Match complete
  INDEPENDENT_DATETIME,
]);

export function parseDateTime(token: Token[]): (AST | Token)[] {
  const results: (AST | Token)[] = [];

  const feed = createTokenFeed(token);
  while (feed.cursor < feed.size) {
    const result = DATE_TIME(feed);
    if (result) {
      results.push(result);
    }
  }

  return results;
}
