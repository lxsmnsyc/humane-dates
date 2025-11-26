import type { Token } from '../core/matcher';
import {
  type AST,
  type ASTMatcher,
  alternation,
  createTokenFeed,
  either,
  literal,
  optional,
  regex,
  sequence,
  tag,
} from '../core/token';

const WHITESPACE = tag('whitespace', 'whitespace');
const OPT_WHITESPACE = optional(WHITESPACE);

const NUMBER = tag('number', 'number');
const ORDINAL = regex('ordinal', 'ident', /^(st|nd|rd|th)$/i);
const SINGULAR = regex('singular', 'ident', /^an?$/i);

const SECONDS = regex('seconds', 'number', /^[0-5]?[0-9]$/);
const MINUTES = regex('minutes', 'number', /^[0-5]?[0-9]$/);
const HOUR_12 = regex('hour-12', 'number', /^(0?[1-9])|(2[0-3])$/);
const HOUR_24 = regex('hour-24', 'number', /^([0-1]?[1-9])|(2[0-3])$/);

// Symbols
const COLON = literal('colon', 'op', ':');

// Keywords
const AGO = regex('ago', 'ident', /^ago$/i);
const ON = regex('on', 'ident', /^on$/i);
const IN = regex('in', 'ident', /^in$/i);
const AT = regex('at', 'ident', /^at$/i);
// const OF = regex('ident', /^of$/i);
const YEAR = regex('year', 'ident', /^year$/i);

const MERIDIEM = alternation('meridiem', [
  regex('meridiem-am', 'ident', /^a\.?m\.?/i),
  regex('meridiem-pm', 'ident', /^p\.?m\.?$/i),
]);

const TIME_UNIT = alternation('time-unit', [
  regex('hours-unit', 'ident', /^(hours?|hrs?\.?)$/i),
  regex('minutes-unit', 'ident', /^(minutes?|mins?\.?)$/i),
  regex('seconds-unit', 'ident', /^(seconds?|secs?\.?)$/i),
]);

const DATE_UNIT = alternation('date-unit', [
  regex('days-unit', 'ident', /^(days?)$/i),
  regex('weeks-unit', 'ident', /^(weeks?|wks?\.?)$/i),
  regex('months-unit', 'ident', /^(months?|mos?\.?)$/i),
  regex('years-unit', 'ident', /^(years?|yrs?\.?)$/i),
]);

const COMPLETE = alternation('complete', [regex('now', 'ident', /^(now)$/i)]);

const COMPLETE_TIME = alternation('complete-time', [
  regex('midnight', 'ident', /^midnight$/i),
  regex('noon', 'ident', /^noon$/i),
]);
const COMPLETE_DATE = alternation('complete-date', [
  regex('tomorrow', 'ident', /^tomorrow$/i),
  regex('today', 'ident', /^today$/i),
  regex('yesterday', 'ident', /^yesterday$/i),
]);

const PARTIAL_RELATIONAL = alternation('partial-relation', [
  regex('before', 'ident', /^before$/i),
  regex('after', 'ident', /^(after|from|past)$/i),
]);

const PARTIAL_COMPLETE = alternation('partial-complete', [
  regex('last', 'ident', /^last$/i),
  regex('next', 'ident', /^next$/i),
  regex('this', 'ident', /^this$/i),
]);

// const ORDER = regex('ident', /^(start|end|first|last)$/i);

const MONTHS = alternation('months', [
  regex('jan', 'ident', /^jan(uary|\.?)$/i),
  regex('feb', 'ident', /^feb(ruary|\.?)$/i),
  regex('mar', 'ident', /^mar(ch|\.?)$/i),
  regex('apr', 'ident', /^apr(il|\.?)$/i),
  regex('may', 'ident', /^may$/i),
  regex('jun', 'ident', /^jun(e|\.?)$/i),
  regex('jul', 'ident', /^jul(y|\.?)$/i),
  regex('aug', 'ident', /^aug(ust|\.?)$/i),
  regex('sep', 'ident', /^sep(tember|\.?)$/i),
  regex('oct', 'ident', /^oct(tober|\.?)$/i),
  regex('nov', 'ident', /^nov(ember|\.?)$/i),
  regex('dec', 'ident', /^dec(ember|\.?)$/i),
]);

const DAYS = alternation('days', [
  regex('sun', 'ident', /^sun(day|\.?)$/i),
  regex('mon', 'ident', /^mon(day|\.?)$/i),
  regex('tue', 'ident', /^tue(sday|\.?)$/i),
  regex('wed', 'ident', /^wed(nesday|\.?)$/i),
  regex('thu', 'ident', /^thu(rsday|\.?)$/i),
  regex('fri', 'ident', /^fri(day|\.?)$/i),
  regex('sat', 'ident', /^sat(urday|\.?)$/i),
]);

const YEARS = regex('years', 'number', /^[1-9][0-9][0-9][0-9]+$/i);

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
  sequence('hour-12-clock', [
    HOUR_12,
    optional(MINUTES_PART),
    OPT_WHITESPACE,
    MERIDIEM,
  ]),
  // Match 24-hour clock
  sequence('hour-24-clock', [HOUR_24, MINUTES_PART]),
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

const RECURSIVE_PARTIAL_DATE: ASTMatcher = feed => PARTIAL_DATE(feed);

const PARTIAL_DATE = sequence('partial-date', [
  PARTIAL_COMPLETE,
  WHITESPACE,
  either(
    // Next January 1
    MONTH_PART,
    // Next week/month
    DATE_UNIT,
    // Next Sunday
    DAYS,
    // Recurse
    RECURSIVE_PARTIAL_DATE,
  ),
]);

const RECURSIVE_PARTIAL_TIME: ASTMatcher = feed => PARTIAL_TIME(feed);

const PARTIAL_TIME = sequence('partial-time', [
  PARTIAL_COMPLETE,
  WHITESPACE,
  either(FULL_TIME, RECURSIVE_PARTIAL_TIME, TIME_UNIT),
]);

const FULL_DATE = alternation('full-date', [
  SPECIFIC_DATE,
  PARTIAL_DATE,
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
  PARTIAL_TIME,
  COMPLETE,
]);

const INDEPENDENT_FULL = alternation('independent-full-date-time', [
  FULL_TIME,
  FULL_DATE,
  PARTIAL_TIME,
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

export function parseDateTime(token: Token[]): AST[] {
  const results: AST[] = [];

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
