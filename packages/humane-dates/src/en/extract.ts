import type { ValueAST } from '../core/token';
import type { DateTimeNode } from './ast/date-time';
import type { FullTimeNode } from './ast/full-time';
import type { Hour12FormatNode, MeridiemNode } from './ast/hour-12';
import type { Hour24FormatNode } from './ast/hour-24';
import type { IndependentDateTimeNode } from './ast/independent-date-time';
import type { MinutesPartNode } from './ast/minutes-part';
import type { RelationalTimeNode } from './ast/relational-time';
import type { SecondsPartNode } from './ast/seconds-part';
import type { TimeNode } from './ast/time';

export interface ExtractedHumaneDate {
  date: Date;
  reference: Date;

  specified: {
    year: boolean;
    month: boolean;
    day: boolean;
    hours: boolean;
    minutes: boolean;
    seconds: boolean;
  };
}

interface ExtractContext {
  info: ExtractedHumaneDate;

  // last/this/next, where last = -1, next = +1
  direction: number;
}

function createExtractedHumaneDate(referenceDate: Date): ExtractedHumaneDate {
  const cloned = new Date(referenceDate);

  return {
    date: cloned,
    reference: new Date(cloned),

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

function extractSecondsPart(ctx: ExtractContext, node: SecondsPartNode): void {
  const value = Number.parseInt(node.value.children, 10);
  ctx.info.date.setSeconds(value, 0);
  ctx.info.specified.seconds = true;
}

function extractMinutesPart(ctx: ExtractContext, node: MinutesPartNode): void {
  const value = Number.parseInt(node.minutes.children, 10);
  ctx.info.date.setMinutes(value);
  ctx.info.specified.minutes = true;

  if (node.seconds) {
    extractSecondsPart(ctx, node.seconds);
  } else {
    ctx.info.date.setSeconds(0, 0);
  }
}

function extractHour12(ctx: ExtractContext, node: ValueAST): void {
  const value = Number.parseInt(node.children, 10);
  ctx.info.date.setHours(value);
  ctx.info.specified.hours = true;
}

function extractMeridiem(ctx: ExtractContext, node: MeridiemNode): void {
  if (node.value.tag === 'meridiem-pm') {
    ctx.info.date.setHours(ctx.info.date.getHours() + 12);
  }
}

function extractHour12Clock(ctx: ExtractContext, node: Hour12FormatNode): void {
  extractHour12(ctx, node.hours);
  if (node.minutes) {
    extractMinutesPart(ctx, node.minutes);
  } else {
    ctx.info.date.setMinutes(0);
  }
  extractMeridiem(ctx, node.meridiem);
}

function extractHour24Clock(ctx: ExtractContext, node: Hour24FormatNode): void {
  extractHour12(ctx, node.hours);
  extractMinutesPart(ctx, node.minutes);
}

function extractFullTime(ctx: ExtractContext, node: FullTimeNode): void {
  switch (node.value.type) {
    case 'hour-12-clock':
      extractHour12Clock(ctx, node.value);
      break;
    case 'hour-24-clock':
      extractHour24Clock(ctx, node.value);
      break;
    case 'complete-time':
      switch (node.value.value.tag) {
        case 'midnight':
          ctx.info.date.setHours(23, 59, 59);
          break;
        case 'noon':
          ctx.info.date.setHours(0, 0, 0);
          break;
      }
      ctx.info.specified.hours = true;
      ctx.info.specified.minutes = true;
      ctx.info.specified.seconds = true;
      break;
  }
}

function extractRelationalTime(
  ctx: ExtractContext,
  node: RelationalTimeNode,
): void {
  switch (node.value.type) {
    case 'at-time':
      extractFullTime(ctx, node.value.value);
      break;
  }
}

function extractTime(ctx: ExtractContext, node: TimeNode): void {
  switch (node.value.type) {
    case 'full-time':
      extractFullTime(ctx, node.value);
      break;
    case 'relational-time':
      extractRelationalTime(ctx, node.value);
      break;
  }
}

function extractIndependentDateTime(
  ctx: ExtractContext,
  node: IndependentDateTimeNode,
): void {
  switch (node.value.type) {
    case 'time':
      extractTime(ctx, node.value);
      break;
    case 'date':
      break;
  }
}

export function extract(
  node: DateTimeNode,
  referenceDate: Date,
): ExtractedHumaneDate {
  const ctx = {
    info: createExtractedHumaneDate(referenceDate),
    direction: 0,
  };
  switch (node.value.type) {
    case 'independent-date-time':
      extractIndependentDateTime(ctx, node.value);
      break;
    case 'date-time-1':
    case 'date-time-2':
    case 'date-time-ago':
    case 'in-date-time':
    case 'relational-date-time':
      break;
  }
  return ctx.info;
}
