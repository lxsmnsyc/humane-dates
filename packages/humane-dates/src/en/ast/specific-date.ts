import type { AST, ValueAST } from '../../core/token';
import { getMonthPart, type MonthPartNode } from './month-part';
import { getYearPart, type YearPartNode } from './year-part';

interface DateFormat1Node {
  type: 'date-format-1';
  month: MonthPartNode;
  year: YearPartNode;
}

function getDateFormat1(ast: AST): DateFormat1Node | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-format-1') {
    // [month, whitespace, year]
    const month = getMonthPart(ast.children[0]);
    const year = getYearPart(ast.children[2]);
    if (month && year) {
      return {
        type: 'date-format-1',
        month,
        year,
      };
    }
  }
  return undefined;
}

interface DateFormat2Node {
  type: 'date-format-2';
  month: MonthPartNode;
  year: ValueAST;
}

function getDateFormat2(ast: AST): DateFormat2Node | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-format-2') {
    // [month, whitespace, number]
    const month = getMonthPart(ast.children[0]);
    const year = ast.children[1];
    if (month && year.kind === 'value') {
      return {
        type: 'date-format-2',
        month,
        year,
      };
    }
  }
  return undefined;
}

interface DateFormat3Node {
  type: 'date-format-3';
  month: MonthPartNode;
  year: YearPartNode;
}

function getDateFormat3(ast: AST): DateFormat3Node | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-format-3') {
    // [year, whitespace, month]
    const month = getMonthPart(ast.children[2]);
    const year = getYearPart(ast.children[0]);
    if (month && year) {
      return {
        type: 'date-format-3',
        month,
        year,
      };
    }
  }
  return undefined;
}

export interface SpecificDateNode {
  type: 'specific-date';
  value: DateFormat1Node | DateFormat2Node | DateFormat3Node;
}

export function getSpecificDate(ast: AST): SpecificDateNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'specific-date') {
    const result =
      getDateFormat1(ast.children) ||
      getDateFormat2(ast.children) ||
      getDateFormat3(ast.children);
    if (result) {
      return {
        type: 'specific-date',
        value: result,
      };
    }
  }
  return undefined;
}
