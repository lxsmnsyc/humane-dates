import type { AST } from '../core/token';

function parseMaybe(ast: AST): AST | undefined {
  if (ast.kind === 'maybe') {
    if (ast.children) {
      return parseMaybe(ast.children);
    }
    return undefined;
  }
  return ast;
}

export type Keywords =
  | 'complete'
  | 'complete-time'
  | 'complete-date'
  | 'date-unit'
  | 'time-unit'
  | 'directional'
  | 'relative'
  | 'months'
  | 'days'
  | 'meridiem';

export interface KeywordNode<Key extends Keywords, Result> {
  type: Key;
  value: Result;
}

type ASTTransformer<T> = (ast: AST) => T | undefined;

function parseKeyword<Key extends Keywords, Result>(
  key: Key,
  transform: (value: string) => Result,
): ASTTransformer<KeywordNode<Key, Result>> {
  return ast => {
    if (
      ast.kind === 'solo' &&
      ast.tag === key &&
      ast.children.kind === 'value'
    ) {
      return {
        type: key,
        value: transform(ast.children.tag),
      };
    }
    return undefined;
  };
}

export type CompleteNode = KeywordNode<'complete', 'now'>;
export type CompleteTimeNode = KeywordNode<
  'complete-time',
  'midnight' | 'noon'
>;
export type CompleteDateNode = KeywordNode<
  'complete-date',
  'tomorrow' | 'today' | 'yesterday'
>;
export type TimeUnitNode = KeywordNode<
  'time-unit',
  'hours' | 'minutes' | 'seconds'
>;
export type DateUnitNode = KeywordNode<
  'date-unit',
  'days' | 'weeks' | 'months' | 'years'
>;
export type RelativeNode = KeywordNode<'relative', 'before' | 'after'>;
export type DirectionalNode = KeywordNode<
  'directional',
  'last' | 'next' | 'this'
>;
export type MonthsNode = KeywordNode<
  'months',
  | 'jan'
  | 'feb'
  | 'mar'
  | 'apr'
  | 'may'
  | 'jun'
  | 'jul'
  | 'aug'
  | 'sep'
  | 'oct'
  | 'nov'
  | 'dec'
>;
export type DaysNode = KeywordNode<
  'days',
  'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
>;
export type MeridiemNode = KeywordNode<'meridiem', 'am' | 'pm'>;

const parseComplete = parseKeyword('complete', value => {
  switch (value) {
    case 'now':
      return value;
    default:
      throw new Error('invalid Complete keyword');
  }
});
const parseCompleteTime = parseKeyword('complete-time', value => {
  switch (value) {
    case 'midnight':
    case 'noon':
      return value;
    default:
      throw new Error('invalid CompleteTime keyword');
  }
});
const parseCompleteDate = parseKeyword('complete-date', value => {
  switch (value) {
    case 'today':
    case 'tomorrow':
    case 'yesterday':
      return value;
    default:
      throw new Error('invalid CompleteDate keyword');
  }
});
const parseTimeUnit = parseKeyword('time-unit', value => {
  switch (value) {
    case 'hours-unit':
      return 'hours';
    case 'minutes-unit':
      return 'minutes';
    case 'seconds-unit':
      return 'seconds';
    default:
      throw new Error('invalid TimeUnit keyword');
  }
});
const parseDateUnit = parseKeyword('date-unit', value => {
  switch (value) {
    case 'days-unit':
      return 'days';
    case 'weeks-unit':
      return 'weeks';
    case 'months-unit':
      return 'months';
    case 'years-unit':
      return 'years';
    default:
      throw new Error('invalid DateUnit keyword');
  }
});
const parseRelative = parseKeyword('relative', value => {
  switch (value) {
    case 'before':
    case 'after':
      return value;
    default:
      throw new Error('invalid Relative keyword');
  }
});
const parseDirectional = parseKeyword('directional', value => {
  switch (value) {
    case 'last':
    case 'next':
    case 'this':
      return value;
    default:
      throw new Error('invalid Directional keyword');
  }
});
const parseMonths = parseKeyword('months', value => {
  switch (value) {
    case 'jan':
    case 'feb':
    case 'mar':
    case 'apr':
    case 'may':
    case 'jun':
    case 'jul':
    case 'aug':
    case 'sep':
    case 'oct':
    case 'nov':
    case 'dec':
      return value;
    default:
      throw new Error('invalid Months keyword');
  }
});
const parseDays = parseKeyword('days', value => {
  switch (value) {
    case 'sun':
    case 'mon':
    case 'tue':
    case 'wed':
    case 'thu':
    case 'fri':
    case 'sat':
      return value;
    default:
      throw new Error('invalid Days keyword');
  }
});
const parseMeridiem = parseKeyword('meridiem', value => {
  switch (value) {
    case 'meridiem-am':
      return 'am';
    case 'meridiem-pm':
      return 'pm';
    default:
      throw new Error('invalid Meridiem keyword');
  }
});

