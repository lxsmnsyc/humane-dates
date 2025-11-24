import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';

export function extractMaybe(ast: AST | Token): AST | Token | undefined {
  if (ast.type === 'ast' && ast.kind === 'maybe') {
    if (ast.children) {
      return extractMaybe(ast.children);
    }
    return undefined;
  }
  return ast;
}
