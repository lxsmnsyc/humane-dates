import type { AST, ValueAST } from '../../core/token';

export interface OrdinalNumberNode {
  type: 'ordinal-day';
  value: ValueAST;
}

export function getOrdinalNumber(ast: AST): OrdinalNumberNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'ordinal-number') {
    const value = ast.children[0];
    if (value.kind === 'value') {
      return {
        type: 'ordinal-day',
        value,
      };
    }
  }
  return undefined;
}
