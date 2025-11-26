import type { AST } from '../../core/token';
import { type FullDateNode, getFullDate } from './full-date';
import { type FullTimeNode, getFullTime } from './full-time';
import type { CompleteNode } from './keywords';
import type { PartialTimeNode } from './partial-time';

export interface IndependentFullDateTimeNode {
  type: 'independent-full-date-time';
  value: FullDateNode | FullTimeNode | PartialTimeNode | CompleteNode;
}

export function getIndependentFullDateTime(
  ast: AST,
): IndependentFullDateTimeNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'independent-full-date-time') {
    const result = getFullDate(ast.children) || getFullTime(ast.children);
    if (result) {
      return {
        type: 'independent-full-date-time',
        value: result,
      };
    }
  }
  return undefined;
}