function parseDirectionalPart(ast: AST): number | undefined {
  if (ast.kind === 'multi' && ast.tag === 'directional-part') {
    const value = parseDirectional(ast.children[0]);
    if (value) {
      if (value.value === 'last') {
        return -1;
      }
      if (value.value === 'next') {
        return 1;
      }
      return 0;
    }
  }
  return undefined;
}

function parseDirectionalSequence(ast: AST): number | undefined {
  if (ast.kind === 'multi' && ast.tag === 'directional-sequence') {
    let offset = 0;
    for (let i = 0, len = ast.children.length; i < len; i++) {
      const value = parseDirectionalPart(ast.children[i]);
      if (value != null) {
        offset += value;
      } else {
        return undefined;
      }
    }
    return offset;
  }
  return undefined;
}

export interface TimeValueNode {
  type: 'time-value';
  value: number;
  unit: TimeUnitNode;
}

function parseTimeValue(ast: AST): TimeValueNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'time-value') {
    const value = ast.children[0];
    const unit = parseTimeUnit(ast.children[2]);
    if (value.kind === 'value' && unit) {
      return {
        type: 'time-value',
        value:
          value.tag === 'singular' ? 1 : Number.parseInt(value.children, 10),
        unit,
      };
    }
  }
  return undefined;
}

export interface DateValueNode {
  type: 'date-value';
  value: number;
  unit: DateUnitNode;
}

function parseDateValue(ast: AST): DateValueNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-value') {
    const value = ast.children[0];
    const unit = parseDateUnit(ast.children[2]);
    if (value.kind === 'value' && unit) {
      return {
        type: 'date-value',
        value:
          value.tag === 'singular' ? 1 : Number.parseInt(value.children, 10),
        unit,
      };
    }
  }
  return undefined;
}

function parseAnnotatedYear(ast: AST): number | undefined {
  if (ast.kind === 'multi' && ast.tag === 'annotated-year') {
    const value = ast.children[2];
    if (value.kind === 'value') {
      return Number.parseInt(value.children, 10);
    }
  }
  return undefined;
}

export interface DirectionalYearNode {
  type: 'directional-year';
  value: number;
}

function parseDirectionalYear(ast: AST): DirectionalYearNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'directional-year') {
    const sequence = parseDirectionalSequence(ast.children[0]);
    if (sequence != null) {
      return {
        type: 'directional-year',
        value: sequence,
      };
    }
  }
  return undefined;
}

export interface YearPartNode {
  type: 'year-part';
  value: number | DirectionalYearNode;
}

function parseYearPart(ast: AST): YearPartNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'year-part') {
    if (ast.children.kind === 'value') {
      return {
        type: 'year-part',
        value: Number.parseInt(ast.children.children, 10),
      };
    }
    const result =
      parseAnnotatedYear(ast.children) || parseDirectionalYear(ast.children);
    if (result) {
      return {
        type: 'year-part',
        value: result,
      };
    }
  }
  return undefined;
}

export interface DayPartNode {
  type: 'day-part';
  value: number;
}

function parseDayPart(ast: AST): DayPartNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'day-part') {
    const value = ast.children[0];
    if (value.kind === 'value') {
      return {
        type: 'day-part',
        value: Number.parseInt(value.children, 10),
      };
    }
  }
  return undefined;
}

export interface MonthDayNode {
  type: 'month-day';
  month: MonthsNode;
  day: DayPartNode;
}

function parseMonthPart1(ast: AST): MonthDayNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'month-day') {
    // month whitespace day
    const month = parseMonths(ast.children[0]);
    const day = parseDayPart(ast.children[2]);
    if (day && month) {
      return {
        type: 'month-day',
        month,
        day,
      };
    }
  }
  return undefined;
}

function parseMonthPart2(ast: AST): MonthDayNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'day-month') {
    // day whitespace month
    const month = parseMonths(ast.children[2]);
    const day = parseDayPart(ast.children[0]);
    if (day && month) {
      return {
        type: 'month-day',
        month,
        day,
      };
    }
  }
  return undefined;
}

