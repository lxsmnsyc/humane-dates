import type { AST } from '../../core/token';
import { type CompleteDateNode, getCompleteDate } from './keywords';
import { getMonthPart, type MonthPartNode } from './month-part';
import { getPartialDate, type PartialDateNode } from './partial-date';
import { getSpecificDate, type SpecificDateNode } from './specific-date';

export interface FullDateNode {
  type: 'full-date';
  value: SpecificDateNode | PartialDateNode | MonthPartNode | CompleteDateNode;
}

export function getFullDate(ast: AST): FullDateNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'full-date') {
    const result =
      getSpecificDate(ast.children) ||
      getPartialDate(ast.children) ||
      getMonthPart(ast.children) ||
      getCompleteDate(ast.children);
    if (result) {
      return {
        type: 'full-date',
        value: result,
      };
    }
  }
  return undefined;
}
