import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';

export interface DateUnitNode {
  type: 'date-unit';
  value: Token;
}

export function getDateUnit(ast: AST | Token): DateUnitNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'solo' && ast.tag === 'date-unit') {
    if (ast.children.type === 'token') {
      return {
        type: 'date-unit',
        value: ast.children,
      };
    }
  }
  return undefined;
}
