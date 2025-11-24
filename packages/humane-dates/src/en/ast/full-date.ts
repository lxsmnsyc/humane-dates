import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { getMonthPart, type MonthPartNode } from './month-part';
import { getPartialDate, type PartialDateNode } from './partial-date';
import { getSpecificDate, type SpecificDateNode } from './specific-date';

export interface FullDateNode {
  type: 'full-date';
  value: SpecificDateNode | PartialDateNode | MonthPartNode | Token;
}

export function getFullDate(ast: AST | Token): FullDateNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'solo' && ast.tag === 'full-date') {
    const result =
      getSpecificDate(ast.children) ||
      getPartialDate(ast.children) ||
      getMonthPart(ast.children);
    if (result) {
      return {
        type: 'full-date',
        value: result,
      };
    }
    if (ast.children.type === 'token') {
      return {
        type: 'full-date',
        value: ast.children,
      };
    }
  }
  return undefined;
}
