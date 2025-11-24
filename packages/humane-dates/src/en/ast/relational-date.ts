import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { getOnDate, type OnDateNode } from './on-date';

export interface RelationalDateNode {
  type: 'relational-date';
  value: OnDateNode;
}

export function getRelationalDate(
  ast: AST | Token,
): RelationalDateNode | undefined {
  if (
    ast.type === 'ast' &&
    ast.kind === 'solo' &&
    ast.tag === 'relational-date'
  ) {
    const result = getOnDate(ast.children);
    if (result) {
      return {
        type: 'relational-date',
        value: result,
      };
    }
  }
  return undefined;
}
