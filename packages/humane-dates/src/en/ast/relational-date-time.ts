import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { type DateValueNode, getDateValue } from './date-value';
import {
  getIndependentFullDateTime,
  type IndependentFullDateTimeNode,
} from './independent-full-date-time';
import { getTimeValue, type TimeValueNode } from './time-value';

export interface RelationalDateTimeNode {
  type: 'relational-date-time';
  value: DateValueNode | TimeValueNode;
  relation: Token;
  reference: IndependentFullDateTimeNode;
}

export function getRelationalDateTime(
  ast: AST | Token,
): RelationalDateTimeNode | undefined {
  if (
    ast.type === 'ast' &&
    ast.kind === 'multi' &&
    ast.tag === 'relational-date-time'
  ) {
    // date-value/time-value whitespace partial-relational whitespace independent-full
    const relation = ast.children[2];
    const value =
      getDateValue(ast.children[0]) || getTimeValue(ast.children[0]);
    const reference = getIndependentFullDateTime(ast.children[4]);
    if (reference && value && relation.type === 'token') {
      return {
        type: 'relational-date-time',
        value,
        relation,
        reference,
      };
    }
  }
  return undefined;
}
