import type { AST } from '../../core/token';
import { type DayPart, getDayPart } from './day-part';
import { getMonths, type MonthsNode } from './keywords';

export interface MonthPart1Node {
  type: 'month-part-1';
  month: MonthsNode;
  day: DayPart;
}

function getMonthPart1(ast: AST): MonthPart1Node | undefined {
  if (ast.kind === 'multi' && ast.tag === 'month-part-1') {
    // month whitespace day
    const month = getMonths(ast.children[0]);
    const day = getDayPart(ast.children[2]);
    if (day && month) {
      return {
        type: 'month-part-1',
        month,
        day,
      };
    }
  }
  return undefined;
}

export interface MonthPart2Node {
  type: 'month-part-2';
  month: MonthsNode;
  day: DayPart;
}

function getMonthPart2(ast: AST): MonthPart2Node | undefined {
  if (ast.kind === 'multi' && ast.tag === 'month-part-2') {
    // day whitespace month
    const month = getMonths(ast.children[2]);
    const day = getDayPart(ast.children[0]);
    if (day && month) {
      return {
        type: 'month-part-2',
        month,
        day,
      };
    }
  }
  return undefined;
}

export interface MonthPartNode {
  type: 'month-part';
  value: MonthPart1Node | MonthPart2Node | MonthsNode;
}

export function getMonthPart(ast: AST): MonthPartNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'month-part') {
    const value =
      getMonthPart1(ast.children) ||
      getMonthPart2(ast.children) ||
      getMonths(ast.children);
    if (value) {
      return {
        type: 'month-part',
        value,
      };
    }
  }
  return undefined;
}
