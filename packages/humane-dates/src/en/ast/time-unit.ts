import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';

export interface TimeUnitNode {
  type: 'time-unit';
  value: Token;
}

export function getTimeUnit(ast: AST | Token): TimeUnitNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'solo' && ast.tag === 'time-unit') {
    if (ast.children.type === 'token') {
      return {
        type: 'time-unit',
        value: ast.children,
      };
    }
  }
  return undefined;
}
