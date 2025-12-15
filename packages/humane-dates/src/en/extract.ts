import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
  getISODay,
  isBefore,
  set,
  subDays,
} from 'date-fns';
import type {
  CompleteDateNode,
  CompleteNode,
  CompleteTimeNode,
  DateFormatNode,
  DateNode,
  DateTimeAgoNode,
  DateTimeNode,
  DateTimeSequenceNode,
  DateUnitNode,
  DirectionalDateNode,
  DirectionalTimeNode,
  FullDateNode,
  FullTimeNode,
  Hour12ClockNode,
  Hour24ClockNode,
  InDateTimeNode,
  IndependentDateTimeNode,
  IndependentFullDateTimeNode,
  MinutesPartNode,
  MonthPartNode,
  MonthsNode,
  RelativeDateNode,
  RelativeDateTimeNode,
  RelativeDayNode,
  RelativeMonthNode,
  SpecificDateNode,
  SpecificTimeNode,
  TimeNode,
  TimeUnitNode,
} from './parser';

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const DAY_INDEX: Record<string, number> = {
  sun: 1,
  mon: 2,
  tue: 3,
  wed: 4,
  thu: 5,
  fri: 6,
  sat: 7,
};

export interface SpecifiedDateProperty {
  year: boolean;
  month: boolean;
  day: boolean;
  hours: boolean;
  minutes: boolean;
  seconds: boolean;
}

export interface ExtractedHumaneDate {
  date: Date;
  reference: Date;
  input: string;

  specified: SpecifiedDateProperty;
}

function createExtractedHumaneDate(
  referenceDate: Date,
  input: string,
): ExtractedHumaneDate {
  const cloned = new Date(referenceDate);

  return {
    date: cloned,
    reference: new Date(cloned),
    input,

    specified: {
      year: false,
      month: false,
      day: false,
      hours: false,
      seconds: false,
      minutes: false,
    },
  };
}

function add(
  state: ExtractedHumaneDate,
  field: DateUnitNode['value'] | TimeUnitNode['value'],
  offset: number,
): void {
  if (offset === 0) {
    return;
  }
  switch (field) {
    case 'seconds':
      state.date = addSeconds(state.date, offset);
      break;
    case 'minutes':
      state.date = addMinutes(state.date, offset);
      break;
    case 'hours':
      state.date = addHours(state.date, offset);
      break;
    case 'days':
      state.date = addDays(state.date, offset);
      break;
    case 'weeks':
      state.date = addWeeks(state.date, offset);
      break;
    case 'months':
      state.date = addMonths(state.date, offset);
      break;
    case 'years':
      state.date = addYears(state.date, offset);
      break;
  }
}

function setDateSpecified(state: ExtractedHumaneDate): void {
  state.specified.day = true;
  state.specified.month = true;
  state.specified.year = true;
}

function extractCompleteDate(
  state: ExtractedHumaneDate,
  node: CompleteDateNode,
): void {
  switch (node.value) {
    case 'today':
      break;
    case 'tomorrow':
      add(state, 'days', 1);
      break;
    case 'yesterday':
      add(state, 'days', -1);
      break;
  }
  setDateSpecified(state);
}

function extractMonths(node: MonthsNode): number {
  return MONTH_INDEX[node.value];
}

function extractMonthPart(node: MonthPartNode): {
  month: number;
  date?: number;
} {
  if (node.value.type === 'month-day') {
    return {
      month: extractMonths(node.value.month),
      date: node.value.day.value,
    };
  }
  return {
    month: extractMonths(node.value),
  };
}

function extractDirectionalDate(
  state: ExtractedHumaneDate,
  node: DirectionalDateNode,
): void {
  switch (node.value.type) {
    case 'date-unit':
      add(state, node.value.value, node.offset);
      setDateSpecified(state);
      break;
    case 'days': {
      const targetISODay = DAY_INDEX[node.value.value];
      const currentISODay = getISODay(state.date);
      let offset = node.offset;
      if (offset < 0) {
        // Refer "last" as "this"
        if (targetISODay < currentISODay) {
          offset += 1;
        }
      }
      // Back track to Sunday
      const lastSunday = subDays(state.date, currentISODay - 1);
      // offset week
      const offsetWeek = addWeeks(lastSunday, offset);
      // adjust days again
      state.date = addDays(offsetWeek, targetISODay - 1);
      setDateSpecified(state);
      break;
    }
    case 'month-part': {
      const monthPart = extractMonthPart(node.value);
      // Create a dummy date
      const base = new Date(
        state.date.getFullYear(),
        monthPart.month,
        monthPart.date,
      );
      let offset = node.offset;
      if (offset < 0) {
        // Check first if dummy date is "past" from the current date
        if (isBefore(state.date, base)) {
          // If it's before, decrease offset by 1
          offset += 1;
        }
      }
      state.date = addYears(base, offset);
      state.specified.month = true;
      if (monthPart.date != null) {
        state.specified.day = true;
      }
      break;
    }
  }
}

