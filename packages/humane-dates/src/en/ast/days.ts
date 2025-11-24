import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';

export interface DaysNode {
  type: 'days';
  value: Token;
}

export function getDays(ast: AST | Token): DaysNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'solo' && ast.tag === 'days') {
    const value = ast.children;
    if (value.type === 'token') {
      return {
        type: 'days',
        value,
      };
    }
  }
  return undefined;
}
