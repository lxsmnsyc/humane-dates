import type { Token } from '../core/matcher';
import {
  type AST,
  type TokenFeed,
  alternation,
  createTokenFeed,
  either,
  literal,
  optional,
  quantifier,
  regex,
  sequence,
  tag,
} from '../core/token';

const WHITESPACE = tag('whitespace', 'whitespace');
const OPT_WHITESPACE = optional(WHITESPACE);

const IDENT = tag('ident', 'ident');
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

const DAYS_UNIT = regex('days-unit', 'ident', /^(days?)$/i);
const WEEKS_UNIT = regex('weeks-unit', 'ident', /^(weeks?|wks?\.?)$/i);
const MONTHS_UNIT = regex('months-unit', 'ident', /^(months?|mos?\.?)$/i);
const YEARS_UNIT = regex('years-unit', 'ident', /^(years?|yrs?\.?)$/i);

const DATE_UNIT = alternation('date-unit', [
  DAYS_UNIT,
  WEEKS_UNIT,
  MONTHS_UNIT,
  YEARS_UNIT,
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

const RELATIVE = alternation('relative', [
  regex('before', 'ident', /^before$/i),
  regex('after', 'ident', /^(after|from|past)$/i),
]);

const DIRECTIONAL = alternation('directional', [
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
  regex('oct', 'ident', /^oct(ober|\.?)$/i),
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

const DAY_NUMBER = regex(
  'day-number',
  'number',
  /^(0?[0-9]|1[0-9]|2[0-9]|3[01])$/i,
);
const YEAR_NUMBER = regex('year-number', 'number', /^[1-9][0-9][0-9][0-9]+$/i);

const DIRECTIONAL_SEQUENCE = quantifier(
  'directional-sequence',
  sequence('directional-part', [DIRECTIONAL, WHITESPACE]),
  1,
);

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
  sequence('annotated-year', [YEAR, WHITESPACE, NUMBER]),
  sequence('directional-year', [DIRECTIONAL_SEQUENCE, YEARS_UNIT]),
  YEAR_NUMBER,
]);

const DAY_PART = sequence('day-part', [DAY_NUMBER, optional(ORDINAL)]);

const MONTH_PART = alternation('month-part', [
  // Match {month} {number}
  sequence('day-month', [DAY_PART, WHITESPACE, MONTHS]),
  sequence('month-day', [MONTHS, WHITESPACE, DAY_PART]),
  // sequence('directional-month', [DIRECTIONAL_SEQUENCE, WHITESPACE, either(MONTHS_UNIT, MONTHS)]),
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

const SPECIFIC_TIME = alternation('specific-time', [
  // Match 12-hour clock
  sequence('hour-12-clock', [
    HOUR_12,
    optional(MINUTES_PART),
    OPT_WHITESPACE,
    MERIDIEM,
  ]),
  // Match 24-hour clock
  sequence('hour-24-clock', [HOUR_24, MINUTES_PART]),
]);

const FULL_TIME = alternation('full-time', [
  SPECIFIC_TIME,
  // Match complete,
  COMPLETE_TIME,
]);

const TIME = sequence('time', [
  optional(sequence('at-prefix', [AT, WHITESPACE])),
  FULL_TIME,
]);

const SPECIFIC_DATE = alternation('specific-date', [
  sequence('date-format-1', [MONTH_PART, WHITESPACE, YEAR_PART]),
  sequence('date-format-2', [YEAR_PART, WHITESPACE, MONTH_PART]),
  sequence('date-format-3', [MONTH_PART, WHITESPACE, NUMBER]),
]);

const RELATIVE_DATE = alternation('relative-date', [
  sequence('relative-day', [
    DAYS,
    WHITESPACE,
    DIRECTIONAL_SEQUENCE,
    WEEKS_UNIT,
  ]),
  sequence('relative-day', [
    DIRECTIONAL_SEQUENCE,
    WEEKS_UNIT,
    WHITESPACE,
    DAYS,
  ]),
  sequence('relative-month', [
    MONTH_PART,
    WHITESPACE,
    DIRECTIONAL_SEQUENCE,
    YEARS_UNIT,
  ]),
  sequence('relative-month', [
    DIRECTIONAL_SEQUENCE,
    YEARS_UNIT,
    WHITESPACE,
    MONTH_PART,
  ]),
]);

const DIRECTIONAL_DATE = sequence('directional-date', [
  DIRECTIONAL_SEQUENCE,
  either(
    // Next January 1
    MONTH_PART,
    // Next week/month
    DATE_UNIT,
    // Next Sunday
    DAYS,
  ),
]);

const DIRECTIONAL_TIME = sequence('directional-time', [
  DIRECTIONAL_SEQUENCE,
  either(TIME_UNIT, FULL_TIME),
]);

const FULL_DATE = alternation('full-date', [
  SPECIFIC_DATE,
  RELATIVE_DATE,
  DIRECTIONAL_DATE,
  // Months
  MONTH_PART,
  // Match complete,
  COMPLETE_DATE,
]);

const DATE = sequence('date', [
  optional(sequence('on-prefix', [ON, WHITESPACE])),
  FULL_DATE,
]);

const INDEPENDENT_DATETIME = alternation('independent-date-time', [
  DATE,
  TIME,
  DIRECTIONAL_TIME,
  COMPLETE,
]);

const INDEPENDENT_FULL = alternation('independent-full-date-time', [
  DIRECTIONAL_TIME,
  FULL_TIME,
  FULL_DATE,
  COMPLETE,
]);

const DATE_TIME_SEQUENCE = sequence('date-time-sequence', [
  DATE,
  WHITESPACE,
  TIME,
]);
const TIME_DATE_SEQUENCE = sequence('time-date-sequence', [
  TIME,
  WHITESPACE,
  DATE,
]);
// Match {number} {unit} ago
const DATE_TIME_AGO = sequence('date-time-ago', [
  NUMBER,
  WHITESPACE,
  either(TIME_UNIT, DATE_UNIT),
  WHITESPACE,
  AGO,
]);
// Match in {number} {unit}
const IN_DATE_TIME = sequence('in-date-time', [
  IN,
  WHITESPACE,
  NUMBER,
  WHITESPACE,
  either(TIME_UNIT, DATE_UNIT),
]);
// Match x {unit} relative (date)
const RELATIVE_DATE_TIME = sequence('relative-date-time', [
  either(TIME_VALUE, DATE_VALUE),
  WHITESPACE,
  RELATIVE,
  WHITESPACE,
  INDEPENDENT_FULL,
  // TODO recursion?
]);

const DATE_TIME = alternation('date-time', [
  DATE_TIME_SEQUENCE,
  TIME_DATE_SEQUENCE,
  DATE_TIME_AGO,
  IN_DATE_TIME,
  RELATIVE_DATE_TIME,
  INDEPENDENT_DATETIME,
]);

export interface CategorizeResult {
  nodes: AST[];
  tokens: Token[];
}

export function categorize(token: Token[]): CategorizeResult {
  const result: CategorizeResult = {
    nodes: [],
    tokens: [],
  };

  const feed = createTokenFeed(token);
  while (feed.cursor < feed.size) {
    const node = DATE_TIME(feed);
    if (node) {
      result.nodes.push(node);
    } else {
      result.tokens.push(feed.source[feed.cursor]);
      feed.cursor++;
    }
  }

  return result;
}

export type IntellisenseLexerResult =
  | { type: 'ast'; value: AST }
  | { type: 'token'; value: Token };

const N_I_I = sequence('n-i-i', [NUMBER, WHITESPACE, IDENT, WHITESPACE, IDENT]);
const I_N_I = sequence('i-n-i', [IDENT, WHITESPACE, NUMBER, WHITESPACE, IDENT]);
const I_I_N = sequence('i-i-n', [IDENT, WHITESPACE, IDENT, WHITESPACE, NUMBER]);
const N_I = sequence('n-i', [NUMBER, WHITESPACE, IDENT]);
const I_N = sequence('i-n', [IDENT, WHITESPACE, NUMBER]);

const INTELLISENSE = (feed: TokenFeed) =>
  DATE_TIME(feed) ||
  N_I_I(feed) ||
  I_N_I(feed) ||
  I_I_N(feed) ||
  N_I(feed) ||
  I_N(feed) ||
  IDENT(feed) ||
  NUMBER(feed);

export function categorizeForIntellisense(token: Token[]): AST[] {
  const result: AST[] = [];

  const feed = createTokenFeed(token);
  while (feed.cursor < feed.size) {
    const node = INTELLISENSE(feed);
    if (node) {
      result.push(node);
    } else {
      feed.cursor++;
    }
  }

  return result;
}