export interface MonthPartNode {
  type: 'month-part';
  value: MonthDayNode | MonthsNode;
}

function parseMonthPart(ast: AST): MonthPartNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'month-part') {
    const value =
      parseMonthPart1(ast.children) ||
      parseMonthPart2(ast.children) ||
      parseMonths(ast.children);
    if (value) {
      return {
        type: 'month-part',
        value,
      };
    }
  }
  return undefined;
}

export interface SecondsPartNode {
  type: 'seconds-part';
  value: number;
}

function parseSecondsPart(ast: AST): SecondsPartNode | undefined {
  const current = parseMaybe(ast);
  if (current && current.kind === 'multi' && current.tag === 'seconds-part') {
    const value = current.children[3];
    if (value.kind === 'value') {
      return {
        type: 'seconds-part',
        value: Number.parseInt(value.children, 10),
      };
    }
  }
  return undefined;
}

export interface MinutesPartNode {
  type: 'minutes-part';
  minutes: number;
  seconds: SecondsPartNode | undefined;
}

function parseMinutesPart(ast: AST): MinutesPartNode | undefined {
  const current = parseMaybe(ast);
  if (current && current.kind === 'multi' && current.tag === 'minutes-part') {
    const minutes = current.children[3];
    if (minutes.kind === 'value') {
      return {
        type: 'minutes-part',
        minutes: Number.parseInt(minutes.children, 10),
        seconds: parseSecondsPart(current.children[4]),
      };
    }
  }
  return undefined;
}

export interface Hour12ClockNode {
  type: 'hour-12-clock';
  hours: number;
  minutes: MinutesPartNode | undefined;
  meridiem: MeridiemNode;
}

function parseHour12Clock(ast: AST): Hour12ClockNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'hour-12-clock') {
    const hours = ast.children[0];
    const minutes = parseMinutesPart(ast.children[1]);
    const meridiem = parseMeridiem(ast.children[3]);
    if (hours.kind === 'value' && meridiem) {
      return {
        type: 'hour-12-clock',
        hours: Number.parseInt(hours.children, 10),
        minutes,
        meridiem,
      };
    }
  }
  return undefined;
}

export interface Hour24ClockNode {
  type: 'hour-24-clock';
  hours: number;
  minutes: MinutesPartNode;
}

function parseHour24Clock(ast: AST): Hour24ClockNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'hour-24-clock') {
    const hours = ast.children[0];
    const minutes = parseMinutesPart(ast.children[1]);
    if (hours.kind === 'value' && minutes) {
      return {
        type: 'hour-24-clock',
        hours: Number.parseInt(hours.children, 10),
        minutes,
      };
    }
  }
  return undefined;
}

export interface SpecificTimeNode {
  type: 'specific-time';
  value: Hour12ClockNode | Hour24ClockNode;
}

function parseSpecificTime(ast: AST): SpecificTimeNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'specific-time') {
    const result =
      parseHour12Clock(ast.children) || parseHour24Clock(ast.children);
    if (result) {
      return {
        type: 'specific-time',
        value: result,
      };
    }
  }
  return undefined;
}

export interface FullTimeNode {
  type: 'full-time';
  value: SpecificTimeNode | CompleteTimeNode;
}

function parseFullTime(ast: AST): FullTimeNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'full-time') {
    const result =
      parseSpecificTime(ast.children) || parseCompleteTime(ast.children);
    if (result) {
      return {
        type: 'full-time',
        value: result,
      };
    }
  }
  return undefined;
}

export interface TimeNode {
  type: 'time';
  value: FullTimeNode;
}

function parseTime(ast: AST): TimeNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'time') {
    const result = parseFullTime(ast.children[1]);
    if (result) {
      return {
        type: 'time',
        value: result,
      };
    }
  }
  return undefined;
}

export interface DateFormatNode {
  type: 'date-format';
  month: MonthPartNode;
  year: YearPartNode;
}

function parseDateFormat1(ast: AST): DateFormatNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-format-1') {
    const month = parseMonthPart(ast.children[0]);
    const year = parseYearPart(ast.children[2]);
    if (month && year) {
      return {
        type: 'date-format',
        month,
        year,
      };
    }
  }
  return undefined;
}

function parseDateFormat2(ast: AST): DateFormatNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-format-2') {
    const month = parseMonthPart(ast.children[2]);
    const year = parseYearPart(ast.children[0]);
    if (month && year) {
      return {
        type: 'date-format',
        month,
        year,
      };
    }
  }
  return undefined;
}

