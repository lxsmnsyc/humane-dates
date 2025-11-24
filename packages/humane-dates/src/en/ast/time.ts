import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { type FullTimeNode, getFullTime } from './full-time';
import { getRelationalTime, type RelationalTimeNode } from './relational-time';

export interface TimeNode {
  type: 'time';
  value: FullTimeNode | RelationalTimeNode;
}

export function getTime(ast: AST | Token): TimeNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'solo' && ast.tag === 'time') {
    const value = getFullTime(ast.children) || getRelationalTime(ast.children);
    if (value) {
      return {
        type: 'time',
        value,
      };
    }
  }
  return undefined;
}
