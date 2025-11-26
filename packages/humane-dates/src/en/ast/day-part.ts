import type { AST, ValueAST } from '../../core/token';
import { getOrdinalNumber, type OrdinalNumberNode } from './ordinal-number';

export interface DayPart {
  type: 'day-part';
  value: OrdinalNumberNode | ValueAST;
}

export function getDayPart(ast: AST): DayPart | undefined {
  if (ast.kind === 'solo' && ast.tag === 'day-part') {
    const result = getOrdinalNumber(ast.children);
    if (result) {
      return {
        type: 'day-part',
        value: result,
      };
    }
    if (ast.children.kind === 'value') {
      return {
        type: 'day-part',
        value: ast.children,
      };
    }
  }
  return undefined;
}
