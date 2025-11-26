import type { AST } from '../../core/token';

export function extractMaybe(ast: AST): AST | undefined {
  if (ast.kind === 'maybe') {
    if (ast.children) {
      return extractMaybe(ast.children);
    }
    return undefined;
  }
  return ast;
}
