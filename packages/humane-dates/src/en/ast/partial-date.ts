import type { AST } from '../../core/token';
import {
  type CompleteTimeNode,
  type DateUnitNode,
  type DaysNode,
  getCompleteTime,
  getDateUnit,
  getDays,
  getPartialComplete,
  type PartialCompleteNode,
} from './keywords';
import { getMonthPart, type MonthPartNode } from './month-part';

export interface PartialDateNode {
  type: 'partial-date';
  relation: PartialCompleteNode;
  value:
    | MonthPartNode
    | DateUnitNode
    | DaysNode
    | CompleteTimeNode
    | PartialDateNode;
}

export function getPartialDate(ast: AST): PartialDateNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'partial-date') {
    // [partialComplete, /* whitespace */ , target]
    const relation = getPartialComplete(ast.children[0]);
    const result =
      getMonthPart(ast.children[2]) ||
      getDateUnit(ast.children[2]) ||
      getDays(ast.children[2]) ||
      getCompleteTime(ast.children[2]) ||
      getPartialDate(ast.children[2]);
    if (result && relation) {
      return {
        type: 'partial-date',
        relation,
        value: result,
      };
    }
  }
  return undefined;
}
