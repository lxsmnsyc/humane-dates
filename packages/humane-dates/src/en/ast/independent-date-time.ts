import type { AST } from '../../core/token';
import { type DateNode, getDate } from './date';
import type { CompleteNode } from './keywords';
import type { PartialTimeNode } from './partial-time';
import { getTime, type TimeNode } from './time';

export interface IndependentDateTimeNode {
  type: 'independent-date-time';
  value: DateNode | TimeNode | PartialTimeNode | CompleteNode;
}

export function getIndependentDateTime(
  ast: AST,
): IndependentDateTimeNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'independent-date-time') {
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