function extractRelativeDay(
  state: ExtractedHumaneDate,
  node: RelativeDayNode,
): void {
  const targetISODay = DAY_INDEX[node.days.value];
  const currentISODay = getISODay(state.date);

  // Back track to Sunday
  const lastSunday = subDays(state.date, currentISODay - 1);
  // offset week
  const offsetWeek = addWeeks(lastSunday, node.offset);
  // adjust days again
  state.date = addDays(offsetWeek, targetISODay - 1);
}

function extractRelativeMonth(
  state: ExtractedHumaneDate,
  node: RelativeMonthNode,
): void {
  const monthPart = extractMonthPart(node.month);
  state.date = addYears(set(state.date, monthPart), node.offset);
}

function extractRelativeDate(
  state: ExtractedHumaneDate,
  node: RelativeDateNode,
): void {
  switch (node.value.type) {
    case 'relative-day':
      extractRelativeDay(state, node.value);
      break;
    case 'relative-month':
      extractRelativeMonth(state, node.value);
      break;
  }
  setDateSpecified(state);
}

function extractDateFormat(
  state: ExtractedHumaneDate,
  node: DateFormatNode,
): void {
  const monthPart = extractMonthPart(node.month);
  if (typeof node.year.value === 'number') {
    state.date.setFullYear(node.year.value);
  } else {
    state.date = addYears(state.date, node.year.value.value);
  }
  state.date = set(state.date, monthPart);
  state.specified.year = true;
  state.specified.month = true;
  if (monthPart.date != null) {
    state.specified.day = true;
  }
}

function extractSpecificDate(
  state: ExtractedHumaneDate,
  node: SpecificDateNode,
): void {
  extractDateFormat(state, node.value);
}

function extractFullDate(state: ExtractedHumaneDate, node: FullDateNode): void {
  switch (node.value.type) {
    case 'complete-date':
      extractCompleteDate(state, node.value);
      break;
    case 'directional-date':
      extractDirectionalDate(state, node.value);
      break;
    case 'month-part': {
      const extracted = extractMonthPart(node.value);
      state.date = set(state.date, extracted);
      state.specified.month = true;
      if (extracted.date != null) {
        state.specified.day = true;
      }
      break;
    }
    case 'relative-date':
      extractRelativeDate(state, node.value);
      break;
    case 'specific-date':
      extractSpecificDate(state, node.value);
      break;
  }
}

function extractDate(state: ExtractedHumaneDate, node: DateNode): void {
  extractFullDate(state, node.value);
}

function setTimeSpecified(state: ExtractedHumaneDate): void {
  state.specified.hours = true;
  state.specified.minutes = true;
  state.specified.seconds = true;
}

function extractCompleteTime(
  state: ExtractedHumaneDate,
  node: CompleteTimeNode,
): void {
  switch (node.value) {
    case 'midnight':
      state.date = set(state.date, {
        hours: 23,
        minutes: 59,
        seconds: 0,
      });
      break;
    case 'noon':
      state.date = set(state.date, {
        hours: 12,
        minutes: 0,
        seconds: 0,
      });
      break;
  }
  setTimeSpecified(state);
}

interface MinutesPart {
  minutes: number;
  seconds?: number;
}

function extractMinutesPart(node: MinutesPartNode): MinutesPart {
  return {
    minutes: node.minutes,
    seconds: node.seconds ? node.seconds.value : undefined,
  };
}

interface HoursPart {
  hours: number;
  minutes?: MinutesPart;
}

function extractHour12Clock(node: Hour12ClockNode): HoursPart {
  return {
    hours:
      node.hours + (node.meridiem.value === 'pm' && node.hours < 12 ? 12 : 0),
    minutes: node.minutes ? extractMinutesPart(node.minutes) : undefined,
  };
}