function parseDateFormat3(ast: AST): DateFormatNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-format-3') {
    const month = parseMonthPart(ast.children[0]);
    const year = ast.children[2];
    if (month && year.kind === 'value') {
      return {
        type: 'date-format',
        month,
        year: {
          type: 'year-part',
          value: Number.parseInt(year.children, 10),
        },
      };
    }
  }
  return undefined;
}

export interface SpecificDateNode {
  type: 'specific-date';
  value: DateFormatNode;
}

function parseSpecificDate(ast: AST): SpecificDateNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'specific-date') {
    const result =
      parseDateFormat1(ast.children) ||
      parseDateFormat2(ast.children) ||
      parseDateFormat3(ast.children);
    if (result) {
      return {
        type: 'specific-date',
        value: result,
      };
    }
  }
  return undefined;
}

export interface RelativeDayNode {
  type: 'relative-day';
  days: DaysNode;
  offset: number;
}

function parseRelativeDay(ast: AST): RelativeDayNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'relative-day') {
    const days = parseDays(ast.children[0]) || parseDays(ast.children[3]);
    const offset =
      parseDirectionalSequence(ast.children[2]) ||
      parseDirectionalSequence(ast.children[0]);
    if (days && offset != null) {
      return {
        type: 'relative-day',
        days,
        offset,
      };
    }
  }
  return undefined;
}

export interface RelativeMonthNode {
  type: 'relative-month';
  month: MonthPartNode;
  offset: number;
}

function parseRelativeMonth(ast: AST): RelativeMonthNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'relative-month') {
    const month =
      parseMonthPart(ast.children[0]) || parseMonthPart(ast.children[3]);
    const offset =
      parseDirectionalSequence(ast.children[2]) ||
      parseDirectionalSequence(ast.children[0]);
    if (month && offset != null) {
      return {
        type: 'relative-month',
        month,
        offset,
      };
    }
  }
  return undefined;
}

export interface RelativeDateNode {
  type: 'relative-date';
  value: RelativeDayNode | RelativeMonthNode;
}

function parseRelativeDate(ast: AST): RelativeDateNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'relative-date') {
    const result =
      parseRelativeDay(ast.children) || parseRelativeMonth(ast.children);
    if (result) {
      return {
        type: 'relative-date',
        value: result,
      };
    }
  }
  return undefined;
}

export interface DirectionalDateNode {
  type: 'directional-date';
  offset: number;
  value: MonthPartNode | DateUnitNode | DaysNode;
}

function parseDirectionalDate(ast: AST): DirectionalDateNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'directional-date') {
    const offset = parseDirectionalSequence(ast.children[0]);
    const value =
      parseMonthPart(ast.children[1]) ||
      parseDateUnit(ast.children[1]) ||
      parseDays(ast.children[1]);
    if (offset != null && value) {
      return {
        type: 'directional-date',
        offset,
        value,
      };
    }
  }
  return undefined;
}

export interface DirectionalTimeNode {
  type: 'directional-time';
  offset: number;
  value: TimeUnitNode | FullTimeNode;
}

function parseDirectionalTime(ast: AST): DirectionalTimeNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'directional-time') {
    const offset = parseDirectionalSequence(ast.children[0]);
    const value =
      parseTimeUnit(ast.children[1]) || parseFullTime(ast.children[1]);
    if (offset != null && value) {
      return {
        type: 'directional-time',
        offset,
        value,
      };
    }
  }
  return undefined;
}

export interface FullDateNode {
  type: 'full-date';
  value:
    | SpecificDateNode
    | DirectionalDateNode
    | RelativeDateNode
    | MonthPartNode
    | CompleteDateNode;
}

function parseFullDate(ast: AST): FullDateNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'full-date') {
    const result =
      parseSpecificDate(ast.children) ||
      parseDirectionalDate(ast.children) ||
      parseRelativeDate(ast.children) ||
      parseMonthPart(ast.children) ||
      parseCompleteDate(ast.children);
    if (result) {
      return {
        type: 'full-date',
        value: result,
      };
    }
  }
  return undefined;
}

export interface DateNode {
  type: 'date';
  value: FullDateNode;
}

function parseDate(ast: AST): DateNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date') {
    const result = parseFullDate(ast.children[1]);
    if (result) {
      return {
        type: 'date',
        value: result,
      };
    }
  }
  return undefined;
}

