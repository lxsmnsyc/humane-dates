import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { getOrdinalNumber, type OrdinalNumberNode } from './ordinal-number';

export interface DayPart {
  type: 'day-part';
  value: OrdinalNumberNode | Token;
}

export function getDayPart(ast: AST | Token): DayPart | undefined {
  if (ast.type === 'ast' && ast.kind === 'solo' && ast.tag === 'day-part') {
    const result = getOrdinalNumber(ast.children);
    if (result) {
      return {
        type: 'day-part',
        value: result,
      };
    }
    if (ast.children.type === 'token') {
      return {
        type: 'day-part',
        value: ast.children,
      };
    }
  }
  return undefined;
}
