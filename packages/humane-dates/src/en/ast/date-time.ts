import type { AST } from '../../core/token';
import { type DateNode, getDate } from './date';
import { type DateTimeAgoNode, getDateTimeAgo } from './date-time-ago';
import { getInDateTime, type InDateTimeNode } from './in-date-time';
import {
  getIndependentDateTime,
  type IndependentDateTimeNode,
} from './independent-date-time';
import { getMonthPart, type MonthPartNode } from './month-part';
import {
  getRelationalDateTime,
  type RelationalDateTimeNode,
} from './relational-date-time';
import { getTime, type TimeNode } from './time';

export interface DateTime1Node {
  type: 'date-time-1';
  month: MonthPartNode;
  time: TimeNode;
}

function getDateTime11(ast: AST): DateTime1Node | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-time-1-1') {
    // [month, whitespace, time]
    const month = getMonthPart(ast.children[0]);
    const time = getTime(ast.children[2]);
    if (month && time) {
      return {
        type: 'date-time-1',
        month,
        time,
      };
    }
  }
  return undefined;
}

function getDateTime12(ast: AST): DateTime1Node | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-time-1-2') {
    // [time, whitespace, month]
    const month = getMonthPart(ast.children[2]);
    const time = getTime(ast.children[0]);
    if (month && time) {
      return {
        type: 'date-time-1',
        month,
        time,
      };
    }
  }
  return undefined;
}

export interface DateTime2Node {
  type: 'date-time-2';
  date: DateNode;
  time: TimeNode;
}

function getDateTime21(ast: AST): DateTime2Node | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-time-2-1') {
    // [date, whitespace, time]
    const date = getDate(ast.children[0]);
    const time = getTime(ast.children[2]);
    if (date && time) {
      return {
        type: 'date-time-2',
        date,
        time,
      };
    }
  }
  return undefined;
}

function getDateTime22(ast: AST): DateTime2Node | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-time-2-2') {
    // [time, whitespace, date]
    const date = getDate(ast.children[2]);
    const time = getTime(ast.children[0]);
    if (date && time) {
      return {
        type: 'date-time-2',
        date,
        time,
      };
    }
  }
  return undefined;
}

export interface DateTimeNode {
  type: 'date-time';
  value:
    | DateTime1Node
    | DateTime2Node
    | DateTimeAgoNode
    | InDateTimeNode
    | RelationalDateTimeNode
    | IndependentDateTimeNode;
  // | ValueAST;
}

export function getDateTime(ast: AST): DateTimeNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'date-time') {
    const result =
      getDateTime11(ast.children) ||
      getDateTime12(ast.children) ||
      getDateTime21(ast.children) ||
      getDateTime22(ast.children) ||
      getDateTimeAgo(ast.children) ||
      getInDateTime(ast.children) ||
      getRelationalDateTime(ast.children) ||
      getIndependentDateTime(ast.children);

    if (result) {
      return {
        type: 'date-time',
        value: result,
      };
    }
  }
  return undefined;
}
