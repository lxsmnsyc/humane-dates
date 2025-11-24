import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';

export interface OrdinalNumberNode {
  type: 'ordinal-day';
  value: Token;
}

export function getOrdinalNumber(
  ast: AST | Token,
): OrdinalNumberNode | undefined {
  if (
    ast.type === 'ast' &&
    ast.kind === 'multi' &&
    ast.tag === 'ordinal-number'
  ) {
    const value = ast.children[0];
    if (value.type === 'token') {
      return {
        type: 'ordinal-day',
        value,
      };
    }
  }
  return undefined;
}
