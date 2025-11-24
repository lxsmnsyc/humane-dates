import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';

export interface MonthsNode {
  type: 'months';
  value: Token;
}

export function getMonths(ast: AST | Token): MonthsNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'solo' && ast.tag === 'months') {
    const value = ast.children;
    if (value.type === 'token') {
      return {
        type: 'months',
        value,
      };
    }
  }
  return undefined;
}