function extractHour24Clock(node: Hour24ClockNode): HoursPart {
  return {
    hours: node.hours,
    minutes: extractMinutesPart(node.minutes),
  };
}

function extractSpecificTime(node: SpecificTimeNode): HoursPart {
  return node.value.type === 'hour-12-clock'
    ? extractHour12Clock(node.value)
    : extractHour24Clock(node.value);
}

function extractFullTime(state: ExtractedHumaneDate, node: FullTimeNode): void {
  switch (node.value.type) {
    case 'complete-time':
      extractCompleteTime(state, node.value);
      break;
    case 'specific-time': {
      const extracted = extractSpecificTime(node.value);
      const update = {
        hours: extracted.hours,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      };
      state.specified.hours = true;
      if (extracted.minutes) {
        update.minutes = extracted.minutes.minutes;
        state.specified.minutes = true;
        if (extracted.minutes.seconds) {
          update.seconds = extracted.minutes.seconds;
          state.specified.seconds = true;
        }
      }
      state.date = set(state.date, update);
      break;
    }
  }
}

function extractTime(state: ExtractedHumaneDate, node: TimeNode): void {
  extractFullTime(state, node.value);
}

function extractDateTimeSequence(
  state: ExtractedHumaneDate,
  node: DateTimeSequenceNode,
): void {
  extractTime(state, node.time);
  extractDate(state, node.date);
}

function extractDateTimeAgo(
  state: ExtractedHumaneDate,
  node: DateTimeAgoNode,
): void {
  add(state, node.unit.value, -node.value);
  setTimeSpecified(state);
  setDateSpecified(state);
}

function extractInDateTime(
  state: ExtractedHumaneDate,
  node: InDateTimeNode,
): void {
  add(state, node.unit.value, node.value);
  setTimeSpecified(state);
  setDateSpecified(state);
}

function extractDirectionalTime(
  state: ExtractedHumaneDate,
  node: DirectionalTimeNode,
): void {
  if (node.value.type === 'full-time') {
    const prevHours = state.date.getHours();

    extractFullTime(state, node.value);

    let offset = node.offset;
    if (offset < 0) {
      if (state.date.getHours() < prevHours) {
        offset += 1;
      }
    }

    state.date = addDays(state.date, offset);
  } else {
    add(state, node.value.value, node.offset);
    setTimeSpecified(state);
  }
  setDateSpecified(state);
}

function extractComplete(state: ExtractedHumaneDate, node: CompleteNode): void {
  switch (node.value) {
    case 'now':
      setDateSpecified(state);
      break;
  }
}

function extractIndependentDateTime(
  state: ExtractedHumaneDate,
  node: IndependentDateTimeNode,
): void {
  switch (node.value.type) {
    case 'complete':
      extractComplete(state, node.value);
      break;
    case 'date':
      extractDate(state, node.value);
      break;
    case 'directional-time':
      extractDirectionalTime(state, node.value);
      break;
    case 'time':
      extractTime(state, node.value);
      break;
  }
}

function extractIndependentFullDateTime(
  state: ExtractedHumaneDate,
  node: IndependentFullDateTimeNode,
): void {
  switch (node.value.type) {
    case 'complete':
      extractComplete(state, node.value);
      break;
    case 'directional-time':
      extractDirectionalTime(state, node.value);
      break;
    case 'full-date':
      extractFullDate(state, node.value);
      break;
    case 'full-time':
      extractFullTime(state, node.value);
      break;
  }
}

function extractRelativeDateTime(
  state: ExtractedHumaneDate,
  node: RelativeDateTimeNode,
): void {
  const offset = node.value.value;
  const unit = node.value.unit.value;
  extractIndependentFullDateTime(state, node.target);

  add(state, unit, node.relative.value === 'before' ? -offset : offset);
}

export function extract(
  node: DateTimeNode,
  referenceDate: Date,
  input: string,
): ExtractedHumaneDate {
  const state = createExtractedHumaneDate(referenceDate, input);
  switch (node.value.type) {
    case 'date-time-ago':
      extractDateTimeAgo(state, node.value);
      break;
    case 'date-time-sequence':
      extractDateTimeSequence(state, node.value);
      break;
    case 'in-date-time':
      extractInDateTime(state, node.value);
      break;
    case 'independent-date-time':
      extractIndependentDateTime(state, node.value);
      break;
    case 'relative-date-time':
      extractRelativeDateTime(state, node.value);
      break;
  }
  return state;
}
