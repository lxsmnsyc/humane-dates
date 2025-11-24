import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { type FullDateNode, getFullDate } from './full-date';
import { getRelationalDate, type RelationalDateNode } from './relational-date';

export interface DateNode {
  type: 'date';
  value: FullDateNode | RelationalDateNode;
}

export function getDate(ast: AST | Token): DateNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'solo' && ast.tag === 'date') {
    const result = getFullDate(ast.children) || getRelationalDate(ast.children);
    if (result) {
      return {
        type: 'date',
        value: result,
      };
    }
  }
  return undefined;
}
