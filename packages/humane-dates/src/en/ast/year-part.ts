import type { AST, ValueAST } from '../../core/token';

export interface YearPartNode {
  type: 'year-part';
  value: ValueAST;
}

export function getYearPart(ast: AST): YearPartNode | undefined {
  if (
    ast.kind === 'solo' &&
    ast.tag === 'year-part' &&
    ast.children.kind === 'value'
  ) {
    return {
      type: 'year-part',
      value: ast.children,
    };
  }
  return undefined;
}