export interface IndependentDateTimeNode {
  type: 'independent-date-time';
  value: DateNode | TimeNode | DirectionalTimeNode | CompleteNode;
}

function parseIndependentDateTime(
  ast: AST,
): IndependentDateTimeNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'independent-date-time') {
    const result =
      parseDate(ast.children) ||
      parseTime(ast.children) ||
      parseDirectionalTime(ast.children) ||
      parseComplete(ast.children);

    if (result) {
      return {
        type: 'independent-date-time',
        value: result,
      };
    }
  }
  return undefined;
}

export interface IndependentFullDateTimeNode {
  type: 'independent-full-date-time';
  value: FullDateNode | FullTimeNode | DirectionalTimeNode | CompleteNode;
}

function parseIndependentFullDateTime(
  ast: AST,
): IndependentFullDateTimeNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'independent-full-date-time') {
    const result =
      parseFullDate(ast.children) ||
      parseFullTime(ast.children) ||
      parseDirectionalTime(ast.children) ||
      parseComplete(ast.children);

    if (result) {
      return {
        type: 'independent-full-date-time',
        value: result,
      };
    }
  }
  return undefined;
}

export interface DateTimeSequenceNode {
  type: 'date-time-sequence';
  date: DateNode;
  time: TimeNode;
}

function parseDateTimeSequence(ast: AST): DateTimeSequenceNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-time-sequence') {
    const date = parseDate(ast.children[0]);
    const time = parseTime(ast.children[2]);
    if (date && time) {
      return {
        type: 'date-time-sequence',
        date,
        time,
      };
    }
  }
  return undefined;
}

function parseTimeDateSequence(ast: AST): DateTimeSequenceNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'time-date-sequence') {
    const time = parseTime(ast.children[0]);
    const date = parseDate(ast.children[2]);
    if (date && time) {
      return {
        type: 'date-time-sequence',
        date,
        time,
      };
    }
  }
  return undefined;
}

export interface DateTimeAgoNode {
  type: 'date-time-ago';
  value: number;
  unit: DateUnitNode | TimeUnitNode;
}

function parseDateTimeAgo(ast: AST): DateTimeAgoNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-time-ago') {
    const value = ast.children[0];
    const unit =
      parseDateUnit(ast.children[2]) || parseTimeUnit(ast.children[2]);
    if (value.kind === 'value' && unit) {
      return {
        type: 'date-time-ago',
        value: Number.parseInt(value.children, 10),
        unit,
      };
    }
  }
  return undefined;
}

export interface InDateTimeNode {
  type: 'in-date-time';
  value: number;
  unit: DateUnitNode | TimeUnitNode;
}

function parseInDateTime(ast: AST): InDateTimeNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'in-date-time') {
    const value = ast.children[2];
    const unit =
      parseDateUnit(ast.children[4]) || parseTimeUnit(ast.children[4]);
    if (value.kind === 'value' && unit) {
      return {
        type: 'in-date-time',
        value: Number.parseInt(value.children, 10),
        unit,
      };
    }
  }
  return undefined;
}

export interface RelativeDateTimeNode {
  type: 'relative-date-time';
  value: DateValueNode | TimeValueNode;
  relative: RelativeNode;
  target: IndependentFullDateTimeNode;
}

export function parseRelativeDateTime(
  ast: AST,
): RelativeDateTimeNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'relative-date-time') {
    const value =
      parseDateValue(ast.children[0]) || parseTimeValue(ast.children[0]);
    const relative = parseRelative(ast.children[2]);
    const target = parseIndependentFullDateTime(ast.children[4]);
    if (value && relative && target) {
      return {
        type: 'relative-date-time',
        value,
        relative,
        target,
      };
    }
  }
  return undefined;
}

export interface DateTimeNode {
  type: 'date-time';
  value:
    | DateTimeSequenceNode
    | DateTimeAgoNode
    | InDateTimeNode
    | RelativeDateTimeNode
    | IndependentDateTimeNode;
}

export function parseDateTime(ast: AST): DateTimeNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'date-time') {
    const result =
      parseDateTimeSequence(ast.children) ||
      parseTimeDateSequence(ast.children) ||
      parseDateTimeAgo(ast.children) ||
      parseInDateTime(ast.children) ||
      parseRelativeDateTime(ast.children) ||
      parseIndependentDateTime(ast.children);

    if (result) {
      return {
        type: 'date-time',
        value: result,
      };
    }
  }
  return undefined;
}
