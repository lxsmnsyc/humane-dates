import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';

export interface YearPartNode {
  type: 'year-part';
  value: Token;
}

export function getYearPart(ast: AST | Token): YearPartNode | undefined {
  if (
    ast.type === 'ast' &&
    ast.kind === 'solo' &&
    ast.tag === 'year-part' &&
    ast.children.type === 'token'
  ) {
    return {
      type: 'year-part',
      value: ast.children,
    };
  }
  return undefined;
}
