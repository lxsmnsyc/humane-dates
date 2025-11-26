import type { AST } from '../../core/token';
import { type AtTimeNode, getAtTime } from './at-time';

export interface RelationalTimeNode {
  type: 'relational-time';
  value: AtTimeNode;
}

export function getRelationalTime(ast: AST): RelationalTimeNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'relational-time') {
    const value = getAtTime(ast.children);
    if (value) {
      return {
        type: 'relational-time',
        value,
      };
    }
  }
  return undefined;
}
