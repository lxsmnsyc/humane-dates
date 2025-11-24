import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { type DateNode, getDate } from './date';
import { getTime, type TimeNode } from './time';

export interface IndependentDateTimeNode {
  type: 'independent-date-time';
  value: DateNode | TimeNode;
}

export function getIndependentDateTime(
  ast: AST | Token,
): IndependentDateTimeNode | undefined {
  if (
    ast.type === 'ast' &&
    ast.kind === 'solo' &&
    ast.tag === 'independent-date-time'
  ) {
    const result = getDate(ast.children) || getTime(ast.children);
    if (result) {
      return {
        type: 'independent-date-time',
        value: result,
      };
    }
  }
  return undefined;
}
